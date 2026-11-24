import { randomUUID } from 'node:crypto'
import { mkdir, open, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import lockfile from 'proper-lockfile'
import {
  BlenderBridgeClient,
  checkScriptSafety,
  launchBlenderGui,
  type BridgeExecuteOptions,
  type BridgeExecuteResult,
  type BridgeLoadScriptOptions,
  type BridgeLoadScriptResult,
  type BridgeViewportOptions,
  type BridgeViewportResult,
  type LaunchBlenderGuiResult,
} from './bridge.js'
import {
  BlenderEnvironment,
  type BlenderCandidate,
  type BlenderVersionProber,
} from './environment.js'
import { PolyHavenClient } from './polyhaven.js'
import {
  BlenderRunner,
  DEFAULT_CYCLES_TIMEOUT_MS,
  DEFAULT_EEVEE_TIMEOUT_MS,
  type BlenderRunExecutor,
} from './runner.js'
import type { SkillBundleHealthReport, SkillsPluginContext } from './skill-bundle.js'
import { BlenderStore, type TrashPathFn, type TrashPathsFn } from './store.js'
import { BLENDER_TEMPLATES, generateRunnerHarness, generateSceneScript } from './templates.js'
import { registerBlenderTools } from './tools.js'
import {
  ARTIFACT_MIME_MAP,
  BLENDER_QUALITY_TIERS,
  BlenderConflict,
  BlenderError,
  blenderId,
  MAX_ARTIFACT_DOWNLOAD_BYTES,
  MAX_ASSET_BYTES,
  MAX_JOB_LOG_LINES,
  resolveRenderResolution,
  scrubLogText,
  validateExportFormat,
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
  executor?: BlenderRunExecutor
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
  readonly route = '/api/dsh-blender-studio/workbench'
  readonly addonPath: string

  private readonly hasCustomBridge: boolean
  private readonly launchGuiFn: (executablePath: string, blendFile?: string) => Promise<LaunchBlenderGuiResult>
  private readonly jobs = new Map<string, RunningJob>()
  private starting = false
  private disposed = false
  private lastBridgeStatus?: BlenderBridgeStatus

  constructor(options: BlenderWorkbenchOptions = {}) {
    this.store = options.store ?? new BlenderStore(options.root, { trashPath: options.trashPath, trashPaths: options.trashPaths })
    this.environment =
      options.environment ??
      new BlenderEnvironment({
        root: this.store.root,
        prober: options.prober,
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

  async bridgeSyncProject(
    id: string,
    opts: BridgeLoadScriptOptions & { allowUnsafe?: boolean } = {},
  ): Promise<BridgeLoadScriptResult & { projectId: string; revision: number }> {
    const validId = blenderId(id)
    const project = await this.store.get(validId)
    if (project.scriptMode === 'custom' && project.customScript.trim()) {
      assertScriptSafeOrAllowed(project.customScript, opts.allowUnsafe)
    }
    const projectDir = await this.store.path(validId)
    const assetsDir = join(projectDir, 'assets')
    const script = generateSceneScript(project, assetsDir)
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
          stage: kind === 'pipeline' ? '准备一键全流程任务' : '准备工程快照与执行环境',
          progress: 2,
          lines: [],
          ...(kind === 'pipeline' ? { pipeline: { artifactIds: [] } } : {}),
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
      })
      return structuredClone(running.view)
    } finally {
      this.starting = false
    }
  }

  private async runHarnessStage(
    job: RunningJob,
    stageKind: Exclude<BlenderJobKind, 'pipeline'>,
    stageRunId: string,
    executablePath: string,
    stageProject: BlenderProject,
    snapshotAssets: Map<string, Buffer>,
    stageOptions: {
      format?: BlenderExportFormat
      overrideCode?: string
      frame?: number
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
      const scriptContent = generateRunnerHarness(stageKind, {
        project: stageProject,
        assetsDir,
        outputPath,
        format: stageOptions.format,
        overrideCode: stageKind === 'run_script' ? stageOptions.overrideCode : undefined,
        frame: stageOptions.frame,
      })

      this.setStage(job, stageOptions.stageCode, stageOptions.stageLabel, stageOptions.progressStart)
      const startedAt = Date.now()
      const span = Math.max(1, stageOptions.progressEnd - stageOptions.progressStart)

      const result = await this.runner.run({
        executablePath,
        scriptPath,
        scriptContent,
        cwd: stageRunDir,
        frameStart: stageProject.frameStart,
        frameEnd: stageProject.frameEnd,
        timeoutMs: stageOptions.timeoutMs,
        signal: job.controller.signal,
        onLine: line => this.pushJobLine(job, line),
        onProgress: (progress, stage) => {
          const mapped =
            progress > 0
              ? stageOptions.progressStart + Math.round((Math.min(100, progress) / 100) * span)
              : job.view.progress
          const nextPct = Math.max(job.view.progress, Math.min(stageOptions.progressEnd, mapped))
          this.setStage(job, stageOptions.stageCode, stage || job.view.stage, nextPct)
        },
      })

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
      } else {
        const single = await this.runHarnessStage(
          job,
          job.view.kind as Exclude<BlenderJobKind, 'pipeline'>,
          job.view.id,
          executablePath,
          project,
          snapshot.assets,
          {
            format: options.format,
            overrideCode: options.code,
            frame: options.frame,
            timeoutMs,
            stageCode: 'running',
            stageLabel: '正在执行 Blender 任务',
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

        switch (v.action) {
          // Project CRUD
          case 'list': {
            const [active, archived, environment] = await Promise.all([
              this.store.listWithWarnings(false),
              this.store.listWithWarnings(true),
              this.environmentStatus({ probeBridge: false }),
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
              environment,
              jobs: this.listJobs(),
            }
            break
          }
          case 'create':
            value = await this.store.create(v.fields)
            break
          case 'get':
            value = await this.store.get(blenderId(v.id), Boolean(v.archived))
            break
          case 'update':
            value = await this.store.update(blenderId(v.id), v.revision, v.fields)
            break
          case 'duplicate':
            value = await this.store.duplicate(
              blenderId(v.id),
              typeof v.title === 'string' ? v.title : undefined,
            )
            break
          case 'save_checkpoint':
            value = await this.store.saveCheckpoint(
              blenderId(v.id),
              v.revision,
              typeof v.note === 'string' ? v.note : undefined,
            )
            break
          case 'restore_checkpoint':
            value = await this.store.restoreCheckpoint(
              blenderId(v.id),
              v.revision,
              blenderId(v.checkpointId ?? v.checkpoint),
            )
            break
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
            const script = generateSceneScript(p, './assets')
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
            })
            break
          case 'export_model':
            value = await this.startJob('export_model', blenderId(v.id), v.revision, {
              format: validateExportFormat(v.format),
              allowUnsafe: v.allowUnsafe === true,
            })
            break
          case 'run_script':
            value = await this.startJob('run_script', blenderId(v.id), v.revision, {
              code: typeof v.code === 'string' ? v.code : undefined,
              allowUnsafe: v.allowUnsafe === true,
            })
            break
          case 'pipeline':
            value = await this.startJob('pipeline', blenderId(v.id), v.revision, {
              frame: typeof v.frame === 'number' ? v.frame : undefined,
              allowUnsafe: v.allowUnsafe === true,
              pipeline: {
                includeContactSheet: typeof v.includeContactSheet === 'boolean' ? v.includeContactSheet : true,
                renderKind: v.renderKind,
                exportFormat: v.exportFormat,
                qualityTier: v.qualityTier,
                abortOnQcError: v.abortOnQcError === true,
              },
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
          case 'bridge_sync':
            value = await this.bridgeSyncProject(blenderId(v.id), {
              clearScene: typeof v.clearScene === 'boolean' ? v.clearScene : true,
              allowUnsafe: v.allowUnsafe === true,
            })
            break

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
