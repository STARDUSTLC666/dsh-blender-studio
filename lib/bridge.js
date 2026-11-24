import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createConnection } from 'node:net';
import { BlenderError, DEFAULT_BRIDGE_HOST, DEFAULT_BRIDGE_PORT, scrubLogText, } from './types.js';
export const MAX_BRIDGE_FRAME_BYTES = 8 * 1024 * 1024; // 8 MB
export const DEFAULT_BRIDGE_TIMEOUT_MS = 15_000;
const ALLOWED_LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
/** Normalize and verify that a host strictly refers to local loopback. */
export function normalizeLoopbackHost(host) {
    if (typeof host !== 'string') {
        throw new BlenderError('Live Bridge 仅允许连接本机回环地址（127.0.0.1 / localhost / ::1）。', 'BRIDGE_HOST_FORBIDDEN', 400);
    }
    const normalized = host.trim().toLowerCase().replace(/^\[|\]$/g, '');
    if (!ALLOWED_LOOPBACK_HOSTS.has(normalized)) {
        throw new BlenderError(`已拒绝非回环地址 "${scrubLogText(host, 80)}"：Live Bridge 仅允许连接 127.0.0.1、localhost 或 ::1。`, 'BRIDGE_HOST_FORBIDDEN', 400);
    }
    return normalized;
}
export function isLoopbackHost(host) {
    if (typeof host !== 'string')
        return false;
    const normalized = host.trim().toLowerCase().replace(/^\[|\]$/g, '');
    return ALLOWED_LOOPBACK_HOSTS.has(normalized);
}
function validateBridgePort(port) {
    if (typeof port !== 'number' || !Number.isInteger(port) || port < 1 || port > 65535) {
        throw new BlenderError('Live Bridge 端口必须为 1–65535 之间的整数。', 'BAD_REQUEST', 400);
    }
    return port;
}
/**
 * Loopback-only TCP client speaking the newline-delimited UTF-8 JSON-RPC
 * protocol implemented by `blender/dsh_blender_bridge.py`.
 */
export class BlenderBridgeClient {
    _host;
    _port;
    _token;
    _timeoutMs;
    constructor(options = {}) {
        this._host = normalizeLoopbackHost(options.host ?? DEFAULT_BRIDGE_HOST);
        this._port = validateBridgePort(options.port ?? DEFAULT_BRIDGE_PORT);
        this._token = typeof options.token === 'string' ? options.token : '';
        this._timeoutMs =
            typeof options.timeoutMs === 'number' && options.timeoutMs > 0
                ? options.timeoutMs
                : DEFAULT_BRIDGE_TIMEOUT_MS;
    }
    get host() {
        return this._host;
    }
    get port() {
        return this._port;
    }
    get hasToken() {
        return this._token.length > 0;
    }
    get timeoutMs() {
        return this._timeoutMs;
    }
    configure(options) {
        if (options.host !== undefined) {
            this._host = normalizeLoopbackHost(options.host);
        }
        if (options.port !== undefined) {
            this._port = validateBridgePort(options.port);
        }
        if (options.token !== undefined) {
            this._token = typeof options.token === 'string' ? options.token : '';
        }
        if (options.timeoutMs !== undefined && typeof options.timeoutMs === 'number' && options.timeoutMs > 0) {
            this._timeoutMs = options.timeoutMs;
        }
    }
    async request(command, params = {}, timeoutMs) {
        const normalizedHost = normalizeLoopbackHost(this._host);
        const dialHost = normalizedHost === 'localhost' ? '127.0.0.1' : normalizedHost;
        const port = validateBridgePort(this._port);
        const effectiveTimeout = typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : this._timeoutMs;
        const reqId = randomUUID();
        const frame = {
            id: reqId,
            ...(this._token ? { token: this._token } : {}),
            command,
            params,
        };
        const encoded = Buffer.from(JSON.stringify(frame) + '\n', 'utf8');
        if (encoded.byteLength > MAX_BRIDGE_FRAME_BYTES) {
            throw new BlenderError('Bridge 请求超过 8 MB 帧大小限制。', 'BRIDGE_PROTOCOL_ERROR', 502);
        }
        return new Promise((resolve, reject) => {
            let settled = false;
            let socket;
            const chunks = [];
            let totalBytes = 0;
            const finish = (err, value) => {
                if (settled)
                    return;
                settled = true;
                clearTimeout(timer);
                if (socket && !socket.destroyed) {
                    socket.destroy();
                }
                if (err)
                    reject(err);
                else
                    resolve(value);
            };
            const timer = setTimeout(() => {
                finish(new BlenderError(`Live Bridge 请求超时（${effectiveTimeout} ms）。请确认 Blender 窗口未阻塞弹窗并已启动 DSH Bridge。`, 'BRIDGE_TIMEOUT', 504));
            }, effectiveTimeout);
            timer.unref?.();
            const processRawFrame = (rawLine) => {
                let parsed;
                try {
                    parsed = JSON.parse(rawLine);
                }
                catch {
                    finish(new BlenderError('Live Bridge 返回了无效的 JSON 响应。', 'BRIDGE_PROTOCOL_ERROR', 502));
                    return;
                }
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    finish(new BlenderError('Live Bridge 响应格式无效。', 'BRIDGE_PROTOCOL_ERROR', 502));
                    return;
                }
                if (parsed.id !== undefined && parsed.id !== null && parsed.id !== reqId) {
                    finish(new BlenderError('Live Bridge 响应编号不匹配。', 'BRIDGE_PROTOCOL_ERROR', 502));
                    return;
                }
                if (!parsed.ok) {
                    const errObj = typeof parsed.error === 'object' && parsed.error !== null ? parsed.error : undefined;
                    const errCode = typeof errObj?.code === 'string' ? errObj.code : undefined;
                    const errMsg = scrubLogText(typeof parsed.error === 'string'
                        ? parsed.error
                        : errObj?.message || 'Live Bridge 命令执行失败。');
                    if (errCode === 'BRIDGE_AUTH_FAILED' || /auth|token|unauthorized/i.test(errMsg)) {
                        finish(new BlenderError(errMsg || 'Live Bridge 鉴权失败，请检查 Token。', 'BRIDGE_AUTH_FAILED', 401));
                        return;
                    }
                    if (errCode === 'BRIDGE_TIMEOUT') {
                        finish(new BlenderError(errMsg || 'Live Bridge 执行超时。', 'BRIDGE_TIMEOUT', 504));
                        return;
                    }
                    if (errCode === 'BRIDGE_UNREACHABLE') {
                        finish(new BlenderError(errMsg || 'Live Bridge 服务不可用。', 'BRIDGE_UNREACHABLE', 503));
                        return;
                    }
                    finish(new BlenderError(errMsg, 'BRIDGE_PROTOCOL_ERROR', 502));
                    return;
                }
                finish(null, parsed.result);
            };
            try {
                socket = createConnection({ host: dialHost, port });
            }
            catch (err) {
                finish(new BlenderError(`无法连接 Live Bridge (${normalizedHost}:${port})：${scrubLogText(err instanceof Error ? err.message : String(err))}`, 'BRIDGE_UNREACHABLE', 503));
                return;
            }
            socket.once('connect', () => {
                socket?.write(encoded);
            });
            socket.on('data', (chunk) => {
                if (settled)
                    return;
                totalBytes += chunk.byteLength;
                if (totalBytes > MAX_BRIDGE_FRAME_BYTES) {
                    finish(new BlenderError('Live Bridge 响应超过 8 MB 帧大小限制。', 'BRIDGE_PROTOCOL_ERROR', 502));
                    return;
                }
                const nlIndex = chunk.indexOf(0x0a);
                if (nlIndex !== -1) {
                    chunks.push(chunk.subarray(0, nlIndex));
                    const line = Buffer.concat(chunks).toString('utf8').trim();
                    processRawFrame(line);
                }
                else {
                    chunks.push(chunk);
                }
            });
            socket.once('end', () => {
                if (settled)
                    return;
                const remaining = Buffer.concat(chunks).toString('utf8').trim();
                if (remaining) {
                    processRawFrame(remaining);
                }
                else {
                    finish(new BlenderError(`Live Bridge (${normalizedHost}:${port}) 在返回结果前关闭了连接。`, 'BRIDGE_UNREACHABLE', 503));
                }
            });
            socket.once('error', (err) => {
                if (err.code === 'ETIMEDOUT') {
                    finish(new BlenderError('Live Bridge 连接超时。', 'BRIDGE_TIMEOUT', 504));
                    return;
                }
                finish(new BlenderError(`无法连接 Blender Live Bridge (${normalizedHost}:${port})：${scrubLogText(err.message)}`, 'BRIDGE_UNREACHABLE', 503));
            });
        });
    }
    async ping(timeoutMs) {
        return this.request('ping', {}, timeoutMs);
    }
    async sceneInfo(timeoutMs) {
        return this.request('scene_info', {}, timeoutMs);
    }
    async execute(code, opts = {}) {
        if (typeof code !== 'string' || !code.trim()) {
            throw new BlenderError('请提供非空的 Python (bpy) 代码。', 'BAD_REQUEST', 400);
        }
        const params = {
            code,
            pushUndo: opts.pushUndo ?? true,
        };
        if (opts.timeoutMs)
            params.timeoutMs = opts.timeoutMs;
        return this.request('execute', params, opts.timeoutMs ?? 60_000);
    }
    async viewportCapture(opts = {}) {
        const width = opts.width ?? 960;
        const height = opts.height ?? 540;
        if (!Number.isInteger(width) || width < 64 || width > 3840) {
            throw new BlenderError('视口抓图宽度必须为 64–3840 之间的整数。', 'BAD_REQUEST', 400);
        }
        if (!Number.isInteger(height) || height < 64 || height > 2160) {
            throw new BlenderError('视口抓图高度必须为 64–2160 之间的整数。', 'BAD_REQUEST', 400);
        }
        const params = { width, height };
        if (opts.timeoutMs)
            params.timeoutMs = opts.timeoutMs;
        return this.request('viewport_capture', params, opts.timeoutMs ?? 45_000);
    }
    async loadScript(code, opts = {}) {
        if (typeof code !== 'string' || !code.trim()) {
            throw new BlenderError('请提供非空的工程生成脚本。', 'BAD_REQUEST', 400);
        }
        const params = {
            code,
            clearScene: opts.clearScene ?? true,
            projectTitle: opts.projectTitle ?? 'DSH Project',
        };
        if (opts.timeoutMs)
            params.timeoutMs = opts.timeoutMs;
        return this.request('load_script', params, opts.timeoutMs ?? 90_000);
    }
    async status(timeoutMs = 2_500) {
        const lastChecked = new Date().toISOString();
        try {
            const info = await this.ping(timeoutMs);
            return {
                host: this._host,
                port: this._port,
                hasToken: this.hasToken,
                connected: true,
                blenderVersion: info.blenderVersion,
                activeScene: info.sceneName,
                lastChecked,
            };
        }
        catch (err) {
            return {
                host: this._host,
                port: this._port,
                hasToken: this.hasToken,
                connected: false,
                lastChecked,
                error: scrubLogText(err instanceof Error ? err.message : String(err), 300),
            };
        }
    }
}
const SCRIPT_SAFETY_RULES = [
    {
        rule: 'os-shell',
        pattern: /(?<![.\w])os\s*\.\s*(?:system|popen|execl|execle|execlp|execlpe|execv|execve|execvp|execvpe|spawnl|spawnle|spawnlp|spawnlpe|spawnv|spawnve|spawnvp|spawnvpe|fork|kill|remove|unlink|rmdir|removedirs)\s*\(/,
        detail: '检测到高危系统调用（os.system / os.popen / os.exec / os.remove 等）。',
    },
    {
        rule: 'os-shell-import',
        pattern: /\bfrom\s+os\s+import\b[^#\n]*\b(?:system|popen|exec\w*|spawn\w*|fork|kill|remove|unlink|rmdir|removedirs)\b/,
        detail: '检测到直接导入高危 os 进程或删除函数。',
    },
    {
        rule: 'subprocess',
        pattern: /(?:\bimport\s+(?:[\w.]+(?:\s+as\s+\w+)?\s*,\s*)*subprocess\b|\bfrom\s+subprocess\s+import\b|(?<![.\w])subprocess\s*\.)/,
        detail: '检测到 subprocess 外部进程调用。',
    },
    {
        rule: 'shutil-rmtree',
        pattern: /(?:(?<![.\w])shutil\s*\.\s*rmtree\s*\(|\bfrom\s+shutil\s+import\b[^#\n]*\brmtree\b)/,
        detail: '检测到递归目录删除调用（shutil.rmtree）。',
    },
    {
        rule: 'ctypes',
        pattern: /(?:\bimport\s+(?:[\w.]+(?:\s+as\s+\w+)?\s*,\s*)*ctypes\b|\bfrom\s+ctypes\s+import\b|(?<![.\w])ctypes\s*\.)/,
        detail: '检测到原生内存/库加载模块（ctypes）。',
    },
    {
        rule: 'network-socket',
        pattern: /(?:\bimport\s+(?:[\w.]+(?:\s+as\s+\w+)?\s*,\s*)*socket\b|\bfrom\s+socket\s+import\b|(?<![.\w])socket\s*\.\s*(?:socket|create_connection|create_server|fromfd|socketpair|getaddrinfo|gethost\w*|getfqdn|inet_\w*|AF_INET|AF_INET6|SOCK_STREAM|SOCK_DGRAM)\b)/,
        detail: '检测到原始网络套接字调用（socket）。',
    },
    {
        rule: 'network-urllib',
        pattern: /(?:\bimport\s+(?:[\w.]+(?:\s+as\s+\w+)?\s*,\s*)*urllib(?:\.\w+)?\b|\bfrom\s+urllib(?:\.\w+)?\s+import\b|(?<![.\w])urllib\s*\.)/,
        detail: '检测到外部网络请求模块（urllib）。',
    },
    {
        rule: 'network-requests',
        pattern: /(?:\bimport\s+(?:[\w.]+(?:\s+as\s+\w+)?\s*,\s*)*(?:requests|httpx|aiohttp)\b|\bfrom\s+(?:requests|httpx|aiohttp)\s+import\b|(?<![.\w])(?:requests|httpx|aiohttp)\s*\.)/,
        detail: '检测到外部 HTTP 客户端模块（requests / httpx / aiohttp）。',
    },
    {
        rule: 'network-http-client',
        pattern: /(?:\bimport\s+(?:[\w.]+(?:\s+as\s+\w+)?\s*,\s*)*http\.(?:client|server)\b|\bfrom\s+http\.(?:client|server)\s+import\b|(?<![.\w])http\s*\.\s*(?:client|server)\b)/,
        detail: '检测到 Python 内置 HTTP 客户端/服务端（http.client / http.server）。',
    },
    {
        rule: 'dynamic-exec',
        pattern: /(?<![.\w])(?:eval|exec|__import__)\s*\(/,
        detail: '检测到动态代码执行或动态导入（eval / exec / __import__）。',
    },
    {
        rule: 'dynamic-importlib',
        pattern: /(?:\bimport\s+(?:[\w.]+(?:\s+as\s+\w+)?\s*,\s*)*importlib\b|\bfrom\s+importlib(?:\.\w+)?\s+import\b|(?<![.\w])importlib\s*\.\s*import_module\s*\()/,
        detail: '检测到动态模块加载（importlib）。',
    },
    {
        rule: 'path-traversal',
        pattern: /(?<![.\w])(?:open|Path|os\.path\.\w+|shutil\.\w+)\s*\([^#\n]*(?:\.\.[\\/]|['"]\.\.['"])/,
        detail: '检测到包含上级目录穿越（..）的文件路径访问。',
    },
    {
        rule: 'external-file-write',
        pattern: /(?<![.\w])open\s*\(\s*[rRfFbBuU]*['"](?:\/|[A-Za-z]:[\\/]|\\\\)[^'"]*['"]\s*,\s*['"][^'"]*[wax+][^'"]*['"]/,
        detail: '检测到直接向项目外的绝对路径执行文件写入。',
    },
];
function stripPythonComment(line) {
    let inSingle = false;
    let inDouble = false;
    let escaped = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === '\\' && (inSingle || inDouble)) {
            escaped = true;
            continue;
        }
        if (ch === "'" && !inDouble) {
            inSingle = !inSingle;
            continue;
        }
        if (ch === '"' && !inSingle) {
            inDouble = !inDouble;
            continue;
        }
        if (ch === '#' && !inSingle && !inDouble) {
            return line.slice(0, i);
        }
    }
    return line;
}
/**
 * Static pre-flight scanner for user-supplied bpy Python scripts.
 * Detects shell execution, destructive filesystem calls, network access,
 * dynamic eval/exec/import, and path escapes outside the project.
 */
export function checkScriptSafety(code) {
    if (typeof code !== 'string' || !code.trim()) {
        return { safe: true, findings: [] };
    }
    const findings = [];
    const lines = code.split(/\r\n|\n|\r/);
    let activeDocstring = null;
    for (let i = 0; i < lines.length; i++) {
        const rawTrimmed = lines[i].trim();
        if (!rawTrimmed)
            continue;
        // Skip standalone triple-quoted docstring blocks so documentation prose
        // never triggers false positives on legitimate bpy / bmesh scripts.
        if (activeDocstring) {
            if (rawTrimmed.includes(activeDocstring)) {
                activeDocstring = null;
            }
            continue;
        }
        if (rawTrimmed.startsWith('"""') || rawTrimmed.startsWith("'''")) {
            const delim = rawTrimmed.startsWith('"""') ? '"""' : "'''";
            const rest = rawTrimmed.slice(3);
            if (!rest.includes(delim)) {
                activeDocstring = delim;
            }
            continue;
        }
        const stripped = stripPythonComment(lines[i]).trim();
        if (!stripped)
            continue;
        for (const { rule, pattern, detail } of SCRIPT_SAFETY_RULES) {
            if (pattern.test(stripped)) {
                findings.push({
                    rule,
                    line: i + 1,
                    detail,
                });
            }
        }
    }
    return {
        safe: findings.length === 0,
        findings,
    };
}
/**
 * Launch desktop Blender GUI in a detached process without blocking the DSH host.
 */
export async function launchBlenderGui(executablePath, blendFile) {
    if (typeof executablePath !== 'string' || !executablePath.trim()) {
        throw new BlenderError('未配置有效的 Blender 可执行文件路径。', 'BLENDER_PATH_INVALID', 400);
    }
    const executable = executablePath.trim();
    const args = typeof blendFile === 'string' && blendFile.trim() ? [blendFile.trim()] : [];
    return new Promise((resolve, reject) => {
        let settled = false;
        const child = spawn(executable, args, {
            shell: false,
            detached: true,
            stdio: 'ignore',
        });
        child.once('error', (err) => {
            if (settled)
                return;
            settled = true;
            reject(new BlenderError(`启动桌面 Blender 失败：${scrubLogText(err.message)}`, 'BLENDER_PROBE_FAILED', 400));
        });
        child.once('spawn', () => {
            if (settled)
                return;
            settled = true;
            child.unref();
            resolve({
                pid: child.pid,
                executable,
                ...(args[0] ? { blendFile: args[0] } : {}),
            });
        });
    });
}
