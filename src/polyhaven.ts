import { randomUUID } from 'node:crypto'
import { mkdir, readdir, readFile, realpath, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { join, relative, resolve, isAbsolute } from 'node:path'
import {
  BlenderError,
  MAX_ASSET_BYTES,
  type BlenderAssetKind,
  type PolyHavenAssetItem,
  type PolyHavenAssetType,
} from './types.js'

const ALLOWED_POLYHAVEN_HOSTS = new Set(['api.polyhaven.com', 'dl.polyhaven.org'])
const VALID_ASSET_TYPES = new Set<PolyHavenAssetType>(['hdris', 'textures', 'models'])
const VALID_RESOLUTIONS = new Set(['1k', '2k'])
const ASSET_ID_RE = /^[a-z0-9][a-z0-9_-]{0,79}$/i
const MAX_REDIRECTS = 3
const DEFAULT_MAX_CACHE_BYTES = 200 * 1024 * 1024
const CATALOG_TTL_MS = 5 * 60 * 1000

export interface PolyHavenClientOptions {
  root: string
  isEnabled: () => boolean | Promise<boolean>
  fetchImpl?: typeof fetch
  maxDownloadBytes?: number
  maxCacheBytes?: number
  timeoutMs?: number
}

export interface PolyHavenDownloadResult {
  assetId: string
  type: PolyHavenAssetType
  resolution: '1k' | '2k'
  fileName: string
  ext: string
  kind: BlenderAssetKind
  bytes: Buffer
  cached: boolean
}

export function validatePolyHavenUrl(rawUrl: string): URL {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new BlenderError('Poly Haven 地址格式无效。', 'POLYHAVEN_FAILED', 502)
  }
  if (parsed.protocol !== 'https:') {
    throw new BlenderError('Poly Haven 仅允许 HTTPS 安全连接。', 'POLYHAVEN_FAILED', 502)
  }
  if (parsed.username || parsed.password || parsed.port) {
    throw new BlenderError('Poly Haven 地址包含不允许的凭据或非标准端口。', 'POLYHAVEN_FAILED', 502)
  }
  if (!ALLOWED_POLYHAVEN_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new BlenderError(
      `已拦截非白名单主机请求：${parsed.hostname}（仅允许 api.polyhaven.com 与 dl.polyhaven.org）。`,
      'POLYHAVEN_FAILED',
      502,
    )
  }
  return parsed
}

interface RawPolyHavenCatalogEntry {
  name?: string
  categories?: string[]
  tags?: string[]
  authors?: Record<string, string> | string[]
  download_count?: number
  thumbnail_url?: string
  max_resolution?: [number, number]
}

export class PolyHavenClient {
  readonly cacheDir: string
  private readonly isEnabled: () => boolean | Promise<boolean>
  private readonly fetchImpl: typeof fetch
  private readonly maxDownloadBytes: number
  private readonly maxCacheBytes: number
  private readonly timeoutMs: number
  private readonly catalogCache = new Map<PolyHavenAssetType, { fetchedAt: number; items: PolyHavenAssetItem[] }>()

  constructor(options: PolyHavenClientOptions) {
    this.cacheDir = resolve(join(options.root, 'cache', 'polyhaven'))
    this.isEnabled = options.isEnabled
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch
    this.maxDownloadBytes = options.maxDownloadBytes ?? MAX_ASSET_BYTES
    this.maxCacheBytes = options.maxCacheBytes ?? DEFAULT_MAX_CACHE_BYTES
    this.timeoutMs = options.timeoutMs ?? 20_000
  }

  private async ensureEnabled(): Promise<void> {
    const enabled = await this.isEnabled()
    if (!enabled) {
      throw new BlenderError(
        'Poly Haven 外部 CC0 资产检索当前未开启；请在“环境与桥接”设置中显式启用后再使用。',
        'POLYHAVEN_DISABLED',
        403,
      )
    }
  }

  private async checkCacheContainment(filePath: string): Promise<void> {
    await mkdir(this.cacheDir, { recursive: true, mode: 0o700 })
    const base = await realpath(this.cacheDir)
    const target = resolve(filePath)
    const rel = relative(base, target)
    if (rel === '..' || rel.startsWith('..' + (process.platform === 'win32' ? '\\' : '/')) || isAbsolute(rel)) {
      throw new BlenderError('缓存文件路径超出 Poly Haven 缓存目录。', 'STORAGE_UNSAFE', 400)
    }
  }

  private async safeFetch(rawUrl: string): Promise<Response> {
    let current = validatePolyHavenUrl(rawUrl)
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      let response: Response
      try {
        response = await this.fetchImpl(current.toString(), {
          method: 'GET',
          redirect: 'manual',
          signal: AbortSignal.timeout(this.timeoutMs),
          headers: {
            'user-agent': 'dsh-blender-studio/0.5.0 (DeepSeek Harness Plugin)',
            accept: '*/*',
          },
        })
      } catch (error) {
        throw new BlenderError(
          `Poly Haven 网络请求失败：${error instanceof Error ? error.message : String(error)}`,
          'POLYHAVEN_FAILED',
          502,
        )
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (!location) {
          throw new BlenderError('Poly Haven 重定向缺少目标地址。', 'POLYHAVEN_FAILED', 502)
        }
        if (hop === MAX_REDIRECTS) {
          throw new BlenderError('Poly Haven 重定向次数过多。', 'POLYHAVEN_FAILED', 502)
        }
        const nextUrl = new URL(location, current).toString()
        current = validatePolyHavenUrl(nextUrl)
        continue
      }

      return response
    }
    throw new BlenderError('Poly Haven 请求重定向超出限制。', 'POLYHAVEN_FAILED', 502)
  }

  private async readBodyWithLimit(response: Response, limitBytes: number): Promise<Buffer> {
    const contentLength = Number(response.headers.get('content-length'))
    if (Number.isFinite(contentLength) && contentLength > limitBytes) {
      throw new BlenderError('Poly Haven 资产超过单文件大小上限（50 MB）。', 'ASSET_SIZE', 400)
    }
    if (!response.body) {
      const buf = Buffer.from(await response.arrayBuffer())
      if (buf.length > limitBytes) {
        throw new BlenderError('Poly Haven 资产超过单文件大小上限（50 MB）。', 'ASSET_SIZE', 400)
      }
      return buf
    }
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue
        total += value.byteLength
        if (total > limitBytes) {
          await reader.cancel().catch(() => {})
          throw new BlenderError('Poly Haven 资产超过单文件大小上限（50 MB）。', 'ASSET_SIZE', 400)
        }
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }
    return Buffer.concat(chunks)
  }

  async search(
    query: string,
    type: PolyHavenAssetType = 'hdris',
    limit = 12,
  ): Promise<PolyHavenAssetItem[]> {
    await this.ensureEnabled()
    if (!VALID_ASSET_TYPES.has(type)) {
      throw new BlenderError('Poly Haven 资产类型必须为 hdris、textures 或 models。', 'BAD_REQUEST', 400)
    }
    const safeLimit = Math.max(1, Math.min(50, Number.isInteger(limit) ? limit : 12))
    let items: PolyHavenAssetItem[]

    const cached = this.catalogCache.get(type)
    if (cached && Date.now() - cached.fetchedAt < CATALOG_TTL_MS) {
      items = cached.items
    } else {
      const response = await this.safeFetch(`https://api.polyhaven.com/assets?t=${encodeURIComponent(type)}`)
      if (!response.ok) {
        throw new BlenderError(`Poly Haven 目录请求失败（HTTP ${response.status}）。`, 'POLYHAVEN_FAILED', 502)
      }
      const rawBuf = await this.readBodyWithLimit(response, 15 * 1024 * 1024)
      let parsed: Record<string, RawPolyHavenCatalogEntry>
      try {
        parsed = JSON.parse(rawBuf.toString('utf8')) as Record<string, RawPolyHavenCatalogEntry>
      } catch {
        throw new BlenderError('Poly Haven 目录响应 JSON 解析失败。', 'POLYHAVEN_FAILED', 502)
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new BlenderError('Poly Haven 目录响应格式无效。', 'POLYHAVEN_FAILED', 502)
      }
      items = Object.entries(parsed).map(([id, entry]) => {
        const authors = Array.isArray(entry.authors)
          ? entry.authors.filter((a): a is string => typeof a === 'string')
          : entry.authors && typeof entry.authors === 'object'
            ? Object.keys(entry.authors)
            : []
        const thumbUrl =
          typeof entry.thumbnail_url === 'string' && entry.thumbnail_url.startsWith('https://')
            ? entry.thumbnail_url
            : `https://cdn.polyhaven.com/asset_img/thumbs/${encodeURIComponent(id)}.png?height=220`
        return {
          id,
          name: typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : id,
          type,
          categories: Array.isArray(entry.categories) ? entry.categories.map(String) : [],
          tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [],
          authors,
          downloadCount: typeof entry.download_count === 'number' ? entry.download_count : 0,
          thumbnailUrl: thumbUrl,
          maxResolution:
            Array.isArray(entry.max_resolution) && entry.max_resolution.length === 2
              ? [Number(entry.max_resolution[0]), Number(entry.max_resolution[1])]
              : undefined,
        }
      })
      items.sort((a, b) => b.downloadCount - a.downloadCount)
      this.catalogCache.set(type, { fetchedAt: Date.now(), items })
    }

    const q = String(query ?? '').trim().toLowerCase()
    if (!q) return items.slice(0, safeLimit)
    const tokens = q.split(/\s+/).filter(Boolean)
    return items
      .filter(item => {
        const haystack = [item.id, item.name, ...item.categories, ...item.tags].join(' ').toLowerCase()
        return tokens.every(token => haystack.includes(token))
      })
      .slice(0, safeLimit)
  }

  private pickDownloadDescriptor(
    filesJson: Record<string, any>,
    type: PolyHavenAssetType,
    resolution: '1k' | '2k',
  ): { url: string; ext: string; kind: BlenderAssetKind } | null {
    const pickEntry = (container: any, exts: string[]): { url: string; ext: string } | null => {
      if (!container || typeof container !== 'object') return null
      const resBucket = container[resolution] ?? container['1k'] ?? container['2k']
      if (!resBucket || typeof resBucket !== 'object') return null
      for (const ext of exts) {
        const url = resBucket[ext]?.url
        if (typeof url === 'string' && url) return { url, ext }
      }
      return null
    }

    if (type === 'hdris') {
      const hit = pickEntry(filesJson.hdri, ['hdr', 'exr'])
      return hit ? { ...hit, kind: 'hdri' } : null
    }
    if (type === 'textures') {
      const hit =
        pickEntry(filesJson.Diffuse, ['png', 'jpg']) ??
        pickEntry(filesJson.diff, ['png', 'jpg']) ??
        pickEntry(filesJson.albedo, ['png', 'jpg'])
      return hit ? { ...hit, kind: 'texture' } : null
    }
    if (type === 'models') {
      const glbHit = pickEntry(filesJson.gltf, ['glb']) ?? pickEntry(filesJson.glb, ['glb'])
      if (glbHit) return { ...glbHit, kind: 'model' }
      const fbxHit = pickEntry(filesJson.fbx, ['fbx'])
      if (fbxHit) return { ...fbxHit, kind: 'model' }
      const blendHit = pickEntry(filesJson.blend, ['blend'])
      if (blendHit) return { ...blendHit, kind: 'blend' }
    }
    return null
  }

  private async enforceCacheLimit(): Promise<void> {
    try {
      const files: Array<{ path: string; size: number; mtimeMs: number }> = []
      const types = await readdir(this.cacheDir).catch(() => [])
      for (const sub of types) {
        const subDir = join(this.cacheDir, sub)
        const entries = await readdir(subDir).catch(() => [])
        for (const entry of entries) {
          const full = join(subDir, entry)
          const info = await stat(full).catch(() => null)
          if (info?.isFile()) files.push({ path: full, size: info.size, mtimeMs: info.mtimeMs })
        }
      }
      let total = files.reduce((sum, f) => sum + f.size, 0)
      if (total <= this.maxCacheBytes) return
      files.sort((a, b) => a.mtimeMs - b.mtimeMs)
      for (const item of files) {
        if (total <= this.maxCacheBytes) break
        await unlink(item.path).catch(() => {})
        total -= item.size
      }
    } catch {
      // best-effort cache eviction
    }
  }

  async downloadAsset(
    assetId: string,
    type: PolyHavenAssetType,
    resolution: '1k' | '2k' = '1k',
  ): Promise<PolyHavenDownloadResult> {
    await this.ensureEnabled()
    if (!ASSET_ID_RE.test(assetId)) {
      throw new BlenderError('Poly Haven 资产 ID 格式无效。', 'BAD_REQUEST', 400)
    }
    if (!VALID_ASSET_TYPES.has(type)) {
      throw new BlenderError('Poly Haven 资产类型无效。', 'BAD_REQUEST', 400)
    }
    if (!VALID_RESOLUTIONS.has(resolution)) {
      throw new BlenderError('Poly Haven 分辨率仅支持 1k 或 2k。', 'BAD_REQUEST', 400)
    }

    const metaRes = await this.safeFetch(`https://api.polyhaven.com/files/${encodeURIComponent(assetId)}`)
    if (metaRes.status === 404) {
      throw new BlenderError(`Poly Haven 未找到资产：${assetId}`, 'POLYHAVEN_NOT_FOUND', 404)
    }
    if (!metaRes.ok) {
      throw new BlenderError(`Poly Haven 文件清单获取失败（HTTP ${metaRes.status}）。`, 'POLYHAVEN_FAILED', 502)
    }
    const metaBuf = await this.readBodyWithLimit(metaRes, 2 * 1024 * 1024)
    let filesJson: Record<string, any>
    try {
      filesJson = JSON.parse(metaBuf.toString('utf8')) as Record<string, any>
    } catch {
      throw new BlenderError('Poly Haven 文件清单解析失败。', 'POLYHAVEN_FAILED', 502)
    }

    const descriptor = this.pickDownloadDescriptor(filesJson, type, resolution)
    if (!descriptor) {
      throw new BlenderError(
        `资产 ${assetId} 缺少可用的 ${resolution} ${type} 下载文件。`,
        'POLYHAVEN_NOT_FOUND',
        404,
      )
    }

    const fileName = `${assetId}_${resolution}.${descriptor.ext}`
    const subDir = join(this.cacheDir, type)
    const cachedFile = join(subDir, fileName)
    await mkdir(subDir, { recursive: true, mode: 0o700 })
    await this.checkCacheContainment(cachedFile)

    try {
      const info = await stat(cachedFile)
      if (info.isFile() && info.size > 0 && info.size <= this.maxDownloadBytes) {
        const bytes = await readFile(cachedFile)
        return {
          assetId,
          type,
          resolution,
          fileName,
          ext: descriptor.ext,
          kind: descriptor.kind,
          bytes,
          cached: true,
        }
      }
    } catch {
      // cache miss
    }

    const dlRes = await this.safeFetch(descriptor.url)
    if (dlRes.status === 404) {
      throw new BlenderError(`Poly Haven 下载文件不存在：${assetId}`, 'POLYHAVEN_NOT_FOUND', 404)
    }
    if (!dlRes.ok) {
      throw new BlenderError(`Poly Haven 文件下载失败（HTTP ${dlRes.status}）。`, 'POLYHAVEN_FAILED', 502)
    }
    const bytes = await this.readBodyWithLimit(dlRes, this.maxDownloadBytes)
    if (!bytes.length) {
      throw new BlenderError('Poly Haven 返回了空文件。', 'POLYHAVEN_FAILED', 502)
    }

    const tmpFile = join(subDir, `${fileName}.${randomUUID()}.tmp`)
    try {
      await writeFile(tmpFile, bytes, { flag: 'wx', mode: 0o600 })
      await rename(tmpFile, cachedFile)
      await this.enforceCacheLimit()
    } finally {
      await unlink(tmpFile).catch(() => {})
    }

    return {
      assetId,
      type,
      resolution,
      fileName,
      ext: descriptor.ext,
      kind: descriptor.kind,
      bytes,
      cached: false,
    }
  }
}
