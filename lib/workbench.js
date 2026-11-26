import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, open, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import lockfile from 'proper-lockfile';
import { BlenderBridgeClient, checkScriptSafety, installBridgeAddon, launchBlenderGui, } from './bridge.js';
import { BlenderEnvironment, } from './environment.js';
import { getExemplar, listExemplarSummaries } from './exemplars.js';
import { PolyHavenClient } from './polyhaven.js';
import { BlenderRunner, DEFAULT_CYCLES_TIMEOUT_MS, DEFAULT_EEVEE_TIMEOUT_MS, } from './runner.js';
import { applyScriptPatches, BlenderStore, } from './store.js';
import { BLENDER_TEMPLATES, generateRunnerHarness, generateSceneScript } from './templates.js';
import { registerBlenderTools } from './tools.js';
import { ARTIFACT_MIME_MAP, BLENDER_QUALITY_TIERS, BLENDER_SHOT_PRESETS, BlenderConflict, BlenderError, blenderId, DEFAULT_MULTI_SHOT_IDS, MAX_ARTIFACT_DOWNLOAD_BYTES, MAX_ASSET_BYTES, MAX_JOB_LOG_LINES, resolveRenderResolution, scrubLogText, validateExportFormat, validateShotPresetIds, } from './types.js';
const MAX_JSON_BODY_BYTES = 512 * 1024; // 512 KB (custom scripts up to 256 KB + metadata)
const MAX_JOBS_RETAINED = 40;
const ANIMATION_JOB_TIMEOUT_MS = 600_000; // 10 min for animations
function errorMessage(e) {
    return scrubLogText(e instanceof Error ? e.message : String(e));
}
async function readPngDimensions(filePath, fallbackW, fallbackH) {
    const handle = await open(filePath, 'r');
    try {
        const header = Buffer.alloc(24);
        const { bytesRead } = await handle.read(header, 0, 24, 0);
        if (bytesRead >= 24 &&
            header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) &&
            header.toString('ascii', 12, 16) === 'IHDR') {
            return {
                width: header.readUInt32BE(16),
                height: header.readUInt32BE(20),
            };
        }
    }
    catch {
        // fallback below
    }
    finally {
        await handle.close();
    }
    return { width: fallbackW, height: fallbackH };
}
function outputSpecForJob(kind, format) {
    switch (kind) {
        case 'preview_still':
            return { fileName: 'render.png', artifactKind: 'still', mime: ARTIFACT_MIME_MAP.png };
        case 'contact_sheet':
            return { fileName: 'contact_sheet.png', artifactKind: 'contact_sheet', mime: ARTIFACT_MIME_MAP.png };
        case 'render_animation':
            return { fileName: 'animation.mp4', artifactKind: 'animation', mime: ARTIFACT_MIME_MAP.mp4 };
        case 'export_model': {
            const fmt = validateExportFormat(format ?? 'glb');
            return {
                fileName: fmt === 'blend' ? 'scene.blend' : `model.${fmt}`,
                artifactKind: fmt,
                mime: ARTIFACT_MIME_MAP[fmt] || 'application/octet-stream',
            };
        }
        case 'build_blend':
            return { fileName: 'scene.blend', artifactKind: 'blend', mime: ARTIFACT_MIME_MAP.blend };
        case 'inspect_scene':
        case 'run_script':
        case 'pipeline':
        case 'render_shots':
            return null;
    }
}
function validateQualityTier(value) {
    if (value === undefined || value === null || value === '')
        return undefined;
    if (typeof value === 'string' && BLENDER_QUALITY_TIERS.includes(value)) {
        return value;
    }
    throw new BlenderError('渲染质量档位必须为 draft、studio 或 beauty。', 'BAD_REQUEST', 400);
}
function validatePipelineOptions(raw) {
    const includeContactSheet = raw?.includeContactSheet !== false;
    const renderKind = raw?.renderKind ?? 'still';
    if (renderKind !== 'still' && renderKind !== 'animation') {
        throw new BlenderError('pipeline renderKind 必须为 still 或 animation。', 'BAD_REQUEST', 400);
    }
    const exportFormat = raw?.exportFormat ?? 'glb';
    if (exportFormat !== 'none') {
        validateExportFormat(exportFormat);
    }
    const qualityTier = validateQualityTier(raw?.qualityTier);
    const abortOnQcError = raw?.abortOnQcError === true;
    return {
        includeContactSheet,
        renderKind,
        exportFormat,
        qualityTier,
        abortOnQcError,
    };
}
function applyQualityTier(project, tier) {
    switch (tier) {
        case 'draft':
            return { ...project, engine: 'EEVEE', samples: 16, resolutionScale: 50 };
        case 'studio':
            return { ...project, engine: 'EEVEE', samples: 32, resolutionScale: 100 };
        case 'beauty':
            return { ...project, engine: 'CYCLES', samples: 64, resolutionScale: 100 };
        default:
            return project;
    }
}
function assertScriptSafeOrAllowed(code, allowUnsafe) {
    if (!code || !code.trim() || allowUnsafe === true)
        return;
    const safety = checkScriptSafety(code);
    if (!safety.safe) {
        const summary = safety.findings
            .slice(0, 3)
            .map(f => `L${f.line} [${f.rule}] ${f.detail}`)
            .join('；');
        throw new BlenderError(`自定义脚本未通过静态安全检查（如确需执行请显式传入 allowUnsafe: true）：${summary}`, 'SCRIPT_UNSAFE', 400);
    }
}
export class BlenderWorkbench {
    store;
    environment;
    runner;
    bridge;
    polyHaven;
    route = '/api/dsh-blender-studio/workbench';
    addonPath;
    hasCustomBridge;
    launchGuiFn;
    addonInstallExecutor;
    jobs = new Map();
    starting = false;
    disposed = false;
    lastBridgeStatus;
    constructor(options = {}) {
        this.store = options.store ?? new BlenderStore(options.root, { trashPath: options.trashPath, trashPaths: options.trashPaths });
        this.environment =
            options.environment ??
                new BlenderEnvironment({
                    root: this.store.root,
                    prober: options.prober,
                    gpuProber: options.gpuProber,
                    probeGpu: options.probeGpu,
                    skipSystemScan: options.skipSystemScan,
                    extraCandidates: options.extraCandidates,
                });
        this.runner =
            options.runner ??
                new BlenderRunner({
                    root: this.store.root,
                    executor: options.executor,
                });
        this.hasCustomBridge = Boolean(options.bridge);
        this.bridge = options.bridge ?? new BlenderBridgeClient();
        this.polyHaven =
            options.polyHaven ??
                new PolyHavenClient({
                    root: this.store.root,
                    isEnabled: async () => (await this.environment.getSettings()).polyHavenEnabled,
                    fetchImpl: options.fetchImpl,
                });
        this.addonPath =
            options.addonPath ?? fileURLToPath(new URL('../blender/dsh_blender_bridge.py', import.meta.url));
        this.launchGuiFn = options.launchGui ?? launchBlenderGui;
        this.addonInstallExecutor = options.addonInstallExecutor;
    }
    async syncBridgeFromSettings() {
        if (!this.hasCustomBridge) {
            const settings = await this.environment.getSettings();
            this.bridge.configure({
                host: settings.bridgeHost,
                port: settings.bridgePort,
                token: settings.bridgeToken,
            });
        }
        return this.bridge;
    }
    async bridgeStatus(timeoutMs = 2_500) {
        const client = await this.syncBridgeFromSettings();
        const status = await client.status(timeoutMs);
        this.lastBridgeStatus = status;
        return status;
    }
    async bridgeSceneInfo() {
        const client = await this.syncBridgeFromSettings();
        return client.sceneInfo();
    }
    async bridgeExecute(code, opts = {}) {
        if (typeof code !== 'string' || !code.trim()) {
            throw new BlenderError('请提供非空的 Python (bpy) 代码。', 'BAD_REQUEST', 400);
        }
        assertScriptSafeOrAllowed(code, opts.allowUnsafe);
        const client = await this.syncBridgeFromSettings();
        return client.execute(code, { pushUndo: opts.pushUndo ?? true, timeoutMs: opts.timeoutMs });
    }
    async bridgeViewport(opts = {}) {
        const client = await this.syncBridgeFromSettings();
        return client.viewportCapture(opts);
    }
    async bridgeSetCamera(opts) {
        const client = await this.syncBridgeFromSettings();
        return client.setCamera(opts);
    }
    async bridgeTransformObject(opts) {
        const client = await this.syncBridgeFromSettings();
        return client.transformObject(opts);
    }
    async bridgeSetMaterialColor(opts) {
        const client = await this.syncBridgeFromSettings();
        return client.setMaterialColor(opts);
    }
    async bridgeSyncProject(id, opts = {}) {
        const validId = blenderId(id);
        const project = await this.store.get(validId);
        if (project.scriptMode === 'custom' && project.customScript.trim()) {
            assertScriptSafeOrAllowed(project.customScript, opts.allowUnsafe);
        }
        const projectDir = await this.store.path(validId);
        const assetsDir = join(projectDir, 'assets');
        const settings = await this.environment.getSettings();
        const script = generateSceneScript(project, assetsDir, {
            computeDevice: settings.computeDevice ?? 'auto',
            applyLookdevOverrides: true,
        });
        const client = await this.syncBridgeFromSettings();
        const res = await client.loadScript(script, {
            clearScene: opts.clearScene ?? true,
            projectTitle: opts.projectTitle ?? project.title,
            timeoutMs: opts.timeoutMs,
        });
        if (res.sceneSummary) {
            await this.store.updateSceneSummary(validId, res.sceneSummary).catch(() => { });
        }
        return {
            projectId: project.id,
            revision: project.revision,
            ...res,
        };
    }
    async installAddon() {
        const active = await this.environment.requireActiveExecutable();
        return installBridgeAddon(active.path, this.addonPath, {
            executor: this.addonInstallExecutor,
        });
    }
    async createFromExemplar(exemplarId, titleOverride) {
        const exemplar = getExemplar(exemplarId);
        const customTitle = typeof titleOverride === 'string' && titleOverride.trim() ? titleOverride.trim() : undefined;
        const created = await this.store.create({
            ...exemplar.fields,
            title: customTitle || exemplar.fields.title || exemplar.titleEn,
            scriptMode: 'custom',
            customScript: exemplar.script,
        });
        return this.store.saveCheckpoint(created.id, created.revision, 'Exemplar baseline');
    }
    async patchProjectScript(id, revision, opts) {
        const validId = blenderId(id);
        const edits = Array.isArray(opts.edits)
            ? opts.edits
            : [{ find: opts.find ?? '', replace: opts.replace ?? '', replaceAll: Boolean(opts.replaceAll) }];
        const current = await this.store.get(validId);
        if (revision !== undefined && revision !== current.revision) {
            throw new BlenderConflict('工程已在另一窗口更新；你的修改已保留，请刷新最新版本后重试。');
        }
        const preview = applyScriptPatches(current.customScript, edits);
        assertScriptSafeOrAllowed(preview.patched, opts.allowUnsafe);
        const { project, replacements, appliedEdits } = await this.store.patchScriptEdits(validId, revision, edits, opts.note);
        return {
            ...project,
            project,
            replacements,
            appliedEdits,
            safety: checkScriptSafety(project.customScript),
        };
    }
    async environmentStatus(options = {}) {
        let bridgePatch;
        if (options.probeBridge) {
            bridgePatch = await this.bridgeStatus(options.bridgeTimeoutMs ?? 1500);
        }
        else if (this.lastBridgeStatus) {
            bridgePatch = this.lastBridgeStatus;
        }
        else if (this.hasCustomBridge) {
            bridgePatch = {
                host: this.bridge.host,
                port: this.bridge.port,
                hasToken: this.bridge.hasToken,
                connected: false,
            };
        }
        else {
            bridgePatch = {};
        }
        const status = await this.environment.status(bridgePatch, { forceDetect: options.forceDetect });
        if (this.hasCustomBridge) {
            status.bridge = {
                ...status.bridge,
                host: this.bridge.host,
                port: this.bridge.port,
                hasToken: this.bridge.hasToken,
            };
        }
        return status;
    }
    async configureSettings(patch) {
        const saved = await this.environment.configure(patch);
        const bridgeChanged = patch.bridgeHost !== undefined || patch.bridgePort !== undefined || patch.bridgeToken !== undefined;
        if (bridgeChanged) {
            this.lastBridgeStatus = undefined;
            this.bridge.configure({
                host: saved.bridgeHost,
                port: saved.bridgePort,
                token: saved.bridgeToken,
            });
        }
        return this.environmentStatus({ probeBridge: false });
    }
    listJobs() {
        return [...this.jobs.values()].map(j => structuredClone(j.view));
    }
    getJob(id) {
        const job = this.jobs.get(blenderId(id));
        if (!job) {
            throw new BlenderError('任务不存在或 DSH 已重启。工程仍保留，请刷新后重试。', 'JOB_NOT_FOUND', 404);
        }
        return structuredClone(job.view);
    }
    cancelJob(id) {
        const job = this.jobs.get(blenderId(id));
        if (!job) {
            throw new BlenderError('任务不存在。', 'JOB_NOT_FOUND', 404);
        }
        if (job.view.state === 'running') {
            job.abortReason = 'user';
            job.controller.abort();
        }
        return structuredClone(job.view);
    }
    async waitForJob(id) {
        const validId = blenderId(id);
        const job = this.jobs.get(validId);
        if (!job) {
            throw new BlenderError('任务不存在。', 'JOB_NOT_FOUND', 404);
        }
        await job.done;
        return structuredClone(job.view);
    }
    dispose() {
        this.disposed = true;
        for (const job of this.jobs.values()) {
            if (job.view.state === 'running') {
                job.abortReason = 'dispose';
                job.controller.abort();
            }
        }
    }
    pushJobLine(job, rawLine) {
        const cleaned = scrubLogText(rawLine);
        if (!cleaned)
            return;
        if (job.view.lines.at(-1) === cleaned)
            return;
        job.view.lines.push(cleaned);
        if (job.view.lines.length > MAX_JOB_LOG_LINES)
            job.view.lines.shift();
    }
    setStage(job, stageCode, stage, progress) {
        job.view.stageCode = stageCode;
        job.view.stage = stage;
        if (typeof progress === 'number' && Number.isFinite(progress)) {
            job.view.progress = Math.max(0, Math.min(100, Math.round(progress)));
        }
    }
    async startJob(kind, id, revision, options = {}) {
        if (this.disposed) {
            throw new BlenderError('插件已卸载，请重新加载。', 'PLUGIN_DISPOSED', 400);
        }
        if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
            throw new BlenderError('已有 Blender 任务正在运行，请等待完成或先取消当前任务。', 'JOB_CONFLICT', 409);
        }
        const validId = blenderId(id);
        const exportFormat = kind === 'export_model' ? validateExportFormat(options.format ?? 'glb') : undefined;
        const pipelineOpts = kind === 'pipeline' ? validatePipelineOptions(options.pipeline) : undefined;
        const validatedShots = kind === 'render_shots'
            ? options.shots !== undefined
                ? validateShotPresetIds(options.shots)
                : [...DEFAULT_MULTI_SHOT_IDS]
            : undefined;
        const validatedQualityTier = kind === 'render_shots' ? validateQualityTier(options.qualityTier) : undefined;
        this.starting = true;
        try {
            const active = await this.environment.requireActiveExecutable();
            const snapshot = await this.store.snapshot(validId, revision);
            const project = snapshot.project;
            const effectiveCustomCode = kind === 'run_script' && typeof options.code === 'string' && options.code.trim()
                ? options.code
                : project.scriptMode === 'custom'
                    ? project.customScript
                    : '';
            if (effectiveCustomCode.trim()) {
                assertScriptSafeOrAllowed(effectiveCustomCode, options.allowUnsafe);
            }
            if (this.disposed) {
                throw new BlenderError('插件已卸载，请重新加载。', 'PLUGIN_DISPOSED', 400);
            }
            if (this.jobs.size >= MAX_JOBS_RETAINED) {
                const oldestFinished = [...this.jobs.values()].find(j => j.view.state !== 'running');
                if (oldestFinished) {
                    this.jobs.delete(oldestFinished.view.id);
                }
                else {
                    throw new BlenderError('运行任务数已达上限。', 'JOB_LIMIT', 409);
                }
            }
            const jobId = randomUUID();
            const running = {
                view: {
                    id: jobId,
                    kind,
                    projectId: project.id,
                    revision: project.revision,
                    state: 'running',
                    stageCode: 'snapshot',
                    stage: kind === 'pipeline'
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
            };
            this.jobs.set(jobId, running);
            running.done = this.executeJob(running, active.path, snapshot, {
                ...options,
                format: exportFormat,
                pipeline: pipelineOpts,
                shots: validatedShots,
                qualityTier: validatedQualityTier,
            });
            return structuredClone(running.view);
        }
        finally {
            this.starting = false;
        }
    }
    async runHarnessStage(job, stageKind, stageRunId, executablePath, stageProject, snapshotAssets, stageOptions) {
        const outputSpec = outputSpecForJob(stageKind, stageOptions.format);
        let stageRunDir;
        let keepStageDir = false;
        try {
            job.controller.signal.throwIfAborted();
            stageRunDir = await this.store.runDir(stageProject.id, stageRunId);
            const assetsDir = join(stageRunDir, 'assets');
            await mkdir(assetsDir, { recursive: true });
            for (const [file, bytes] of snapshotAssets) {
                await writeFile(join(assetsDir, file), bytes, { flag: 'wx', mode: 0o600 });
            }
            const outputPath = outputSpec ? join(stageRunDir, outputSpec.fileName) : undefined;
            const scriptPath = join(stageRunDir, 'run.py');
            const settings = await this.environment.getSettings();
            const scriptContent = generateRunnerHarness(stageKind, {
                project: stageProject,
                assetsDir,
                outputPath,
                format: stageOptions.format,
                overrideCode: stageKind === 'run_script' ? stageOptions.overrideCode : undefined,
                frame: stageOptions.frame,
                computeDevice: settings.computeDevice ?? 'auto',
            });
            this.setStage(job, stageOptions.stageCode, stageOptions.stageLabel, stageOptions.progressStart);
            const startedAt = Date.now();
            const span = Math.max(1, stageOptions.progressEnd - stageOptions.progressStart);
            let tileIndex = 0;
            let tileTotal = 0;
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
                    if (stageKind === 'contact_sheet' && typeof stage === 'string') {
                        const tileMatch = /\((\d+)\/(\d+)\)/.exec(stage);
                        if (tileMatch) {
                            const cur = Math.max(1, Number(tileMatch[1]));
                            const tot = Math.max(1, Number(tileMatch[2]));
                            if (tot > 1 && cur <= tot) {
                                tileIndex = cur - 1;
                                tileTotal = tot;
                            }
                        }
                    }
                    let mapped = job.view.progress;
                    if (stageKind === 'contact_sheet' && tileTotal > 1) {
                        const tileFraction = progress > 0 ? Math.min(100, progress) / 100 : 0.05;
                        const overallFraction = Math.min(1, (tileIndex + tileFraction) / tileTotal);
                        mapped = stageOptions.progressStart + Math.round(overallFraction * span);
                    }
                    else if (progress > 0) {
                        mapped = stageOptions.progressStart + Math.round((Math.min(100, progress) / 100) * span);
                    }
                    const nextPct = Math.max(job.view.progress, Math.min(stageOptions.progressEnd, mapped));
                    this.setStage(job, stageOptions.stageCode, stage || job.view.stage, nextPct);
                },
            });
            job.controller.signal.throwIfAborted();
            if (result.sceneSummary) {
                job.view.sceneSummary = result.sceneSummary;
                await this.store.updateSceneSummary(stageProject.id, result.sceneSummary);
            }
            if (stageKind === 'run_script') {
                const combined = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
                job.view.scriptOutput = scrubLogText(combined, 16_000);
            }
            let artifact;
            if (outputSpec && outputPath) {
                let finalFileName = outputSpec.fileName;
                let finalFilePath = outputPath;
                let finalMime = outputSpec.mime;
                let fileInfo = await stat(finalFilePath).catch(() => null);
                if ((!fileInfo || !fileInfo.isFile() || fileInfo.size <= 0) && stageKind === 'render_animation') {
                    const framesDir = join(stageRunDir, 'frames');
                    const frameEntries = (await readdir(framesDir).catch(() => []))
                        .filter(name => /\.png$/i.test(name))
                        .sort();
                    if (frameEntries.length > 0) {
                        const firstFrame = join(framesDir, frameEntries[0]);
                        const firstBytes = await readFile(firstFrame);
                        finalFileName = 'frame_0001.png';
                        finalFilePath = join(stageRunDir, finalFileName);
                        finalMime = ARTIFACT_MIME_MAP.png;
                        await writeFile(finalFilePath, firstBytes, { mode: 0o600 });
                        fileInfo = await stat(finalFilePath).catch(() => null);
                    }
                }
                if (!fileInfo || !fileInfo.isFile() || fileInfo.size <= 0) {
                    throw new BlenderError('Blender 任务结束但未生成有效成品文件，请展开日志检查。', 'OUTPUT_INVALID', 400);
                }
                if (fileInfo.size > MAX_ARTIFACT_DOWNLOAD_BYTES) {
                    throw new BlenderError('生成的成品文件超过 200 MB 下载上限。', 'OUTPUT_TOO_LARGE', 400);
                }
                const { width: baseW, height: baseH } = resolveRenderResolution(stageProject.aspect, stageProject.resolutionScale);
                let dims = {};
                if (finalMime === 'image/png') {
                    dims = await readPngDimensions(finalFilePath, baseW, baseH);
                }
                else if (outputSpec.artifactKind === 'animation') {
                    dims = { width: baseW, height: baseH };
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
                };
                await this.store.registerArtifact(stageProject.id, artifact);
                await this.store.pruneRunWorkdir(stageRunDir, [finalFileName]);
                keepStageDir = true;
            }
            return { result, artifact };
        }
        finally {
            if (stageRunDir && !keepStageDir) {
                await this.store.safeRemoveRunDir(stageProject.id, stageRunId);
            }
        }
    }
    async executeJob(job, executablePath, snapshot, options) {
        const project = snapshot.project;
        let unlock;
        let finalState = 'failed';
        let finalStageCode = 'failed';
        let finalStage = '任务未完成';
        const pipelineOpts = job.view.kind === 'pipeline' ? validatePipelineOptions(options.pipeline) : undefined;
        const timeoutMs = options.timeoutMs ??
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
                            : DEFAULT_EEVEE_TIMEOUT_MS);
        const timer = setTimeout(() => {
            job.abortReason ??= 'timeout';
            job.controller.abort();
        }, timeoutMs);
        timer.unref?.();
        try {
            await this.store.init();
            const slot = join(this.store.root, 'workbench-slot');
            await mkdir(slot, { recursive: true });
            unlock = await lockfile.lock(slot, {
                retries: 0,
                stale: 30_000,
                update: 10_000,
                onCompromised: () => {
                    job.abortReason ??= 'lock-lost';
                    job.controller.abort();
                },
            });
            if (job.view.kind === 'pipeline' && pipelineOpts) {
                const summary = { artifactIds: [] };
                job.view.pipeline = summary;
                const deadline = Date.now() + timeoutMs;
                const remainingTimeout = () => Math.max(10_000, deadline - Date.now());
                // Stage 1: inspect_scene + QC-3D audit
                const qcStage = await this.runHarnessStage(job, 'inspect_scene', randomUUID(), executablePath, project, snapshot.assets, {
                    frame: options.frame,
                    timeoutMs: remainingTimeout(),
                    stageCode: 'pipeline-qc',
                    stageLabel: '全流程 (1/4)：场景构建与 QC-3D 体检',
                    progressStart: 5,
                    progressEnd: 18,
                });
                if (qcStage.result.sceneSummary?.qc) {
                    summary.qc = qcStage.result.sceneSummary.qc;
                }
                const errorIssues = summary.qc?.issues?.filter(issue => issue.severity === 'error') ?? [];
                if (pipelineOpts.abortOnQcError && errorIssues.length > 0) {
                    summary.stoppedEarly = true;
                    summary.stopReason = `QC-3D 检测到阻断性错误（${errorIssues.map(i => i.code).join(', ')}），已提前中止渲染。`;
                    finalState = 'done';
                    finalStageCode = 'stopped-early';
                    finalStage = summary.stopReason;
                    job.view.progress = 100;
                }
                else {
                    // Stage 2: 2x2 multi-angle visual QC contact sheet (fast EEVEE 16 spp)
                    if (pipelineOpts.includeContactSheet) {
                        const csId = randomUUID();
                        const qcProject = { ...project, engine: 'EEVEE', samples: 16 };
                        const csStage = await this.runHarnessStage(job, 'contact_sheet', csId, executablePath, qcProject, snapshot.assets, {
                            frame: options.frame,
                            timeoutMs: remainingTimeout(),
                            stageCode: 'pipeline-contact-sheet',
                            stageLabel: '全流程 (2/4)：渲染 2×2 四视角质检拼图 (EEVEE 16 spp)',
                            progressStart: 20,
                            progressEnd: 46,
                        });
                        if (csStage.artifact) {
                            summary.contactSheetId = csStage.artifact.id;
                            summary.artifactIds.push(csStage.artifact.id);
                            job.view.artifactId = csStage.artifact.id;
                            job.view.artifactKind = csStage.artifact.kind;
                        }
                    }
                    // Stage 3: Primary render with optional qualityTier (without mutating saved project)
                    const renderProject = applyQualityTier(project, pipelineOpts.qualityTier);
                    const primaryKind = pipelineOpts.renderKind === 'animation' ? 'render_animation' : 'preview_still';
                    const renderId = randomUUID();
                    const renderStage = await this.runHarnessStage(job, primaryKind, renderId, executablePath, renderProject, snapshot.assets, {
                        frame: options.frame,
                        timeoutMs: remainingTimeout(),
                        stageCode: 'pipeline-render',
                        stageLabel: `全流程 (3/4)：主画面渲染 (${renderProject.engine} ${renderProject.samples} spp · ${renderProject.resolutionScale}%)`,
                        progressStart: 48,
                        progressEnd: 84,
                    });
                    if (renderStage.result.sceneSummary?.qc) {
                        summary.qc = renderStage.result.sceneSummary.qc;
                    }
                    if (renderStage.artifact) {
                        summary.primaryRenderId = renderStage.artifact.id;
                        summary.artifactIds.push(renderStage.artifact.id);
                        job.view.artifactId = renderStage.artifact.id;
                        job.view.artifactKind = renderStage.artifact.kind;
                    }
                    // Stage 4: Optional 3D model export
                    if (pipelineOpts.exportFormat !== 'none') {
                        const exportId = randomUUID();
                        const exportStage = await this.runHarnessStage(job, 'export_model', exportId, executablePath, project, snapshot.assets, {
                            format: pipelineOpts.exportFormat,
                            timeoutMs: remainingTimeout(),
                            stageCode: 'pipeline-export',
                            stageLabel: `全流程 (4/4)：导出 3D 模型 (${pipelineOpts.exportFormat.toUpperCase()})`,
                            progressStart: 86,
                            progressEnd: 98,
                        });
                        if (exportStage.artifact) {
                            summary.modelArtifactId = exportStage.artifact.id;
                            summary.artifactIds.push(exportStage.artifact.id);
                        }
                    }
                    const userCancelled = job.controller.signal.aborted &&
                        (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason);
                    finalState = userCancelled ? 'cancelled' : 'done';
                    finalStageCode = userCancelled ? 'cancelled' : 'done';
                    finalStage = userCancelled
                        ? '已取消'
                        : `全流程完成（生成 ${summary.artifactIds.length} 项成品${summary.qc ? ` · QC-3D ${summary.qc.score}/${summary.qc.grade}` : ''}）`;
                    if (finalState === 'done')
                        job.view.progress = 100;
                }
            }
            else if (job.view.kind === 'render_shots') {
                const shotIds = options.shots && options.shots.length > 0 ? options.shots : [...DEFAULT_MULTI_SHOT_IDS];
                const renderProject = applyQualityTier(project, options.qualityTier);
                const settings = await this.environment.getSettings();
                // Keep temporary batch staging outside projects/<id>/runs so registerArtifact's
                // pruneOldRuns never deletes remaining shots while registering shot 1..N.
                const batchRunDir = join(this.store.root, 'tmp', `shots-${job.view.id}`);
                const completedShots = [];
                try {
                    job.controller.signal.throwIfAborted();
                    const assetsDir = join(batchRunDir, 'assets');
                    const shotsOutDir = join(batchRunDir, 'shots');
                    await mkdir(assetsDir, { recursive: true, mode: 0o700 });
                    await mkdir(shotsOutDir, { recursive: true, mode: 0o700 });
                    await this.store.checkPath(batchRunDir);
                    for (const [file, bytes] of snapshot.assets) {
                        await writeFile(join(assetsDir, file), bytes, { flag: 'wx', mode: 0o600 });
                    }
                    const scriptPath = join(batchRunDir, 'run.py');
                    const scriptContent = generateRunnerHarness('render_shots', {
                        project: renderProject,
                        assetsDir,
                        outputDir: shotsOutDir,
                        shots: shotIds,
                        frame: options.frame,
                        computeDevice: settings.computeDevice ?? 'auto',
                    });
                    this.setStage(job, 'render-shots', `多机位批量渲染 (0/${shotIds.length} · ${renderProject.engine} ${renderProject.samples} spp)`, 8);
                    const startedAt = Date.now();
                    const totalShots = Math.max(1, shotIds.length);
                    const shotSliceStart = (idx) => 8 + (Math.min(idx, totalShots) / totalShots) * 86;
                    const shotSliceEnd = (idx) => 8 + (Math.min(idx + 1, totalShots) / totalShots) * 86;
                    let doneCount = 0;
                    const result = await this.runner.run({
                        executablePath,
                        scriptPath,
                        scriptContent,
                        cwd: batchRunDir,
                        frameStart: renderProject.frameStart,
                        frameEnd: renderProject.frameEnd,
                        timeoutMs,
                        signal: job.controller.signal,
                        onLine: line => this.pushJobLine(job, line),
                        onShotDone: shot => {
                            doneCount = Math.min(totalShots, Math.max(doneCount + 1, shot.index ?? doneCount + 1));
                            const pct = Math.max(job.view.progress, Math.min(94, Math.round(shotSliceStart(doneCount))));
                            const label = shot.labelZh || shot.shotId;
                            this.setStage(job, 'render-shots', `多机位分镜已完成 ${doneCount}/${totalShots}：${label} (${shot.lensMm}mm)`, pct);
                        },
                        onProgress: (progress, stage) => {
                            if (doneCount < totalShots) {
                                const startPct = shotSliceStart(doneCount);
                                const endPct = Math.max(startPct + 1, shotSliceEnd(doneCount) - 1);
                                const rawMapped = progress > 0
                                    ? Math.round(startPct + (Math.min(100, progress) / 100) * (endPct - startPct))
                                    : job.view.progress;
                                const mapped = Math.max(job.view.progress, Math.min(94, rawMapped));
                                this.setStage(job, 'render-shots', stage || job.view.stage, mapped);
                            }
                        },
                    });
                    job.controller.signal.throwIfAborted();
                    if (result.sceneSummary) {
                        job.view.sceneSummary = result.sceneSummary;
                        await this.store.updateSceneSummary(project.id, result.sceneSummary);
                    }
                    const parsedMap = new Map((result.shots ?? []).map(s => [s.shotId, s]));
                    const { width: baseW, height: baseH } = resolveRenderResolution(renderProject.aspect, renderProject.resolutionScale);
                    const perShotDuration = Math.max(1, Math.round((result.durationMs || Date.now() - startedAt) / Math.max(1, shotIds.length)));
                    for (const shotId of shotIds) {
                        const fileName = `shot_${shotId}.png`;
                        const srcFile = join(shotsOutDir, fileName);
                        const fileInfo = await stat(srcFile).catch(() => null);
                        if (!fileInfo || !fileInfo.isFile() || fileInfo.size <= 0) {
                            continue;
                        }
                        if (fileInfo.size > MAX_ARTIFACT_DOWNLOAD_BYTES) {
                            throw new BlenderError('单张分镜成品超过 200 MB 下载上限。', 'OUTPUT_TOO_LARGE', 400);
                        }
                        const preset = BLENDER_SHOT_PRESETS.find(p => p.id === shotId);
                        const parsed = parsedMap.get(shotId);
                        const shotArtifactId = randomUUID();
                        const shotRunDir = await this.store.runDir(project.id, shotArtifactId);
                        let registered = false;
                        try {
                            const dstFile = join(shotRunDir, fileName);
                            await copyFile(srcFile, dstFile);
                            const dims = await readPngDimensions(dstFile, parsed?.width ?? baseW, parsed?.height ?? baseH);
                            const lensMm = parsed?.lensMm ?? preset?.lensMm ?? 50;
                            const labelZh = parsed?.labelZh ?? preset?.zh ?? shotId;
                            const labelEn = parsed?.labelEn ?? preset?.en ?? shotId;
                            const artifact = {
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
                            };
                            await this.store.registerArtifact(project.id, artifact);
                            registered = true;
                            completedShots.push({
                                shotId,
                                labelZh,
                                labelEn,
                                artifactId: shotArtifactId,
                                lensMm,
                                width: dims.width,
                                height: dims.height,
                            });
                        }
                        finally {
                            if (!registered) {
                                await this.store.safeRemoveRunDir(project.id, shotArtifactId);
                            }
                        }
                    }
                    if (completedShots.length === 0) {
                        throw new BlenderError('多机位批量渲染未生成有效 PNG 分镜，请展开日志检查。', 'OUTPUT_INVALID', 400);
                    }
                    job.view.shots = completedShots;
                    job.view.artifactId = completedShots[0].artifactId;
                    job.view.artifactKind = 'shot';
                    const userCancelled = job.controller.signal.aborted &&
                        (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason);
                    finalState = userCancelled ? 'cancelled' : 'done';
                    finalStageCode = userCancelled ? 'cancelled' : 'done';
                    finalStage = userCancelled
                        ? '已取消'
                        : `多机位分镜完成（已产出 ${completedShots.length} 张分镜图）`;
                    if (finalState === 'done')
                        job.view.progress = 100;
                }
                finally {
                    await this.store.checkPath(batchRunDir).then(() => rm(batchRunDir, { recursive: true, force: true, maxRetries: 4, retryDelay: 50 }), () => undefined).catch(() => { });
                }
            }
            else {
                const single = await this.runHarnessStage(job, job.view.kind, job.view.id, executablePath, project, snapshot.assets, {
                    format: options.format,
                    overrideCode: options.code,
                    frame: options.frame,
                    timeoutMs,
                    stageCode: 'running',
                    stageLabel: '正在执行 Blender 任务',
                    progressStart: 8,
                    progressEnd: 99,
                });
                if (single.artifact) {
                    job.view.artifactId = single.artifact.id;
                    job.view.artifactKind = single.artifact.kind;
                }
                const userCancelled = job.controller.signal.aborted &&
                    (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason);
                finalState = userCancelled ? 'cancelled' : 'done';
                finalStageCode = userCancelled ? 'cancelled' : 'done';
                finalStage = userCancelled ? '已取消' : '已完成';
                if (finalState === 'done')
                    job.view.progress = 100;
            }
        }
        catch (err) {
            const errCode = err?.code;
            const message = errCode === 'ELOCKED'
                ? '另一个 DSH 实例正在执行 Blender 任务，请等待完成或停止后再试。'
                : errorMessage(err);
            const isUserCancel = errCode === 'JOB_CANCELLED' ||
                (job.controller.signal.aborted &&
                    (job.abortReason === 'user' || job.abortReason === 'dispose' || !job.abortReason));
            finalState = isUserCancel ? 'cancelled' : 'failed';
            finalStageCode = isUserCancel
                ? 'cancelled'
                : job.abortReason || (typeof errCode === 'string' ? errCode.toLowerCase() : 'failed');
            finalStage = isUserCancel ? '已取消；工程已保留' : message;
            this.pushJobLine(job, message);
        }
        finally {
            clearTimeout(timer);
            if (unlock)
                await unlock().catch(() => { });
            this.setStage(job, finalStageCode, finalStage);
            job.view.state = finalState;
            job.view.finishedAt = new Date().toISOString();
        }
    }
    async openGui(id, revision) {
        const validId = blenderId(id);
        const active = await this.environment.requireActiveExecutable();
        const project = await this.store.get(validId);
        if (revision !== undefined && project.revision !== revision) {
            throw new BlenderConflict('工程已更新，请保存并刷新最新版本后再在 Blender 中打开。');
        }
        const existingBlend = project.artifacts.find(art => art.kind === 'blend' && art.revision === project.revision);
        if (existingBlend) {
            try {
                const info = await this.store.artifactPath(validId, existingBlend.id);
                const launched = await this.launchGuiFn(active.path, info.file);
                return {
                    launched: true,
                    executable: launched.executable,
                    blendFile: info.file,
                    pid: launched.pid,
                    built: false,
                };
            }
            catch {
                // Re-materialize if file missing on disk
            }
        }
        const startedJob = await this.startJob('build_blend', validId, project.revision);
        const finished = await this.waitForJob(startedJob.id);
        if (finished.state !== 'done' || !finished.artifactId) {
            throw new BlenderError(finished.stage || '无法构建工程 .blend 文件。', 'CLI_FAILED', 400);
        }
        const info = await this.store.artifactPath(validId, finished.artifactId);
        const launched = await this.launchGuiFn(active.path, info.file);
        return {
            launched: true,
            executable: launched.executable,
            blendFile: info.file,
            pid: launched.pid,
            built: true,
            job: finished,
        };
    }
    guard(request) {
        const url = new URL(request.url);
        const rawOrigin = request.headers.get('origin');
        const origin = rawOrigin ? rawOrigin.trim() : null;
        const site = request.headers.get('sec-fetch-site')?.trim().toLowerCase() || null;
        const desktop = origin !== null && origin.replace(/\/+$/, '').toLowerCase() === 'dsh-app://app';
        // DeepSeek Harness Desktop Electron shell sends Origin: dsh-app://app with Sec-Fetch-Site: cross-site.
        if (site && !['same-origin', 'none'].includes(site) && !desktop) {
            throw new BlenderError('请从 DSH 页面操作。', 'ORIGIN_FORBIDDEN', 403);
        }
        if (origin && !desktop) {
            let source;
            try {
                source = new URL(origin);
            }
            catch {
                throw new BlenderError('请从 DSH 页面操作。', 'ORIGIN_FORBIDDEN', 403);
            }
            const protocolOk = source.protocol === 'http:' || source.protocol === 'https:';
            const hostHeader = request.headers.get('host')?.trim();
            const expectedHost = hostHeader || url.host;
            const sameHost = source.host.toLowerCase() === expectedHost.toLowerCase();
            const isInternalCarrierLoopback = !hostHeader &&
                url.hostname.toLowerCase() === 'dsh.internal' &&
                source.protocol === 'http:' &&
                ['127.0.0.1', 'localhost', '[::1]', '::1', 'dsh.internal'].includes(source.hostname.toLowerCase());
            if (!protocolOk || (!sameHost && !isInternalCarrierLoopback)) {
                throw new BlenderError('请从 DSH 页面操作。', 'ORIGIN_FORBIDDEN', 403);
            }
        }
        if (request.method === 'POST') {
            const primary = request.headers.get('x-dsh-blender-studio');
            const compat = request.headers.get('x-dsh-blender');
            const marker = primary !== null ? primary : compat;
            if (marker !== '1') {
                throw new BlenderError('操作来源无效。', 'ORIGIN_FORBIDDEN', 403);
            }
        }
    }
    async streamFileWithRange(request, filePath, mimeType, downloadFileName) {
        await this.store.checkPath(filePath);
        const handle = await open(filePath, 'r');
        let streaming = false;
        try {
            const info = await handle.stat();
            const size = info.size;
            if (!info.isFile()) {
                throw new BlenderError('下载目标不是普通文件。', 'DOWNLOAD_INVALID', 400);
            }
            if (size > MAX_ARTIFACT_DOWNLOAD_BYTES) {
                throw new BlenderError('文件超过 200 MB 浏览器传输上限，请从本地工程目录取回。', 'OUTPUT_TOO_LARGE', 400);
            }
            const range = request.headers.get('range');
            const headers = {
                'content-type': mimeType,
                'cache-control': 'no-store',
                'x-content-type-options': 'nosniff',
                'accept-ranges': 'bytes',
            };
            if (downloadFileName) {
                headers['content-disposition'] = `attachment; filename="${downloadFileName}"`;
            }
            let start = 0;
            let end = size - 1;
            if (range) {
                const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
                const invalid = () => new Response(null, {
                    status: 416,
                    headers: { ...headers, 'content-range': `bytes */${size}` },
                });
                if (!match || (!match[1] && !match[2]) || !size)
                    return invalid();
                const first = Number(match[1]);
                const last = Number(match[2]);
                if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last))
                    return invalid();
                if (!match[1]) {
                    if (!last)
                        return invalid();
                    start = Math.max(0, size - last);
                }
                else {
                    start = first;
                    if (match[2])
                        end = Math.min(last, end);
                }
                if (start > end || start >= size)
                    return invalid();
                headers['content-range'] = `bytes ${start}-${end}/${size}`;
            }
            headers['content-length'] = String(size ? end - start + 1 : 0);
            if (!size)
                return new Response(null, { headers });
            const body = Readable.toWeb(handle.createReadStream({ start, end, highWaterMark: 64 * 1024, signal: request.signal }), {
                strategy: {
                    highWaterMark: 64 * 1024,
                    size: (chunk) => chunk.byteLength,
                },
            });
            const response = new Response(body, { status: range ? 206 : 200, headers });
            streaming = true;
            return response;
        }
        finally {
            if (!streaming)
                await handle.close();
        }
    }
    async fetch(request) {
        try {
            this.guard(request);
            const url = new URL(request.url);
            if (request.method === 'GET') {
                const kind = url.searchParams.get('kind');
                if (kind === 'addon') {
                    const addonText = await readFile(this.addonPath, 'utf8');
                    return new Response(addonText, {
                        headers: {
                            'content-type': 'text/x-python; charset=utf-8',
                            'content-disposition': 'attachment; filename="dsh_blender_bridge.py"',
                            'cache-control': 'no-store',
                            'x-content-type-options': 'nosniff',
                        },
                    });
                }
                const id = blenderId(url.searchParams.get('id'));
                if (kind === 'source') {
                    const zipBytes = await this.store.buildSourceZip(id);
                    return new Response(zipBytes, {
                        headers: {
                            'content-type': 'application/zip',
                            'content-disposition': `attachment; filename="dsh-blender-studio-${id}.zip"`,
                            'cache-control': 'no-store',
                            'x-content-type-options': 'nosniff',
                        },
                    });
                }
                const wantDownload = url.searchParams.get('download') === '1';
                if (kind === 'asset') {
                    const assetId = blenderId(url.searchParams.get('asset'));
                    const { file, asset } = await this.store.assetPath(id, assetId);
                    const mimeType = ARTIFACT_MIME_MAP[asset.ext] || 'application/octet-stream';
                    const dlName = wantDownload ? `dsh-blender-studio-${id}-${asset.id}.${asset.ext}` : undefined;
                    return await this.streamFileWithRange(request, file, mimeType, dlName);
                }
                if (kind === 'artifact') {
                    const artifactId = blenderId(url.searchParams.get('artifact'));
                    const { file, artifact, mime } = await this.store.artifactPath(id, artifactId);
                    const ext = extname(artifact.file).replace(/^\./, '') || 'bin';
                    const dlName = wantDownload
                        ? `dsh-blender-studio-${id}-${artifact.kind}-${basename(artifact.file).replace(/[^a-zA-Z0-9._-]/g, '_') || artifact.id + '.' + ext}`
                        : undefined;
                    return await this.streamFileWithRange(request, file, mime, dlName);
                }
                throw new BlenderError('下载类型无效。', 'DOWNLOAD_INVALID', 400);
            }
            if (request.method !== 'POST') {
                return new Response(null, { status: 405 });
            }
            let value;
            if (url.pathname.endsWith('/upload')) {
                const reader = request.body?.getReader();
                if (!reader)
                    throw new BlenderError('请选择需要上传的 3D 素材文件。', 'ASSET_REQUIRED', 400);
                const chunks = [];
                let size = 0;
                try {
                    while (true) {
                        const chunk = await reader.read();
                        if (chunk.done)
                            break;
                        size += chunk.value.length;
                        if (size > MAX_ASSET_BYTES) {
                            throw new BlenderError('单个素材文件不能超过 50 MB。', 'ASSET_SIZE', 400);
                        }
                        chunks.push(chunk.value);
                    }
                }
                finally {
                    await reader.cancel().catch(() => { });
                }
                let fileName = '';
                try {
                    fileName = decodeURIComponent(request.headers.get('x-file-name') || '');
                }
                catch {
                    throw new BlenderError('文件名编码无效。', 'ASSET_FORMAT', 400);
                }
                if (!fileName.trim()) {
                    throw new BlenderError('缺少素材文件名。', 'ASSET_REQUIRED', 400);
                }
                const projectId = blenderId(request.headers.get('x-project-id'));
                const revision = Number(request.headers.get('x-project-revision'));
                value = await this.store.upload(projectId, revision, fileName, Buffer.concat(chunks));
            }
            else {
                if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
                    throw new BlenderError('请求格式无效，需要 application/json。', 'BAD_REQUEST', 400);
                }
                const text = await request.text();
                if (Buffer.byteLength(text, 'utf8') > MAX_JSON_BODY_BYTES) {
                    throw new BlenderError('请求体过大（上限 512 KB）。', 'BAD_REQUEST', 400);
                }
                let v;
                try {
                    v = JSON.parse(text);
                }
                catch {
                    throw new BlenderError('请求 JSON 解析失败。', 'BAD_REQUEST', 400);
                }
                if (!v || typeof v !== 'object' || Array.isArray(v)) {
                    throw new BlenderError('请求体必须为 JSON 对象。', 'BAD_REQUEST', 400);
                }
                switch (v.action) {
                    // Project CRUD
                    case 'list': {
                        const [active, archived, environment] = await Promise.all([
                            this.store.listWithWarnings(false),
                            this.store.listWithWarnings(true),
                            this.environmentStatus({ probeBridge: false }),
                        ]);
                        const corruptedProjects = [
                            ...active.corrupted.map(item => ({ ...item, archived: false })),
                            ...archived.corrupted.map(item => ({ ...item, archived: true })),
                        ];
                        const corruptedCount = corruptedProjects.length;
                        value = {
                            projects: active.projects,
                            archivedProjects: archived.projects,
                            ...(corruptedCount ? { corruptedCount, corruptedProjects } : {}),
                            templates: BLENDER_TEMPLATES,
                            exemplars: listExemplarSummaries(),
                            shotPresets: BLENDER_SHOT_PRESETS,
                            environment,
                            jobs: this.listJobs(),
                        };
                        break;
                    }
                    case 'list_exemplars':
                        value = { exemplars: listExemplarSummaries() };
                        break;
                    case 'create_from_exemplar': {
                        const exemplarId = typeof v.exemplarId === 'string' ? v.exemplarId : typeof v.id === 'string' ? v.id : '';
                        value = await this.createFromExemplar(exemplarId, typeof v.title === 'string' ? v.title : undefined);
                        break;
                    }
                    case 'create':
                        value = await this.store.create(v.fields);
                        break;
                    case 'get':
                        value = await this.store.get(blenderId(v.id), Boolean(v.archived));
                        break;
                    case 'update':
                        value = await this.store.update(blenderId(v.id), v.revision, v.fields);
                        break;
                    case 'duplicate':
                        value = await this.store.duplicate(blenderId(v.id), typeof v.title === 'string' ? v.title : undefined);
                        break;
                    case 'save_checkpoint':
                        value = await this.store.saveCheckpoint(blenderId(v.id), v.revision, typeof v.note === 'string' ? v.note : undefined);
                        break;
                    case 'restore_checkpoint':
                        value = await this.store.restoreCheckpoint(blenderId(v.id), v.revision, blenderId(v.checkpointId ?? v.checkpoint));
                        break;
                    case 'patch_script': {
                        if (Array.isArray(v.edits)) {
                            const edits = v.edits.map((item, idx) => {
                                if (!item || typeof item !== 'object' || typeof item.find !== 'string' || typeof item.replace !== 'string') {
                                    throw new BlenderError(`patch_script 的 edits[${idx}] 需要字符串类型的 find 与 replace 参数。`, 'BAD_REQUEST', 400);
                                }
                                return {
                                    find: item.find,
                                    replace: item.replace,
                                    replaceAll: item.replaceAll === true,
                                };
                            });
                            value = await this.patchProjectScript(blenderId(v.id), v.revision, {
                                edits,
                                note: typeof v.note === 'string' ? v.note : undefined,
                                allowUnsafe: v.allowUnsafe === true,
                            });
                        }
                        else {
                            if (typeof v.find !== 'string' || typeof v.replace !== 'string') {
                                throw new BlenderError('patch_script 需要字符串类型的 find 与 replace 参数，或提供 edits 数组。', 'BAD_REQUEST', 400);
                            }
                            value = await this.patchProjectScript(blenderId(v.id), v.revision, {
                                find: v.find,
                                replace: v.replace,
                                replaceAll: v.replaceAll === true,
                                note: typeof v.note === 'string' ? v.note : undefined,
                                allowUnsafe: v.allowUnsafe === true,
                            });
                        }
                        break;
                    }
                    case 'removeAsset':
                        value = await this.store.removeAsset(blenderId(v.id), v.revision, blenderId(v.asset ?? v.assetId));
                        break;
                    case 'archive':
                    case 'restore': {
                        if (v.confirmed !== true) {
                            throw new BlenderError('请明确确认归档或恢复操作。', 'CONFIRM_REQUIRED', 400);
                        }
                        const slot = join(this.store.root, 'workbench-slot');
                        await this.store.init();
                        await mkdir(slot, { recursive: true });
                        const unlock = await lockfile.lock(slot, { retries: 0, stale: 30_000, update: 10_000 }).catch(error => {
                            if (error.code === 'ELOCKED') {
                                throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再归档或恢复工程。');
                            }
                            throw error;
                        });
                        try {
                            value = await this.store.archive(blenderId(v.id), v.revision, v.action === 'restore');
                        }
                        finally {
                            await unlock().catch(() => { });
                        }
                        break;
                    }
                    case 'trash': {
                        if (v.confirmed !== true) {
                            throw new BlenderError('请明确确认移入系统回收站。', 'CONFIRM_REQUIRED', 400);
                        }
                        if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
                            throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再移入系统回收站。');
                        }
                        const id = blenderId(v.id);
                        const archived = v.archived !== false;
                        const slot = join(this.store.root, 'workbench-slot');
                        await this.store.init();
                        await mkdir(slot, { recursive: true });
                        const unlock = await lockfile.lock(slot, { retries: 0, stale: 30_000, update: 10_000 }).catch(error => {
                            if (error.code === 'ELOCKED') {
                                throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再移入系统回收站。');
                            }
                            throw error;
                        });
                        try {
                            value = await this.store.trash(id, v.revision, archived);
                        }
                        finally {
                            await unlock().catch(() => { });
                        }
                        break;
                    }
                    case 'trashArchived': {
                        if (v.confirmed !== true) {
                            throw new BlenderError('请明确确认清空已归档工程。', 'CONFIRM_REQUIRED', 400);
                        }
                        if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
                            throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再清空已归档工程。');
                        }
                        const slot = join(this.store.root, 'workbench-slot');
                        await this.store.init();
                        await mkdir(slot, { recursive: true });
                        const unlock = await lockfile.lock(slot, { retries: 0, stale: 30_000, update: 10_000 }).catch(error => {
                            if (error.code === 'ELOCKED') {
                                throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再清空已归档工程。');
                            }
                            throw error;
                        });
                        try {
                            value = await this.store.trashArchived();
                        }
                        finally {
                            await unlock().catch(() => { });
                        }
                        break;
                    }
                    case 'trashCorrupted': {
                        if (v.confirmed !== true) {
                            throw new BlenderError('请明确确认清理损坏工程目录。', 'CONFIRM_REQUIRED', 400);
                        }
                        if (v.items !== undefined && !Array.isArray(v.items)) {
                            throw new BlenderError('损坏工程列表格式无效。', 'BAD_REQUEST', 400);
                        }
                        if (this.starting || [...this.jobs.values()].some(j => j.view.state === 'running')) {
                            throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再清理损坏工程目录。');
                        }
                        const slot = join(this.store.root, 'workbench-slot');
                        await this.store.init();
                        await mkdir(slot, { recursive: true });
                        const unlock = await lockfile.lock(slot, { retries: 0, stale: 30_000, update: 10_000 }).catch(error => {
                            if (error.code === 'ELOCKED') {
                                throw new BlenderConflict('已有 Blender 任务正在运行，请先等待完成或取消任务后再清理损坏工程目录。');
                            }
                            throw error;
                        });
                        try {
                            value = await this.store.trashCorrupted(v.items);
                        }
                        finally {
                            await unlock().catch(() => { });
                        }
                        break;
                    }
                    case 'generatedScript': {
                        const p = await this.store.get(blenderId(v.id));
                        const settings = await this.environment.getSettings();
                        const script = generateSceneScript(p, './assets', {
                            computeDevice: settings.computeDevice ?? 'auto',
                        });
                        const safety = checkScriptSafety(p.scriptMode === 'custom' ? p.customScript : script);
                        value = {
                            id: p.id,
                            revision: p.revision,
                            scriptMode: p.scriptMode,
                            script,
                            safety,
                        };
                        break;
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
                        });
                        break;
                    case 'export_model':
                        value = await this.startJob('export_model', blenderId(v.id), v.revision, {
                            format: validateExportFormat(v.format),
                            allowUnsafe: v.allowUnsafe === true,
                        });
                        break;
                    case 'run_script':
                        value = await this.startJob('run_script', blenderId(v.id), v.revision, {
                            code: typeof v.code === 'string' ? v.code : undefined,
                            allowUnsafe: v.allowUnsafe === true,
                        });
                        break;
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
                        });
                        break;
                    case 'render_shots':
                        value = await this.startJob('render_shots', blenderId(v.id), v.revision, {
                            frame: typeof v.frame === 'number' ? v.frame : undefined,
                            allowUnsafe: v.allowUnsafe === true,
                            shots: v.shots,
                            qualityTier: v.qualityTier,
                        });
                        break;
                    case 'open_gui':
                        value = await this.openGui(blenderId(v.id), v.revision);
                        break;
                    case 'job':
                        value = this.getJob(blenderId(v.job ?? v.id));
                        break;
                    case 'cancel':
                        value = this.cancelJob(blenderId(v.job ?? v.id));
                        break;
                    // Environment & configuration
                    case 'environment':
                        value = await this.environmentStatus({
                            probeBridge: Boolean(v.probeBridge),
                            forceDetect: Boolean(v.forceDetect),
                        });
                        break;
                    case 'configure': {
                        const patch = {};
                        if (v.blenderPath !== undefined)
                            patch.blenderPath = v.blenderPath;
                        if (v.bridgeHost !== undefined)
                            patch.bridgeHost = v.bridgeHost;
                        if (v.bridgePort !== undefined)
                            patch.bridgePort = v.bridgePort;
                        if (v.bridgeToken !== undefined)
                            patch.bridgeToken = v.bridgeToken;
                        if (v.polyHavenEnabled !== undefined)
                            patch.polyHavenEnabled = v.polyHavenEnabled;
                        if (v.computeDevice !== undefined)
                            patch.computeDevice = v.computeDevice;
                        value = await this.configureSettings(patch);
                        break;
                    }
                    case 'detect_blender':
                        value = await this.environmentStatus({ forceDetect: true, probeBridge: false });
                        break;
                    // Live Socket Bridge
                    case 'bridge_status':
                        value = await this.bridgeStatus();
                        break;
                    case 'bridge_scene':
                        value = await this.bridgeSceneInfo();
                        break;
                    case 'bridge_execute':
                        value = await this.bridgeExecute(v.code, {
                            pushUndo: typeof v.pushUndo === 'boolean' ? v.pushUndo : true,
                            allowUnsafe: v.allowUnsafe === true,
                        });
                        break;
                    case 'bridge_viewport':
                        value = await this.bridgeViewport({
                            width: typeof v.width === 'number' ? v.width : undefined,
                            height: typeof v.height === 'number' ? v.height : undefined,
                        });
                        break;
                    case 'bridge_sync':
                        value = await this.bridgeSyncProject(blenderId(v.id), {
                            clearScene: typeof v.clearScene === 'boolean' ? v.clearScene : true,
                            allowUnsafe: v.allowUnsafe === true,
                        });
                        break;
                    case 'bridge_install_addon': {
                        if (v.confirmed !== true) {
                            throw new BlenderError('安装并启用 Blender Live Bridge 插件将写入本机 Blender 用户插件配置，请明确确认（confirmed: true）。', 'CONFIRM_REQUIRED', 400);
                        }
                        value = await this.installAddon();
                        break;
                    }
                    case 'bridge_set_camera':
                        value = await this.bridgeSetCamera({
                            location: v.location,
                            target: v.target,
                            lensMm: v.lensMm,
                            dofFstop: v.dofFstop,
                        });
                        break;
                    case 'bridge_transform_object':
                        value = await this.bridgeTransformObject({
                            name: v.name,
                            location: v.location,
                            rotationDeg: v.rotationDeg,
                            scale: v.scale,
                        });
                        break;
                    case 'bridge_set_material':
                        value = await this.bridgeSetMaterialColor({
                            materialName: v.materialName,
                            color: v.color,
                            metallic: v.metallic,
                            roughness: v.roughness,
                        });
                        break;
                    // Optional Poly Haven CC0 assets
                    case 'polyhaven_search': {
                        const query = typeof v.query === 'string' ? v.query : '';
                        const type = (v.type ?? 'hdris');
                        const limit = typeof v.limit === 'number' ? v.limit : 12;
                        const items = await this.polyHaven.search(query, type, limit);
                        value = { items, query, type };
                        break;
                    }
                    case 'polyhaven_import': {
                        const projectId = blenderId(v.id);
                        const assetId = typeof v.assetId === 'string' ? v.assetId.trim() : '';
                        if (!assetId)
                            throw new BlenderError('缺少 Poly Haven 资产 ID。', 'BAD_REQUEST', 400);
                        const assetType = (v.assetType ?? v.type ?? 'hdris');
                        const resolution = v.resolution === '2k' ? '2k' : '1k';
                        const dl = await this.polyHaven.downloadAsset(assetId, assetType, resolution);
                        const { project, asset } = await this.store.addAsset(projectId, v.revision, dl.fileName, dl.bytes, {
                            kind: dl.kind,
                            source: 'polyhaven',
                            sourceId: dl.assetId,
                        });
                        // Spread project at top level so UI callers reading updated.id work directly,
                        // while also exposing `project`, `asset`, and `cached` for tools/API callers.
                        value = {
                            ...project,
                            project,
                            asset,
                            cached: dl.cached,
                        };
                        break;
                    }
                    default:
                        throw new BlenderError('不支持的工作台操作。', 'BAD_ACTION', 400);
                }
            }
            return Response.json({ ok: true, value }, { headers: { 'cache-control': 'no-store' } });
        }
        catch (e) {
            const status = e instanceof BlenderConflict ? 409 : e instanceof BlenderError ? e.status : 400;
            const code = e instanceof BlenderError ? e.code : undefined;
            return Response.json({ ok: false, message: errorMessage(e), ...(code ? { code } : {}) }, { status, headers: { 'cache-control': 'no-store' } });
        }
    }
}
export function installBlenderWorkbench(ctx, options = {}) {
    const workbench = options.workbench ?? new BlenderWorkbench(options);
    const disposers = [() => workbench.dispose()];
    if (typeof options.onDispose === 'function') {
        disposers.push(options.onDispose);
    }
    const registerRoutes = (host) => {
        const fetchReg = host?.connection?.fetch?.register;
        if (typeof fetchReg !== 'function')
            return;
        const r1 = fetchReg.call(host.connection.fetch, {
            path: workbench.route,
            methods: ['GET', 'POST'],
            requestBody: 'buffered',
            fetch: (request) => workbench.fetch(request),
        });
        const r2 = fetchReg.call(host.connection.fetch, {
            path: workbench.route + '/upload',
            methods: ['POST'],
            requestBody: 'streaming',
            fetch: (request) => workbench.fetch(request),
        });
        const removeRoutes = () => {
            r2?.();
            r1?.();
        };
        if (typeof host.effect === 'function') {
            host.effect(() => removeRoutes);
        }
        else {
            disposers.push(removeRoutes);
        }
    };
    if (typeof ctx.inject === 'function') {
        ctx.inject(['connection'], registerRoutes);
    }
    else if (ctx.connection?.fetch?.register) {
        registerRoutes(ctx);
    }
    const toolDisposers = registerBlenderTools(ctx, workbench, {
        checkSkillsHealth: options.checkSkillsHealth,
    });
    disposers.push(...toolDisposers);
    let cleaned = false;
    const cleanup = () => {
        if (cleaned)
            return;
        cleaned = true;
        for (const fn of disposers.splice(0).reverse()) {
            try {
                fn();
            }
            catch {
                // best-effort dispose
            }
        }
    };
    ctx.effect?.(() => cleanup);
    ctx.on?.('dispose', cleanup);
    return workbench;
}
