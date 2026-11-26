import { execFile, spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { StringDecoder } from 'node:string_decoder';
import { BlenderError, MAX_JOB_LOG_LINES, SCENE_JSON_MARKER, SHOT_DONE_MARKER, scrubLogText, } from './types.js';
export const DEFAULT_EEVEE_TIMEOUT_MS = 180_000;
export const DEFAULT_CYCLES_TIMEOUT_MS = 300_000;
const SCRUBBED_ENV_ALLOWLIST = /^(path|pathext|systemroot|windir|comspec|display|wayland_display|xdg_runtime_dir|cuda_visible_devices|hip_visible_devices|metal_device_wrapper_type)$/i;
export function buildBlenderChildEnv(root) {
    const result = {};
    for (const [key, value] of Object.entries(process.env)) {
        if (SCRUBBED_ENV_ALLOWLIST.test(key) && value !== undefined) {
            result[key] = value;
        }
    }
    const userHome = join(root, 'blender-home');
    const tmpDir = join(root, 'tmp');
    return {
        ...result,
        HOME: userHome,
        USERPROFILE: userHome,
        APPDATA: join(userHome, 'AppData', 'Roaming'),
        LOCALAPPDATA: join(userHome, 'AppData', 'Local'),
        TEMP: tmpDir,
        TMP: tmpDir,
        TMPDIR: tmpDir,
        BLENDER_USER_CONFIG: join(userHome, 'config'),
        BLENDER_USER_SCRIPTS: join(userHome, 'scripts'),
        BLENDER_USER_DATAFILES: join(userHome, 'datafiles'),
        PYTHONNOUSERSITE: '1',
        PYTHONIOENCODING: 'utf-8',
        NO_COLOR: '1',
        CI: '1',
    };
}
export function parseBlenderProgressLine(line, frameStart = 1, frameEnd = 1) {
    const result = {};
    const savedMatch = /(?:^|\|\s*)Saved:\s*'([^']+)'/i.exec(line.trim());
    if (savedMatch) {
        result.savedFile = savedMatch[1];
        result.stage = '已写入渲染文件';
    }
    const totalFrames = Math.max(1, frameEnd - frameStart + 1);
    const fraMatch = /\bFra:(\d+)\b/.exec(line);
    const sampleMatch = /\bSample\s+(\d+)\s*\/\s*(\d+)/i.exec(line) ??
        /\bRendering\s+(\d+)\s*\/\s*(\d+)\s+samples/i.exec(line);
    if (fraMatch) {
        const currentFrame = Number(fraMatch[1]);
        const frameIndex = Math.max(0, Math.min(totalFrames - 1, currentFrame - frameStart));
        let subFraction = 0;
        if (sampleMatch) {
            const done = Number(sampleMatch[1]);
            const total = Math.max(1, Number(sampleMatch[2]));
            subFraction = Math.max(0, Math.min(1, done / total));
            result.stage = `渲染第 ${currentFrame} 帧 · 采样 ${done}/${total}`;
        }
        else if (/Denoising/i.test(line)) {
            subFraction = 0.95;
            result.stage = `第 ${currentFrame} 帧降噪中`;
        }
        else if (/Compositing/i.test(line)) {
            subFraction = 0.98;
            result.stage = `第 ${currentFrame} 帧合成中`;
        }
        else {
            result.stage = totalFrames > 1 ? `渲染第 ${currentFrame}/${frameEnd} 帧` : `渲染第 ${currentFrame} 帧`;
        }
        const pct = Math.round(((frameIndex + subFraction) / totalFrames) * 95);
        result.progress = Math.max(5, Math.min(99, pct));
    }
    else if (sampleMatch) {
        const done = Number(sampleMatch[1]);
        const total = Math.max(1, Number(sampleMatch[2]));
        result.progress = Math.max(5, Math.min(98, Math.round((done / total) * 95)));
        result.stage = `渲染采样 ${done}/${total}`;
    }
    else if (/^__DSH_STAGE__=(.+)$/.test(line.trim())) {
        const stageText = line.trim().slice('__DSH_STAGE__='.length).trim();
        if (stageText)
            result.stage = stageText;
    }
    return result;
}
export function parseSceneSummaryFromLine(line) {
    const idx = line.indexOf(SCENE_JSON_MARKER);
    if (idx === -1)
        return undefined;
    const jsonPart = line.slice(idx + SCENE_JSON_MARKER.length).trim();
    if (!jsonPart)
        return undefined;
    try {
        const parsed = JSON.parse(jsonPart);
        if (parsed && typeof parsed === 'object' && typeof parsed.objectCount === 'number') {
            return parsed;
        }
    }
    catch {
        // ignore malformed marker
    }
    return undefined;
}
export function parseSceneSummaryFromOutput(text) {
    let latest;
    for (const line of String(text ?? '').split(/\r?\n/)) {
        const parsed = parseSceneSummaryFromLine(line);
        if (parsed)
            latest = parsed;
    }
    return latest;
}
export function parseShotDoneFromLine(line) {
    const idx = line.indexOf(SHOT_DONE_MARKER);
    if (idx === -1)
        return undefined;
    const jsonPart = line.slice(idx + SHOT_DONE_MARKER.length).trim();
    if (!jsonPart)
        return undefined;
    try {
        const parsed = JSON.parse(jsonPart);
        if (parsed &&
            typeof parsed === 'object' &&
            typeof parsed.shotId === 'string' &&
            typeof parsed.file === 'string' &&
            typeof parsed.lensMm === 'number') {
            return {
                shotId: parsed.shotId,
                file: parsed.file,
                path: typeof parsed.path === 'string' ? parsed.path : undefined,
                labelZh: typeof parsed.labelZh === 'string' ? parsed.labelZh : undefined,
                labelEn: typeof parsed.labelEn === 'string' ? parsed.labelEn : undefined,
                lensMm: parsed.lensMm,
                width: typeof parsed.width === 'number' ? parsed.width : 0,
                height: typeof parsed.height === 'number' ? parsed.height : 0,
                index: typeof parsed.index === 'number' ? parsed.index : undefined,
                total: typeof parsed.total === 'number' ? parsed.total : undefined,
            };
        }
    }
    catch {
        // ignore malformed shot marker
    }
    return undefined;
}
function killProcessTree(child) {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null)
        return;
    if (process.platform === 'win32') {
        execFile(join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe'), ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }, () => { });
    }
    else {
        try {
            process.kill(-child.pid, 'SIGKILL');
        }
        catch {
            try {
                child.kill('SIGKILL');
            }
            catch {
                // already exited
            }
        }
    }
}
export class BlenderRunner {
    root;
    executor;
    defaultTimeoutMs;
    constructor(options = {}) {
        this.root = resolve(options.root ?? join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'data', 'dsh-blender-studio'));
        this.executor = options.executor;
        this.defaultTimeoutMs = options.defaultTimeoutMs ?? 10 * 60 * 1000;
    }
    async run(request) {
        if (request.signal?.aborted) {
            throw new BlenderError('任务已取消。', 'JOB_CANCELLED', 400);
        }
        if (request.scriptContent !== undefined) {
            await mkdir(request.cwd, { recursive: true });
            await writeFile(request.scriptPath, request.scriptContent, { encoding: 'utf8', mode: 0o600 });
        }
        if (this.executor) {
            return this.executor(request);
        }
        const startedAt = Date.now();
        const userHome = join(this.root, 'blender-home');
        await Promise.all([
            mkdir(join(this.root, 'tmp'), { recursive: true }),
            mkdir(join(userHome, 'AppData', 'Roaming'), { recursive: true }),
            mkdir(join(userHome, 'AppData', 'Local'), { recursive: true }),
            mkdir(join(userHome, 'config'), { recursive: true }),
            mkdir(join(userHome, 'scripts'), { recursive: true }),
            mkdir(join(userHome, 'datafiles'), { recursive: true }),
        ]);
        if (request.signal?.aborted) {
            throw new BlenderError('任务已取消。', 'JOB_CANCELLED', 400);
        }
        const timeoutMs = request.timeoutMs ?? this.defaultTimeoutMs;
        const args = ['--background', '--factory-startup', '--python-exit-code', '1', '--python', request.scriptPath, ...(request.args ?? [])];
        return new Promise((resolveRun, rejectRun) => {
            const child = spawn(request.executablePath, args, {
                cwd: request.cwd,
                env: buildBlenderChildEnv(this.root),
                shell: false,
                windowsHide: true,
                detached: process.platform !== 'win32',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            let timedOut = false;
            let abortedBySignal = false;
            const lines = [];
            const stdoutLines = [];
            const stderrLines = [];
            const savedFiles = [];
            const completedShots = [];
            let sceneSummary;
            const pushRingLine = (rawLine) => {
                const cleaned = scrubLogText(rawLine);
                if (!cleaned)
                    return;
                if (lines.at(-1) === cleaned)
                    return;
                lines.push(cleaned);
                if (lines.length > MAX_JOB_LOG_LINES)
                    lines.shift();
                request.onLine?.(cleaned);
            };
            const handleLine = (rawLine, isStdout) => {
                if (isStdout) {
                    if (stdoutLines.length < 4000)
                        stdoutLines.push(rawLine);
                }
                else {
                    if (stderrLines.length < 2000)
                        stderrLines.push(rawLine);
                }
                const summary = parseSceneSummaryFromLine(rawLine);
                if (summary) {
                    sceneSummary = summary;
                    pushRingLine(`[dsh-blender-studio] 已采集场景摘要（${summary.objectCount} 个对象，${summary.totalPolygons} 多边形）`);
                    return;
                }
                const shot = parseShotDoneFromLine(rawLine);
                if (shot) {
                    completedShots.push(shot);
                    if (shot.path)
                        savedFiles.push(shot.path);
                    request.onShotDone?.(shot);
                    if (!request.onShotDone && shot.index && shot.total) {
                        const pct = Math.max(10, Math.min(96, Math.round((shot.index / shot.total) * 95)));
                        request.onProgress?.(pct, `已完成分镜 ${shot.index}/${shot.total} · ${shot.labelZh || shot.shotId}`);
                    }
                    pushRingLine(`[dsh-blender-studio] 已完成分镜 ${shot.shotId} (${shot.lensMm}mm · ${shot.file})`);
                    return;
                }
                const parsed = parseBlenderProgressLine(rawLine, request.frameStart, request.frameEnd);
                if (parsed.savedFile)
                    savedFiles.push(parsed.savedFile);
                if (parsed.progress !== undefined || parsed.stage) {
                    request.onProgress?.(parsed.progress ?? 0, parsed.stage);
                }
                if (!rawLine.startsWith('__DSH_STAGE__=')) {
                    pushRingLine(rawLine);
                }
            };
            const attachStream = (stream, isStdout) => {
                if (!stream)
                    return () => { };
                const decoder = new StringDecoder('utf8');
                let pending = '';
                stream.on('data', (chunk) => {
                    pending += typeof chunk === 'string' ? chunk : decoder.write(chunk);
                    const parts = pending.split(/\r\n|\n|\r/);
                    pending = parts.pop() ?? '';
                    for (const part of parts) {
                        if (part)
                            handleLine(part, isStdout);
                    }
                });
                return () => {
                    pending += decoder.end();
                    if (pending) {
                        handleLine(pending, isStdout);
                        pending = '';
                    }
                };
            };
            const flushStdout = attachStream(child.stdout, true);
            const flushStderr = attachStream(child.stderr, false);
            const onAbort = () => {
                abortedBySignal = true;
                killProcessTree(child);
            };
            request.signal?.addEventListener('abort', onAbort, { once: true });
            const timer = setTimeout(() => {
                timedOut = true;
                killProcessTree(child);
            }, timeoutMs);
            timer.unref();
            const cleanup = () => {
                clearTimeout(timer);
                request.signal?.removeEventListener('abort', onAbort);
                flushStdout();
                flushStderr();
            };
            child.once('error', error => {
                cleanup();
                rejectRun(new BlenderError(`无法启动 Blender 进程：${scrubLogText(error.message)}`, 'CLI_FAILED', 400));
            });
            child.once('close', code => {
                cleanup();
                const durationMs = Date.now() - startedAt;
                if (timedOut) {
                    rejectRun(new BlenderError('Blender 任务执行超时，已安全终止进程树。', 'JOB_TIMEOUT', 504));
                    return;
                }
                if (abortedBySignal || request.signal?.aborted) {
                    rejectRun(new BlenderError('Blender 任务已取消。', 'JOB_CANCELLED', 400));
                    return;
                }
                const exitCode = code ?? 1;
                if (exitCode !== 0) {
                    const highlights = lines.filter(l => /(?:Traceback|Error:|Exception:|SyntaxError|AttributeError|TypeError|RuntimeError|PermissionError)/i.test(l));
                    const tail = (highlights.length ? highlights.slice(-4) : lines.slice(-6)).join('\n');
                    rejectRun(new BlenderError(`Blender 渲染或脚本执行失败（退出码 ${exitCode}）。${tail ? '\n' + tail : ''}`, 'CLI_FAILED', 400));
                    return;
                }
                resolveRun({
                    exitCode,
                    lines,
                    stdout: stdoutLines.join('\n'),
                    stderr: stderrLines.join('\n'),
                    sceneSummary,
                    shots: completedShots.length ? completedShots : undefined,
                    savedFiles,
                    durationMs,
                });
            });
        });
    }
}
