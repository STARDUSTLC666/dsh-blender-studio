import { randomUUID } from 'node:crypto'
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rename,
  rm,
  rmdir,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises'
import { homedir } from 'node:os'
import { extname, isAbsolute, join, relative, resolve } from 'node:path'
import { strToU8, zip, type AsyncZippable } from 'fflate'
import lockfile from 'proper-lockfile'
import { generateSceneScript } from './templates.js'
import { movePathToTrash, movePathsToTrash } from './trash.js'

export type TrashPathFn = typeof movePathToTrash
export type TrashPathsFn = typeof movePathsToTrash
import {
  ARTIFACT_MIME_MAP,
  BlenderConflict,
  BlenderError,
  blenderId,
  MAX_ACTIVE_PROJECTS,
  MAX_ASSET_BYTES,
  MAX_PROJECT_ARTIFACTS,
  MAX_PROJECT_ASSETS,
  MAX_PROJECT_ASSETS_BYTES,
  MAX_PROJECT_JSON_BYTES,
  MAX_SCRIPT_CHECKPOINTS,
  sanitizeFileName,
  validateProjectFields,
  type BlenderArtifact,
  type BlenderAsset,
  type BlenderAssetKind,
  type BlenderProject,
  type BlenderSceneSummary,
  type BlenderScriptCheckpoint,
} from './types.js'

export { BlenderConflict, BlenderError, blenderId }

const UUID_RE = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/
const ASSET_EXT_PATTERN = '(?:hdr|exr|png|jpg|webp|glb|gltf|obj|fbx|stl|blend)'
const PRECOMPRESSED_RE = /\.(?:png|jpe?g|webp|mp4|glb|blend|exr)$/i
const SAFE_ARTIFACT_FILE_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,120}$/

export function zipAsync(files: AsyncZippable): Promise<Uint8Array> {
  return new Promise((resolveZip, rejectZip) => {
    zip(files, (error, data) => {
      if (error) rejectZip(error)
      else resolveZip(data)
    })
  })
}

function hasNullBytes(bytes: Buffer, scanLimit = 65536): boolean {
  const len = Math.min(bytes.length, scanLimit)
  for (let i = 0; i < len; i++) {
    if (bytes[i] === 0) return true
  }
  return false
}

export function validateAssetUpload(
  fileName: string,
  bytes: Buffer,
  preferredKind?: BlenderAssetKind,
): { kind: BlenderAssetKind; ext: string; normalizedName: string } {
  if (!bytes || !bytes.length || bytes.length > MAX_ASSET_BYTES) {
    throw new BlenderError('单个素材文件大小需在 1 字节至 50 MB 之间。', 'ASSET_SIZE', 400)
  }

  const rawExt = extname(String(fileName ?? '')).toLowerCase()
  const isPng =
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const isJpg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const isWebp =
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  const isHdr =
    bytes.length >= 10 &&
    (bytes.toString('ascii', 0, 10) === '#?RADIANCE' || bytes.toString('ascii', 0, 6) === '#?RGBE')
  const isExr =
    bytes.length >= 4 &&
    bytes[0] === 0x76 &&
    bytes[1] === 0x2f &&
    bytes[2] === 0x31 &&
    bytes[3] === 0x01
  const isGlb = bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'glTF'
  const isBlend =
    (bytes.length >= 7 && bytes.toString('ascii', 0, 7) === 'BLENDER') ||
    (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) ||
    (bytes.length >= 4 &&
      bytes[0] === 0x28 &&
      bytes[1] === 0xb5 &&
      bytes[2] === 0x2f &&
      bytes[3] === 0xfd)

  let kind: BlenderAssetKind | undefined
  let ext: string | undefined

  if (rawExt === '.png' && isPng) {
    kind = preferredKind === 'reference' ? 'reference' : 'texture'
    ext = 'png'
  } else if ((rawExt === '.jpg' || rawExt === '.jpeg') && isJpg) {
    kind = preferredKind === 'reference' ? 'reference' : 'texture'
    ext = 'jpg'
  } else if (rawExt === '.webp' && isWebp) {
    kind = preferredKind === 'reference' ? 'reference' : 'texture'
    ext = 'webp'
  } else if (rawExt === '.hdr' && isHdr) {
    kind = 'hdri'
    ext = 'hdr'
  } else if (rawExt === '.exr' && isExr) {
    kind = 'hdri'
    ext = 'exr'
  } else if (rawExt === '.glb' && isGlb) {
    kind = 'model'
    ext = 'glb'
  } else if (rawExt === '.gltf' && !hasNullBytes(bytes)) {
    try {
      const parsed = JSON.parse(bytes.toString('utf8')) as Record<string, unknown>
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof parsed.asset === 'object') {
        kind = 'model'
        ext = 'gltf'
      }
    } catch {
      // invalid glTF JSON
    }
  } else if (rawExt === '.obj' && !hasNullBytes(bytes)) {
    const sample = bytes.subarray(0, 65536).toString('utf8')
    if (/^\s*(?:v|vt|vn|vp|f|o|g|s|l|mtllib|usemtl|#)(?:\s|$)/m.test(sample)) {
      kind = 'model'
      ext = 'obj'
    }
  } else if (rawExt === '.fbx') {
    const isBinaryFbx = bytes.length >= 18 && bytes.toString('ascii', 0, 18) === 'Kaydara FBX Binary'
    const isAsciiFbx =
      !hasNullBytes(bytes) && /(?:;\s*FBX|FBXHeaderExtension\s*:)/i.test(bytes.subarray(0, 4096).toString('utf8'))
    if (isBinaryFbx || isAsciiFbx) {
      kind = 'model'
      ext = 'fbx'
    }
  } else if (rawExt === '.stl') {
    const head = bytes.subarray(0, 4096).toString('utf8')
    const isAsciiStl =
      !hasNullBytes(bytes) && /^\s*solid\b/i.test(head) && /\b(?:facet|endsolid)\b/i.test(bytes.toString('utf8'))
    const isBinaryStl = bytes.length >= 84 && 84 + bytes.readUInt32LE(80) * 50 === bytes.length
    if (isAsciiStl || isBinaryStl) {
      kind = 'model'
      ext = 'stl'
    }
  } else if (rawExt === '.blend' && isBlend) {
    kind = 'blend'
    ext = 'blend'
  }

  if (!kind || !ext) {
    throw new BlenderError(
      '仅支持内容魔数与扩展名严格匹配的 HDR、EXR、PNG、JPG、WebP、GLB、GLTF、OBJ、FBX、STL 或 BLEND 文件。',
      'ASSET_FORMAT',
      400,
    )
  }

  return {
    kind,
    ext,
    normalizedName: sanitizeFileName(fileName, 100),
  }
}

export interface AddAssetOptions {
  kind?: BlenderAssetKind
  source?: 'upload' | 'polyhaven'
  sourceId?: string
}

export class BlenderStore {
  readonly root: string
  private readonly customTrashPath?: TrashPathFn
  private readonly customTrashPaths?: TrashPathsFn

  constructor(root?: string, options?: { trashPath?: TrashPathFn; trashPaths?: TrashPathsFn }) {
    this.root = resolve(root ?? join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'data', 'dsh-blender-studio'))
    this.customTrashPath = options?.trashPath
    this.customTrashPaths = options?.trashPaths
  }

  private async trashDirs(dirs: string[]): Promise<void> {
    if (dirs.length === 0) return
    if (this.customTrashPaths) {
      await this.customTrashPaths(dirs)
      return
    }
    if (this.customTrashPath) {
      for (const dir of dirs) await this.customTrashPath(dir)
      return
    }
    await movePathsToTrash(dirs)
  }

  async init(): Promise<void> {
    await mkdir(join(this.root, 'projects'), { recursive: true, mode: 0o700 })
  }

  async checkPath(targetPath: string): Promise<void> {
    const base = await realpath(this.root)
    const actual = await realpath(targetPath)
    const rel = relative(base, actual)
    if (rel === '..' || rel.startsWith('..' + (process.platform === 'win32' ? '\\' : '/')) || isAbsolute(rel)) {
      throw new BlenderError('路径超出本插件受管数据目录范围。', 'STORAGE_UNSAFE', 400)
    }
  }

  async path(id: string, archived = false): Promise<string> {
    await this.init()
    const validId = blenderId(id)
    const dir = join(this.root, archived ? 'archives' : 'projects', validId)
    let info
    try {
      info = await lstat(dir)
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        throw new BlenderError('指定的 3D 工程不存在。', 'PROJECT_NOT_FOUND', 404)
      }
      throw error
    }
    if (info.isSymbolicLink()) {
      throw new BlenderError('工程目录不能为符号链接或目录联接。', 'STORAGE_UNSAFE', 400)
    }
    if (!info.isDirectory()) {
      throw new BlenderError('工程目录结构损坏。', 'PROJECT_CORRUPT', 400)
    }
    await this.checkPath(dir)
    return dir
  }

  private async writeProjectFile(project: BlenderProject): Promise<void> {
    const dir = await this.path(project.id)
    const temp = join(dir, `${randomUUID()}.tmp`)
    try {
      await writeFile(temp, JSON.stringify(project, null, 2), { flag: 'wx', mode: 0o600 })
      await rename(temp, join(dir, 'project.json'))
    } finally {
      await unlink(temp).catch(() => {})
    }
  }

  async get(id: string, archived = false): Promise<BlenderProject> {
    const dir = await this.path(id, archived)
    const file = join(dir, 'project.json')
    let fileInfo
    try {
      fileInfo = await lstat(file)
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        throw new BlenderError('工程缺少 project.json 记录，原目录已保留。', 'PROJECT_CORRUPT', 400)
      }
      throw error
    }
    if (fileInfo.isSymbolicLink()) {
      throw new BlenderError('工程元数据文件不能为符号链接。', 'STORAGE_UNSAFE', 400)
    }
    await this.checkPath(file)
    if (fileInfo.size > MAX_PROJECT_JSON_BYTES) {
      throw new BlenderError('工程记录文件体积异常，原文件已保留。', 'PROJECT_CORRUPT', 400)
    }

    let raw: unknown
    try {
      raw = JSON.parse(await readFile(file, 'utf8'))
    } catch {
      throw new BlenderError('工程 JSON 解析失败，原文件已保留。', 'PROJECT_CORRUPT', 400)
    }

    let validatedFields
    try {
      validatedFields = validateProjectFields(raw, { strict: true })
    } catch (error) {
      throw new BlenderError(
        `工程字段损坏：${error instanceof Error ? error.message : String(error)}`,
        'PROJECT_CORRUPT',
        400,
      )
    }

    const p = raw as BlenderProject
    if (
      p.id !== id ||
      !Number.isInteger(p.revision) ||
      p.revision < 1 ||
      typeof p.created !== 'string' ||
      typeof p.updated !== 'string' ||
      !Array.isArray(p.assets) ||
      p.assets.length > MAX_PROJECT_ASSETS ||
      !Array.isArray(p.artifacts)
    ) {
      throw new BlenderError('工程记录结构损坏，原文件已保留。', 'PROJECT_CORRUPT', 400)
    }

    for (const a of p.assets) {
      try {
        blenderId(a.id)
      } catch {
        throw new BlenderError('工程素材编号损坏。', 'PROJECT_CORRUPT', 400)
      }
      if (
        typeof a.file !== 'string' ||
        !new RegExp(`^${a.id}\\.${ASSET_EXT_PATTERN}$`).test(a.file) ||
        typeof a.size !== 'number' ||
        a.size < 1 ||
        a.size > MAX_ASSET_BYTES
      ) {
        throw new BlenderError('工程素材记录无效。', 'PROJECT_CORRUPT', 400)
      }
    }

    for (const art of p.artifacts) {
      try {
        blenderId(art.id)
      } catch {
        throw new BlenderError('工程成品记录编号损坏。', 'PROJECT_CORRUPT', 400)
      }
      if (typeof art.file !== 'string' || !SAFE_ARTIFACT_FILE_RE.test(art.file)) {
        throw new BlenderError('工程成品文件路径记录无效。', 'PROJECT_CORRUPT', 400)
      }
    }

    let checkpoints: BlenderScriptCheckpoint[] | undefined
    if (p.checkpoints !== undefined) {
      if (!Array.isArray(p.checkpoints)) {
        throw new BlenderError('工程脚本快照记录损坏。', 'PROJECT_CORRUPT', 400)
      }
      checkpoints = []
      for (const cp of p.checkpoints.slice(0, MAX_SCRIPT_CHECKPOINTS)) {
        try {
          blenderId(cp.id)
        } catch {
          throw new BlenderError('工程脚本快照编号损坏。', 'PROJECT_CORRUPT', 400)
        }
        if (typeof cp.customScript !== 'string' || typeof cp.created !== 'string') {
          throw new BlenderError('工程脚本快照内容损坏。', 'PROJECT_CORRUPT', 400)
        }
        checkpoints.push(cp)
      }
    }

    return {
      ...validatedFields,
      id: p.id,
      revision: p.revision,
      created: p.created,
      updated: p.updated,
      archived,
      assets: p.assets,
      artifacts: p.artifacts,
      sceneSummary: p.sceneSummary,
      checkpoints: checkpoints ?? [],
    }
  }

  async listWithWarnings(
    archived = false,
  ): Promise<{ projects: BlenderProject[]; corrupted: Array<{ id: string; detail: string }> }> {
    await this.init()
    const folder = join(this.root, archived ? 'archives' : 'projects')
    const entries = await readdir(folder).catch((error: NodeJS.ErrnoException) => {
      if (archived && error.code === 'ENOENT') return [] as string[]
      throw error
    })
    const ids = entries.filter(entry => UUID_RE.test(entry))
    const projects: BlenderProject[] = []
    const corrupted: Array<{ id: string; detail: string }> = []
    const batchSize = 6

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize)
      const settled = await Promise.allSettled(batch.map(id => this.get(id, archived)))
      for (let j = 0; j < settled.length; j++) {
        const outcome = settled[j]
        if (outcome.status === 'fulfilled') {
          projects.push(outcome.value)
        } else {
          const reason = outcome.reason as { code?: string; message?: string } | undefined
          if (reason?.code !== 'PROJECT_NOT_FOUND' && reason?.code !== 'ENOENT') {
            corrupted.push({
              id: batch[j],
              detail: reason instanceof Error ? reason.message : String(reason),
            })
          }
        }
      }
    }

    projects.sort((a, b) => b.updated.localeCompare(a.updated))
    return { projects, corrupted }
  }

  async list(archived = false): Promise<BlenderProject[]> {
    return (await this.listWithWarnings(archived)).projects
  }

  async create(value: unknown): Promise<BlenderProject> {
    await this.init()
    const unlock = await lockfile.lock(join(this.root, 'projects'), {
      retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
    })
    try {
      const active = await this.list(false)
      if (active.length >= MAX_ACTIVE_PROJECTS) {
        throw new BlenderError(
          `工作台最多保存 ${MAX_ACTIVE_PROJECTS} 个活跃工程，请先归档现有工程。`,
          'PROJECT_LIMIT',
          409,
        )
      }
      const fields = validateProjectFields(value)
      const now = new Date().toISOString()
      const project: BlenderProject = {
        ...fields,
        id: randomUUID(),
        revision: 1,
        created: now,
        updated: now,
        archived: false,
        assets: [],
        artifacts: [],
        checkpoints: [],
      }
      const dir = join(this.root, 'projects', project.id)
      await mkdir(dir, { mode: 0o700 })
      try {
        await this.writeProjectFile(project)
        return project
      } catch (error) {
        await rmdir(dir).catch(() => {})
        throw error
      }
    } finally {
      await unlock()
    }
  }

  async edit(
    id: string,
    revision: unknown,
    fn: (project: BlenderProject) => Promise<void> | void,
    bump = true,
  ): Promise<BlenderProject> {
    const dir = await this.path(id)
    const unlock = await lockfile.lock(dir, {
      retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
    })
    try {
      const project = await this.get(id)
      if (revision !== undefined && revision !== project.revision) {
        throw new BlenderConflict('工程已在另一窗口更新；你的修改已保留，请刷新最新版本后重试。')
      }
      await fn(project)
      if (bump) project.revision++
      project.updated = new Date().toISOString()
      await this.writeProjectFile(project)
      return project
    } finally {
      await unlock()
    }
  }

  private makeCheckpoint(project: BlenderProject, note?: string): BlenderScriptCheckpoint {
    const cleanNote = typeof note === 'string' && note.trim() ? note.trim().slice(0, 120) : `Revision ${project.revision}`
    return {
      id: randomUUID(),
      revision: project.revision,
      created: new Date().toISOString(),
      note: cleanNote,
      scriptMode: project.scriptMode,
      scriptLength: project.customScript.length,
      customScript: project.customScript,
      engine: project.engine,
      samples: project.samples,
      qcScore: project.sceneSummary?.qc?.score,
    }
  }

  private pushCheckpoint(project: BlenderProject, checkpoint: BlenderScriptCheckpoint): void {
    const existing = Array.isArray(project.checkpoints) ? project.checkpoints : []
    project.checkpoints = [checkpoint, ...existing].slice(0, MAX_SCRIPT_CHECKPOINTS)
  }

  async update(id: string, revision: unknown, value: unknown): Promise<BlenderProject> {
    return this.edit(id, revision, project => {
      const next = validateProjectFields(value, { defaults: project })
      const scriptChanged =
        project.customScript.trim().length > 0 &&
        (next.customScript !== project.customScript || next.scriptMode !== project.scriptMode)
      if (scriptChanged) {
        const latest = project.checkpoints?.[0]
        const isDuplicate =
          latest && latest.customScript === project.customScript && latest.scriptMode === project.scriptMode
        if (!isDuplicate) {
          this.pushCheckpoint(project, this.makeCheckpoint(project, `Auto snapshot (R${project.revision})`))
        }
      }
      Object.assign(project, next)
    })
  }

  async saveCheckpoint(id: string, revision: unknown, note?: string): Promise<BlenderProject> {
    return this.edit(id, revision, project => {
      this.pushCheckpoint(project, this.makeCheckpoint(project, note))
    })
  }

  async restoreCheckpoint(id: string, revision: unknown, checkpointId: string): Promise<BlenderProject> {
    const validCheckpointId = blenderId(checkpointId)
    return this.edit(id, revision, project => {
      const target = (project.checkpoints ?? []).find(cp => cp.id === validCheckpointId)
      if (!target) {
        throw new BlenderError('指定的脚本快照不存在。', 'CHECKPOINT_NOT_FOUND', 404)
      }
      if (
        project.customScript.trim().length > 0 &&
        (project.customScript !== target.customScript || project.scriptMode !== target.scriptMode)
      ) {
        this.pushCheckpoint(project, this.makeCheckpoint(project, `Auto backup before restore (R${project.revision})`))
      }
      const next = validateProjectFields(
        {
          customScript: target.customScript,
          scriptMode: target.scriptMode,
          engine: target.engine,
          samples: target.samples,
        },
        { defaults: project },
      )
      Object.assign(project, next)
    })
  }

  async archive(id: string, revision: unknown, restore = false): Promise<BlenderProject> {
    await this.init()
    const unlockProjects = await lockfile.lock(join(this.root, 'projects'), {
      retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
    })
    let releaseSource: (() => Promise<void>) | undefined
    try {
      const source = await this.path(id, restore)
      releaseSource = await lockfile.lock(source, {
        retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
      })
      const project = await this.get(id, restore)
      if (revision !== project.revision) {
        throw new BlenderConflict('工程已更新，请重新读取最新版本后再归档或恢复。')
      }
      if (restore && (await this.list(false)).length >= MAX_ACTIVE_PROJECTS) {
        throw new BlenderError(
          `当前活跃工程已达 ${MAX_ACTIVE_PROJECTS} 个上限，请先归档其他工程再恢复。`,
          'PROJECT_LIMIT',
          409,
        )
      }
      const targetRoot = join(this.root, restore ? 'projects' : 'archives')
      await mkdir(targetRoot, { recursive: true, mode: 0o700 })
      await this.checkPath(targetRoot)
      const target = join(targetRoot, blenderId(id))
      const exists = await lstat(target).then(
        () => true,
        (error: NodeJS.ErrnoException) => {
          if (error.code === 'ENOENT') return false
          throw error
        },
      )
      if (exists) {
        throw new BlenderError('目标目录已存在同编号工程，已保留两份文件避免覆盖。', 'PROJECT_EXISTS', 409)
      }
      await rename(source, target)
      return { ...project, archived: !restore }
    } finally {
      if (releaseSource) await releaseSource().catch(() => {})
      await unlockProjects().catch(() => {})
    }
  }

  async trash(id: string, revision: unknown, archived = true): Promise<BlenderProject> {
    await this.init()
    const unlockProjects = await lockfile.lock(join(this.root, 'projects'), {
      retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
    })
    let releaseSource: (() => Promise<void>) | undefined
    try {
      const source = await this.path(id, archived)
      releaseSource = await lockfile.lock(source, {
        retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
      })
      const project = await this.get(id, archived)
      if (revision !== project.revision) {
        throw new BlenderConflict('工程已更新，请重新读取最新版本后再移入回收站。')
      }
      // Release per-project lock before handing directory to OS Recycle Bin (Windows lock safety).
      await releaseSource()
      releaseSource = undefined
      await this.trashDirs([source])
      return project
    } finally {
      if (releaseSource) await releaseSource().catch(() => {})
      await unlockProjects().catch(() => {})
    }
  }

  async trashArchived(): Promise<{ trashedCount: number; ids: string[] }> {
    await this.init()
    const unlockProjects = await lockfile.lock(join(this.root, 'projects'), {
      retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
    })
    try {
      const { projects } = await this.listWithWarnings(true)
      if (projects.length === 0) return { trashedCount: 0, ids: [] }
      const dirs: string[] = []
      const ids: string[] = []
      for (const project of projects) {
        const source = await this.path(project.id, true)
        const releaseSource = await lockfile.lock(source, {
          retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
        })
        await releaseSource()
        dirs.push(source)
        ids.push(project.id)
      }
      await this.trashDirs(dirs)
      return { trashedCount: ids.length, ids }
    } finally {
      await unlockProjects().catch(() => {})
    }
  }

  async trashCorrupted(items?: Array<{ id: string; archived?: boolean }>): Promise<{ trashedCount: number; ids: string[] }> {
    await this.init()
    const unlockProjects = await lockfile.lock(join(this.root, 'projects'), {
      retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
    })
    try {
      const candidates: Array<{ id: string; archived: boolean }> = []
      const seen = new Set<string>()
      const addCandidate = (id: string, archived: boolean) => {
        const validId = blenderId(id)
        const key = (archived ? 'a:' : 'p:') + validId
        if (seen.has(key)) return
        seen.add(key)
        candidates.push({ id: validId, archived })
      }
      if (items !== undefined) {
        if (!Array.isArray(items) || items.length > 100) {
          throw new BlenderError('损坏工程列表格式无效。', 'BAD_REQUEST', 400)
        }
        for (const item of items) {
          if (!item || typeof item !== 'object') {
            throw new BlenderError('损坏工程项格式无效。', 'BAD_REQUEST', 400)
          }
          addCandidate((item as { id?: unknown }).id as string, Boolean((item as { archived?: unknown }).archived))
        }
      } else {
        const [active, archived] = await Promise.all([this.listWithWarnings(false), this.listWithWarnings(true)])
        for (const c of active.corrupted) addCandidate(c.id, false)
        for (const c of archived.corrupted) addCandidate(c.id, true)
      }

      const dirs: string[] = []
      const ids: string[] = []
      for (const candidate of candidates) {
        const dir = join(this.root, candidate.archived ? 'archives' : 'projects', candidate.id)
        let info
        try {
          info = await lstat(dir)
        } catch (error) {
          if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') continue
          throw error
        }
        if (info.isSymbolicLink()) {
          throw new BlenderError('工程目录不能为符号链接或目录联接。', 'STORAGE_UNSAFE', 400)
        }
        if (!info.isDirectory()) {
          throw new BlenderError('清理目标必须是损坏工程目录。', 'STORAGE_UNSAFE', 400)
        }
        await this.checkPath(dir)
        let isCorrupt = false
        try {
          await this.get(candidate.id, candidate.archived)
        } catch (error) {
          const code = (error as { code?: string } | undefined)?.code
          if (code === 'ENOENT' || code === 'PROJECT_NOT_FOUND') continue
          isCorrupt = true
        }
        if (!isCorrupt) {
          throw new BlenderError('该 3D 工程当前完好，拒绝作为损坏目录清理。', 'PROJECT_NOT_CORRUPT', 400)
        }
        dirs.push(dir)
        ids.push(candidate.id)
      }
      if (dirs.length === 0) return { trashedCount: 0, ids: [] }
      await this.trashDirs(dirs)
      return { trashedCount: ids.length, ids }
    } finally {
      await unlockProjects().catch(() => {})
    }
  }

  async duplicate(id: string, titleOverride?: string): Promise<BlenderProject> {
    await this.init()
    const unlockProjects = await lockfile.lock(join(this.root, 'projects'), {
      retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
    })
    let releaseSource: (() => Promise<void>) | undefined
    let createdDir: string | undefined
    try {
      const sourceDir = await this.path(id, false)
      releaseSource = await lockfile.lock(sourceDir, {
        retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
      })
      const active = await this.list(false)
      if (active.length >= MAX_ACTIVE_PROJECTS) {
        throw new BlenderError(
          `工作台最多保存 ${MAX_ACTIVE_PROJECTS} 个活跃工程，请先归档现有工程。`,
          'PROJECT_LIMIT',
          409,
        )
      }
      const source = await this.get(id, false)
      const fallbackTitle = `${source.title.slice(0, 64)} (Copy)`
      const requestedTitle =
        typeof titleOverride === 'string' && titleOverride.trim() ? titleOverride.trim() : fallbackTitle
      const fields = validateProjectFields({ ...source, title: requestedTitle })
      const now = new Date().toISOString()
      const newId = randomUUID()
      const targetDir = join(this.root, 'projects', newId)
      await mkdir(targetDir, { mode: 0o700 })
      createdDir = targetDir

      const copiedAssets: BlenderAsset[] = []
      if (source.assets.length > 0) {
        const targetAssetsDir = join(targetDir, 'assets')
        await mkdir(targetAssetsDir, { recursive: true, mode: 0o700 })
        await this.checkPath(targetAssetsDir)
        for (const asset of source.assets) {
          const bytes = await this.assetBytes(source.id, asset)
          const nextAssetId = randomUUID()
          const nextFile = `${nextAssetId}.${asset.ext}`
          await writeFile(join(targetAssetsDir, nextFile), bytes, { flag: 'wx', mode: 0o600 })
          copiedAssets.push({
            ...asset,
            id: nextAssetId,
            file: nextFile,
            created: now,
          })
        }
      }

      const cloned: BlenderProject = {
        ...fields,
        id: newId,
        revision: 1,
        created: now,
        updated: now,
        archived: false,
        assets: copiedAssets,
        artifacts: [],
        checkpoints: [],
      }
      await this.writeProjectFile(cloned)
      createdDir = undefined
      return cloned
    } catch (error) {
      if (createdDir) {
        await rm(createdDir, { recursive: true, force: true }).catch(() => {})
      }
      throw error
    } finally {
      if (releaseSource) await releaseSource().catch(() => {})
      await unlockProjects().catch(() => {})
    }
  }

  async addAsset(
    id: string,
    revision: unknown,
    name: string,
    bytes: Buffer,
    options: AddAssetOptions = {},
  ): Promise<{ project: BlenderProject; asset: BlenderAsset }> {
    const validated = validateAssetUpload(name, bytes, options.kind)
    let writtenFile: string | undefined
    let createdAsset: BlenderAsset | undefined
    try {
      const project = await this.edit(id, revision, async p => {
        const currentTotal = p.assets.reduce((sum, item) => sum + item.size, 0)
        if (p.assets.length >= MAX_PROJECT_ASSETS || currentTotal + bytes.length > MAX_PROJECT_ASSETS_BYTES) {
          throw new BlenderError(
            `单个工程最多保存 ${MAX_PROJECT_ASSETS} 个素材且总大小不超过 ${Math.round(MAX_PROJECT_ASSETS_BYTES / (1024 * 1024))} MB。`,
            'ASSET_LIMIT',
            400,
          )
        }
        const assetsDir = join(await this.path(id), 'assets')
        await mkdir(assetsDir, { recursive: true, mode: 0o700 })
        if ((await lstat(assetsDir)).isSymbolicLink()) {
          throw new BlenderError('素材目录不能为符号链接。', 'STORAGE_UNSAFE', 400)
        }
        await this.checkPath(assetsDir)

        const assetId = randomUUID()
        const asset: BlenderAsset = {
          id: assetId,
          name: validated.normalizedName,
          file: `${assetId}.${validated.ext}`,
          kind: validated.kind,
          ext: validated.ext,
          size: bytes.length,
          source: options.source ?? 'upload',
          sourceId: options.sourceId,
          created: new Date().toISOString(),
        }
        const destination = join(assetsDir, asset.file)
        writtenFile = destination
        await writeFile(destination, bytes, { flag: 'wx', mode: 0o600 })
        createdAsset = asset
        p.assets.push(asset)
      })
      return { project, asset: createdAsset! }
    } catch (error) {
      if (writtenFile) await unlink(writtenFile).catch(() => {})
      throw error
    }
  }

  async upload(
    id: string,
    revision: unknown,
    name: string,
    bytes: Buffer,
    options: AddAssetOptions = {},
  ): Promise<BlenderProject> {
    return (await this.addAsset(id, revision, name, bytes, options)).project
  }

  async assetPath(id: string, assetId: string): Promise<{ file: string; asset: BlenderAsset }> {
    const project = await this.get(id)
    const validAssetId = blenderId(assetId)
    const asset = project.assets.find(item => item.id === validAssetId)
    if (!asset) {
      throw new BlenderError('指定的素材不存在。', 'ASSET_NOT_FOUND', 404)
    }
    const file = join(await this.path(id), 'assets', asset.file)
    let info
    try {
      info = await lstat(file)
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        throw new BlenderError('素材文件已在磁盘缺失。', 'ASSET_NOT_FOUND', 404)
      }
      throw error
    }
    if (info.isSymbolicLink()) {
      throw new BlenderError('素材文件不能为符号链接。', 'STORAGE_UNSAFE', 400)
    }
    await this.checkPath(file)
    return { file, asset }
  }

  async assetBytes(id: string, asset: BlenderAsset): Promise<Buffer> {
    const file = join(await this.path(id), 'assets', asset.file)
    const info = await lstat(file)
    if (info.isSymbolicLink()) {
      throw new BlenderError('素材文件不能为符号链接。', 'STORAGE_UNSAFE', 400)
    }
    await this.checkPath(file)
    if (info.size !== asset.size || asset.size > MAX_ASSET_BYTES) {
      throw new BlenderError('素材文件体积与记录不一致，请重新上传检查。', 'ASSET_CHANGED', 400)
    }
    return readFile(file)
  }

  async removeAsset(id: string, revision: unknown, assetId: string): Promise<BlenderProject> {
    let targetFile: string | undefined
    const validAssetId = blenderId(assetId)
    const project = await this.edit(id, revision, async p => {
      const hit = p.assets.find(item => item.id === validAssetId)
      if (!hit) throw new BlenderError('指定的素材不存在。', 'ASSET_NOT_FOUND', 404)
      targetFile = join(await this.path(id), 'assets', hit.file)
      p.assets = p.assets.filter(item => item.id !== validAssetId)
    })
    if (targetFile) await unlink(targetFile).catch(() => {})
    return project
  }

  async runDir(id: string, runId: string): Promise<string> {
    const projectDir = await this.path(id)
    const runsRoot = join(projectDir, 'runs')
    await mkdir(runsRoot, { recursive: true, mode: 0o700 })
    if ((await lstat(runsRoot)).isSymbolicLink()) {
      throw new BlenderError('运行目录不能为符号链接。', 'STORAGE_UNSAFE', 400)
    }
    const dir = join(runsRoot, blenderId(runId))
    await mkdir(dir, { recursive: true, mode: 0o700 })
    if ((await lstat(dir)).isSymbolicLink()) {
      throw new BlenderError('任务运行目录不能为符号链接。', 'STORAGE_UNSAFE', 400)
    }
    await this.checkPath(dir)
    return dir
  }

  async safeRemoveRunDir(id: string, runId: string): Promise<void> {
    try {
      const projectDir = await this.path(id)
      const target = join(projectDir, 'runs', blenderId(runId))
      const info = await lstat(target).catch(() => null)
      if (!info || info.isSymbolicLink()) return
      await this.checkPath(target)
      await rm(target, { recursive: true, force: true, maxRetries: 4, retryDelay: 50 })
    } catch {
      // best-effort cleanup of owned run directory
    }
  }

  async pruneRunWorkdir(runDirPath: string, keepFiles: string[] = []): Promise<void> {
    try {
      await this.checkPath(runDirPath)
      const keepSet = new Set(keepFiles)
      const entries = await readdir(runDirPath)
      await Promise.all(
        entries
          .filter(entry => !keepSet.has(entry))
          .map(entry =>
            rm(join(runDirPath, entry), { recursive: true, force: true, maxRetries: 3, retryDelay: 40 }).catch(
              () => {},
            ),
          ),
      )
    } catch {
      // best-effort pruning
    }
  }

  async pruneOldRuns(
    projectDir: string,
    keepIds: Iterable<string> = [],
    maxRetained = 10,
  ): Promise<string[]> {
    const removed: string[] = []
    try {
      await this.checkPath(projectDir)
      const runsRoot = join(projectDir, 'runs')
      const runsInfo = await lstat(runsRoot).catch(() => null)
      if (!runsInfo || runsInfo.isSymbolicLink() || !runsInfo.isDirectory()) return removed
      await this.checkPath(runsRoot)

      const limit = Math.max(0, Math.floor(maxRetained))
      const entries = (await readdir(runsRoot)).filter(entry => UUID_RE.test(entry))
      const requestedKeep = [...keepIds].filter(id => UUID_RE.test(id))
      const retained = new Set<string>()

      if (requestedKeep.length > 0) {
        for (const id of requestedKeep) {
          if (retained.size >= limit) break
          retained.add(id)
        }
      } else if (limit > 0 && entries.length > 0) {
        const dated = await Promise.all(
          entries.map(async entry => {
            const full = join(runsRoot, entry)
            const info = await lstat(full).catch(() => null)
            return info && !info.isSymbolicLink() ? { entry, mtimeMs: info.mtimeMs } : null
          }),
        )
        const sorted = dated
          .filter((item): item is { entry: string; mtimeMs: number } => item !== null)
          .sort((a, b) => b.mtimeMs - a.mtimeMs)
        for (const item of sorted.slice(0, limit)) {
          retained.add(item.entry)
        }
      }

      for (const entry of entries) {
        if (retained.has(entry)) continue
        const target = join(runsRoot, entry)
        const info = await lstat(target).catch(() => null)
        if (!info || info.isSymbolicLink()) continue
        await this.checkPath(target)
        await rm(target, { recursive: true, force: true, maxRetries: 4, retryDelay: 50 })
        removed.push(entry)
      }
    } catch {
      // best-effort retention cleanup
    }
    return removed
  }

  async registerArtifact(id: string, artifact: BlenderArtifact): Promise<BlenderProject> {
    blenderId(artifact.id)
    if (!SAFE_ARTIFACT_FILE_RE.test(artifact.file)) {
      throw new BlenderError('成品文件名无效。', 'BAD_REQUEST', 400)
    }
    let keptIds: string[] = []
    const project = await this.edit(
      id,
      undefined,
      p => {
        const next = [artifact, ...p.artifacts.filter(item => item.id !== artifact.id)]
        p.artifacts = next.slice(0, MAX_PROJECT_ARTIFACTS)
        keptIds = p.artifacts.map(item => item.id)
      },
      false,
    )
    const projectDir = await this.path(id)
    await this.pruneOldRuns(projectDir, keptIds, MAX_PROJECT_ARTIFACTS)
    return project
  }

  async artifactPath(id: string, artifactId: string): Promise<{ file: string; artifact: BlenderArtifact; mime: string }> {
    const project = await this.get(id)
    const validArtId = blenderId(artifactId)
    const artifact = project.artifacts.find(item => item.id === validArtId)
    if (!artifact) {
      throw new BlenderError('指定的渲染或导出成品不存在。', 'ARTIFACT_NOT_FOUND', 404)
    }
    if (!SAFE_ARTIFACT_FILE_RE.test(artifact.file)) {
      throw new BlenderError('成品文件路径不安全。', 'STORAGE_UNSAFE', 400)
    }
    const file = join(await this.path(id), 'runs', artifact.id, artifact.file)
    let info
    try {
      info = await lstat(file)
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        throw new BlenderError('成品文件已在磁盘缺失。', 'ARTIFACT_NOT_FOUND', 404)
      }
      throw error
    }
    if (info.isSymbolicLink()) {
      throw new BlenderError('成品文件不能为符号链接。', 'STORAGE_UNSAFE', 400)
    }
    await this.checkPath(file)
    const ext = extname(artifact.file).toLowerCase().replace(/^\./, '')
    const mime = artifact.mime || ARTIFACT_MIME_MAP[ext] || 'application/octet-stream'
    return { file, artifact, mime }
  }

  async updateSceneSummary(id: string, summary: BlenderSceneSummary): Promise<BlenderProject> {
    return this.edit(
      id,
      undefined,
      p => {
        p.sceneSummary = summary
      },
      false,
    )
  }

  async snapshot(
    id: string,
    revision?: unknown,
  ): Promise<{ project: BlenderProject; assets: Map<string, Buffer> }> {
    const dir = await this.path(id)
    const unlock = await lockfile.lock(dir, {
      retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
    })
    try {
      const project = await this.get(id)
      if (revision !== undefined && project.revision !== revision) {
        throw new BlenderConflict('工程已更新，请保存并刷新最新版本后再执行。')
      }
      const assets = new Map<string, Buffer>()
      for (const asset of project.assets) {
        assets.set(asset.file, await this.assetBytes(id, asset))
      }
      return { project, assets }
    } finally {
      await unlock()
    }
  }

  async buildSourceZip(
    id: string,
    generateSceneFn?: (project: BlenderProject) => string,
  ): Promise<Uint8Array> {
    const current = await this.get(id)
    const { project, assets } = await this.snapshot(id, current.revision)
    const scenePy = generateSceneFn ? generateSceneFn(project) : generateSceneScript(project, './assets')
    const readmeLines = [
      `# ${project.title.replace(/[\r\n]+/g, ' ')}`,
      '',
      `Project ID: ${project.id}`,
      `Revision: ${project.revision}`,
      `Template: ${project.template}`,
      `Engine: ${project.engine} (${project.samples} samples)`,
      `Aspect: ${project.aspect} (${project.resolutionScale}%)`,
      `Frames: ${project.frameStart}..${project.frameEnd} @ ${project.fps} fps`,
      '',
      'Run locally with Blender 3.6–5.x:',
      '  blender --background --factory-startup --python scene.py',
      '',
      `Bundled assets (${project.assets.length}):`,
      ...project.assets.map(a => `  - assets/${a.file} (${a.name}, ${a.kind}, ${a.size} bytes)`),
      '',
    ]

    const files: AsyncZippable = {
      'project.json': [strToU8(JSON.stringify(project, null, 2)), { level: 6 }],
      'scene.py': [strToU8(scenePy), { level: 6 }],
      'README.txt': [strToU8(readmeLines.join('\n')), { level: 6 }],
    }
    for (const [file, bytes] of assets) {
      files[`assets/${file}`] = [bytes, { level: PRECOMPRESSED_RE.test(file) ? 0 : 6 }]
    }
    return zipAsync(files)
  }
}
