import { randomUUID } from 'node:crypto'
import { copyFile, mkdir, open, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import lockfile from 'proper-lockfile'
import {
  BlenderBridgeClient,
  checkScriptSafety,
  installBridgeAddon,
  launchBlenderGui,
  type BridgeAddonInstallExecutor,
  type BridgeExecuteOptions,
  type BridgeExecuteResult,
  type BridgeLoadScriptOptions,
  type BridgeLoadScriptResult,
  type BridgeSetCameraOptions,
  type BridgeSetCameraResult,
  type BridgeSetMaterialColorOptions,
  type BridgeSetMaterialColorResult,
  type BridgeTransformObjectOptions,
  type BridgeTransformObjectResult,
  type BridgeViewportOptions,
  type BridgeViewportResult,
  type InstallBridgeAddonResult,
  type LaunchBlenderGuiResult,
} from './bridge.js'
import {
  BlenderEnvironment,
  type BlenderCandidate,
  type BlenderGpuProber,
  type BlenderVersionProber,
} from './environment.js'
import { getExemplar, listExemplarSummaries } from './exemplars.js'
import { PolyHavenClient } from './polyhaven.js'
import {
  BlenderRunner,
  DEFAULT_CYCLES_TIMEOUT_MS,
  DEFAULT_EEVEE_TIMEOUT_MS,
  isCyclesGpuCrashError,
  type BlenderRunExecutor,
} from './runner.js'
import type { SkillBundleHealthReport, SkillsPluginContext } from './skill-bundle.js'
import {
  applyScriptPatches,
  BlenderStore,
  type ScriptPatchEdit,
  type TrashPathFn,
  type TrashPathsFn,
} from './store.js'
import { BLENDER_TEMPLATES, generateRunnerHarness, generateSceneScript } from './templates.js'
import { registerBlenderTools } from './tools.js'
import {
  BlenderWorkflowStore,
  buildRecipeFromHistory,
  defaultStepLabel,
  extractLookdevDiff,
  summarizeWorkflowRecipe,
  validateWorkflowReplayOverrides,
} from './workflow.js'
import {
  ARTIFACT_MIME_MAP,
  BLENDER_QUALITY_TIERS,
  BLENDER_SHOT_PRESETS,
  BlenderConflict,
  BlenderError,
  blenderId,
  DEFAULT_MULTI_SHOT_IDS,
  MAX_ARTIFACT_DOWNLOAD_BYTES,
  MAX_ASSET_BYTES,
  MAX_JOB_LOG_LINES,
  resolveRenderResolution,
  scrubLogText,
  validateExportFormat,
  validateShotPresetIds,
  type BlenderArtifact,
  type BlenderArtifactKind,
  type BlenderBridgeStatus,
  type BlenderEnvironmentStatus,
  type BlenderExportFormat,
  type BlenderJob,
  type BlenderJobKind,
  type BlenderPipelineOptions,
  type BlenderPipelineSummary,
  type BlenderProject,
  type BlenderQualityTier,
  type BlenderSceneSummary,
  type BlenderSettings,
  type BlenderShotPresetId,
  type BlenderShotResult,
  type BlenderWorkflowEvent,
  type BlenderWorkflowRecipe,
  type BlenderWorkflowReplayOverrides,
  type BlenderWorkflowReplayStepResult,
  type BlenderWorkflowReplaySummary,
  type BlenderWorkflowSource,
  type PolyHavenAssetType,
} from './types.js'

type AbortReason = 'user' | 'timeout' | 'lock-lost' | 'dispose'

interface RunningJob {
  view: BlenderJob
  controller: AbortController
  abortReason?: AbortReason
  done: Promise<void>
}

export interface StartJobOptions {
  format?: BlenderExportFormat
  frame?: number
  code?: string
  allowUnsafe?: boolean
  timeoutMs?: number
  pipeline?: BlenderPipelineOptions
  shots?: BlenderShotPresetId[]
  qualityTier?: BlenderQualityTier
  source?: BlenderWorkflowSource
  skipWorkflowRecord?: boolean
}

export interface ReplayWorkflowOptions {
  revision?: unknown
  dryRun?: boolean
  stopOnError?: boolean
  skipIfBridgeOffline?: boolean
  overrides?: BlenderWorkflowReplayOverrides
  allowUnsafe?: boolean
  source?: BlenderWorkflowSource
  timeoutMs?: number
}

export interface BlenderWorkbenchOptions {
  root?: string
  store?: BlenderStore
  environment?: BlenderEnvironment
  runner?: BlenderRunner
  bridge?: BlenderBridgeClient
  polyHaven?: PolyHavenClient
  addonPath?: string
  prober?: BlenderVersionProber
  gpuProber?: BlenderGpuProber
  probeGpu?: boolean
  executor?: BlenderRunExecutor
  addonInstallExecutor?: BridgeAddonInstallExecutor
  fetchImpl?: typeof fetch
  skipSystemScan?: boolean
  extraCandidates?: BlenderCandidate[]
  launchGui?: (executablePath: string, blendFile?: string) => Promise<LaunchBlenderGuiResult>
  checkSkillsHealth?: () => Promise<SkillBundleHealthReport>
  trashPath?: TrashPathFn
  trashPaths?: TrashPathsFn
}

const MAX_JSON_BODY_BYTES = 512 * 1024 // 512 KB (custom scripts up to 256 KB + metadata)
const MAX_JOBS_RETAINED = 40
const ANIMATION_JOB_TIMEOUT_MS = 600_000 // 10 min for animations

function errorMessage(e: unknown): string {
  return scrubLogText(e instanceof Error ? e.message : String(e))
}

async function readPngDimensions(
  filePath: string,
  fallbackW: number,
  fallbackH: number,
): Promise<{ width: number; height: number }> {
  const handle = await open(filePath, 'r')
  try {
    const header = Buffer.alloc(24)
    const { bytesRead } = await handle.read(header, 0, 24, 0)
    if (
      bytesRead >= 24 &&
      header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) &&
      header.toString('ascii', 12, 16) === 'IHDR'
    ) {
      return {
        width: header.readUInt32BE(16),
        height: header.readUInt32BE(20),
      }
    }
  } catch {
    // fallback below
  } finally {
    await handle.close()
  }
  return { width: fallbackW, height: fallbackH }
}

function outputSpecForJob(
  kind: BlenderJobKind,
  format?: BlenderExportFormat,
): { fileName: string; artifactKind: BlenderArtifactKind; mime: string } | null {
  switch (kind) {
    case 'preview_still':
      return { fileName: 'render.png', artifactKind: 'still', mime: ARTIFACT_MIME_MAP.png }
    case 'contact_sheet':
      return { fileName: 'contact_sheet.png', artifactKind: 'contact_sheet', mime: ARTIFACT_MIME_MAP.png }
    case 'render_animation':
      return { fileName: 'animation.mp4', artifactKind: 'animation', mime: ARTIFACT_MIME_MAP.mp4 }
    case 'export_model': {
      const fmt = validateExportFormat(format ?? 'glb')
      return {
        fileName: fmt === 'blend' ? 'scene.blend' : `model.${fmt}`,
        artifactKind: fmt,
        mime: ARTIFACT_MIME_MAP[fmt] || 'application/octet-stream',
      }
    }
    case 'build_blend':
      return { fileName: 'scene.blend', artifactKind: 'blend', mime: ARTIFACT_MIME_MAP.blend }
    case 'inspect_scene':
    case 'run_script':
    case 'pipeline':
    case 'render_shots':
    case 'workflow_replay':
      return null
  }
}

function validateQualityTier(value: unknown): BlenderQualityTier | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'string' && (BLENDER_QUALITY_TIERS as readonly string[]).includes(value)) {
    return value as BlenderQualityTier
  }
  throw new BlenderError('渲染质量档位必须为 draft、studio 或 beauty。', 'BAD_REQUEST', 400)
}

function validatePipelineOptions(raw?: BlenderPipelineOptions): Required<Omit<BlenderPipelineOptions, 'qualityTier'>> & {
  qualityTier?: BlenderQualityTier
} {
  const includeContactSheet = raw?.includeContactSheet !== false
  const renderKind = raw?.renderKind ?? 'still'
  if (renderKind !== 'still' && renderKind !== 'animation') {
    throw new BlenderError('pipeline renderKind 必须为 still 或 animation。', 'BAD_REQUEST', 400)
  }
  const exportFormat = raw?.exportFormat ?? 'glb'
  if (exportFormat !== 'none') {
    validateExportFormat(exportFormat)
  }
  const qualityTier = validateQualityTier(raw?.qualityTier)
  const abortOnQcError = raw?.abortOnQcError === true
  return {
    includeContactSheet,
    renderKind,
    exportFormat,
    qualityTier,
    abortOnQcError,
  }
}

function applyQualityTier(project: BlenderProject, tier?: BlenderQualityTier): BlenderProject {
  switch (tier) {
    case 'draft':
      return { ...project, engine: 'EEVEE', samples: 16, resolutionScale: 50 }
    case 'studio':
      return { ...project, engine: 'EEVEE', samples: 32, resolutionScale: 100 }
    case 'beauty':
      return { ...project, engine: 'CYCLES', samples: 64, resolutionScale: 100 }
    default:
      return project
  }
}

function assertScriptSafeOrAllowed(code: string, allowUnsafe?: boolean): void {
  if (!code || !code.trim() || allowUnsafe === true) return
  const safety = checkScriptSafety(code)
  if (!safety.safe) {
    const summary = safety.findings
      .slice(0, 3)
      .map(f => `L${f.line} [${f.rule}] ${f.detail}`)
      .join('；')
    throw new BlenderError(
      `自定义脚本未通过静态安全检查（如确需执行请显式传入 allowUnsafe: true）：${summary}`,
      'SCRIPT_UNSAFE',
      400,
    )
  }
}

export class BlenderWorkbench {
  readonly store: BlenderStore
  readonly environment: BlenderEnvironment
  readonly runner: BlenderRunner
  readonly bridge: BlenderBridgeClient
  readonly polyHaven: PolyHavenClient
  readonly workflows: BlenderWorkflowStore
  readonly route = '/api/dsh-blender-studio/workbench'
  readonly addonPath: string

  private readonly hasCustomBridge: boolean
  private readonly launchGuiFn: (executablePath: string, blendFile?: string) => Promise<LaunchBlenderGuiResult>
  private readonly addonInstallExecutor?: BridgeAddonInstallExecutor
  private readonly jobs = new Map<string, RunningJob>()
  private starting = false
  private disposed = false
  private lastBridgeStatus?: BlenderBridgeStatus

  constructor(options: BlenderWorkbenchOptions = {}) {
    this.store = options.store ?? new BlenderStore(options.root, { trashPath: options.trashPath, trashPaths: options.trashPaths })
    this.workflows = new BlenderWorkflowStore(this.store.root)
    this.environment =
      options.environment ??
      new BlenderEnvironment({
        root: this.store.root,
        prober: options.prober,
        gpuProber: options.gpuProber,
        probeGpu: options.probeGpu,
        skipSystemScan: options.skipSystemScan,
        extraCandidates: options.extraCandidates,
      })
    this.runner =
      options.runner ??
      new BlenderRunner({
        root: this.store.root,
        executor: options.executor,
      })
    this.hasCustomBridge = Boolean(options.bridge)
    this.bridge = options.bridge ?? new BlenderBridgeClient()
    this.polyHaven =
      options.polyHaven ??
      new PolyHavenClient({
        root: this.store.root,
        isEnabled: async () => (await this.environment.getSettings()).polyHavenEnabled,
        fetchImpl: options.fetchImpl,
      })
    this.addonPath =
      options.addonPath ?? fileURLToPath(new URL('../blender/dsh_blender_bridge.py', import.meta.url))
    this.launchGuiFn = options.launchGui ?? launchBlenderGui
    this.addonInstallExecutor = options.addonInstallExecutor
  }

  private async syncBridgeFromSettings(): Promise<BlenderBridgeClient> {
    if (!this.hasCustomBridge) {
      const settings = await this.environment.getSettings()
      this.bridge.configure({
        host: settings.bridgeHost,
        port: settings.bridgePort,
        token: settings.bridgeToken,
      })
    }
    return this.bridge
  }

  async bridgeStatus(timeoutMs = 2_500): Promise<BlenderBridgeStatus> {
    const client = await this.syncBridgeFromSettings()
    const status = await client.status(timeoutMs)
    this.lastBridgeStatus = status
    return status
  }

  async bridgeSceneInfo(): Promise<BlenderSceneSummary> {
    const client = await this.syncBridgeFromSettings()
    return client.sceneInfo()
  }

  async bridgeExecute(
    code: string,
    opts: BridgeExecuteOptions & { allowUnsafe?: boolean } = {},
  ): Promise<BridgeExecuteResult> {
    if (typeof code !== 'string' || !code.trim()) {
      throw new BlenderError('请提供非空的 Python (bpy) 代码。', 'BAD_REQUEST', 400)
    }
    assertScriptSafeOrAllowed(code, opts.allowUnsafe)
    const client = await this.syncBridgeFromSettings()
    return client.execute(code, { pushUndo: opts.pushUndo ?? true, timeoutMs: opts.timeoutMs })
  }

  async bridgeViewport(opts: BridgeViewportOptions = {}): Promise<BridgeViewportResult> {
    const client = await this.syncBridgeFromSettings()
    return client.viewportCapture(opts)
  }

  async bridgeSetCamera(opts: BridgeSetCameraOptions): Promise<BridgeSetCameraResult> {
    const client = await this.syncBridgeFromSettings()
    return client.setCamera(opts)
  }

  async bridgeTransformObject(opts: BridgeTransformObjectOptions): Promise<BridgeTransformObjectResult> {
    const client = await this.syncBridgeFromSettings()
    return client.transformObject(opts)
  }

  async bridgeSetMaterialColor(opts: BridgeSetMaterialColorOptions): Promise<BridgeSetMaterialColorResult> {
    const client = await this.syncBridgeFromSettings()
    return client.setMaterialColor(opts)
  }

  async bridgeSyncProject(
    id: string,
    opts: BridgeLoadScriptOptions & { allowUnsafe?: boolean; lookdevOverrides?: BlenderWorkflowReplayOverrides } = {},
  ): Promise<BridgeLoadScriptResult & { projectId: string; revision: number }> {
    const validId = blenderId(id)
    const rawProject = await this.store.get(validId)
    const ov = opts.lookdevOverrides
    const project: BlenderProject = ov
      ? {
          ...rawProject,
          ...(ov.accentColor ? { accentColor: ov.accentColor } : {}),
          ...(ov.lensMm !== undefined ? { lensMm: ov.lensMm } : {}),
          ...(ov.exposure !== undefined ? { exposure: ov.exposure } : {}),
          ...(ov.clayMode !== undefined ? { clayMode: ov.clayMode } : {}),
        }
      : rawProject
    if (project.scriptMode === 'custom' && project.customScript.trim()) {
      assertScriptSafeOrAllowed(project.customScript, opts.allowUnsafe)
    }
    const projectDir = await this.store.path(validId)
    const assetsDir = join(projectDir, 'assets')
    const settings = await this.environment.getSettings()
    const script = generateSceneScript(project, assetsDir, {
      computeDevice: settings.computeDevice ?? 'auto',
      applyLookdevOverrides: true,
    })
    const client = await this.syncBridgeFromSettings()
    const res = await client.loadScript(script, {
      clearScene: opts.clearScene ?? true,
      projectTitle: opts.projectTitle ?? project.title,
      timeoutMs: opts.timeoutMs,
    })
    if (res.sceneSummary) {
      await this.store.updateSceneSummary(validId, res.sceneSummary).catch(() => {})
    }
    return {
      projectId: project.id,
      revision: project.revision,
      ...res,
    }
  }

  async installAddon(): Promise<InstallBridgeAddonResult> {
    const active = await this.environment.requireActiveExecutable()
    return installBridgeAddon(active.path, this.addonPath, {
      executor: this.addonInstallExecutor,
    })
  }

  async isWorkflowRecordingEnabled(): Promise<boolean> {
    const settings = await this.environment.getSettings()
    return settings.workflowRecordingEnabled !== false
  }

  async recordWorkflowEvent(
    projectId: string,
    event: Omit<BlenderWorkflowEvent, 'id' | 'seq' | 'timestamp'>,
    options: { force?: boolean } = {},
  ): Promise<BlenderWorkflowEvent | null> {
    try {
      if (!options.force && !(await this.isWorkflowRecordingEnabled())) return null
      return await this.store.appendWorkflowEvent(projectId, event)
    } catch {
      return null
    }
  }

  async readProjectScript(
    id: string,
    opts: { startLine?: number; endLine?: number; pattern?: string; maxMatches?: number } = {},
  ): Promise<{
    id: string
    title: string
    revision: number
    scriptMode: BlenderProject['scriptMode']
    totalLines: number
    byteLength: number
    startLine: number
    endLine: number
    content: string
    matches?: Array<{ line: number; text: string }>
  }> {
    const project = await this.store.get(blenderId(id))
    const settings = await this.environment.getSettings()
    const raw =
      project.scriptMode === 'custom'
        ? project.customScript
        : generateSceneScript(project, './assets', { computeDevice: settings.computeDevice ?? 'auto' })
    const allLines = raw.split(/\r?\n/)
    const totalLines = allLines.length
    const byteLength = Buffer.byteLength(raw, 'utf8')

    if (typeof opts.pattern === 'string' && opts.pattern.trim()) {
      const needle = opts.pattern.trim()
      const maxMatches = Math.max(1, Math.min(100, Number(opts.maxMatches) || 40))
      let regex: RegExp | null = null
      try {
        regex = new RegExp(needle, 'i')
      } catch {
        regex = null
      }
      const matches: Array<{ line: number; text: string }> = []
      for (let i = 0; i < allLines.length; i++) {
        const lineText = allLines[i]
        const hit = regex ? regex.test(lineText) : lineText.toLowerCase().includes(needle.toLowerCase())
        if (hit) {
          matches.push({ line: i + 1, text: lineText.slice(0, 240) })
          if (matches.length >= maxMatches) break
        }
      }
      const formatted = matches.map(m => `${String(m.line).padStart(4, ' ')}: ${m.text}`).join('\n')
      return {
        id: project.id,
        title: project.title,
        revision: project.revision,
        scriptMode: project.scriptMode,
        totalLines,
        byteLength,
        startLine: 1,
        endLine: totalLines,
        content: formatted,
        matches,
      }
    }

    const startLine = Math.max(1, Math.min(totalLines, Math.floor(Number(opts.startLine) || 1)))
    const defaultSpan = 160
    const endLine = Math.max(
      startLine,
      Math.min(totalLines, Math.floor(Number(opts.endLine) || startLine + defaultSpan - 1)),
    )
    const slice = allLines.slice(startLine - 1, endLine)
    const content = slice.map((l, idx) => `${String(startLine + idx).padStart(4, ' ')}: ${l}`).join('\n')
    return {
      id: project.id,
      title: project.title,
      revision: project.revision,
      scriptMode: project.scriptMode,
      totalLines,
      byteLength,
      startLine,
      endLine,
      content,
    }
  }

  async createFromExemplar(
    exemplarId: string,
    titleOverride?: string,
    source: BlenderWorkflowSource = 'ui',
  ): Promise<BlenderProject> {
    const exemplar = getExemplar(exemplarId)
    const customTitle = typeof titleOverride === 'string' && titleOverride.trim() ? titleOverride.trim() : undefined
    const created = await this.store.create({
      ...exemplar.fields,
      title: customTitle || exemplar.fields.title || exemplar.titleEn,
      scriptMode: 'custom',
      customScript: exemplar.script,
    })
    const saved = await this.store.saveCheckpoint(created.id, created.revision, 'Exemplar baseline')
    await this.recordWorkflowEvent(saved.id, {
      kind: 'project_init',
      source,
      status: 'ok',
      revision: saved.revision,
      label: `从范本创建：${exemplar.titleZh}`,
      params: { exemplarId: exemplar.id, engine: saved.engine, samples: saved.samples, accentColor: saved.accentColor },
      summary: `已实例化 ${exemplar.id}（${saved.engine} ${saved.samples}spp）`,
    })
    return this.store.get(saved.id)
  }

  async patchProjectScript(
    id: string,
    revision: unknown,
    opts: {
      find?: string
      replace?: string
      replaceAll?: boolean
      edits?: ScriptPatchEdit[]
      note?: string
      allowUnsafe?: boolean
      source?: BlenderWorkflowSource
      skipWorkflowRecord?: boolean
    },
  ): Promise<
    BlenderProject & {
      project: BlenderProject
      replacements: number
      appliedEdits: number
      safety: ReturnType<typeof checkScriptSafety>
    }
  > {
    const validId = blenderId(id)
    const edits: ScriptPatchEdit[] = Array.isArray(opts.edits)
      ? opts.edits
      : [{ find: opts.find ?? '', replace: opts.replace ?? '', replaceAll: Boolean(opts.replaceAll) }]
    const current = await this.store.get(validId)
    if (revision !== undefined && revision !== current.revision) {
      throw new BlenderConflict('工程已在另一窗口更新；你的修改已保留，请刷新最新版本后重试。')
    }
    const preview = applyScriptPatches(current.customScript, edits)
    assertScriptSafeOrAllowed(preview.patched, opts.allowUnsafe)
    const { project, replacements, appliedEdits } = await this.store.patchScriptEdits(
      validId,
      revision,
      edits,
      opts.note,
    )
    if (!opts.skipWorkflowRecord) {
      const editsBytes = Buffer.byteLength(JSON.stringify(edits), 'utf8')
      const params: Record<string, unknown> = {
        appliedEdits,
        replacements,
        ...(opts.note ? { note: opts.note.slice(0, 120) } : {}),
        // Preserve replayable patch hunks when compact (<= 16 KB) so saved workflows can replay script refinements!
        ...(editsBytes <= 16_384 ? { edits } : {}),
      }
      await this.recordWorkflowEvent(project.id, {
        kind: 'script_patch',
        source: opts.source ?? 'ui',
        status: 'ok',
        revision: project.revision,
        label: defaultStepLabel('script_patch', params),
        params,
        summary: `${appliedEdits} 组补丁 / 替换 ${replacements} 处 → v${project.revision}`,
      })
    }
    const latest = await this.store.get(project.id)
    return {
      ...latest,
      project: latest,
      replacements,
      appliedEdits,
      safety: checkScriptSafety(latest.customScript),
    }
  }

  async environmentStatus(
    options: { probeBridge?: boolean; bridgeTimeoutMs?: number; forceDetect?: boolean } = {},
  ): Promise<BlenderEnvironmentStatus> {
    let bridgePatch: Partial<BlenderBridgeStatus>
    if (options.probeBridge) {
      bridgePatch = await this.bridgeStatus(options.bridgeTimeoutMs ?? 1500)
    } else if (this.lastBridgeStatus) {
      bridgePatch = this.lastBridgeStatus
    } else if (this.hasCustomBridge) {
      bridgePatch = {
        host: this.bridge.host,
        port: this.bridge.port,
        hasToken: this.bridge.hasToken,
        connected: false,
      }
    } else {
      bridgePatch = {}
    }

    const status = await this.environment.status(bridgePatch, { forceDetect: options.forceDetect })
    if (this.hasCustomBridge) {
      status.bridge = {
        ...status.bridge,
        host: this.bridge.host,
        port: this.bridge.port,
        hasToken: this.bridge.hasToken,
      }
    }
    return status
  }

  async configureSettings(patch: Partial<BlenderSettings>): Promise<BlenderEnvironmentStatus> {
    const saved = await this.environment.configure(patch)
    const bridgeChanged =
      patch.bridgeHost !== undefined || patch.bridgePort !== undefined || patch.bridgeToken !== undefined
    if (bridgeChanged) {
      this.lastBridgeStatus = undefined
      this.bridge.configure({
        host: saved.bridgeHost,
        port: saved.bridgePort,
        token: saved.bridgeToken,
      })
    }
    return this.environmentStatus({ probeBridge: false })
  }

  listJobs(): BlenderJob[] {
    return [...this.jobs.values()].map(j => structuredClone(j.view))
  }

  getJob(id: string): BlenderJob {
    const job = this.jobs.get(blenderId(id))
    if (!job) {
      throw new BlenderError('任务不存在或 DSH 已重启。工程仍保留，请刷新后重试。', 'JOB_NOT_FOUND', 404)
    }
    return structuredClone(job.view)
  }

  cancelJob(id: string): BlenderJob {
    const job = this.jobs.get(blenderId(id))
    if (!job) {
      throw new BlenderError('任务不存在。', 'JOB_NOT_FOUND', 404)
    }
    if (job.view.state === 'running') {
      job.abortReason = 'user'
      job.controller.abort()
    }
    return structuredClone(job.view)
  }

  async waitForJob(id: string): Promise<BlenderJob> {
    const validId = blenderId(id)
    const job = this.jobs.get(validId)
    if (!job) {
      throw new BlenderError('任务不存在。', 'JOB_NOT_FOUND', 404)
    }
    await job.done
    return structuredClone(job.view)
  }

  dispose(): void {
    this.disposed = true
    for (const job of this.jobs.values()) {
      if (job.view.state === 'running') {
        job.abortReason = 'dispose'
        job.controller.abort()
      }
    }
  }

  private pushJobLine(job: RunningJob, rawLine: string): void {
    const cleaned = scrubLogText(rawLine)
    if (!cleaned) return
    if (job.view.lines.at(-1) === cleaned) return
    job.view.lines.push(cleaned)
    if (job.view.lines.length > MAX_JOB_LOG_LINES) job.view.lines.shift()
  }

  private setStage(job: RunningJob, stageCode: string, stage: string, progress?: number): void {
    job.view.stageCode = stageCode
    job.view.stage = stage
    if (typeof progress === 'number' && Number.isFinite(progress)) {
      job.view.progress = Math.max(0, Math.min(100, Math.round(progress)))
    }
  }

  async startJob(
    kind: BlenderJobKind,
    id: string,
    revision?: unknown,
    options: StartJobOptions = {},
  ): Promise<BlenderJob> {
    if (this.disposed) {
      throw new BlenderError('插件已卸载，请重新加载。', 'PLUGIN_DISPOSED', 400)
    }
    if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
      throw new BlenderError('已有 Blender 任务正在运行，请等待完成或先取消当前任务。', 'JOB_CONFLICT', 409)
    }

    const validId = blenderId(id)
    const exportFormat = kind === 'export_model' ? validateExportFormat(options.format ?? 'glb') : undefined
    const pipelineOpts = kind === 'pipeline' ? validatePipelineOptions(options.pipeline) : undefined
    const validatedShots =
      kind === 'render_shots'
        ? options.shots !== undefined
          ? validateShotPresetIds(options.shots)
          : [...DEFAULT_MULTI_SHOT_IDS]
        : undefined
    const validatedQualityTier =
      kind === 'render_shots' || kind === 'preview_still' || kind === 'contact_sheet'
        ? validateQualityTier(options.qualityTier)
        : undefined

    this.starting = true
    try {
      const active = await this.environment.requireActiveExecutable()
      const snapshot = await this.store.snapshot(validId, revision)
      const project = snapshot.project

      const effectiveCustomCode =
        kind === 'run_script' && typeof options.code === 'string' && options.code.trim()
          ? options.code
          : project.scriptMode === 'custom'
            ? project.customScript
            : ''
      if (effectiveCustomCode.trim()) {
        assertScriptSafeOrAllowed(effectiveCustomCode, options.allowUnsafe)
      }

      if (this.disposed) {
        throw new BlenderError('插件已卸载，请重新加载。', 'PLUGIN_DISPOSED', 400)
      }

      if (this.jobs.size >= MAX_JOBS_RETAINED) {
        const oldestFinished = [...this.jobs.values()].find(j => j.view.state !== 'running')
        if (oldestFinished) {
          this.jobs.delete(oldestFinished.view.id)
        } else {
          throw new BlenderError('运行任务数已达上限。', 'JOB_LIMIT', 409)
        }
      }

      const jobId = randomUUID()
      const running: RunningJob = {
        view: {
          id: jobId,
          kind,
          projectId: project.id,
          revision: project.revision,
          state: 'running',
          stageCode: 'snapshot',
          stage:
            kind === 'pipeline'
              ? '准备一键全流程任务'
              : kind === 'render_shots'
                ? `准备多机位分镜批量渲染（${validatedShots?.length ?? 4} 镜）`
                : '准备工程快照与执行环境',
          progress: 2,
          lines: [],
          ...(kind === 'pipeline' ? { pipeline: { artifactIds: [] } } : {}),
          ...(kind === 'render_shots' ? { shots: [] } : {}),
          startedAt: new Date().toISOString(),
        },
        controller: new AbortController(),
        done: Promise.resolve(),
      }

      this.jobs.set(jobId, running)
      running.done = this.executeJob(running, active.path, snapshot, {
        ...options,
        format: exportFormat,
        pipeline: pipelineOpts,
        shots: validatedShots,
        qualityTier: validatedQualityTier,
      })
      return structuredClone(running.view)
    } finally {
      this.starting = false
    }
  }

  private async runHarnessStage(
    job: RunningJob,
    stageKind: Exclude<BlenderJobKind, 'pipeline' | 'workflow_replay'>,
    stageRunId: string,
    executablePath: string,
    stageProject: BlenderProject,
    snapshotAssets: Map<string, Buffer>,
    stageOptions: {
      format?: BlenderExportFormat
      overrideCode?: string
      frame?: number
      enforceRenderProfile?: boolean
      timeoutMs: number
      stageCode: string
      stageLabel: string
      progressStart: number
      progressEnd: number
    },
  ): Promise<{
    result: Awaited<ReturnType<BlenderRunner['run']>>
    artifact?: BlenderArtifact
  }> {
    const outputSpec = outputSpecForJob(stageKind, stageOptions.format)
    let stageRunDir: string | undefined
    let keepStageDir = false

    try {
      job.controller.signal.throwIfAborted()
      stageRunDir = await this.store.runDir(stageProject.id, stageRunId)
      const assetsDir = join(stageRunDir, 'assets')
      await mkdir(assetsDir, { recursive: true })
      for (const [file, bytes] of snapshotAssets) {
        await writeFile(join(assetsDir, file), bytes, { flag: 'wx', mode: 0o600 })
      }

      const outputPath = outputSpec ? join(stageRunDir, outputSpec.fileName) : undefined
      const scriptPath = join(stageRunDir, 'run.py')
      const settings = await this.environment.getSettings()
      const initialComputeDevice = settings.computeDevice ?? 'auto'
      const buildStageScript = (computeDevice: 'auto' | 'gpu' | 'cpu') =>
        generateRunnerHarness(stageKind, {
          project: stageProject,
          assetsDir,
          outputPath,
          format: stageOptions.format,
          overrideCode: stageKind === 'run_script' ? stageOptions.overrideCode : undefined,
          frame: stageOptions.frame,
          computeDevice,
          enforceRenderProfile: stageOptions.enforceRenderProfile,
        })

      this.setStage(job, stageOptions.stageCode, stageOptions.stageLabel, stageOptions.progressStart)
      const startedAt = Date.now()
      const span = Math.max(1, stageOptions.progressEnd - stageOptions.progressStart)
      let tileIndex = 0
      let tileTotal = 0

      const singleFrame = Math.max(1, Math.floor(stageOptions.frame ?? stageProject.frameStart))
      const runFrameStart = stageKind === 'render_animation' ? stageProject.frameStart : singleFrame
      const runFrameEnd = stageKind === 'render_animation' ? stageProject.frameEnd : singleFrame

      const invokeRunner = (computeDevice: 'auto' | 'gpu' | 'cpu', remainingMs: number) =>
        this.runner.run({
          executablePath,
          scriptPath,
          scriptContent: buildStageScript(computeDevice),
          cwd: stageRunDir!,
          frameStart: runFrameStart,
          frameEnd: runFrameEnd,
          timeoutMs: remainingMs,
          signal: job.controller.signal,
          onLine: line => this.pushJobLine(job, line),
          onProgress: (progress, stage) => {
            if (stageKind === 'contact_sheet' && typeof stage === 'string') {
              const tileMatch = /\((\d+)\/(\d+)\)/.exec(stage)
              if (tileMatch) {
                const cur = Math.max(1, Number(tileMatch[1]))
                const tot = Math.max(1, Number(tileMatch[2]))
                if (tot > 1 && cur <= tot) {
                  tileIndex = cur - 1
                  tileTotal = tot
                }
              }
            }
            let mapped = job.view.progress
            if (stageKind === 'contact_sheet' && tileTotal > 1) {
              const tileFraction = progress > 0 ? Math.min(100, progress) / 100 : 0.05
              const overallFraction = Math.min(1, (tileIndex + tileFraction) / tileTotal)
              mapped = stageOptions.progressStart + Math.round(overallFraction * span)
            } else if (progress > 0) {
              mapped = stageOptions.progressStart + Math.round((Math.min(100, progress) / 100) * span)
            }
            const nextPct = Math.max(job.view.progress, Math.min(stageOptions.progressEnd, mapped))
            this.setStage(job, stageOptions.stageCode, stage || job.view.stage, nextPct)
          },
        })

      let result: Awaited<ReturnType<BlenderRunner['run']>>
      try {
        result = await invokeRunner(initialComputeDevice, stageOptions.timeoutMs)
      } catch (err) {
        const canCpuFallback =
          initialComputeDevice === 'auto' &&
          !job.controller.signal.aborted &&
          isCyclesGpuCrashError(err)
        if (!canCpuFallback) throw err
        const elapsed = Date.now() - startedAt
        const fallbackTimeout = Math.max(20_000, stageOptions.timeoutMs - elapsed)
        this.pushJobLine(
          job,
          '[dsh-blender-studio] Cycles GPU 渲染异常（CUDA/OPTIX），已自动回退至 Cycles CPU 重试…',
        )
        this.setStage(
          job,
          stageOptions.stageCode,
          `${stageOptions.stageLabel}（GPU 异常，自动回退 CPU 重试）`,
          Math.max(stageOptions.progressStart, job.view.progress),
        )
        tileIndex = 0
        tileTotal = 0
        result = await invokeRunner('cpu', fallbackTimeout)
      }

      job.controller.signal.throwIfAborted()

      if (result.sceneSummary) {
        job.view.sceneSummary = result.sceneSummary
        await this.store.updateSceneSummary(stageProject.id, result.sceneSummary)
      }

      if (stageKind === 'run_script') {
        const combined = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
        job.view.scriptOutput = scrubLogText(combined, 16_000)
      }

      let artifact: BlenderArtifact | undefined
      if (outputSpec && outputPath) {
        let finalFileName = outputSpec.fileName
        let finalFilePath = outputPath
        let finalMime = outputSpec.mime

        let fileInfo = await stat(finalFilePath).catch(() => null)
        if ((!fileInfo || !fileInfo.isFile() || fileInfo.size <= 0) && stageKind === 'render_animation') {
          const framesDir = join(stageRunDir, 'frames')
          const frameEntries = (await readdir(framesDir).catch(() => []))
            .filter(name => /\.png$/i.test(name))
            .sort()
          if (frameEntries.length > 0) {
            const firstFrame = join(framesDir, frameEntries[0])
            const firstBytes = await readFile(firstFrame)
            finalFileName = 'frame_0001.png'
            finalFilePath = join(stageRunDir, finalFileName)
            finalMime = ARTIFACT_MIME_MAP.png
            await writeFile(finalFilePath, firstBytes, { mode: 0o600 })
            fileInfo = await stat(finalFilePath).catch(() => null)
          }
        }

        if (!fileInfo || !fileInfo.isFile() || fileInfo.size <= 0) {
          throw new BlenderError('Blender 任务结束但未生成有效成品文件，请展开日志检查。', 'OUTPUT_INVALID', 400)
        }
        if (fileInfo.size > MAX_ARTIFACT_DOWNLOAD_BYTES) {
          throw new BlenderError('生成的成品文件超过 200 MB 下载上限。', 'OUTPUT_TOO_LARGE', 400)
        }

        const { width: baseW, height: baseH } = resolveRenderResolution(
          stageProject.aspect,
          stageProject.resolutionScale,
        )
        let dims: { width?: number; height?: number } = {}
        if (finalMime === 'image/png') {
          dims = await readPngDimensions(finalFilePath, baseW, baseH)
        } else if (outputSpec.artifactKind === 'animation') {
          dims = { width: baseW, height: baseH }
        }

        artifact = {
          id: stageRunId,
          kind: outputSpec.artifactKind,
          revision: stageProject.revision,
          file: finalFileName,
          mime: finalMime,
          size: fileInfo.size,
          engine: stageProject.engine,
          samples: stageProject.samples,
          width: dims.width,
          height: dims.height,
          durationMs: Math.max(1, result.durationMs || Date.now() - startedAt),
          created: new Date().toISOString(),
        }

        await this.store.registerArtifact(stageProject.id, artifact)
        await this.store.pruneRunWorkdir(stageRunDir, [finalFileName])
        keepStageDir = true
      }

      return { result, artifact }
    } finally {
      if (stageRunDir && !keepStageDir) {
        await this.store.safeRemoveRunDir(stageProject.id, stageRunId)
      }
    }
  }

  private async executeJob(
    job: RunningJob,
    executablePath: string,
    snapshot: { project: BlenderProject; assets: Map<string, Buffer> },
    options: StartJobOptions,
  ): Promise<void> {
    const project = snapshot.project
    let unlock: (() => Promise<void>) | undefined

    let finalState: BlenderJob['state'] = 'failed'
    let finalStageCode = 'failed'
    let finalStage = '任务未完成'

    const pipelineOpts = job.view.kind === 'pipeline' ? validatePipelineOptions(options.pipeline) : undefined
    const timeoutMs =
      options.timeoutMs ??
      (job.view.kind === 'pipeline'
        ? pipelineOpts?.renderKind === 'animation'
          ? 900_000
          : pipelineOpts?.qualityTier === 'beauty' || project.engine === 'CYCLES'
            ? 600_000
            : 360_000
        : job.view.kind === 'render_shots'
          ? options.qualityTier === 'beauty' || project.engine === 'CYCLES'
            ? 600_000
            : 360_000
          : job.view.kind === 'render_animation'
            ? ANIMATION_JOB_TIMEOUT_MS
            : project.engine === 'CYCLES'
              ? DEFAULT_CYCLES_TIMEOUT_MS
              : DEFAULT_EEVEE_TIMEOUT_MS)

    const timer = setTimeout(() => {
      job.abortReason ??= 'timeout'
      job.controller.abort()
    }, timeoutMs)
    timer.unref?.()

    try {
      await this.store.init()
      const slot = join(this.store.root, 'workbench-slot')
      await mkdir(slot, { recursive: true })
      unlock = await lockfile.lock(slot, {
        retries: 0,
        stale: 30_000,
        update: 10_000,
        onCompromised: () => {
          job.abortReason ??= 'lock-lost'
          job.controller.abort()
        },
      })

      if (job.view.kind === 'pipeline' && pipelineOpts) {
        const summary: BlenderPipelineSummary = { artifactIds: [] }
        job.view.pipeline = summary
        const deadline = Date.now() + timeoutMs
        const remainingTimeout = () => Math.max(10_000, deadline - Date.now())

        // Stage 1: inspect_scene + QC-3D audit
        const qcStage = await this.runHarnessStage(
          job,
          'inspect_scene',
          randomUUID(),
          executablePath,
          project,
          snapshot.assets,
          {
            frame: options.frame,
            timeoutMs: remainingTimeout(),
            stageCode: 'pipeline-qc',
            stageLabel: '全流程 (1/4)：场景构建与 QC-3D 体检',
            progressStart: 5,
            progressEnd: 18,
          },
        )
        if (qcStage.result.sceneSummary?.qc) {
          summary.qc = qcStage.result.sceneSummary.qc
        }

        const errorIssues = summary.qc?.issues?.filter(issue => issue.severity === 'error') ?? []
        if (pipelineOpts.abortOnQcError && errorIssues.length > 0) {
          summary.stoppedEarly = true
          summary.stopReason = `QC-3D 检测到阻断性错误（${errorIssues.map(i => i.code).join(', ')}），已提前中止渲染。`
          finalState = 'done'
          finalStageCode = 'stopped-early'
          finalStage = summary.stopReason
          job.view.progress = 100
        } else {
          // Stage 2: 2x2 multi-angle visual QC contact sheet (fast EEVEE 16 spp)
          if (pipelineOpts.includeContactSheet) {
            const csId = randomUUID()
            const qcProject: BlenderProject = { ...project, engine: 'EEVEE', samples: 16 }
            const csStage = await this.runHarnessStage(
              job,
              'contact_sheet',
              csId,
              executablePath,
              qcProject,
              snapshot.assets,
              {
                frame: options.frame,
                enforceRenderProfile: true,
                timeoutMs: remainingTimeout(),
                stageCode: 'pipeline-contact-sheet',
                stageLabel: '全流程 (2/4)：渲染 2×2 四视角质检拼图 (EEVEE 16 spp)',
                progressStart: 20,
                progressEnd: 46,
              },
            )
            if (csStage.artifact) {
              summary.contactSheetId = csStage.artifact.id
              summary.artifactIds.push(csStage.artifact.id)
              job.view.artifactId = csStage.artifact.id
              job.view.artifactKind = csStage.artifact.kind
            }
          }

          // Stage 3: Primary render with optional qualityTier (without mutating saved project)
          const renderProject = applyQualityTier(project, pipelineOpts.qualityTier)
          const primaryKind: 'preview_still' | 'render_animation' =
            pipelineOpts.renderKind === 'animation' ? 'render_animation' : 'preview_still'
          const renderId = randomUUID()
          const renderStage = await this.runHarnessStage(
            job,
            primaryKind,
            renderId,
            executablePath,
            renderProject,
            snapshot.assets,
            {
              frame: options.frame,
              enforceRenderProfile: Boolean(pipelineOpts.qualityTier),
              timeoutMs: remainingTimeout(),
              stageCode: 'pipeline-render',
              stageLabel: `全流程 (3/4)：主画面渲染 (${renderProject.engine} ${renderProject.samples} spp · ${renderProject.resolutionScale}%)`,
              progressStart: 48,
              progressEnd: 84,
            },
          )
          if (renderStage.result.sceneSummary?.qc) {
            summary.qc = renderStage.result.sceneSummary.qc
          }
          if (renderStage.artifact) {
            summary.primaryRenderId = renderStage.artifact.id
            summary.artifactIds.push(renderStage.artifact.id)
            job.view.artifactId = renderStage.artifact.id
            job.view.artifactKind = renderStage.artifact.kind
          }

          // Stage 4: Optional 3D model export
          if (pipelineOpts.exportFormat !== 'none') {
            const exportId = randomUUID()
            const exportStage = await this.runHarnessStage(
              job,
              'export_model',
              exportId,
              executablePath,
              project,
              snapshot.assets,
              {
                format: pipelineOpts.exportFormat,
                timeoutMs: remainingTimeout(),
                stageCode: 'pipeline-export',
                stageLabel: `全流程 (4/4)：导出 3D 模型 (${pipelineOpts.exportFormat.toUpperCase()})`,
                progressStart: 86,
                progressEnd: 98,
              },
            )
            if (exportStage.artifact) {
              summary.modelArtifactId = exportStage.artifact.id
              summary.artifactIds.push(exportStage.artifact.id)
            }
          }

          const userCancelled =
            job.controller.signal.aborted &&
            (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason)
          finalState = userCancelled ? 'cancelled' : 'done'
          finalStageCode = userCancelled ? 'cancelled' : 'done'
          finalStage = userCancelled
            ? '已取消'
            : `全流程完成（生成 ${summary.artifactIds.length} 项成品${summary.qc ? ` · QC-3D ${summary.qc.score}/${summary.qc.grade}` : ''}）`
          if (finalState === 'done') job.view.progress = 100
        }
      } else if (job.view.kind === 'render_shots') {
        const shotIds =
          options.shots && options.shots.length > 0 ? options.shots : [...DEFAULT_MULTI_SHOT_IDS]
        const renderProject = applyQualityTier(project, options.qualityTier)
        const settings = await this.environment.getSettings()
        // Keep temporary batch staging outside projects/<id>/runs so registerArtifact's
        // pruneOldRuns never deletes remaining shots while registering shot 1..N.
        const batchRunDir = join(this.store.root, 'tmp', `shots-${job.view.id}`)
        const completedShots: BlenderShotResult[] = []

        try {
          job.controller.signal.throwIfAborted()
          const assetsDir = join(batchRunDir, 'assets')
          const shotsOutDir = join(batchRunDir, 'shots')
          await mkdir(assetsDir, { recursive: true, mode: 0o700 })
          await mkdir(shotsOutDir, { recursive: true, mode: 0o700 })
          await this.store.checkPath(batchRunDir)
          for (const [file, bytes] of snapshot.assets) {
            await writeFile(join(assetsDir, file), bytes, { flag: 'wx', mode: 0o600 })
          }

          const scriptPath = join(batchRunDir, 'run.py')
          const initialComputeDevice = settings.computeDevice ?? 'auto'
          const buildShotsScript = (computeDevice: 'auto' | 'gpu' | 'cpu') =>
            generateRunnerHarness('render_shots', {
              project: renderProject,
              assetsDir,
              outputDir: shotsOutDir,
              shots: shotIds,
              frame: options.frame,
              computeDevice,
              enforceRenderProfile: Boolean(options.qualityTier),
            })

          this.setStage(
            job,
            'render-shots',
            `多机位批量渲染 (0/${shotIds.length} · ${renderProject.engine} ${renderProject.samples} spp)`,
            8,
          )
          const startedAt = Date.now()
          const totalShots = Math.max(1, shotIds.length)
          const shotSliceStart = (idx: number) => 8 + (Math.min(idx, totalShots) / totalShots) * 86
          const shotSliceEnd = (idx: number) => 8 + (Math.min(idx + 1, totalShots) / totalShots) * 86
          let doneCount = 0

          const shotFrame = Math.max(1, Math.floor(options.frame ?? renderProject.frameStart))
          const invokeShotsRunner = (computeDevice: 'auto' | 'gpu' | 'cpu', remainingMs: number) =>
            this.runner.run({
              executablePath,
              scriptPath,
              scriptContent: buildShotsScript(computeDevice),
              cwd: batchRunDir,
              frameStart: shotFrame,
              frameEnd: shotFrame,
              timeoutMs: remainingMs,
              signal: job.controller.signal,
              onLine: line => this.pushJobLine(job, line),
              onShotDone: shot => {
                doneCount = Math.min(totalShots, Math.max(doneCount + 1, shot.index ?? doneCount + 1))
                const pct = Math.max(job.view.progress, Math.min(94, Math.round(shotSliceStart(doneCount))))
                const label = shot.labelZh || shot.shotId
                this.setStage(
                  job,
                  'render-shots',
                  `多机位分镜已完成 ${doneCount}/${totalShots}：${label} (${shot.lensMm}mm)`,
                  pct,
                )
              },
              onProgress: (progress, stage) => {
                if (doneCount < totalShots) {
                  const startPct = shotSliceStart(doneCount)
                  const endPct = Math.max(startPct + 1, shotSliceEnd(doneCount) - 1)
                  const rawMapped =
                    progress > 0
                      ? Math.round(startPct + (Math.min(100, progress) / 100) * (endPct - startPct))
                      : job.view.progress
                  const mapped = Math.max(job.view.progress, Math.min(94, rawMapped))
                  this.setStage(job, 'render-shots', stage || job.view.stage, mapped)
                }
              },
            })

          let result: Awaited<ReturnType<BlenderRunner['run']>>
          try {
            result = await invokeShotsRunner(initialComputeDevice, timeoutMs)
          } catch (err) {
            const canCpuFallback =
              initialComputeDevice === 'auto' &&
              !job.controller.signal.aborted &&
              isCyclesGpuCrashError(err)
            if (!canCpuFallback) throw err
            const elapsed = Date.now() - startedAt
            const fallbackTimeout = Math.max(30_000, timeoutMs - elapsed)
            this.pushJobLine(
              job,
              '[dsh-blender-studio] 多机位 Cycles GPU 渲染异常，已自动回退至 Cycles CPU 重试…',
            )
            doneCount = 0
            result = await invokeShotsRunner('cpu', fallbackTimeout)
          }

          job.controller.signal.throwIfAborted()

          if (result.sceneSummary) {
            job.view.sceneSummary = result.sceneSummary
            await this.store.updateSceneSummary(project.id, result.sceneSummary)
          }

          const parsedMap = new Map((result.shots ?? []).map(s => [s.shotId, s]))
          const { width: baseW, height: baseH } = resolveRenderResolution(
            renderProject.aspect,
            renderProject.resolutionScale,
          )
          const perShotDuration = Math.max(
            1,
            Math.round((result.durationMs || Date.now() - startedAt) / Math.max(1, shotIds.length)),
          )

          for (const shotId of shotIds) {
            const fileName = `shot_${shotId}.png`
            const srcFile = join(shotsOutDir, fileName)
            const fileInfo = await stat(srcFile).catch(() => null)
            if (!fileInfo || !fileInfo.isFile() || fileInfo.size <= 0) {
              continue
            }
            if (fileInfo.size > MAX_ARTIFACT_DOWNLOAD_BYTES) {
              throw new BlenderError('单张分镜成品超过 200 MB 下载上限。', 'OUTPUT_TOO_LARGE', 400)
            }

            const preset = BLENDER_SHOT_PRESETS.find(p => p.id === shotId)
            const parsed = parsedMap.get(shotId)
            const shotArtifactId = randomUUID()
            const shotRunDir = await this.store.runDir(project.id, shotArtifactId)
            let registered = false
            try {
              const dstFile = join(shotRunDir, fileName)
              await copyFile(srcFile, dstFile)
              const dims = await readPngDimensions(dstFile, parsed?.width ?? baseW, parsed?.height ?? baseH)
              const lensMm = parsed?.lensMm ?? preset?.lensMm ?? 50
              const labelZh = parsed?.labelZh ?? preset?.zh ?? shotId
              const labelEn = parsed?.labelEn ?? preset?.en ?? shotId

              const artifact: BlenderArtifact = {
                id: shotArtifactId,
                kind: 'shot',
                revision: project.revision,
                file: fileName,
                mime: ARTIFACT_MIME_MAP.png,
                size: fileInfo.size,
                engine: renderProject.engine,
                samples: renderProject.samples,
                width: dims.width,
                height: dims.height,
                durationMs: perShotDuration,
                created: new Date().toISOString(),
                shotId,
                label: `${labelZh} · ${lensMm}mm`,
              }
              await this.store.registerArtifact(project.id, artifact)
              registered = true
              completedShots.push({
                shotId,
                labelZh,
                labelEn,
                artifactId: shotArtifactId,
                lensMm,
                width: dims.width,
                height: dims.height,
              })
            } finally {
              if (!registered) {
                await this.store.safeRemoveRunDir(project.id, shotArtifactId)
              }
            }
          }

          if (completedShots.length === 0) {
            throw new BlenderError('多机位批量渲染未生成有效 PNG 分镜，请展开日志检查。', 'OUTPUT_INVALID', 400)
          }

          job.view.shots = completedShots
          job.view.artifactId = completedShots[0].artifactId
          job.view.artifactKind = 'shot'

          const userCancelled =
            job.controller.signal.aborted &&
            (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason)
          finalState = userCancelled ? 'cancelled' : 'done'
          finalStageCode = userCancelled ? 'cancelled' : 'done'
          finalStage = userCancelled
            ? '已取消'
            : `多机位分镜完成（已产出 ${completedShots.length} 张分镜图）`
          if (finalState === 'done') job.view.progress = 100
        } finally {
          await this.store.checkPath(batchRunDir).then(
            () => rm(batchRunDir, { recursive: true, force: true, maxRetries: 4, retryDelay: 50 }),
            () => undefined,
          ).catch(() => {})
        }
      } else {
        const effectiveProject =
          (job.view.kind === 'preview_still' || job.view.kind === 'contact_sheet') && options.qualityTier
            ? applyQualityTier(project, options.qualityTier)
            : project
        const single = await this.runHarnessStage(
          job,
          job.view.kind as Exclude<BlenderJobKind, 'pipeline' | 'render_shots' | 'workflow_replay'>,
          job.view.id,
          executablePath,
          effectiveProject,
          snapshot.assets,
          {
            format: options.format,
            overrideCode: options.code,
            frame: options.frame,
            enforceRenderProfile: Boolean(
              options.qualityTier && (job.view.kind === 'preview_still' || job.view.kind === 'contact_sheet'),
            ),
            timeoutMs,
            stageCode: 'running',
            stageLabel:
              options.qualityTier && (job.view.kind === 'preview_still' || job.view.kind === 'contact_sheet')
                ? `正在执行 Blender 任务 (${effectiveProject.engine} ${effectiveProject.samples} spp · ${effectiveProject.resolutionScale}%)`
                : '正在执行 Blender 任务',
            progressStart: 8,
            progressEnd: 99,
          },
        )
        if (single.artifact) {
          job.view.artifactId = single.artifact.id
          job.view.artifactKind = single.artifact.kind
        }

        const userCancelled =
          job.controller.signal.aborted &&
          (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason)
        finalState = userCancelled ? 'cancelled' : 'done'
        finalStageCode = userCancelled ? 'cancelled' : 'done'
        finalStage = userCancelled ? '已取消' : '已完成'
        if (finalState === 'done') job.view.progress = 100
      }
    } catch (err) {
      const errCode = (err as { code?: string })?.code
      const message =
        errCode === 'ELOCKED'
          ? '另一个 DSH 实例正在执行 Blender 任务，请等待完成或停止后再试。'
          : errorMessage(err)
      const isUserCancel =
        errCode === 'JOB_CANCELLED' ||
        (job.controller.signal.aborted &&
          (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason))
      finalState = isUserCancel ? 'cancelled' : 'failed'
      finalStageCode = isUserCancel
        ? 'cancelled'
        : job.abortReason || (typeof errCode === 'string' ? errCode.toLowerCase() : 'failed')
      finalStage = isUserCancel ? '已取消；工程已保留' : message
      this.pushJobLine(job, message)
    } finally {
      clearTimeout(timer)
      if (unlock) await unlock().catch(() => {})
      this.setStage(job, finalStageCode, finalStage)
      job.view.state = finalState
      job.view.finishedAt = new Date().toISOString()

      const recordableJobKinds = new Set([
        'inspect_scene',
        'preview_still',
        'contact_sheet',
        'render_shots',
        'render_animation',
        'export_model',
        'pipeline',
      ])
      if (!options.skipWorkflowRecord && recordableJobKinds.has(job.view.kind)) {
        const durationMs = Math.max(
          1,
          Date.parse(job.view.finishedAt) - Date.parse(job.view.startedAt || job.view.finishedAt),
        )
        const wfParams: Record<string, unknown> = {}
        if (options.qualityTier) wfParams.qualityTier = options.qualityTier
        if (options.frame !== undefined) wfParams.frame = options.frame
        if (options.format) wfParams.format = options.format
        if (options.shots) wfParams.shots = options.shots
        if (options.pipeline) {
          if (typeof options.pipeline.includeContactSheet === 'boolean') {
            wfParams.includeContactSheet = options.pipeline.includeContactSheet
          }
          if (options.pipeline.renderKind) wfParams.renderKind = options.pipeline.renderKind
          if (options.pipeline.exportFormat) wfParams.exportFormat = options.pipeline.exportFormat
          if (options.pipeline.qualityTier) wfParams.qualityTier = options.pipeline.qualityTier
          if (options.pipeline.abortOnQcError) wfParams.abortOnQcError = true
        }
        const qc = job.view.sceneSummary?.qc ?? job.view.pipeline?.qc
        const summaryParts: string[] = []
        if (qc) summaryParts.push(`QC-3D ${qc.score}/${qc.grade}`)
        if (job.view.shots?.length) summaryParts.push(`${job.view.shots.length} 镜`)
        if (job.view.pipeline?.artifactIds?.length) summaryParts.push(`${job.view.pipeline.artifactIds.length} 成品`)
        if (finalState !== 'done') summaryParts.push(finalState)
        await this.recordWorkflowEvent(project.id, {
          kind: job.view.kind as any,
          source: options.source ?? 'ui',
          status: finalState === 'done' ? 'ok' : finalState === 'cancelled' ? 'skipped' : 'failed',
          revision: project.revision,
          durationMs,
          label: defaultStepLabel(job.view.kind as any, wfParams),
          params: wfParams,
          ...(summaryParts.length ? { summary: summaryParts.join(' · ') } : {}),
          ...(job.view.artifactId ? { artifactId: job.view.artifactId } : {}),
          ...(finalState === 'failed' ? { error: finalStage.slice(0, 200) } : {}),
        })
      }
    }
  }

  async replayWorkflow(
    workflowId: string,
    projectId: string,
    options: ReplayWorkflowOptions = {},
  ): Promise<BlenderJob | { dryRun: true; workflowReplay: BlenderWorkflowReplaySummary; projectId: string; revision: number }> {
    if (this.disposed) {
      throw new BlenderError('插件已卸载，请重新加载。', 'PLUGIN_DISPOSED', 400)
    }
    const validProjectId = blenderId(projectId)
    const recipe = await this.workflows.get(workflowId)
    const current = await this.store.get(validProjectId)
    if (options.revision !== undefined && options.revision !== current.revision) {
      throw new BlenderConflict('工程已在另一窗口更新；请刷新最新版本后再重放工作流。')
    }
    const enabledSteps = recipe.steps.filter(s => s.enabled !== false)
    if (enabledSteps.length === 0) {
      throw new BlenderError('该工作流中没有已启用的可执行步骤。', 'WORKFLOW_INVALID', 400)
    }

    const overrides = validateWorkflowReplayOverrides(options.overrides)
    if (options.dryRun === true) {
      const planned: BlenderWorkflowReplayStepResult[] = enabledSteps.map((step, idx) => {
        const hints: string[] = []
        const effectiveTier = overrides.qualityTier ?? (typeof step.params.qualityTier === 'string' ? step.params.qualityTier : undefined)
        const effectiveClay = overrides.clayMode ?? (typeof step.params.clayMode === 'boolean' ? step.params.clayMode : undefined)
        if (effectiveTier && ['preview_still', 'contact_sheet', 'render_shots', 'pipeline'].includes(step.kind)) {
          hints.push(`qualityTier=${effectiveTier}`)
        }
        if (effectiveClay !== undefined && ['preview_still', 'contact_sheet', 'render_shots', 'render_animation', 'pipeline', 'bridge_sync'].includes(step.kind)) {
          hints.push(`clayMode=${effectiveClay}`)
        }
        if (overrides.exportFormat && (step.kind === 'export_model' || step.kind === 'pipeline')) {
          hints.push(`exportFormat=${overrides.exportFormat}`)
        }
        if (overrides.accentColor) hints.push(`accentColor=${overrides.accentColor}`)
        if (overrides.lensMm !== undefined) hints.push(`lensMm=${overrides.lensMm}mm`)
        if (overrides.exposure !== undefined) hints.push(`exposure=${overrides.exposure}`)
        return {
          stepId: step.id,
          index: idx + 1,
          kind: step.kind,
          label: step.label || defaultStepLabel(step.kind, step.params),
          status: 'skipped',
          durationMs: 0,
          summary: `预演：${step.kind}${hints.length ? ` (${hints.join(', ')})` : ''}`,
        }
      })
      return {
        dryRun: true,
        projectId: current.id,
        revision: current.revision,
        workflowReplay: {
          workflowId: recipe.id,
          workflowName: recipe.name,
          dryRun: true,
          totalSteps: enabledSteps.length,
          completedSteps: 0,
          failedSteps: 0,
          skippedSteps: enabledSteps.length,
          artifactIds: [],
          steps: planned,
        },
      }
    }

    if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
      throw new BlenderError('已有 Blender 任务正在运行，请等待完成或先取消当前任务。', 'JOB_CONFLICT', 409)
    }

    const cliStepKinds = new Set([
      'inspect_scene',
      'preview_still',
      'contact_sheet',
      'render_shots',
      'render_animation',
      'export_model',
      'pipeline',
    ])
    const firstCliIdx = enabledSteps.findIndex(s => cliStepKinds.has(s.kind))
    const firstPatchIdx = enabledSteps.findIndex(s => s.kind === 'script_patch')
    const needsCli = firstCliIdx !== -1
    if (
      needsCli &&
      (firstPatchIdx === -1 || firstCliIdx < firstPatchIdx) &&
      current.scriptMode === 'custom' &&
      current.customScript.trim()
    ) {
      assertScriptSafeOrAllowed(current.customScript, options.allowUnsafe)
    }
    let activeExecPath = ''
    if (needsCli) {
      activeExecPath = (await this.environment.requireActiveExecutable()).path
    }

    this.starting = true
    try {
      if (this.jobs.size >= MAX_JOBS_RETAINED) {
        const oldestFinished = [...this.jobs.values()].find(j => j.view.state !== 'running')
        if (oldestFinished) {
          this.jobs.delete(oldestFinished.view.id)
        } else {
          throw new BlenderError('运行任务数已达上限。', 'JOB_LIMIT', 409)
        }
      }

      const jobId = randomUUID()
      const summary: BlenderWorkflowReplaySummary = {
        workflowId: recipe.id,
        workflowName: recipe.name,
        dryRun: false,
        totalSteps: enabledSteps.length,
        completedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        artifactIds: [],
        steps: [],
      }

      const running: RunningJob = {
        view: {
          id: jobId,
          kind: 'workflow_replay',
          projectId: current.id,
          revision: current.revision,
          state: 'running',
          stageCode: 'workflow-init',
          stage: `准备重放工作流「${recipe.name}」（共 ${enabledSteps.length} 步）`,
          progress: 2,
          lines: [],
          workflowReplay: summary,
          startedAt: new Date().toISOString(),
        },
        controller: new AbortController(),
        done: Promise.resolve(),
      }

      this.jobs.set(jobId, running)
      running.done = this.executeWorkflowReplay(running, recipe, enabledSteps, validProjectId, activeExecPath, {
        ...options,
        overrides,
      })
      return structuredClone(running.view)
    } finally {
      this.starting = false
    }
  }

  private async executeWorkflowReplay(
    job: RunningJob,
    recipe: BlenderWorkflowRecipe,
    steps: BlenderWorkflowRecipe['steps'],
    projectId: string,
    executablePath: string,
    options: ReplayWorkflowOptions,
  ): Promise<void> {
    const summary = job.view.workflowReplay!
    const stopOnError = options.stopOnError !== false
    const skipIfBridgeOffline = options.skipIfBridgeOffline !== false
    const overrides = options.overrides ?? {}
    const timeoutMs = options.timeoutMs ?? Math.max(600_000, steps.length * 180_000)
    const deadline = Date.now() + timeoutMs
    const remainingTimeout = () => Math.max(15_000, deadline - Date.now())

    let unlock: (() => Promise<void>) | undefined
    let finalState: BlenderJob['state'] = 'failed'
    let finalStageCode = 'failed'
    let finalStage = '工作流重放未完成'

    const timer = setTimeout(() => {
      job.abortReason ??= 'timeout'
      job.controller.abort()
    }, timeoutMs)
    timer.unref?.()

    try {
      await this.store.init()
      const slot = join(this.store.root, 'workbench-slot')
      await mkdir(slot, { recursive: true })
      unlock = await lockfile.lock(slot, {
        retries: 0,
        stale: 30_000,
        update: 10_000,
        onCompromised: () => {
          job.abortReason ??= 'lock-lost'
          job.controller.abort()
        },
      })

      const applyReplayLookdevOverrides = (
        proj: BlenderProject,
        opts: { stepClayMode?: boolean; allowClay?: boolean } = {},
      ): BlenderProject => {
        const effectiveClay =
          opts.allowClay === false
            ? undefined
            : overrides.clayMode !== undefined
              ? overrides.clayMode
              : opts.stepClayMode
        return {
          ...proj,
          ...(overrides.accentColor ? { accentColor: overrides.accentColor } : {}),
          ...(overrides.lensMm !== undefined ? { lensMm: overrides.lensMm } : {}),
          ...(overrides.exposure !== undefined ? { exposure: overrides.exposure } : {}),
          ...(effectiveClay !== undefined ? { clayMode: effectiveClay } : {}),
        }
      }

      const total = Math.max(1, steps.length)
      for (let idx = 0; idx < steps.length; idx++) {
        job.controller.signal.throwIfAborted()
        const step = steps[idx]
        const stepLabel = step.label || defaultStepLabel(step.kind, step.params)
        const progressStart = Math.round(5 + (idx / total) * 90)
        const progressEnd = Math.round(5 + ((idx + 1) / total) * 90)
        const stepStartedAt = Date.now()
        this.setStage(job, `workflow-step-${idx + 1}`, `重放工作流 (${idx + 1}/${total})：${stepLabel}`, progressStart)
        this.pushJobLine(job, `[workflow] (${idx + 1}/${total}) ${step.kind}: ${stepLabel}`)

        try {
          const latest = await this.store.get(projectId)
          job.view.revision = latest.revision

          if (step.kind === 'lookdev_update') {
            const rawFields =
              step.params.fields && typeof step.params.fields === 'object'
                ? { ...(step.params.fields as Record<string, unknown>) }
                : { ...step.params }
            if (overrides.accentColor && rawFields.accentColor !== undefined) rawFields.accentColor = overrides.accentColor
            if (overrides.lensMm !== undefined && rawFields.lensMm !== undefined) rawFields.lensMm = overrides.lensMm
            if (overrides.exposure !== undefined && rawFields.exposure !== undefined) rawFields.exposure = overrides.exposure
            if (overrides.clayMode !== undefined && rawFields.clayMode !== undefined) rawFields.clayMode = overrides.clayMode
            const updated = await this.store.update(projectId, latest.revision, rawFields)
            job.view.revision = updated.revision
            summary.completedSteps++
            summary.steps.push({
              stepId: step.id,
              index: idx + 1,
              kind: step.kind,
              label: stepLabel,
              status: 'done',
              durationMs: Math.max(1, Date.now() - stepStartedAt),
              summary: `已更新 ${Object.keys(rawFields).join(', ')} → v${updated.revision}`,
            })
          } else if (step.kind === 'script_patch') {
            const patchRes = await this.patchProjectScript(projectId, latest.revision, {
              edits: Array.isArray(step.params.edits) ? (step.params.edits as ScriptPatchEdit[]) : undefined,
              find: typeof step.params.find === 'string' ? step.params.find : undefined,
              replace: typeof step.params.replace === 'string' ? step.params.replace : undefined,
              replaceAll: step.params.replaceAll === true,
              note: typeof step.params.note === 'string' ? step.params.note : `Workflow: ${recipe.name}`,
              allowUnsafe: options.allowUnsafe === true,
              source: 'replay',
              skipWorkflowRecord: true,
            })
            job.view.revision = patchRes.revision
            summary.completedSteps++
            summary.steps.push({
              stepId: step.id,
              index: idx + 1,
              kind: step.kind,
              label: stepLabel,
              status: 'done',
              durationMs: Math.max(1, Date.now() - stepStartedAt),
              summary: `替换 ${patchRes.replacements} 处 → v${patchRes.revision}`,
            })
          } else if (step.kind === 'checkpoint_save') {
            const note =
              typeof step.params.note === 'string' && step.params.note.trim()
                ? step.params.note.trim()
                : `Workflow: ${recipe.name}`
            const saved = await this.store.saveCheckpoint(projectId, latest.revision, note)
            job.view.revision = saved.revision
            summary.completedSteps++
            summary.steps.push({
              stepId: step.id,
              index: idx + 1,
              kind: step.kind,
              label: stepLabel,
              status: 'done',
              durationMs: Math.max(1, Date.now() - stepStartedAt),
              summary: `已保存快照「${note}」(v${saved.revision})`,
            })
          } else if (
            step.kind === 'inspect_scene' ||
            step.kind === 'preview_still' ||
            step.kind === 'contact_sheet' ||
            step.kind === 'render_animation' ||
            step.kind === 'export_model'
          ) {
            const snap = await this.store.snapshot(projectId)
            if (snap.project.scriptMode === 'custom' && snap.project.customScript.trim()) {
              assertScriptSafeOrAllowed(snap.project.customScript, options.allowUnsafe)
            }
            const stepClayMode = typeof step.params.clayMode === 'boolean' ? step.params.clayMode : undefined
            const overriddenProj = applyReplayLookdevOverrides(snap.project, {
              stepClayMode,
              allowClay: step.kind !== 'export_model' && step.kind !== 'inspect_scene',
            })
            const tier =
              step.kind === 'preview_still' || step.kind === 'contact_sheet'
                ? validateQualityTier(overrides.qualityTier ?? step.params.qualityTier)
                : undefined
            const stageProj = tier ? applyQualityTier(overriddenProj, tier) : overriddenProj
            const exportFmt =
              step.kind === 'export_model'
                ? validateExportFormat(overrides.exportFormat ?? step.params.format ?? 'glb')
                : undefined
            const stageRes = await this.runHarnessStage(
              job,
              step.kind,
              randomUUID(),
              executablePath,
              stageProj,
              snap.assets,
              {
                format: exportFmt,
                frame: typeof step.params.frame === 'number' ? step.params.frame : undefined,
                enforceRenderProfile: Boolean(tier),
                timeoutMs: remainingTimeout(),
                stageCode: `workflow-step-${idx + 1}`,
                stageLabel: `重放 (${idx + 1}/${total})：${stepLabel}`,
                progressStart,
                progressEnd,
              },
            )
            const qc = stageRes.result.sceneSummary?.qc
            const qcErrors = qc?.issues?.filter(i => i.severity === 'error') ?? []
            let artifactPath: string | undefined
            if (stageRes.artifact) {
              summary.artifactIds.push(stageRes.artifact.id)
              job.view.artifactId = stageRes.artifact.id
              job.view.artifactKind = stageRes.artifact.kind
              try {
                artifactPath = (await this.store.artifactPath(projectId, stageRes.artifact.id)).file
              } catch {
                // ignore
              }
            }
            if (step.kind === 'inspect_scene' && step.params.abortOnQcError === true && qcErrors.length > 0) {
              throw new BlenderError(
                `QC-3D 检测到阻断性错误（${qcErrors.map(e => e.code).join(', ')}）`,
                'CLI_FAILED',
                400,
              )
            }
            summary.completedSteps++
            summary.steps.push({
              stepId: step.id,
              index: idx + 1,
              kind: step.kind,
              label: stepLabel,
              status: 'done',
              durationMs: Math.max(1, Date.now() - stepStartedAt),
              summary: qc ? `QC-3D ${qc.score}/${qc.grade}` : stageRes.artifact ? stageRes.artifact.file : '已完成',
              ...(stageRes.artifact ? { artifactId: stageRes.artifact.id } : {}),
              ...(artifactPath ? { artifactPath } : {}),
              ...(qc ? { qc } : {}),
            })
          } else if (step.kind === 'render_shots') {
            const snap = await this.store.snapshot(projectId)
            if (snap.project.scriptMode === 'custom' && snap.project.customScript.trim()) {
              assertScriptSafeOrAllowed(snap.project.customScript, options.allowUnsafe)
            }
            const shotIds = step.params.shots ? validateShotPresetIds(step.params.shots) : [...DEFAULT_MULTI_SHOT_IDS]
            const tier = validateQualityTier(overrides.qualityTier ?? step.params.qualityTier)
            const stepClayMode = typeof step.params.clayMode === 'boolean' ? step.params.clayMode : undefined
            const renderProj = applyQualityTier(
              applyReplayLookdevOverrides(snap.project, { stepClayMode, allowClay: true }),
              tier,
            )
            const settings = await this.environment.getSettings()
            const batchRunDir = join(this.store.root, 'tmp', `wf-shots-${job.view.id}-${idx}`)
            const shotResults: BlenderShotResult[] = []
            const shotPaths: string[] = []
            try {
              const assetsDir = join(batchRunDir, 'assets')
              const shotsOutDir = join(batchRunDir, 'shots')
              await mkdir(assetsDir, { recursive: true, mode: 0o700 })
              await mkdir(shotsOutDir, { recursive: true, mode: 0o700 })
              await this.store.checkPath(batchRunDir)
              for (const [file, bytes] of snap.assets) {
                await writeFile(join(assetsDir, file), bytes, { flag: 'wx', mode: 0o600 })
              }
              const scriptPath = join(batchRunDir, 'run.py')
              const initialDev = settings.computeDevice ?? 'auto'
              const mkScript = (dev: 'auto' | 'gpu' | 'cpu') =>
                generateRunnerHarness('render_shots', {
                  project: renderProj,
                  assetsDir,
                  outputDir: shotsOutDir,
                  shots: shotIds,
                  frame: typeof step.params.frame === 'number' ? step.params.frame : undefined,
                  computeDevice: dev,
                  enforceRenderProfile: Boolean(tier),
                })
              const shotFrame = Math.max(
                1,
                Math.floor(typeof step.params.frame === 'number' ? step.params.frame : renderProj.frameStart),
              )
              const totalShots = Math.max(1, shotIds.length)
              const stepSpan = Math.max(1, progressEnd - progressStart)
              let doneShots = 0
              const runShots = (dev: 'auto' | 'gpu' | 'cpu') =>
                this.runner.run({
                  executablePath,
                  scriptPath,
                  scriptContent: mkScript(dev),
                  cwd: batchRunDir,
                  frameStart: shotFrame,
                  frameEnd: shotFrame,
                  timeoutMs: remainingTimeout(),
                  signal: job.controller.signal,
                  onLine: line => this.pushJobLine(job, line),
                  onShotDone: shot => {
                    doneShots = Math.min(totalShots, Math.max(doneShots + 1, shot.index ?? doneShots + 1))
                    const pct = Math.max(
                      job.view.progress,
                      Math.min(progressEnd, progressStart + Math.round((doneShots / totalShots) * stepSpan)),
                    )
                    this.setStage(
                      job,
                      `workflow-step-${idx + 1}`,
                      `重放 (${idx + 1}/${total})：多机位 ${doneShots}/${totalShots} (${shot.labelZh || shot.shotId})`,
                      pct,
                    )
                  },
                  onProgress: (progress, stage) => {
                    if (doneShots < totalShots && progress > 0) {
                      const frac = (doneShots + Math.min(100, progress) / 100) / totalShots
                      const pct = Math.max(
                        job.view.progress,
                        Math.min(progressEnd, progressStart + Math.round(frac * stepSpan)),
                      )
                      this.setStage(job, `workflow-step-${idx + 1}`, stage || job.view.stage, pct)
                    }
                  },
                })
              let res: Awaited<ReturnType<BlenderRunner['run']>>
              try {
                res = await runShots(initialDev)
              } catch (err) {
                if (initialDev === 'auto' && !job.controller.signal.aborted && isCyclesGpuCrashError(err)) {
                  this.pushJobLine(job, '[dsh-blender-studio] 工作流多机位 GPU 异常，自动回退 CPU 重试…')
                  this.setStage(
                    job,
                    `workflow-step-${idx + 1}`,
                    `重放 (${idx + 1}/${total})：${stepLabel}（GPU 异常，自动回退 CPU 重试）`,
                    Math.max(progressStart, job.view.progress),
                  )
                  doneShots = 0
                  res = await runShots('cpu')
                } else {
                  throw err
                }
              }
              if (res.sceneSummary) {
                job.view.sceneSummary = res.sceneSummary
                await this.store.updateSceneSummary(projectId, res.sceneSummary)
              }
              const parsedMap = new Map((res.shots ?? []).map(s => [s.shotId, s]))
              const { width: baseW, height: baseH } = resolveRenderResolution(renderProj.aspect, renderProj.resolutionScale)
              for (const shotId of shotIds) {
                const fileName = `shot_${shotId}.png`
                const srcFile = join(shotsOutDir, fileName)
                const fileInfo = await stat(srcFile).catch(() => null)
                if (!fileInfo || !fileInfo.isFile() || fileInfo.size <= 0) continue
                if (fileInfo.size > MAX_ARTIFACT_DOWNLOAD_BYTES) {
                  throw new BlenderError('单张分镜成品超过 200 MB 下载上限。', 'OUTPUT_TOO_LARGE', 400)
                }
                const preset = BLENDER_SHOT_PRESETS.find(p => p.id === shotId)
                const parsed = parsedMap.get(shotId)
                const shotArtifactId = randomUUID()
                const shotRunDir = await this.store.runDir(projectId, shotArtifactId)
                let registered = false
                try {
                  const dstFile = join(shotRunDir, fileName)
                  await copyFile(srcFile, dstFile)
                  const dims = await readPngDimensions(dstFile, parsed?.width ?? baseW, parsed?.height ?? baseH)
                  const lensMm = parsed?.lensMm ?? preset?.lensMm ?? 50
                  const labelZh = parsed?.labelZh ?? preset?.zh ?? shotId
                  const labelEn = parsed?.labelEn ?? preset?.en ?? shotId
                  await this.store.registerArtifact(projectId, {
                    id: shotArtifactId,
                    kind: 'shot',
                    revision: renderProj.revision,
                    file: fileName,
                    mime: ARTIFACT_MIME_MAP.png,
                    size: fileInfo.size,
                    engine: renderProj.engine,
                    samples: renderProj.samples,
                    width: dims.width,
                    height: dims.height,
                    durationMs: Math.max(1, Math.round((res.durationMs || 1) / Math.max(1, shotIds.length))),
                    created: new Date().toISOString(),
                    shotId,
                    label: `${labelZh} · ${lensMm}mm`,
                  })
                  registered = true
                  summary.artifactIds.push(shotArtifactId)
                  shotPaths.push(dstFile)
                  shotResults.push({ shotId, labelZh, labelEn, artifactId: shotArtifactId, lensMm, width: dims.width, height: dims.height })
                } finally {
                  if (!registered) {
                    await this.store.safeRemoveRunDir(projectId, shotArtifactId)
                  }
                }
              }
              if (shotResults.length === 0) {
                throw new BlenderError('工作流多机位分镜未产出有效 PNG。', 'OUTPUT_INVALID', 400)
              }
              job.view.shots = shotResults
              job.view.artifactId = shotResults[0].artifactId
              job.view.artifactKind = 'shot'
              summary.completedSteps++
              summary.steps.push({
                stepId: step.id,
                index: idx + 1,
                kind: step.kind,
                label: stepLabel,
                status: 'done',
                durationMs: Math.max(1, Date.now() - stepStartedAt),
                summary: `已产出 ${shotResults.length} 张分镜 (${shotResults.map(s => s.shotId).join(', ')})`,
                artifactId: shotResults[0].artifactId,
                ...(shotPaths[0] ? { artifactPath: shotPaths[0] } : {}),
                ...(shotPaths.length > 0 ? { artifactPaths: shotPaths } : {}),
              })
            } finally {
              await this.store.checkPath(batchRunDir).then(
                () => rm(batchRunDir, { recursive: true, force: true, maxRetries: 4, retryDelay: 50 }),
                () => undefined,
              ).catch(() => {})
            }
          } else if (step.kind === 'pipeline') {
            const snap = await this.store.snapshot(projectId)
            if (snap.project.scriptMode === 'custom' && snap.project.customScript.trim()) {
              assertScriptSafeOrAllowed(snap.project.customScript, options.allowUnsafe)
            }
            const stepClayMode = typeof step.params.clayMode === 'boolean' ? step.params.clayMode : undefined
            const stepFrame = typeof step.params.frame === 'number' ? step.params.frame : undefined
            const basePipeProj = applyReplayLookdevOverrides(snap.project, { stepClayMode, allowClay: true })
            const pipeExportProj = applyReplayLookdevOverrides(snap.project, { allowClay: false })
            const pipeOpts = validatePipelineOptions({
              includeContactSheet: typeof step.params.includeContactSheet === 'boolean' ? step.params.includeContactSheet : true,
              renderKind: (step.params.renderKind as any) ?? 'still',
              exportFormat: (overrides.exportFormat ?? (step.params.exportFormat as any) ?? 'glb') as any,
              qualityTier: (overrides.qualityTier ?? (step.params.qualityTier as any)) as any,
              abortOnQcError: step.params.abortOnQcError === true,
            })
            const stepSpan = Math.max(4, progressEnd - progressStart)
            const qcRes = await this.runHarnessStage(
              job,
              'inspect_scene',
              randomUUID(),
              executablePath,
              pipeExportProj,
              snap.assets,
              {
                frame: stepFrame,
                timeoutMs: remainingTimeout(),
                stageCode: `workflow-step-${idx + 1}-qc`,
                stageLabel: `重放 (${idx + 1}/${total})：全流程 QC-3D`,
                progressStart,
                progressEnd: progressStart + Math.round(stepSpan * 0.2),
              },
            )
            const qc = qcRes.result.sceneSummary?.qc
            const qcErrors = qc?.issues?.filter(i => i.severity === 'error') ?? []
            if (pipeOpts.abortOnQcError && qcErrors.length > 0) {
              throw new BlenderError(`QC-3D 阻断错误：${qcErrors.map(e => e.code).join(', ')}`, 'CLI_FAILED', 400)
            }
            const pipeArtifacts: string[] = []
            const pipeArtifactPaths: string[] = []
            let primaryArtifactPath: string | undefined
            const resolveArtPath = async (artId: string): Promise<string | undefined> => {
              try {
                return (await this.store.artifactPath(projectId, artId)).file
              } catch {
                return undefined
              }
            }
            if (pipeOpts.includeContactSheet) {
              const csRes = await this.runHarnessStage(
                job,
                'contact_sheet',
                randomUUID(),
                executablePath,
                { ...basePipeProj, engine: 'EEVEE', samples: 16 },
                snap.assets,
                {
                  frame: stepFrame,
                  enforceRenderProfile: true,
                  timeoutMs: remainingTimeout(),
                  stageCode: `workflow-step-${idx + 1}-cs`,
                  stageLabel: `重放 (${idx + 1}/${total})：全流程四视角`,
                  progressStart: progressStart + Math.round(stepSpan * 0.2),
                  progressEnd: progressStart + Math.round(stepSpan * 0.45),
                },
              )
              if (csRes.artifact) {
                pipeArtifacts.push(csRes.artifact.id)
                summary.artifactIds.push(csRes.artifact.id)
                const p = await resolveArtPath(csRes.artifact.id)
                if (p) pipeArtifactPaths.push(p)
              }
            }
            const renderProj = applyQualityTier(basePipeProj, pipeOpts.qualityTier)
            const primaryRes = await this.runHarnessStage(
              job,
              pipeOpts.renderKind === 'animation' ? 'render_animation' : 'preview_still',
              randomUUID(),
              executablePath,
              renderProj,
              snap.assets,
              {
                frame: stepFrame,
                enforceRenderProfile: Boolean(pipeOpts.qualityTier),
                timeoutMs: remainingTimeout(),
                stageCode: `workflow-step-${idx + 1}-render`,
                stageLabel: `重放 (${idx + 1}/${total})：主渲染 (${renderProj.engine} ${renderProj.samples}spp)`,
                progressStart: progressStart + Math.round(stepSpan * 0.45),
                progressEnd: progressStart + Math.round(stepSpan * 0.85),
              },
            )
            if (primaryRes.artifact) {
              pipeArtifacts.push(primaryRes.artifact.id)
              summary.artifactIds.push(primaryRes.artifact.id)
              job.view.artifactId = primaryRes.artifact.id
              job.view.artifactKind = primaryRes.artifact.kind
              primaryArtifactPath = await resolveArtPath(primaryRes.artifact.id)
              if (primaryArtifactPath) pipeArtifactPaths.push(primaryArtifactPath)
            }
            if (pipeOpts.exportFormat !== 'none') {
              const expRes = await this.runHarnessStage(
                job,
                'export_model',
                randomUUID(),
                executablePath,
                pipeExportProj,
                snap.assets,
                {
                  format: pipeOpts.exportFormat,
                  timeoutMs: remainingTimeout(),
                  stageCode: `workflow-step-${idx + 1}-export`,
                  stageLabel: `重放 (${idx + 1}/${total})：导出 ${pipeOpts.exportFormat.toUpperCase()}`,
                  progressStart: progressStart + Math.round(stepSpan * 0.85),
                  progressEnd,
                },
              )
              if (expRes.artifact) {
                pipeArtifacts.push(expRes.artifact.id)
                summary.artifactIds.push(expRes.artifact.id)
                const p = await resolveArtPath(expRes.artifact.id)
                if (p) pipeArtifactPaths.push(p)
              }
            }
            summary.completedSteps++
            summary.steps.push({
              stepId: step.id,
              index: idx + 1,
              kind: step.kind,
              label: stepLabel,
              status: 'done',
              durationMs: Math.max(1, Date.now() - stepStartedAt),
              summary: `产出 ${pipeArtifacts.length} 项成品${qc ? ` · QC ${qc.score}/${qc.grade}` : ''}`,
              ...(primaryRes.artifact ? { artifactId: primaryRes.artifact.id } : {}),
              ...(primaryArtifactPath ? { artifactPath: primaryArtifactPath } : {}),
              ...(pipeArtifactPaths.length > 0 ? { artifactPaths: pipeArtifactPaths } : {}),
              ...(qc ? { qc } : {}),
            })
          } else if (step.kind.startsWith('bridge_')) {
            try {
              if (step.kind === 'bridge_sync') {
                await this.bridgeSyncProject(projectId, {
                  clearScene: step.params.clearScene !== false,
                  allowUnsafe: options.allowUnsafe === true,
                  lookdevOverrides: overrides,
                })
              } else if (step.kind === 'bridge_set_camera') {
                await this.bridgeSetCamera({
                  location: step.params.location as any,
                  target: step.params.target as any,
                  lensMm: (overrides.lensMm ?? step.params.lensMm) as any,
                  dofFstop: step.params.dofFstop as any,
                })
              } else if (step.kind === 'bridge_transform_object') {
                await this.bridgeTransformObject({
                  name: String(step.params.name || ''),
                  location: step.params.location as any,
                  rotationDeg: step.params.rotationDeg as any,
                  scale: step.params.scale as any,
                })
              } else if (step.kind === 'bridge_set_material') {
                await this.bridgeSetMaterialColor({
                  materialName: String(step.params.materialName || ''),
                  color: String(overrides.accentColor ?? step.params.color ?? '#3B82F6'),
                  metallic: step.params.metallic as any,
                  roughness: step.params.roughness as any,
                })
              }
              summary.completedSteps++
              summary.steps.push({
                stepId: step.id,
                index: idx + 1,
                kind: step.kind,
                label: stepLabel,
                status: 'done',
                durationMs: Math.max(1, Date.now() - stepStartedAt),
                summary: 'Live Bridge 已执行',
              })
            } catch (bridgeErr) {
              const code = (bridgeErr as { code?: string })?.code
              if (skipIfBridgeOffline && (code === 'BRIDGE_UNREACHABLE' || code === 'BRIDGE_TIMEOUT')) {
                summary.skippedSteps++
                summary.steps.push({
                  stepId: step.id,
                  index: idx + 1,
                  kind: step.kind,
                  label: stepLabel,
                  status: 'skipped',
                  durationMs: Math.max(1, Date.now() - stepStartedAt),
                  summary: 'Live Bridge 未连接，已安全跳过',
                })
                continue
              }
              throw bridgeErr
            }
          }
          this.setStage(job, `workflow-step-${idx + 1}`, `已完成 (${idx + 1}/${total})：${stepLabel}`, progressEnd)
        } catch (stepErr) {
          if (job.controller.signal.aborted) throw stepErr
          const msg = errorMessage(stepErr)
          summary.failedSteps++
          summary.steps.push({
            stepId: step.id,
            index: idx + 1,
            kind: step.kind,
            label: stepLabel,
            status: 'failed',
            durationMs: Math.max(1, Date.now() - stepStartedAt),
            error: msg.slice(0, 240),
          })
          this.pushJobLine(job, `[workflow] 第 ${idx + 1} 步失败：${msg}`)
          if (stopOnError) {
            summary.stoppedEarly = true
            throw stepErr
          }
        }
      }

      const userCancelled =
        job.controller.signal.aborted &&
        (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason)
      finalState = userCancelled ? 'cancelled' : summary.failedSteps > 0 ? 'failed' : 'done'
      finalStageCode = finalState
      finalStage = userCancelled
        ? '已取消工作流重放'
        : `工作流「${recipe.name}」完成（成功 ${summary.completedSteps}/${summary.totalSteps}${summary.skippedSteps ? ` · 跳过 ${summary.skippedSteps}` : ''}${summary.failedSteps ? ` · 失败 ${summary.failedSteps}` : ''}）`
      if (finalState === 'done') job.view.progress = 100
    } catch (err) {
      const errCode = (err as { code?: string })?.code
      const message =
        errCode === 'ELOCKED'
          ? '另一个 DSH 实例正在执行 Blender 任务，请等待完成或停止后再试。'
          : errorMessage(err)
      const isUserCancel =
        errCode === 'JOB_CANCELLED' ||
        (job.controller.signal.aborted &&
          (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason))
      finalState = isUserCancel ? 'cancelled' : 'failed'
      finalStageCode = isUserCancel ? 'cancelled' : job.abortReason || 'failed'
      finalStage = isUserCancel ? '已取消工作流重放' : message
      this.pushJobLine(job, message)
    } finally {
      clearTimeout(timer)
      if (unlock) await unlock().catch(() => {})
      this.setStage(job, finalStageCode, finalStage)
      job.view.state = finalState
      job.view.finishedAt = new Date().toISOString()
      const durationMs = Math.max(
        1,
        Date.parse(job.view.finishedAt) - Date.parse(job.view.startedAt || job.view.finishedAt),
      )
      await this.recordWorkflowEvent(projectId, {
        kind: 'workflow_replay',
        source: options.source ?? 'ui',
        status: finalState === 'done' ? 'ok' : finalState === 'cancelled' ? 'skipped' : 'failed',
        revision: job.view.revision,
        durationMs,
        label: `重放工作流：${recipe.name}`,
        params: {
          workflowId: recipe.id,
          workflowName: recipe.name,
          totalSteps: summary.totalSteps,
          completedSteps: summary.completedSteps,
          failedSteps: summary.failedSteps,
          skippedSteps: summary.skippedSteps,
        },
        summary: `成功 ${summary.completedSteps}/${summary.totalSteps} · 产出 ${summary.artifactIds.length} 项成品`,
        ...(job.view.artifactId ? { artifactId: job.view.artifactId } : {}),
        ...(finalState === 'failed' ? { error: finalStage.slice(0, 200) } : {}),
      })
    }
  }

  async openGui(
    id: string,
    revision?: unknown,
  ): Promise<{
    launched: boolean
    executable: string
    blendFile: string
    pid?: number
    built: boolean
    job?: BlenderJob
  }> {
    const validId = blenderId(id)
    const active = await this.environment.requireActiveExecutable()
    const project = await this.store.get(validId)
    if (revision !== undefined && project.revision !== revision) {
      throw new BlenderConflict('工程已更新，请保存并刷新最新版本后再在 Blender 中打开。')
    }

    const existingBlend = project.artifacts.find(
      art => art.kind === 'blend' && art.revision === project.revision,
    )
    if (existingBlend) {
      try {
        const info = await this.store.artifactPath(validId, existingBlend.id)
        const launched = await this.launchGuiFn(active.path, info.file)
        return {
          launched: true,
          executable: launched.executable,
          blendFile: info.file,
          pid: launched.pid,
          built: false,
        }
      } catch {
        // Re-materialize if file missing on disk
      }
    }

    const startedJob = await this.startJob('build_blend', validId, project.revision)
    const finished = await this.waitForJob(startedJob.id)
    if (finished.state !== 'done' || !finished.artifactId) {
      throw new BlenderError(
        finished.stage || '无法构建工程 .blend 文件。',
        'CLI_FAILED',
        400,
      )
    }
    const info = await this.store.artifactPath(validId, finished.artifactId)
    const launched = await this.launchGuiFn(active.path, info.file)
    return {
      launched: true,
      executable: launched.executable,
      blendFile: info.file,
      pid: launched.pid,
      built: true,
      job: finished,
    }
  }

  private guard(request: Request): void {
    const url = new URL(request.url)
    const rawOrigin = request.headers.get('origin')
    const origin = rawOrigin ? rawOrigin.trim() : null
    const site = request.headers.get('sec-fetch-site')?.trim().toLowerCase() || null
    const desktop = origin !== null && origin.replace(/\/+$/, '').toLowerCase() === 'dsh-app://app'

    // DeepSeek Harness Desktop Electron shell sends Origin: dsh-app://app with Sec-Fetch-Site: cross-site.
    if (site && !['same-origin', 'none'].includes(site) && !desktop) {
      throw new BlenderError('请从 DSH 页面操作。', 'ORIGIN_FORBIDDEN', 403)
    }
    if (origin && !desktop) {
      let source: URL
      try {
        source = new URL(origin)
      } catch {
        throw new BlenderError('请从 DSH 页面操作。', 'ORIGIN_FORBIDDEN', 403)
      }
      const protocolOk = source.protocol === 'http:' || source.protocol === 'https:'
      const hostHeader = request.headers.get('host')?.trim()
      const expectedHost = hostHeader || url.host
      const sameHost = source.host.toLowerCase() === expectedHost.toLowerCase()
      const isInternalCarrierLoopback =
        !hostHeader &&
        url.hostname.toLowerCase() === 'dsh.internal' &&
        source.protocol === 'http:' &&
        ['127.0.0.1', 'localhost', '[::1]', '::1', 'dsh.internal'].includes(source.hostname.toLowerCase())
      if (!protocolOk || (!sameHost && !isInternalCarrierLoopback)) {
        throw new BlenderError('请从 DSH 页面操作。', 'ORIGIN_FORBIDDEN', 403)
      }
    }
    if (request.method === 'POST') {
      const primary = request.headers.get('x-dsh-blender-studio')
      const compat = request.headers.get('x-dsh-blender')
      const marker = primary !== null ? primary : compat
      if (marker !== '1') {
        throw new BlenderError('操作来源无效。', 'ORIGIN_FORBIDDEN', 403)
      }
    }
  }

  private async streamFileWithRange(
    request: Request,
    filePath: string,
    mimeType: string,
    downloadFileName?: string,
  ): Promise<Response> {
    await this.store.checkPath(filePath)
    const handle = await open(filePath, 'r')
    let streaming = false
    try {
      const info = await handle.stat()
      const size = info.size
      if (!info.isFile()) {
        throw new BlenderError('下载目标不是普通文件。', 'DOWNLOAD_INVALID', 400)
      }
      if (size > MAX_ARTIFACT_DOWNLOAD_BYTES) {
        throw new BlenderError('文件超过 200 MB 浏览器传输上限，请从本地工程目录取回。', 'OUTPUT_TOO_LARGE', 400)
      }
      const range = request.headers.get('range')
      const headers: Record<string, string> = {
        'content-type': mimeType,
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'accept-ranges': 'bytes',
      }
      if (downloadFileName) {
        headers['content-disposition'] = `attachment; filename="${downloadFileName}"`
      }
      let start = 0
      let end = size - 1
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
        const invalid = () =>
          new Response(null, {
            status: 416,
            headers: { ...headers, 'content-range': `bytes */${size}` },
          })
        if (!match || (!match[1] && !match[2]) || !size) return invalid()
        const first = Number(match[1])
        const last = Number(match[2])
        if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last)) return invalid()
        if (!match[1]) {
          if (!last) return invalid()
          start = Math.max(0, size - last)
        } else {
          start = first
          if (match[2]) end = Math.min(last, end)
        }
        if (start > end || start >= size) return invalid()
        headers['content-range'] = `bytes ${start}-${end}/${size}`
      }
      headers['content-length'] = String(size ? end - start + 1 : 0)
      if (!size) return new Response(null, { headers })

      const body = Readable.toWeb(
        handle.createReadStream({ start, end, highWaterMark: 64 * 1024, signal: request.signal }),
        {
          strategy: {
            highWaterMark: 64 * 1024,
            size: (chunk: Uint8Array) => chunk.byteLength,
          },
        },
      )
      const response = new Response(body as any, { status: range ? 206 : 200, headers })
      streaming = true
      return response
    } finally {
      if (!streaming) await handle.close()
    }
  }

  async fetch(request: Request): Promise<Response> {
    try {
      this.guard(request)
      const url = new URL(request.url)

      if (request.method === 'GET') {
        const kind = url.searchParams.get('kind')
        if (kind === 'addon') {
          const addonText = await readFile(this.addonPath, 'utf8')
          return new Response(addonText, {
            headers: {
              'content-type': 'text/x-python; charset=utf-8',
              'content-disposition': 'attachment; filename="dsh_blender_bridge.py"',
              'cache-control': 'no-store',
              'x-content-type-options': 'nosniff',
            },
          })
        }

        const id = blenderId(url.searchParams.get('id'))
        if (kind === 'source') {
          const zipBytes = await this.store.buildSourceZip(id)
          return new Response(zipBytes as any, {
            headers: {
              'content-type': 'application/zip',
              'content-disposition': `attachment; filename="dsh-blender-studio-${id}.zip"`,
              'cache-control': 'no-store',
              'x-content-type-options': 'nosniff',
            },
          })
        }

        const wantDownload = url.searchParams.get('download') === '1'
        if (kind === 'asset') {
          const assetId = blenderId(url.searchParams.get('asset'))
          const { file, asset } = await this.store.assetPath(id, assetId)
          const mimeType = ARTIFACT_MIME_MAP[asset.ext] || 'application/octet-stream'
          const dlName = wantDownload ? `dsh-blender-studio-${id}-${asset.id}.${asset.ext}` : undefined
          return await this.streamFileWithRange(request, file, mimeType, dlName)
        }

        if (kind === 'artifact') {
          const artifactId = blenderId(url.searchParams.get('artifact'))
          const { file, artifact, mime } = await this.store.artifactPath(id, artifactId)
          const ext = extname(artifact.file).replace(/^\./, '') || 'bin'
          const dlName = wantDownload
            ? `dsh-blender-studio-${id}-${artifact.kind}-${basename(artifact.file).replace(/[^a-zA-Z0-9._-]/g, '_') || artifact.id + '.' + ext}`
            : undefined
          return await this.streamFileWithRange(request, file, mime, dlName)
        }

        throw new BlenderError('下载类型无效。', 'DOWNLOAD_INVALID', 400)
      }

      if (request.method !== 'POST') {
        return new Response(null, { status: 405 })
      }

      let value: unknown
      if (url.pathname.endsWith('/upload')) {
        const reader = request.body?.getReader()
        if (!reader) throw new BlenderError('请选择需要上传的 3D 素材文件。', 'ASSET_REQUIRED', 400)
        const chunks: Uint8Array[] = []
        let size = 0
        try {
          while (true) {
            const chunk = await reader.read()
            if (chunk.done) break
            size += chunk.value.length
            if (size > MAX_ASSET_BYTES) {
              throw new BlenderError('单个素材文件不能超过 50 MB。', 'ASSET_SIZE', 400)
            }
            chunks.push(chunk.value)
          }
        } finally {
          await reader.cancel().catch(() => {})
        }
        let fileName = ''
        try {
          fileName = decodeURIComponent(request.headers.get('x-file-name') || '')
        } catch {
          throw new BlenderError('文件名编码无效。', 'ASSET_FORMAT', 400)
        }
        if (!fileName.trim()) {
          throw new BlenderError('缺少素材文件名。', 'ASSET_REQUIRED', 400)
        }
        const projectId = blenderId(request.headers.get('x-project-id'))
        const revision = Number(request.headers.get('x-project-revision'))
        value = await this.store.upload(projectId, revision, fileName, Buffer.concat(chunks))
      } else {
        if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
          throw new BlenderError('请求格式无效，需要 application/json。', 'BAD_REQUEST', 400)
        }
        const text = await request.text()
        if (Buffer.byteLength(text, 'utf8') > MAX_JSON_BODY_BYTES) {
          throw new BlenderError('请求体过大（上限 512 KB）。', 'BAD_REQUEST', 400)
        }
        let v: Record<string, any>
        try {
          v = JSON.parse(text) as Record<string, any>
        } catch {
          throw new BlenderError('请求 JSON 解析失败。', 'BAD_REQUEST', 400)
        }
        if (!v || typeof v !== 'object' || Array.isArray(v)) {
          throw new BlenderError('请求体必须为 JSON 对象。', 'BAD_REQUEST', 400)
        }

        const reqSource: BlenderWorkflowSource =
          request.headers.get('x-dsh-blender-source') === 'agent' ? 'agent' : 'ui'

        switch (v.action) {
          // Project CRUD
          case 'list': {
            const [active, archived, environment, workflows, workflowRecordingEnabled] = await Promise.all([
              this.store.listWithWarnings(false),
              this.store.listWithWarnings(true),
              this.environmentStatus({ probeBridge: false }),
              this.workflows.list(),
              this.isWorkflowRecordingEnabled(),
            ])
            const corruptedProjects = [
              ...active.corrupted.map(item => ({ ...item, archived: false })),
              ...archived.corrupted.map(item => ({ ...item, archived: true })),
            ]
            const corruptedCount = corruptedProjects.length
            value = {
              projects: active.projects,
              archivedProjects: archived.projects,
              ...(corruptedCount ? { corruptedCount, corruptedProjects } : {}),
              templates: BLENDER_TEMPLATES,
              exemplars: listExemplarSummaries(),
              shotPresets: BLENDER_SHOT_PRESETS,
              workflows,
              workflowRecordingEnabled,
              environment,
              jobs: this.listJobs(),
            }
            break
          }
          case 'list_exemplars':
            value = { exemplars: listExemplarSummaries() }
            break
          case 'get_exemplar': {
            const exemplarId = typeof v.exemplarId === 'string' ? v.exemplarId : typeof v.id === 'string' ? v.id : ''
            value = getExemplar(exemplarId)
            break
          }
          case 'create_from_exemplar': {
            const exemplarId = typeof v.exemplarId === 'string' ? v.exemplarId : typeof v.id === 'string' ? v.id : ''
            value = await this.createFromExemplar(
              exemplarId,
              typeof v.title === 'string' ? v.title : undefined,
              reqSource,
            )
            break
          }
          case 'create': {
            const created = await this.store.create(v.fields)
            await this.recordWorkflowEvent(created.id, {
              kind: 'project_init',
              source: reqSource,
              status: 'ok',
              revision: created.revision,
              label: `创建工程：${created.title}`,
              params: {
                template: created.template,
                engine: created.engine,
                samples: created.samples,
                aspect: created.aspect,
                lightingPreset: created.lightingPreset,
                materialPreset: created.materialPreset,
                accentColor: created.accentColor,
              },
              summary: `${created.template} · ${created.engine} ${created.samples}spp`,
            })
            value = await this.store.get(created.id)
            break
          }
          case 'get':
            value = await this.store.get(blenderId(v.id), Boolean(v.archived))
            break
          case 'update': {
            const targetId = blenderId(v.id)
            const before = await this.store.get(targetId)
            const updated = await this.store.update(targetId, v.revision, v.fields)
            const lookdevDiff = extractLookdevDiff(before as any, updated as any)
            if (Object.keys(lookdevDiff).length > 0) {
              await this.recordWorkflowEvent(updated.id, {
                kind: 'lookdev_update',
                source: reqSource,
                status: 'ok',
                revision: updated.revision,
                label: defaultStepLabel('lookdev_update', { fields: lookdevDiff }),
                params: { fields: lookdevDiff },
                summary: `v${updated.revision} · ${Object.keys(lookdevDiff).join(', ')}`,
              })
            }
            if (updated.customScript !== before.customScript || updated.scriptMode !== before.scriptMode) {
              await this.recordWorkflowEvent(updated.id, {
                kind: 'script_update',
                source: reqSource,
                status: 'ok',
                revision: updated.revision,
                label: `更新 bpy 脚本 (${updated.customScript.length} chars)`,
                params: { scriptMode: updated.scriptMode, scriptLength: updated.customScript.length },
                summary: `${updated.scriptMode} · ${updated.customScript.length} chars → v${updated.revision}`,
              })
            }
            value = await this.store.get(updated.id)
            break
          }
          case 'duplicate': {
            const sourceId = blenderId(v.id)
            const cloned = await this.store.duplicate(
              sourceId,
              typeof v.title === 'string' ? v.title : undefined,
            )
            await this.recordWorkflowEvent(cloned.id, {
              kind: 'project_init',
              source: reqSource,
              status: 'ok',
              revision: cloned.revision,
              label: `复制工程：${cloned.title}`,
              params: {
                sourceProjectId: sourceId,
                engine: cloned.engine,
                samples: cloned.samples,
                accentColor: cloned.accentColor,
              },
              summary: `复制自 ${sourceId.slice(0, 8)} · ${cloned.engine} ${cloned.samples}spp`,
            })
            value = await this.store.get(cloned.id)
            break
          }
          case 'save_checkpoint': {
            const saved = await this.store.saveCheckpoint(
              blenderId(v.id),
              v.revision,
              typeof v.note === 'string' ? v.note : undefined,
            )
            const cp = saved.checkpoints?.[0]
            await this.recordWorkflowEvent(saved.id, {
              kind: 'checkpoint_save',
              source: reqSource,
              status: 'ok',
              revision: saved.revision,
              label: defaultStepLabel('checkpoint_save', { note: cp?.note }),
              params: { note: cp?.note || `Revision ${saved.revision}` },
              summary: `快照「${cp?.note || 'checkpoint'}」`,
            })
            value = await this.store.get(saved.id)
            break
          }
          case 'restore_checkpoint': {
            const cpId = blenderId(v.checkpointId ?? v.checkpoint)
            const restored = await this.store.restoreCheckpoint(blenderId(v.id), v.revision, cpId)
            await this.recordWorkflowEvent(restored.id, {
              kind: 'checkpoint_restore',
              source: reqSource,
              status: 'ok',
              revision: restored.revision,
              label: `恢复脚本快照 → v${restored.revision}`,
              params: { checkpointId: cpId },
            })
            value = await this.store.get(restored.id)
            break
          }
          case 'read_script':
            value = await this.readProjectScript(blenderId(v.id), {
              startLine: typeof v.startLine === 'number' ? v.startLine : undefined,
              endLine: typeof v.endLine === 'number' ? v.endLine : undefined,
              pattern: typeof v.pattern === 'string' ? v.pattern : undefined,
              maxMatches: typeof v.maxMatches === 'number' ? v.maxMatches : undefined,
            })
            break
          case 'patch_script': {
            if (Array.isArray(v.edits)) {
              const edits: ScriptPatchEdit[] = v.edits.map((item: any, idx: number) => {
                if (!item || typeof item !== 'object' || typeof item.find !== 'string' || typeof item.replace !== 'string') {
                  throw new BlenderError(
                    `patch_script 的 edits[${idx}] 需要字符串类型的 find 与 replace 参数。`,
                    'BAD_REQUEST',
                    400,
                  )
                }
                return {
                  find: item.find,
                  replace: item.replace,
                  replaceAll: item.replaceAll === true,
                }
              })
              value = await this.patchProjectScript(blenderId(v.id), v.revision, {
                edits,
                note: typeof v.note === 'string' ? v.note : undefined,
                allowUnsafe: v.allowUnsafe === true,
                source: reqSource,
              })
            } else {
              if (typeof v.find !== 'string' || typeof v.replace !== 'string') {
                throw new BlenderError('patch_script 需要字符串类型的 find 与 replace 参数，或提供 edits 数组。', 'BAD_REQUEST', 400)
              }
              value = await this.patchProjectScript(blenderId(v.id), v.revision, {
                find: v.find,
                replace: v.replace,
                replaceAll: v.replaceAll === true,
                note: typeof v.note === 'string' ? v.note : undefined,
                allowUnsafe: v.allowUnsafe === true,
                source: reqSource,
              })
            }
            break
          }
          case 'removeAsset':
            value = await this.store.removeAsset(blenderId(v.id), v.revision, blenderId(v.asset ?? v.assetId))
            break
          case 'archive':
          case 'restore': {
            if (v.confirmed !== true) {
              throw new BlenderError('请明确确认归档或恢复操作。', 'CONFIRM_REQUIRED', 400)
            }
            const slot = join(this.store.root, 'workbench-slot')
            await this.store.init()
            await mkdir(slot, { recursive: true })
            const unlock = await lockfile.lock(slot, { retries: 0, stale: 30_000, update: 10_000 }).catch(error => {
              if ((error as { code?: string }).code === 'ELOCKED') {
                throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再归档或恢复工程。')
              }
              throw error
            })
            try {
              value = await this.store.archive(blenderId(v.id), v.revision, v.action === 'restore')
            } finally {
              await unlock().catch(() => {})
            }
            break
          }
          case 'trash': {
            if (v.confirmed !== true) {
              throw new BlenderError('请明确确认移入系统回收站。', 'CONFIRM_REQUIRED', 400)
            }
            if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
              throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再移入系统回收站。')
            }
            const id = blenderId(v.id)
            const archived = v.archived !== false
            const slot = join(this.store.root, 'workbench-slot')
            await this.store.init()
            await mkdir(slot, { recursive: true })
            const unlock = await lockfile.lock(slot, { retries: 0, stale: 30_000, update: 10_000 }).catch(error => {
              if ((error as { code?: string }).code === 'ELOCKED') {
                throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再移入系统回收站。')
              }
              throw error
            })
            try {
              value = await this.store.trash(id, v.revision, archived)
            } finally {
              await unlock().catch(() => {})
            }
            break
          }
          case 'trashArchived': {
            if (v.confirmed !== true) {
              throw new BlenderError('请明确确认清空已归档工程。', 'CONFIRM_REQUIRED', 400)
            }
            if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
              throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再清空已归档工程。')
            }
            const slot = join(this.store.root, 'workbench-slot')
            await this.store.init()
            await mkdir(slot, { recursive: true })
            const unlock = await lockfile.lock(slot, { retries: 0, stale: 30_000, update: 10_000 }).catch(error => {
              if ((error as { code?: string }).code === 'ELOCKED') {
                throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再清空已归档工程。')
              }
              throw error
            })
            try {
              value = await this.store.trashArchived()
            } finally {
              await unlock().catch(() => {})
            }
            break
          }
          case 'trashCorrupted': {
            if (v.confirmed !== true) {
              throw new BlenderError('请明确确认清理损坏工程目录。', 'CONFIRM_REQUIRED', 400)
            }
            if (v.items !== undefined && !Array.isArray(v.items)) {
              throw new BlenderError('损坏工程列表格式无效。', 'BAD_REQUEST', 400)
            }
            if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
              throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再清理损坏工程目录。')
            }
            const slot = join(this.store.root, 'workbench-slot')
            await this.store.init()
            await mkdir(slot, { recursive: true })
            const unlock = await lockfile.lock(slot, { retries: 0, stale: 30_000, update: 10_000 }).catch(error => {
              if ((error as { code?: string }).code === 'ELOCKED') {
                throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再清理损坏工程目录。')
              }
              throw error
            })
            try {
              value = await this.store.trashCorrupted(v.items)
            } finally {
              await unlock().catch(() => {})
            }
            break
          }
          case 'generatedScript': {
            const p = await this.store.get(blenderId(v.id))
            const settings = await this.environment.getSettings()
            const script = generateSceneScript(p, './assets', {
              computeDevice: settings.computeDevice ?? 'auto',
            })
            const safety = checkScriptSafety(p.scriptMode === 'custom' ? p.customScript : script)
            value = {
              id: p.id,
              revision: p.revision,
              scriptMode: p.scriptMode,
              script,
              safety,
            }
            break
          }

          // Headless CLI jobs & GUI open
          case 'preview_still':
          case 'contact_sheet':
          case 'render_animation':
          case 'inspect_scene':
          case 'build_blend':
            value = await this.startJob(v.action, blenderId(v.id), v.revision, {
              frame: typeof v.frame === 'number' ? v.frame : undefined,
              allowUnsafe: v.allowUnsafe === true,
              qualityTier: v.action === 'preview_still' || v.action === 'contact_sheet' ? v.qualityTier : undefined,
              source: reqSource,
            })
            break
          case 'export_model':
            value = await this.startJob('export_model', blenderId(v.id), v.revision, {
              format: validateExportFormat(v.format),
              allowUnsafe: v.allowUnsafe === true,
              source: reqSource,
            })
            break
          case 'run_script':
            value = await this.startJob('run_script', blenderId(v.id), v.revision, {
              code: typeof v.code === 'string' ? v.code : undefined,
              allowUnsafe: v.allowUnsafe === true,
              source: reqSource,
            })
            break
          case 'pipeline':
            value = await this.startJob('pipeline', blenderId(v.id), v.revision, {
              frame: typeof v.frame === 'number' ? v.frame : undefined,
              allowUnsafe: v.allowUnsafe === true,
              source: reqSource,
              pipeline: {
                includeContactSheet: typeof v.includeContactSheet === 'boolean' ? v.includeContactSheet : true,
                renderKind: v.renderKind,
                exportFormat: v.exportFormat,
                qualityTier: v.qualityTier,
                abortOnQcError: v.abortOnQcError === true,
              },
            })
            break
          case 'render_shots':
            value = await this.startJob('render_shots', blenderId(v.id), v.revision, {
              frame: typeof v.frame === 'number' ? v.frame : undefined,
              allowUnsafe: v.allowUnsafe === true,
              shots: v.shots,
              qualityTier: v.qualityTier,
              source: reqSource,
            })
            break
          case 'open_gui':
            value = await this.openGui(blenderId(v.id), v.revision)
            break
          case 'job':
            value = this.getJob(blenderId(v.job ?? v.id))
            break
          case 'cancel':
            value = this.cancelJob(blenderId(v.job ?? v.id))
            break

          // Environment & configuration
          case 'environment':
            value = await this.environmentStatus({
              probeBridge: Boolean(v.probeBridge),
              forceDetect: Boolean(v.forceDetect),
            })
            break
          case 'configure': {
            const patch: Partial<BlenderSettings> = {}
            if (v.blenderPath !== undefined) patch.blenderPath = v.blenderPath
            if (v.bridgeHost !== undefined) patch.bridgeHost = v.bridgeHost
            if (v.bridgePort !== undefined) patch.bridgePort = v.bridgePort
            if (v.bridgeToken !== undefined) patch.bridgeToken = v.bridgeToken
            if (v.polyHavenEnabled !== undefined) patch.polyHavenEnabled = v.polyHavenEnabled
            if (v.computeDevice !== undefined) patch.computeDevice = v.computeDevice
            if (v.workflowRecordingEnabled !== undefined) patch.workflowRecordingEnabled = v.workflowRecordingEnabled
            value = await this.configureSettings(patch)
            break
          }
          case 'detect_blender':
            value = await this.environmentStatus({ forceDetect: true, probeBridge: false })
            break

          // Live Socket Bridge
          case 'bridge_status':
            value = await this.bridgeStatus()
            break
          case 'bridge_scene':
            value = await this.bridgeSceneInfo()
            break
          case 'bridge_execute':
            value = await this.bridgeExecute(v.code, {
              pushUndo: typeof v.pushUndo === 'boolean' ? v.pushUndo : true,
              allowUnsafe: v.allowUnsafe === true,
            })
            break
          case 'bridge_viewport':
            value = await this.bridgeViewport({
              width: typeof v.width === 'number' ? v.width : undefined,
              height: typeof v.height === 'number' ? v.height : undefined,
            })
            break
          case 'bridge_sync': {
            const syncId = blenderId(v.id)
            const syncRes = await this.bridgeSyncProject(syncId, {
              clearScene: typeof v.clearScene === 'boolean' ? v.clearScene : true,
              allowUnsafe: v.allowUnsafe === true,
            })
            await this.recordWorkflowEvent(syncId, {
              kind: 'bridge_sync',
              source: reqSource,
              status: 'ok',
              revision: syncRes.revision,
              label: defaultStepLabel('bridge_sync', { clearScene: v.clearScene !== false }),
              params: { clearScene: v.clearScene !== false },
            })
            value = syncRes
            break
          }
          case 'bridge_install_addon': {
            if (v.confirmed !== true) {
              throw new BlenderError(
                '安装并启用 Blender Live Bridge 插件将写入本机 Blender 用户插件配置，请明确确认（confirmed: true）。',
                'CONFIRM_REQUIRED',
                400,
              )
            }
            value = await this.installAddon()
            break
          }
          case 'bridge_set_camera': {
            const camRes = await this.bridgeSetCamera({
              location: v.location,
              target: v.target,
              lensMm: v.lensMm,
              dofFstop: v.dofFstop,
            })
            if (typeof v.projectId === 'string' && v.projectId.trim()) {
              await this.recordWorkflowEvent(v.projectId.trim(), {
                kind: 'bridge_set_camera',
                source: reqSource,
                status: 'ok',
                label: defaultStepLabel('bridge_set_camera', v),
                params: {
                  ...(v.location ? { location: v.location } : {}),
                  ...(v.target ? { target: v.target } : {}),
                  ...(typeof v.lensMm === 'number' ? { lensMm: v.lensMm } : {}),
                  ...(typeof v.dofFstop === 'number' ? { dofFstop: v.dofFstop } : {}),
                },
              })
            }
            value = camRes
            break
          }
          case 'bridge_transform_object': {
            const objRes = await this.bridgeTransformObject({
              name: v.name,
              location: v.location,
              rotationDeg: v.rotationDeg,
              scale: v.scale,
            })
            if (typeof v.projectId === 'string' && v.projectId.trim()) {
              await this.recordWorkflowEvent(v.projectId.trim(), {
                kind: 'bridge_transform_object',
                source: reqSource,
                status: 'ok',
                label: defaultStepLabel('bridge_transform_object', { name: v.name }),
                params: {
                  name: v.name,
                  ...(v.location ? { location: v.location } : {}),
                  ...(v.rotationDeg ? { rotationDeg: v.rotationDeg } : {}),
                  ...(v.scale ? { scale: v.scale } : {}),
                },
              })
            }
            value = objRes
            break
          }
          case 'bridge_set_material': {
            const matRes = await this.bridgeSetMaterialColor({
              materialName: v.materialName,
              color: v.color,
              metallic: v.metallic,
              roughness: v.roughness,
            })
            if (typeof v.projectId === 'string' && v.projectId.trim()) {
              await this.recordWorkflowEvent(v.projectId.trim(), {
                kind: 'bridge_set_material',
                source: reqSource,
                status: 'ok',
                label: defaultStepLabel('bridge_set_material', { materialName: v.materialName }),
                params: {
                  materialName: v.materialName,
                  color: v.color,
                  ...(typeof v.metallic === 'number' ? { metallic: v.metallic } : {}),
                  ...(typeof v.roughness === 'number' ? { roughness: v.roughness } : {}),
                },
              })
            }
            value = matRes
            break
          }

          // Workflow Recording, Recipes & Replay
          case 'workflow_list': {
            const [workflows, recordingEnabled] = await Promise.all([
              this.workflows.list(),
              this.isWorkflowRecordingEnabled(),
            ])
            value = { workflows, recordingEnabled }
            break
          }
          case 'workflow_get': {
            const workflowId = typeof v.workflowId === 'string' ? v.workflowId : typeof v.id === 'string' ? v.id : ''
            value = await this.workflows.get(workflowId)
            break
          }
          case 'workflow_history': {
            const p = await this.store.get(blenderId(v.id))
            const recordingEnabled = await this.isWorkflowRecordingEnabled()
            const limit =
              typeof v.limit === 'number' && Number.isFinite(v.limit) && v.limit > 0
                ? Math.min(120, Math.floor(v.limit))
                : 120
            const all = Array.isArray(p.workflowHistory) ? p.workflowHistory : []
            value = {
              projectId: p.id,
              title: p.title,
              revision: p.revision,
              recordingEnabled,
              totalCount: all.length,
              events: all.slice(-limit),
            }
            break
          }
          case 'workflow_clear_history': {
            if (v.confirmed !== true) {
              throw new BlenderError('清空工程工作流录制历史需要显式确认（confirmed: true）。', 'CONFIRM_REQUIRED', 400)
            }
            value = await this.store.clearWorkflowHistory(blenderId(v.id), v.revision)
            break
          }
          case 'workflow_toggle_recording': {
            if (typeof v.enabled !== 'boolean') {
              throw new BlenderError('enabled 必须为布尔值。', 'BAD_REQUEST', 400)
            }
            await this.environment.configure({ workflowRecordingEnabled: v.enabled })
            value = { recordingEnabled: v.enabled }
            break
          }
          case 'workflow_save_from_history': {
            const p = await this.store.get(blenderId(v.id))
            const history = Array.isArray(p.workflowHistory) ? p.workflowHistory : []
            const requestedName = typeof v.name === 'string' ? v.name.trim() : ''
            const fallbackName = `${p.title.slice(0, 68).trim()} 工作流`.slice(0, 72)
            const recipeInput = buildRecipeFromHistory(history, {
              name: requestedName || fallbackName,
              description: typeof v.description === 'string' ? v.description : undefined,
              tags: Array.isArray(v.tags) ? v.tags : undefined,
              eventIds: Array.isArray(v.eventIds) ? v.eventIds : undefined,
              includeScriptPatches: v.includeScriptPatches !== false,
              coalesceLookdev: v.coalesceLookdev !== false,
              sourceProjectId: p.id,
              sourceProjectTitle: p.title,
            })
            const saved = await this.workflows.save(recipeInput)
            value = { recipe: saved, summary: summarizeWorkflowRecipe(saved) }
            break
          }
          case 'workflow_create': {
            const saved = await this.workflows.save({
              schemaVersion: 1,
              name: v.name,
              description: v.description ?? '',
              tags: v.tags ?? [],
              steps: v.steps,
            })
            value = { recipe: saved, summary: summarizeWorkflowRecipe(saved) }
            break
          }
          case 'workflow_delete': {
            if (v.confirmed !== true) {
              throw new BlenderError('删除工作流配方需要显式确认（confirmed: true）。', 'CONFIRM_REQUIRED', 400)
            }
            const workflowId = typeof v.workflowId === 'string' ? v.workflowId : typeof v.id === 'string' ? v.id : ''
            value = await this.workflows.delete(workflowId)
            break
          }
          case 'workflow_export': {
            const workflowId = typeof v.workflowId === 'string' ? v.workflowId : typeof v.id === 'string' ? v.id : ''
            const recipe = await this.workflows.exportRecipe(workflowId)
            value = { recipe, json: JSON.stringify(recipe, null, 2) }
            break
          }
          case 'workflow_import': {
            const imported = await this.workflows.importRecipe(v.recipe ?? v.json)
            value = { recipe: imported, summary: summarizeWorkflowRecipe(imported) }
            break
          }
          case 'workflow_replay': {
            const workflowId = typeof v.workflowId === 'string' ? v.workflowId : ''
            value = await this.replayWorkflow(workflowId, blenderId(v.id), {
              revision: v.revision,
              dryRun: v.dryRun === true,
              stopOnError: v.stopOnError !== false,
              skipIfBridgeOffline: v.skipIfBridgeOffline !== false,
              overrides: v.overrides as any,
              allowUnsafe: v.allowUnsafe === true,
              source: reqSource,
            })
            break
          }

          // Optional Poly Haven CC0 assets
          case 'polyhaven_search': {
            const query = typeof v.query === 'string' ? v.query : ''
            const type = (v.type ?? 'hdris') as PolyHavenAssetType
            const limit = typeof v.limit === 'number' ? v.limit : 12
            const items = await this.polyHaven.search(query, type, limit)
            value = { items, query, type }
            break
          }
          case 'polyhaven_import': {
            const projectId = blenderId(v.id)
            const assetId = typeof v.assetId === 'string' ? v.assetId.trim() : ''
            if (!assetId) throw new BlenderError('缺少 Poly Haven 资产 ID。', 'BAD_REQUEST', 400)
            const assetType = (v.assetType ?? v.type ?? 'hdris') as PolyHavenAssetType
            const resolution = v.resolution === '2k' ? '2k' : '1k'
            const dl = await this.polyHaven.downloadAsset(assetId, assetType, resolution)
            const { project, asset } = await this.store.addAsset(
              projectId,
              v.revision,
              dl.fileName,
              dl.bytes,
              {
                kind: dl.kind,
                source: 'polyhaven',
                sourceId: dl.assetId,
              },
            )
            // Spread project at top level so UI callers reading updated.id work directly,
            // while also exposing `project`, `asset`, and `cached` for tools/API callers.
            value = {
              ...project,
              project,
              asset,
              cached: dl.cached,
            }
            break
          }

          default:
            throw new BlenderError('不支持的工作台操作。', 'BAD_ACTION', 400)
        }
      }

      return Response.json({ ok: true, value }, { headers: { 'cache-control': 'no-store' } })
    } catch (e) {
      const status = e instanceof BlenderConflict ? 409 : e instanceof BlenderError ? e.status : 400
      const code = e instanceof BlenderError ? e.code : undefined
      return Response.json(
        { ok: false, message: errorMessage(e), ...(code ? { code } : {}) },
        { status, headers: { 'cache-control': 'no-store' } },
      )
    }
  }
}

export interface InstallBlenderWorkbenchOptions extends BlenderWorkbenchOptions {
  workbench?: BlenderWorkbench
  checkSkillsHealth?: () => Promise<SkillBundleHealthReport>
  onDispose?: () => void
}

export function installBlenderWorkbench(
  ctx: SkillsPluginContext & Record<string, any>,
  options: InstallBlenderWorkbenchOptions = {},
): BlenderWorkbench {
  const workbench = options.workbench ?? new BlenderWorkbench(options)
  const disposers: Array<() => void> = [() => workbench.dispose()]
  if (typeof options.onDispose === 'function') {
    disposers.push(options.onDispose)
  }

  const registerRoutes = (host: any) => {
    const fetchReg = host?.connection?.fetch?.register
    if (typeof fetchReg !== 'function') return
    const r1 = fetchReg.call(host.connection.fetch, {
      path: workbench.route,
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: (request: Request) => workbench.fetch(request),
    })
    const r2 = fetchReg.call(host.connection.fetch, {
      path: workbench.route + '/upload',
      methods: ['POST'],
      requestBody: 'streaming',
      fetch: (request: Request) => workbench.fetch(request),
    })
    const removeRoutes = () => {
      r2?.()
      r1?.()
    }
    if (typeof host.effect === 'function') {
      host.effect(() => removeRoutes)
    } else {
      disposers.push(removeRoutes)
    }
  }

  if (typeof ctx.inject === 'function') {
    ctx.inject(['connection'], registerRoutes)
  } else if (ctx.connection?.fetch?.register) {
    registerRoutes(ctx)
  }

  const toolDisposers = registerBlenderTools(ctx, workbench, {
    checkSkillsHealth: options.checkSkillsHealth,
  })
  disposers.push(...toolDisposers)

  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    for (const fn of disposers.splice(0).reverse()) {
      try {
        fn()
      } catch {
        // best-effort dispose
      }
    }
  }

  ctx.effect?.(() => cleanup)
  ctx.on?.('dispose', cleanup)

  return workbench
}
