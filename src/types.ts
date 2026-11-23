export type BlenderTemplateId =
  | 'product-studio'
  | 'logo-3d'
  | 'isometric-room'
  | 'motion-data'
  | 'grease-pencil-2d'
  | 'blank-stage'

export type BlenderRenderEngine = 'EEVEE' | 'CYCLES' | 'WORKBENCH'
export type BlenderAspect = 'landscape' | 'portrait' | 'square'
export type BlenderCameraPreset = 'three_quarter' | 'front' | 'isometric' | 'top' | 'closeup' | 'turntable'
export type BlenderLightingPreset = 'studio_3point' | 'soft_daylight' | 'dramatic_rim' | 'neon_cyber' | 'clay_overcast'
export type BlenderMaterialPreset = 'clay_matte' | 'brushed_metal' | 'frosted_glass' | 'ceramic_gloss' | 'toon_cel'
export type BlenderScriptMode = 'template' | 'custom'
export type BlenderAssetKind = 'hdri' | 'texture' | 'model' | 'blend' | 'reference'
export type BlenderArtifactKind = 'still' | 'contact_sheet' | 'animation' | 'glb' | 'fbx' | 'obj' | 'stl' | 'blend'
export type BlenderExportFormat = 'glb' | 'fbx' | 'obj' | 'stl' | 'blend'
export type BlenderFps = 24 | 30 | 60
export type BlenderResolutionScale = 50 | 100 | 150 | 200
export type PolyHavenAssetType = 'hdris' | 'textures' | 'models'

export type BlenderJobKind =
  | 'preview_still'
  | 'contact_sheet'
  | 'render_animation'
  | 'export_model'
  | 'inspect_scene'
  | 'run_script'
  | 'build_blend'

export interface BlenderProjectFields {
  template: BlenderTemplateId
  title: string
  description: string
  headline: string
  engine: BlenderRenderEngine
  samples: number
  aspect: BlenderAspect
  resolutionScale: number
  fps: BlenderFps
  frameStart: number
  frameEnd: number
  cameraPreset: BlenderCameraPreset
  lightingPreset: BlenderLightingPreset
  materialPreset: BlenderMaterialPreset
  accentColor: string
  transparentBg: boolean
  scriptMode: BlenderScriptMode
  customScript: string
}

export interface BlenderAsset {
  id: string
  name: string
  file: string
  kind: BlenderAssetKind
  ext: string
  size: number
  source?: 'upload' | 'polyhaven'
  sourceId?: string
  created: string
}

export interface BlenderSceneObjectSummary {
  name: string
  type: string
  location: [number, number, number]
  dimensions?: [number, number, number]
  materialCount?: number
  vertices?: number
  polygons?: number
}

export interface BlenderSceneSummary {
  capturedAt: string
  blenderVersion: string
  engine: string
  objectCount: number
  meshCount: number
  lightCount: number
  cameraCount: number
  totalPolygons: number
  activeCamera?: string
  materials: string[]
  collections: string[]
  objects: BlenderSceneObjectSummary[]
}

export interface BlenderArtifact {
  id: string
  kind: BlenderArtifactKind
  revision: number
  file: string
  mime: string
  size: number
  engine: BlenderRenderEngine
  samples: number
  width?: number
  height?: number
  durationMs: number
  created: string
}

export interface BlenderProject extends BlenderProjectFields {
  id: string
  revision: number
  created: string
  updated: string
  archived?: boolean
  assets: BlenderAsset[]
  artifacts: BlenderArtifact[]
  sceneSummary?: BlenderSceneSummary
}

export interface BlenderExecutableInfo {
  path: string
  version: string
  major: number
  minor: number
  source: 'env' | 'config' | 'path' | 'standard'
  eeveeEngine: 'BLENDER_EEVEE_NEXT' | 'BLENDER_EEVEE'
  greasePencilApi: 'gpv3' | 'gpv2'
}

export interface BlenderBridgeStatus {
  host: string
  port: number
  hasToken: boolean
  connected: boolean
  blenderVersion?: string
  activeScene?: string
  lastChecked?: string
  error?: string
}

export interface BlenderEnvironmentStatus {
  ready: boolean
  active?: BlenderExecutableInfo
  detected: BlenderExecutableInfo[]
  configuredPath: string
  bridge: BlenderBridgeStatus
  polyHavenEnabled: boolean
  node: string
  platform: string
  hint: string
}

export interface BlenderSettings {
  blenderPath: string
  bridgeHost: string
  bridgePort: number
  bridgeToken: string
  polyHavenEnabled: boolean
}

export interface BlenderJob {
  id: string
  kind: BlenderJobKind
  projectId: string
  revision: number
  state: 'running' | 'done' | 'failed' | 'cancelled'
  stageCode: string
  stage: string
  progress: number
  lines: string[]
  artifactId?: string
  artifactKind?: BlenderArtifactKind
  sceneSummary?: BlenderSceneSummary
  scriptOutput?: string
  startedAt: string
  finishedAt?: string
}

export interface BlenderTemplateMeta {
  id: BlenderTemplateId
  zh: string
  en: string
  description: string
  descriptionEn: string
  recommendedEngine: BlenderRenderEngine
  defaultCamera: BlenderCameraPreset
  defaultLighting: BlenderLightingPreset
  defaultMaterial: BlenderMaterialPreset
  defaultFrames: number
}

export interface ScriptSafetyFinding {
  rule: string
  line: number
  detail: string
}

export interface ScriptSafetyResult {
  safe: boolean
  findings: ScriptSafetyFinding[]
}

export interface PolyHavenAssetItem {
  id: string
  name: string
  type: PolyHavenAssetType
  categories: string[]
  tags: string[]
  authors: string[]
  downloadCount: number
  thumbnailUrl: string
  maxResolution?: [number, number]
}

export type BlenderErrorCode =
  | 'ID_INVALID'
  | 'BAD_REQUEST'
  | 'BAD_ACTION'
  | 'TITLE_INVALID'
  | 'DESCRIPTION_TOO_LONG'
  | 'HEADLINE_TOO_LONG'
  | 'SAMPLES_INVALID'
  | 'FRAMES_INVALID'
  | 'COLOR_INVALID'
  | 'SCRIPT_TOO_LARGE'
  | 'SCRIPT_UNSAFE'
  | 'TEMPLATE_INVALID'
  | 'EXPORT_FORMAT_INVALID'
  | 'CONFLICT'
  | 'JOB_CONFLICT'
  | 'PROJECT_LIMIT'
  | 'PROJECT_EXISTS'
  | 'PROJECT_NOT_FOUND'
  | 'ASSET_NOT_FOUND'
  | 'ASSET_CHANGED'
  | 'ARTIFACT_NOT_FOUND'
  | 'JOB_NOT_FOUND'
  | 'JOB_LIMIT'
  | 'JOB_CANCELLED'
  | 'ENV_NOT_READY'
  | 'BLENDER_PATH_INVALID'
  | 'BLENDER_PROBE_FAILED'
  | 'BRIDGE_UNREACHABLE'
  | 'BRIDGE_AUTH_FAILED'
  | 'BRIDGE_TIMEOUT'
  | 'BRIDGE_PROTOCOL_ERROR'
  | 'BRIDGE_HOST_FORBIDDEN'
  | 'ASSET_REQUIRED'
  | 'ASSET_SIZE'
  | 'ASSET_FORMAT'
  | 'ASSET_LIMIT'
  | 'POLYHAVEN_DISABLED'
  | 'POLYHAVEN_FAILED'
  | 'POLYHAVEN_NOT_FOUND'
  | 'STORAGE_UNSAFE'
  | 'PROJECT_CORRUPT'
  | 'CONFIRM_REQUIRED'
  | 'JOB_TIMEOUT'
  | 'LOCK_LOST'
  | 'CLI_FAILED'
  | 'OUTPUT_INVALID'
  | 'OUTPUT_TOO_LARGE'
  | 'ORIGIN_FORBIDDEN'
  | 'DOWNLOAD_INVALID'
  | 'PLUGIN_DISPOSED'

export const BLENDER_TEMPLATE_IDS: readonly BlenderTemplateId[] = [
  'product-studio',
  'logo-3d',
  'isometric-room',
  'motion-data',
  'grease-pencil-2d',
  'blank-stage',
] as const

export const BLENDER_ENGINES: readonly BlenderRenderEngine[] = ['EEVEE', 'CYCLES', 'WORKBENCH'] as const
export const BLENDER_ASPECTS: readonly BlenderAspect[] = ['landscape', 'portrait', 'square'] as const
export const BLENDER_RESOLUTION_SCALES: readonly BlenderResolutionScale[] = [50, 100, 150, 200] as const
export const BLENDER_FPS_VALUES: readonly BlenderFps[] = [24, 30, 60] as const
export const BLENDER_CAMERA_PRESETS: readonly BlenderCameraPreset[] = [
  'three_quarter',
  'front',
  'isometric',
  'top',
  'closeup',
  'turntable',
] as const
export const BLENDER_LIGHTING_PRESETS: readonly BlenderLightingPreset[] = [
  'studio_3point',
  'soft_daylight',
  'dramatic_rim',
  'neon_cyber',
  'clay_overcast',
] as const
export const BLENDER_MATERIAL_PRESETS: readonly BlenderMaterialPreset[] = [
  'clay_matte',
  'brushed_metal',
  'frosted_glass',
  'ceramic_gloss',
  'toon_cel',
] as const
export const BLENDER_SCRIPT_MODES: readonly BlenderScriptMode[] = ['template', 'custom'] as const
export const BLENDER_EXPORT_FORMATS: readonly BlenderExportFormat[] = ['glb', 'fbx', 'obj', 'stl', 'blend'] as const
export const BLENDER_ARTIFACT_KINDS: readonly BlenderArtifactKind[] = [
  'still',
  'contact_sheet',
  'animation',
  'glb',
  'fbx',
  'obj',
  'stl',
  'blend',
] as const

export const ASPECT_RESOLUTIONS: Record<BlenderAspect, [number, number]> = {
  landscape: [1280, 720],
  portrait: [720, 1280],
  square: [1024, 1024],
}

export const ARTIFACT_MIME_MAP: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  hdr: 'image/vnd.radiance',
  exr: 'image/x-exr',
  mp4: 'video/mp4',
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
  fbx: 'application/octet-stream',
  obj: 'text/plain; charset=utf-8',
  stl: 'model/stl',
  blend: 'application/x-blender',
}

export const MAX_ACTIVE_PROJECTS = 30
export const MAX_PROJECT_ASSETS = 24
export const MAX_ASSET_BYTES = 50 * 1024 * 1024
export const MAX_PROJECT_ASSETS_BYTES = 120 * 1024 * 1024
export const MAX_PROJECT_ARTIFACTS = 20
export const MAX_ARTIFACT_DOWNLOAD_BYTES = 200 * 1024 * 1024
export const MAX_CUSTOM_SCRIPT_BYTES = 64 * 1024
export const MAX_PROJECT_JSON_BYTES = 256 * 1024
export const MAX_JOB_LOG_LINES = 80
export const SCENE_JSON_MARKER = '__DSH_SCENE_JSON__='
export const DEFAULT_BRIDGE_HOST = '127.0.0.1'
export const DEFAULT_BRIDGE_PORT = 9876

const UUID_RE = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

export class BlenderError extends Error {
  constructor(
    message: string,
    readonly code: BlenderErrorCode | string,
    readonly status = 400,
  ) {
    super(message)
    this.name = 'BlenderError'
  }
}

export class BlenderConflict extends BlenderError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
    this.name = 'BlenderConflict'
  }
}

export function blenderId(value: unknown): string {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    throw new BlenderError('项目、素材或任务编号无效。', 'ID_INVALID', 400)
  }
  return value
}

export function sanitizeFileName(name: string, maxLength = 100): string {
  const cleaned = String(name ?? '')
    .replace(/[\x00-\x1f\x7f<>:"/\\|?*]+/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^[\s._-]+/, '')
    .trim()
    .slice(0, maxLength)
  return cleaned || 'asset'
}

export function defaultProjectFields(overrides: Partial<BlenderProjectFields> = {}): BlenderProjectFields {
  const engine: BlenderRenderEngine = overrides.engine ?? 'EEVEE'
  const defaultSamples = engine === 'CYCLES' ? 64 : engine === 'WORKBENCH' ? 16 : 32
  const frameStart = overrides.frameStart ?? 1
  return {
    template: overrides.template ?? 'product-studio',
    title: overrides.title ?? 'Untitled 3D Scene',
    description: overrides.description ?? '',
    headline: overrides.headline ?? 'DSH 3D',
    engine,
    samples: overrides.samples ?? defaultSamples,
    aspect: overrides.aspect ?? 'landscape',
    resolutionScale: overrides.resolutionScale ?? 100,
    fps: overrides.fps ?? 24,
    frameStart,
    frameEnd: overrides.frameEnd ?? Math.max(frameStart, 48),
    cameraPreset: overrides.cameraPreset ?? 'three_quarter',
    lightingPreset: overrides.lightingPreset ?? 'studio_3point',
    materialPreset: overrides.materialPreset ?? 'ceramic_gloss',
    accentColor: (overrides.accentColor ?? '#3B82F6').toUpperCase(),
    transparentBg: overrides.transparentBg ?? false,
    scriptMode: overrides.scriptMode ?? 'template',
    customScript: overrides.customScript ?? '',
  }
}

export interface ValidateProjectFieldsOptions {
  defaults?: Partial<BlenderProjectFields>
  strict?: boolean
}

export function validateProjectFields(
  value: unknown,
  options: ValidateProjectFieldsOptions = {},
): BlenderProjectFields {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BlenderError('请提供有效的工程参数对象。', 'BAD_REQUEST', 400)
  }
  const v = value as Record<string, unknown>
  const { defaults, strict = false } = options
  const pick = <K extends keyof BlenderProjectFields>(
    key: K,
    fallback: BlenderProjectFields[K],
  ): unknown => {
    if (v[key] !== undefined) return v[key]
    if (strict) return undefined
    if (defaults && defaults[key] !== undefined) return defaults[key]
    return fallback
  }

  const rawTemplate = pick('template', 'product-studio')
  if (typeof rawTemplate !== 'string' || !(BLENDER_TEMPLATE_IDS as readonly string[]).includes(rawTemplate)) {
    throw new BlenderError('请选择支持的 3D 模板。', 'TEMPLATE_INVALID', 400)
  }
  const template = rawTemplate as BlenderTemplateId

  const rawTitle = v.title !== undefined ? v.title : (!strict ? defaults?.title : undefined)
  if (typeof rawTitle !== 'string' || !rawTitle.trim() || rawTitle.trim().length > 72) {
    throw new BlenderError('工程标题需为 1–72 个字符。', 'TITLE_INVALID', 400)
  }
  const title = rawTitle.trim()

  const rawDescription = pick('description', '')
  if (typeof rawDescription !== 'string' || rawDescription.length > 600) {
    throw new BlenderError('工程描述不能超过 600 个字符。', 'DESCRIPTION_TOO_LONG', 400)
  }
  const description = rawDescription.trim()

  const rawHeadline = pick('headline', '')
  if (typeof rawHeadline !== 'string' || rawHeadline.length > 48) {
    throw new BlenderError('场景主标题文本不能超过 48 个字符。', 'HEADLINE_TOO_LONG', 400)
  }
  const headline = rawHeadline.trim()

  const rawEngine = pick('engine', 'EEVEE')
  if (typeof rawEngine !== 'string' || !(BLENDER_ENGINES as readonly string[]).includes(rawEngine)) {
    throw new BlenderError('渲染引擎必须为 EEVEE、CYCLES 或 WORKBENCH。', 'BAD_REQUEST', 400)
  }
  const engine = rawEngine as BlenderRenderEngine

  const defaultSamples = engine === 'CYCLES' ? 64 : engine === 'WORKBENCH' ? 16 : 32
  const rawSamples = pick('samples', defaultSamples)
  if (typeof rawSamples !== 'number' || !Number.isInteger(rawSamples) || rawSamples < 4 || rawSamples > 1024) {
    throw new BlenderError('采样数需为 4–1024 之间的整数。', 'SAMPLES_INVALID', 400)
  }
  const samples = rawSamples

  const rawAspect = pick('aspect', 'landscape')
  if (typeof rawAspect !== 'string' || !(BLENDER_ASPECTS as readonly string[]).includes(rawAspect)) {
    throw new BlenderError('画幅必须为 landscape、portrait 或 square。', 'BAD_REQUEST', 400)
  }
  const aspect = rawAspect as BlenderAspect

  const rawResolutionScale = pick('resolutionScale', 100)
  if (
    typeof rawResolutionScale !== 'number' ||
    !(BLENDER_RESOLUTION_SCALES as readonly number[]).includes(rawResolutionScale)
  ) {
    throw new BlenderError('分辨率倍率必须为 50、100、150 或 200。', 'BAD_REQUEST', 400)
  }
  const resolutionScale = rawResolutionScale

  const rawFps = pick('fps', 24)
  if (typeof rawFps !== 'number' || !(BLENDER_FPS_VALUES as readonly number[]).includes(rawFps)) {
    throw new BlenderError('帧率必须为 24、30 或 60。', 'BAD_REQUEST', 400)
  }
  const fps = rawFps as BlenderFps

  const rawFrameStart = pick('frameStart', 1)
  if (
    typeof rawFrameStart !== 'number' ||
    !Number.isInteger(rawFrameStart) ||
    rawFrameStart < 1 ||
    rawFrameStart > 100000
  ) {
    throw new BlenderError('起始帧必须为大于等于 1 的整数。', 'FRAMES_INVALID', 400)
  }
  const frameStart = rawFrameStart

  const defaultEnd = defaults?.frameEnd !== undefined ? defaults.frameEnd : Math.max(frameStart, 48)
  const rawFrameEnd = v.frameEnd !== undefined ? v.frameEnd : (!strict ? defaultEnd : undefined)
  if (
    typeof rawFrameEnd !== 'number' ||
    !Number.isInteger(rawFrameEnd) ||
    rawFrameEnd < frameStart ||
    rawFrameEnd > frameStart + 600
  ) {
    throw new BlenderError('结束帧需大于等于起始帧，且总跨度不超过 600 帧。', 'FRAMES_INVALID', 400)
  }
  const frameEnd = rawFrameEnd

  const rawCameraPreset = pick('cameraPreset', 'three_quarter')
  if (
    typeof rawCameraPreset !== 'string' ||
    !(BLENDER_CAMERA_PRESETS as readonly string[]).includes(rawCameraPreset)
  ) {
    throw new BlenderError('相机预设无效。', 'BAD_REQUEST', 400)
  }
  const cameraPreset = rawCameraPreset as BlenderCameraPreset

  const rawLightingPreset = pick('lightingPreset', 'studio_3point')
  if (
    typeof rawLightingPreset !== 'string' ||
    !(BLENDER_LIGHTING_PRESETS as readonly string[]).includes(rawLightingPreset)
  ) {
    throw new BlenderError('布光预设无效。', 'BAD_REQUEST', 400)
  }
  const lightingPreset = rawLightingPreset as BlenderLightingPreset

  const rawMaterialPreset = pick('materialPreset', 'ceramic_gloss')
  if (
    typeof rawMaterialPreset !== 'string' ||
    !(BLENDER_MATERIAL_PRESETS as readonly string[]).includes(rawMaterialPreset)
  ) {
    throw new BlenderError('材质预设无效。', 'BAD_REQUEST', 400)
  }
  const materialPreset = rawMaterialPreset as BlenderMaterialPreset

  const rawAccentColor = pick('accentColor', '#3B82F6')
  if (typeof rawAccentColor !== 'string' || !HEX_COLOR_RE.test(rawAccentColor.trim())) {
    throw new BlenderError('主题色必须为 #RRGGBB 十六进制颜色。', 'COLOR_INVALID', 400)
  }
  const accentColor = rawAccentColor.trim().toUpperCase()

  const rawTransparentBg = pick('transparentBg', false)
  if (typeof rawTransparentBg !== 'boolean') {
    throw new BlenderError('透明背景开关必须为布尔值。', 'BAD_REQUEST', 400)
  }
  const transparentBg = rawTransparentBg

  const rawScriptMode = pick('scriptMode', 'template')
  if (
    typeof rawScriptMode !== 'string' ||
    !(BLENDER_SCRIPT_MODES as readonly string[]).includes(rawScriptMode)
  ) {
    throw new BlenderError('脚本模式必须为 template 或 custom。', 'BAD_REQUEST', 400)
  }
  const scriptMode = rawScriptMode as BlenderScriptMode

  const rawCustomScript = pick('customScript', '')
  if (typeof rawCustomScript !== 'string') {
    throw new BlenderError('自定义脚本必须为字符串。', 'BAD_REQUEST', 400)
  }
  if (Buffer.byteLength(rawCustomScript, 'utf8') > MAX_CUSTOM_SCRIPT_BYTES) {
    throw new BlenderError('自定义 bpy 脚本不能超过 64 KB。', 'SCRIPT_TOO_LARGE', 400)
  }
  const customScript = rawCustomScript

  return {
    template,
    title,
    description,
    headline,
    engine,
    samples,
    aspect,
    resolutionScale,
    fps,
    frameStart,
    frameEnd,
    cameraPreset,
    lightingPreset,
    materialPreset,
    accentColor,
    transparentBg,
    scriptMode,
    customScript,
  }
}

export function validateExportFormat(value: unknown): BlenderExportFormat {
  if (typeof value !== 'string' || !(BLENDER_EXPORT_FORMATS as readonly string[]).includes(value)) {
    throw new BlenderError('导出格式必须为 glb、fbx、obj、stl 或 blend。', 'EXPORT_FORMAT_INVALID', 400)
  }
  return value as BlenderExportFormat
}

export function resolveRenderResolution(
  aspect: BlenderAspect,
  resolutionScale: number,
): { width: number; height: number } {
  const [baseW, baseH] = ASPECT_RESOLUTIONS[aspect] ?? ASPECT_RESOLUTIONS.landscape
  const factor = Math.max(0.25, Math.min(2, resolutionScale / 100))
  const toEven = (n: number) => Math.max(64, Math.round(n / 2) * 2)
  return {
    width: toEven(baseW * factor),
    height: toEven(baseH * factor),
  }
}

export function scrubLogText(text: string, maxLength = 1600): string {
  return String(text ?? '')
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, '$1[redacted]@')
    .replace(/(token|password|passwd|secret|authorization|api[_-]?key)(\s*[=:]\s*)[^\s,;'"`]+/gi, '$1$2[redacted]')
    .slice(0, maxLength)
}
