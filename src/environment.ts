import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, readdir, readFile, realpath, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import {
  BLENDER_COMPUTE_DEVICES,
  BlenderError,
  DEFAULT_BRIDGE_HOST,
  DEFAULT_BRIDGE_PORT,
  type BlenderBridgeStatus,
  type BlenderComputeDevice,
  type BlenderEnvironmentStatus,
  type BlenderExecutableInfo,
  type BlenderGpuBackend,
  type BlenderGpuInfo,
  type BlenderSettings,
} from './types.js'

export type BlenderVersionProber = (
  execPath: string,
  timeoutMs: number,
) => Promise<{ ok: boolean; stdout: string; stderr?: string; error?: string }>

export type BlenderGpuProber = (execPath: string, timeoutMs: number) => Promise<BlenderGpuInfo>

export interface BlenderCandidate {
  path: string
  source: BlenderExecutableInfo['source']
}

export interface BlenderEnvironmentOptions {
  root?: string
  prober?: BlenderVersionProber
  gpuProber?: BlenderGpuProber
  probeGpu?: boolean
  extraCandidates?: BlenderCandidate[]
  skipSystemScan?: boolean
  probeTimeoutMs?: number
}

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1'])
const BLENDER_VERSION_RE = /Blender\s+(\d+)\.(\d+)(?:\.(\d+))?/i
const SAFE_ENV_KEYS = /^(path|pathext|systemroot|windir|comspec|home|userprofile|tmp|temp|tmpdir|display|wayland_display|xdg_runtime_dir)$/i
const GPU_PROBE_MARKER = '__DSH_GPU_JSON__='
const VALID_GPU_BACKENDS = new Set<BlenderGpuBackend>(['OPTIX', 'CUDA', 'METAL', 'HIP', 'ONEAPI', 'CPU'])
const CYCLES_GPU_PROBE_EXPR = [
  'import bpy, json',
  'out = {"available": False, "backend": "CPU", "devices": []}',
  'try:',
  '    addon = bpy.context.preferences.addons.get("cycles")',
  '    prefs = addon.preferences if addon else None',
  '    if prefs is not None:',
  '        for b in ("OPTIX", "CUDA", "METAL", "HIP", "ONEAPI"):',
  '            try:',
  '                prefs.compute_device_type = b',
  '                prefs.get_devices()',
  '                devs = [d.name for d in prefs.devices if getattr(d, "type", "") == b]',
  '                if devs:',
  '                    out = {"available": True, "backend": b, "devices": devs}',
  '                    break',
  '            except Exception:',
  '                continue',
  'except Exception:',
  '    pass',
  `print(${JSON.stringify(GPU_PROBE_MARKER)} + json.dumps(out, ensure_ascii=False), flush=True)`,
].join('\n')

export function isLoopbackHost(host: string): boolean {
  const normalized = host.trim().toLowerCase()
  return LOOPBACK_HOSTS.has(normalized)
}

export function defaultBlenderSettings(): BlenderSettings {
  return {
    blenderPath: '',
    bridgeHost: DEFAULT_BRIDGE_HOST,
    bridgePort: DEFAULT_BRIDGE_PORT,
    bridgeToken: '',
    polyHavenEnabled: false,
    computeDevice: 'auto',
  }
}

export function parseCyclesGpuProbeOutput(stdout: string): BlenderGpuInfo {
  const fallback: BlenderGpuInfo = { available: false, backend: 'CPU', devices: [] }
  for (const line of String(stdout ?? '').split(/\r?\n/)) {
    const idx = line.indexOf(GPU_PROBE_MARKER)
    if (idx === -1) continue
    try {
      const parsed = JSON.parse(line.slice(idx + GPU_PROBE_MARKER.length).trim()) as Partial<BlenderGpuInfo>
      const backend =
        typeof parsed.backend === 'string' && VALID_GPU_BACKENDS.has(parsed.backend as BlenderGpuBackend)
          ? (parsed.backend as BlenderGpuBackend)
          : 'CPU'
      const devices = Array.isArray(parsed.devices)
        ? parsed.devices.filter((d): d is string => typeof d === 'string' && d.trim().length > 0).slice(0, 16)
        : []
      const available = Boolean(parsed.available) && backend !== 'CPU' && devices.length > 0
      return { available, backend: available ? backend : 'CPU', devices: available ? devices : [] }
    } catch {
      return fallback
    }
  }
  return fallback
}

export async function defaultProbeCyclesGpu(execPath: string, timeoutMs = 12_000): Promise<BlenderGpuInfo> {
  const fallback: BlenderGpuInfo = { available: false, backend: 'CPU', devices: [] }
  if (!execPath || /[\x00-\x1f]/.test(execPath)) return fallback
  try {
    const info = await stat(execPath)
    if (!info.isFile()) return fallback
  } catch {
    return fallback
  }

  return new Promise(resolveGpu => {
    let settled = false
    let stdout = ''
    const finish = (result: BlenderGpuInfo) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolveGpu(result)
    }

    const child = spawn(
      execPath,
      ['--background', '--factory-startup', '--python-exit-code', '1', '--python-expr', CYCLES_GPU_PROBE_EXPR],
      {
        shell: false,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: minimalProbeEnv(),
      },
    )

    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL')
      } catch {
        // already exited
      }
      finish(fallback)
    }, timeoutMs)
    timer.unref()

    child.stdout?.on('data', (chunk: Buffer) => {
      if (stdout.length < 16384) stdout += chunk.toString('utf8')
    })
    child.once('error', () => finish(fallback))
    child.once('close', code => {
      if (code !== 0) finish(fallback)
      else finish(parseCyclesGpuProbeOutput(stdout))
    })
  })
}

export function parseBlenderVersionOutput(
  output: string,
): { version: string; major: number; minor: number; patch: number } | null {
  const match = BLENDER_VERSION_RE.exec(String(output ?? ''))
  if (!match) return null
  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = match[3] !== undefined ? Number(match[3]) : 0
  if (!Number.isInteger(major) || !Number.isInteger(minor) || major < 2 || major > 99) return null
  return {
    version: `${major}.${minor}.${patch}`,
    major,
    minor,
    patch,
  }
}

export function buildExecutableInfo(
  execPath: string,
  versionOutput: string,
  source: BlenderExecutableInfo['source'],
): BlenderExecutableInfo | null {
  const parsed = parseBlenderVersionOutput(versionOutput)
  if (!parsed) return null
  // Blender 4.2–4.x uses BLENDER_EEVEE_NEXT; Blender 3.6–4.1 and 5.0+ use BLENDER_EEVEE.
  const isEeveeNext = parsed.major === 4 && parsed.minor >= 2
  const isGpv3 = parsed.major > 4 || (parsed.major === 4 && parsed.minor >= 3)
  return {
    path: execPath,
    version: parsed.version,
    major: parsed.major,
    minor: parsed.minor,
    source,
    eeveeEngine: isEeveeNext ? 'BLENDER_EEVEE_NEXT' : 'BLENDER_EEVEE',
    greasePencilApi: isGpv3 ? 'gpv3' : 'gpv2',
  }
}

function minimalProbeEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (SAFE_ENV_KEYS.test(k) && v !== undefined) env[k] = v
  }
  env.NO_COLOR = '1'
  return env
}

export async function defaultProbeBlender(
  execPath: string,
  timeoutMs = 8000,
): Promise<{ ok: boolean; stdout: string; stderr?: string; error?: string }> {
  if (!execPath || /[\x00-\x1f]/.test(execPath)) {
    return { ok: false, stdout: '', error: 'Invalid executable path' }
  }
  try {
    const info = await stat(execPath)
    if (!info.isFile()) return { ok: false, stdout: '', error: 'Path is not a regular file' }
  } catch (error) {
    return { ok: false, stdout: '', error: error instanceof Error ? error.message : String(error) }
  }

  return new Promise(resolveProbe => {
    let settled = false
    let stdout = ''
    let stderr = ''
    const finish = (result: { ok: boolean; stdout: string; stderr?: string; error?: string }) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolveProbe(result)
    }

    const child = spawn(execPath, ['--version'], {
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: minimalProbeEnv(),
    })

    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL')
      } catch {
        // ignore kill error on already exited process
      }
      finish({ ok: false, stdout, stderr, error: `Blender probe timed out after ${timeoutMs}ms` })
    }, timeoutMs)
    timer.unref()

    child.stdout?.on('data', (chunk: Buffer) => {
      if (stdout.length < 4096) stdout += chunk.toString('utf8')
    })
    child.stderr?.on('data', (chunk: Buffer) => {
      if (stderr.length < 4096) stderr += chunk.toString('utf8')
    })
    child.once('error', error => {
      finish({ ok: false, stdout, stderr, error: error.message })
    })
    child.once('close', code => {
      finish({
        ok: code === 0,
        stdout,
        stderr,
        error: code === 0 ? undefined : `Exited with code ${code}`,
      })
    })
  })
}

async function scanVersionedDir(baseDir: string, subPath: string): Promise<string[]> {
  try {
    const entries = await readdir(baseDir, { withFileTypes: true })
    const dirs = entries
      .filter(entry => entry.isDirectory() && /^Blender/i.test(entry.name))
      .map(entry => entry.name)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
    return dirs.map(name => join(baseDir, name, subPath))
  } catch {
    return []
  }
}

async function discoverSystemCandidates(): Promise<BlenderCandidate[]> {
  const candidates: BlenderCandidate[] = []
  const isWin = process.platform === 'win32'
  const isMac = process.platform === 'darwin'
  const binName = isWin ? 'blender.exe' : 'blender'

  // 1. PATH scan
  const pathEnv = process.env.PATH || process.env.Path || ''
  for (const dir of pathEnv.split(delimiter).map(s => s.trim()).filter(Boolean)) {
    candidates.push({ path: join(dir, binName), source: 'path' })
  }

  // 2. Standard OS installation locations
  if (isWin) {
    const pf = process.env.ProgramFiles || 'C:\\Program Files'
    const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
    const localApp = process.env.LOCALAPPDATA || ''
    const userProfile = process.env.USERPROFILE || homedir()

    const foundationDirs = [
      ...(await scanVersionedDir(join(pf, 'Blender Foundation'), 'blender.exe')),
      ...(localApp ? await scanVersionedDir(join(localApp, 'Programs', 'Blender Foundation'), 'blender.exe') : []),
    ]
    for (const p of foundationDirs) candidates.push({ path: p, source: 'standard' })

    candidates.push(
      { path: join(pf86, 'Steam', 'steamapps', 'common', 'Blender', 'blender.exe'), source: 'standard' },
      { path: join(pf, 'Steam', 'steamapps', 'common', 'Blender', 'blender.exe'), source: 'standard' },
      { path: join(userProfile, 'scoop', 'apps', 'blender', 'current', 'blender.exe'), source: 'standard' },
      { path: join(userProfile, 'scoop', 'shims', 'blender.exe'), source: 'standard' },
    )
  } else if (isMac) {
    candidates.push({ path: '/Applications/Blender.app/Contents/MacOS/Blender', source: 'standard' })
    const macVersioned = await scanVersionedDir('/Applications', 'Contents/MacOS/Blender')
    for (const p of macVersioned) candidates.push({ path: p, source: 'standard' })
    candidates.push(
      { path: join(homedir(), 'Applications', 'Blender.app', 'Contents', 'MacOS', 'Blender'), source: 'standard' },
      { path: '/opt/homebrew/bin/blender', source: 'standard' },
      { path: '/usr/local/bin/blender', source: 'standard' },
    )
  } else {
    candidates.push(
      { path: '/usr/bin/blender', source: 'standard' },
      { path: '/usr/local/bin/blender', source: 'standard' },
      { path: '/snap/bin/blender', source: 'standard' },
      { path: '/var/lib/flatpak/exports/bin/org.blender.Blender', source: 'standard' },
      { path: join(homedir(), '.local', 'bin', 'blender'), source: 'standard' },
    )
  }

  return candidates
}

export class BlenderEnvironment {
  readonly root: string
  readonly settingsFile: string
  private readonly prober: BlenderVersionProber
  private readonly gpuProber: BlenderGpuProber
  private readonly shouldProbeGpu: boolean
  private readonly extraCandidates: BlenderCandidate[]
  private readonly skipSystemScan: boolean
  private readonly probeTimeoutMs: number
  private cachedDetect?: { detected: BlenderExecutableInfo[]; active?: BlenderExecutableInfo; checkedAt: number }
  private gpuCache = new Map<string, { info: BlenderGpuInfo; checkedAt: number }>()

  constructor(options: BlenderEnvironmentOptions = {}) {
    this.root = resolve(
      options.root ?? join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'data', 'dsh-blender-studio'),
    )
    this.settingsFile = join(this.root, 'settings.json')
    this.prober = options.prober ?? defaultProbeBlender
    this.gpuProber = options.gpuProber ?? defaultProbeCyclesGpu
    this.shouldProbeGpu = options.probeGpu ?? (options.gpuProber !== undefined || options.prober === undefined)
    this.extraCandidates = options.extraCandidates ?? []
    this.skipSystemScan = options.skipSystemScan ?? false
    this.probeTimeoutMs = options.probeTimeoutMs ?? 8000
  }

  async getSettings(): Promise<BlenderSettings> {
    const defaults = defaultBlenderSettings()
    try {
      const raw = JSON.parse(await readFile(this.settingsFile, 'utf8')) as Partial<BlenderSettings>
      const bridgeHost =
        typeof raw.bridgeHost === 'string' && isLoopbackHost(raw.bridgeHost)
          ? raw.bridgeHost.trim().toLowerCase()
          : defaults.bridgeHost
      const bridgePort =
        typeof raw.bridgePort === 'number' &&
        Number.isInteger(raw.bridgePort) &&
        raw.bridgePort >= 1 &&
        raw.bridgePort <= 65535
          ? raw.bridgePort
          : defaults.bridgePort
      const computeDevice: BlenderComputeDevice =
        typeof raw.computeDevice === 'string' &&
        (BLENDER_COMPUTE_DEVICES as readonly string[]).includes(raw.computeDevice)
          ? (raw.computeDevice as BlenderComputeDevice)
          : 'auto'
      return {
        blenderPath: typeof raw.blenderPath === 'string' ? raw.blenderPath.trim() : defaults.blenderPath,
        bridgeHost,
        bridgePort,
        bridgeToken: typeof raw.bridgeToken === 'string' ? raw.bridgeToken.slice(0, 256) : defaults.bridgeToken,
        polyHavenEnabled: typeof raw.polyHavenEnabled === 'boolean' ? raw.polyHavenEnabled : defaults.polyHavenEnabled,
        computeDevice,
      }
    } catch {
      return defaults
    }
  }

  private async saveSettings(settings: BlenderSettings): Promise<void> {
    await mkdir(this.root, { recursive: true, mode: 0o700 })
    const temp = join(this.root, `settings-${randomUUID()}.tmp`)
    try {
      await writeFile(temp, JSON.stringify(settings, null, 2), { flag: 'wx', mode: 0o600 })
      await rename(temp, this.settingsFile)
    } finally {
      await unlink(temp).catch(() => {})
    }
  }

  async probeExecutable(
    execPath: string,
    source: BlenderExecutableInfo['source'] = 'config',
  ): Promise<BlenderExecutableInfo> {
    const trimmed = typeof execPath === 'string' ? execPath.trim() : ''
    if (!trimmed || /[\x00-\x1f]/.test(trimmed)) {
      throw new BlenderError('Blender 可执行文件路径无效。', 'BLENDER_PATH_INVALID', 400)
    }
    const probe = await this.prober(trimmed, this.probeTimeoutMs)
    if (!probe.ok) {
      throw new BlenderError(
        `无法探测 Blender 版本：${probe.error || probe.stderr || '命令执行失败'}`,
        'BLENDER_PROBE_FAILED',
        400,
      )
    }
    const resolvedPath = await realpath(trimmed).catch(() => trimmed)
    const info = buildExecutableInfo(resolvedPath, probe.stdout, source)
    if (!info) {
      throw new BlenderError(
        `未能从输出中识别有效的 Blender 版本号：${probe.stdout.slice(0, 160)}`,
        'BLENDER_PROBE_FAILED',
        400,
      )
    }
    return info
  }

  async configure(patch: Partial<BlenderSettings>): Promise<BlenderSettings> {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      throw new BlenderError('配置参数无效。', 'BAD_REQUEST', 400)
    }
    const current = await this.getSettings()
    const next: BlenderSettings = { ...current }

    if (patch.bridgeHost !== undefined) {
      if (typeof patch.bridgeHost !== 'string' || !isLoopbackHost(patch.bridgeHost)) {
        throw new BlenderError(
          'Live Bridge 仅允许本地回环地址（127.0.0.1 / localhost / ::1）。',
          'BRIDGE_HOST_FORBIDDEN',
          400,
        )
      }
      next.bridgeHost = patch.bridgeHost.trim().toLowerCase()
    }

    if (patch.bridgePort !== undefined) {
      if (
        typeof patch.bridgePort !== 'number' ||
        !Number.isInteger(patch.bridgePort) ||
        patch.bridgePort < 1 ||
        patch.bridgePort > 65535
      ) {
        throw new BlenderError('Bridge 端口需为 1–65535 之间的整数。', 'BAD_REQUEST', 400)
      }
      next.bridgePort = patch.bridgePort
    }

    if (patch.bridgeToken !== undefined) {
      if (typeof patch.bridgeToken !== 'string' || patch.bridgeToken.length > 256) {
        throw new BlenderError('Bridge 令牌需为不超过 256 字符的字符串。', 'BAD_REQUEST', 400)
      }
      next.bridgeToken = patch.bridgeToken
    }

    if (patch.polyHavenEnabled !== undefined) {
      if (typeof patch.polyHavenEnabled !== 'boolean') {
        throw new BlenderError('polyHavenEnabled 必须为布尔值。', 'BAD_REQUEST', 400)
      }
      next.polyHavenEnabled = patch.polyHavenEnabled
    }

    if (patch.computeDevice !== undefined) {
      if (
        typeof patch.computeDevice !== 'string' ||
        !(BLENDER_COMPUTE_DEVICES as readonly string[]).includes(patch.computeDevice)
      ) {
        throw new BlenderError('Cycles 计算设备必须为 auto、gpu 或 cpu。', 'BAD_REQUEST', 400)
      }
      next.computeDevice = patch.computeDevice as BlenderComputeDevice
    }

    if (patch.blenderPath !== undefined) {
      if (typeof patch.blenderPath !== 'string') {
        throw new BlenderError('Blender 路径必须为字符串。', 'BLENDER_PATH_INVALID', 400)
      }
      const trimmed = patch.blenderPath.trim()
      if (trimmed) {
        const info = await this.probeExecutable(trimmed, 'config')
        next.blenderPath = info.path
      } else {
        next.blenderPath = ''
      }
      this.gpuCache.clear()
    }

    await this.saveSettings(next)
    this.cachedDetect = undefined
    return next
  }

  async probeCyclesGpu(execPath: string, options: { force?: boolean } = {}): Promise<BlenderGpuInfo> {
    const trimmed = typeof execPath === 'string' ? execPath.trim() : ''
    if (!trimmed) return { available: false, backend: 'CPU', devices: [] }
    const key = process.platform === 'win32' ? trimmed.toLowerCase() : trimmed
    const cached = this.gpuCache.get(key)
    if (!options.force && cached && Date.now() - cached.checkedAt < 5 * 60_000) {
      return { ...cached.info, devices: [...cached.info.devices] }
    }
    const info = await this.gpuProber(trimmed, Math.max(this.probeTimeoutMs, 12_000)).catch(
      (): BlenderGpuInfo => ({ available: false, backend: 'CPU', devices: [] }),
    )
    this.gpuCache.set(key, { info, checkedAt: Date.now() })
    return { ...info, devices: [...info.devices] }
  }

  async detect(options: { force?: boolean; probeGpu?: boolean } = {}): Promise<{
    active?: BlenderExecutableInfo
    detected: BlenderExecutableInfo[]
  }> {
    if (!options.force && this.cachedDetect && Date.now() - this.cachedDetect.checkedAt < 15_000) {
      return {
        active: this.cachedDetect.active
          ? {
              ...this.cachedDetect.active,
              gpu: this.cachedDetect.active.gpu
                ? { ...this.cachedDetect.active.gpu, devices: [...this.cachedDetect.active.gpu.devices] }
                : undefined,
            }
          : undefined,
        detected: this.cachedDetect.detected.map(item => ({
          ...item,
          gpu: item.gpu ? { ...item.gpu, devices: [...item.gpu.devices] } : undefined,
        })),
      }
    }

    const settings = await this.getSettings()
    const rawCandidates: BlenderCandidate[] = []

    const envPath = process.env.DSH_BLENDER_EXECUTABLE?.trim()
    if (envPath) rawCandidates.push({ path: envPath, source: 'env' })
    if (settings.blenderPath) rawCandidates.push({ path: settings.blenderPath, source: 'config' })
    for (const candidate of this.extraCandidates) rawCandidates.push(candidate)
    if (!this.skipSystemScan) {
      rawCandidates.push(...(await discoverSystemCandidates()))
    }

    const seen = new Set<string>()
    const detected: BlenderExecutableInfo[] = []
    const normalizeKey = (p: string) => (process.platform === 'win32' ? p.toLowerCase() : p)

    for (const candidate of rawCandidates) {
      const trimmed = candidate.path.trim()
      if (!trimmed) continue
      const resolved = await realpath(trimmed).catch(() => trimmed)
      const key = normalizeKey(resolved)
      if (seen.has(key)) continue
      seen.add(key)

      const probe = await this.prober(trimmed, this.probeTimeoutMs)
      if (!probe.ok) continue
      const info = buildExecutableInfo(resolved, probe.stdout, candidate.source)
      if (info) detected.push(info)
    }

    const active = detected[0]
    const doGpu = options.probeGpu ?? this.shouldProbeGpu
    if (active && doGpu) {
      active.gpu = await this.probeCyclesGpu(active.path, { force: options.force })
    }

    this.cachedDetect = { active, detected, checkedAt: Date.now() }
    return {
      active: active
        ? {
            ...active,
            gpu: active.gpu ? { ...active.gpu, devices: [...active.gpu.devices] } : undefined,
          }
        : undefined,
      detected: detected.map(item => ({
        ...item,
        gpu: item.gpu ? { ...item.gpu, devices: [...item.gpu.devices] } : undefined,
      })),
    }
  }

  async requireActiveExecutable(): Promise<BlenderExecutableInfo> {
    const { active } = await this.detect()
    if (!active) {
      throw new BlenderError(
        '未检测到可用的 Blender（建议 3.6–5.x）。请安装 Blender，或在设置中配置 blenderPath / 环境变量 DSH_BLENDER_EXECUTABLE。',
        'ENV_NOT_READY',
        400,
      )
    }
    return active
  }

  async status(
    bridgePatch: Partial<BlenderBridgeStatus> = {},
    options: { forceDetect?: boolean; probeGpu?: boolean } = {},
  ): Promise<BlenderEnvironmentStatus> {
    const settings = await this.getSettings()
    const computeDevice: BlenderComputeDevice = settings.computeDevice ?? 'auto'
    const { active, detected } = await this.detect({ force: options.forceDetect, probeGpu: options.probeGpu })
    const gpu: BlenderGpuInfo = active?.gpu ?? { available: false, backend: 'CPU', devices: [] }
    const bridge: BlenderBridgeStatus = {
      host: settings.bridgeHost,
      port: settings.bridgePort,
      hasToken: Boolean(settings.bridgeToken),
      connected: Boolean(bridgePatch.connected),
      blenderVersion: bridgePatch.blenderVersion,
      activeScene: bridgePatch.activeScene,
      lastChecked: bridgePatch.lastChecked,
      error: bridgePatch.error,
    }
    const gpuNote = gpu.available ? ` · Cycles GPU: ${gpu.backend}` : ' · Cycles: CPU'
    const hint = active
      ? `已就绪：Blender ${active.version}（${active.eeveeEngine} / ${active.greasePencilApi.toUpperCase()}${gpuNote}），支持无头 CLI 渲染与可选 Live Bridge 联动。`
      : '未检测到本机 Blender。请安装 Blender 3.6–5.x（https://www.blender.org/download/），或设置 DSH_BLENDER_EXECUTABLE / 在“环境与桥接”页手动指定可执行路径。'

    return {
      ready: Boolean(active),
      active,
      detected,
      configuredPath: settings.blenderPath,
      computeDevice,
      gpu,
      bridge,
      polyHavenEnabled: settings.polyHavenEnabled,
      node: process.version,
      platform: process.platform,
      hint,
    }
  }
}
