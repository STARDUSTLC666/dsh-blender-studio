export const BLENDER_TEMPLATE_IDS = [
    'product-studio',
    'logo-3d',
    'isometric-room',
    'motion-data',
    'grease-pencil-2d',
    'blank-stage',
    'architectural-pavilion',
    'procedural-abstract',
];
export const BLENDER_ENGINES = ['EEVEE', 'CYCLES', 'WORKBENCH'];
export const BLENDER_ASPECTS = ['landscape', 'portrait', 'square'];
export const BLENDER_RESOLUTION_SCALES = [50, 100, 150, 200];
export const BLENDER_FPS_VALUES = [24, 30, 60];
export const BLENDER_CAMERA_PRESETS = [
    'three_quarter',
    'front',
    'isometric',
    'top',
    'closeup',
    'turntable',
];
export const BLENDER_LIGHTING_PRESETS = [
    'studio_3point',
    'soft_daylight',
    'dramatic_rim',
    'neon_cyber',
    'clay_overcast',
];
export const BLENDER_MATERIAL_PRESETS = [
    'clay_matte',
    'brushed_metal',
    'frosted_glass',
    'ceramic_gloss',
    'toon_cel',
];
export const BLENDER_SCRIPT_MODES = ['template', 'custom'];
export const BLENDER_EXPORT_FORMATS = ['glb', 'fbx', 'obj', 'stl', 'blend'];
export const BLENDER_QUALITY_TIERS = ['draft', 'studio', 'beauty'];
export const BLENDER_COMPUTE_DEVICES = ['auto', 'gpu', 'cpu'];
export const BLENDER_ARTIFACT_KINDS = [
    'still',
    'contact_sheet',
    'shot',
    'animation',
    'glb',
    'fbx',
    'obj',
    'stl',
    'blend',
];
export const BLENDER_SHOT_PRESETS = [
    {
        id: 'hero_3q',
        zh: '主 3/4 视',
        en: 'Hero 3/4',
        lensMm: 58,
        azimuthDeg: 35,
        elevationDeg: 22,
        margin: 1.18,
    },
    {
        id: 'low_dramatic',
        zh: '低角度仰拍',
        en: 'Low Dramatic',
        lensMm: 35,
        azimuthDeg: -42,
        elevationDeg: 8,
        margin: 1.15,
    },
    {
        id: 'macro_dof',
        zh: '微距景深特写',
        en: 'Macro DOF',
        lensMm: 85,
        azimuthDeg: 22,
        elevationDeg: 14,
        margin: 0.78,
        dofFstop: 2.8,
    },
    {
        id: 'side_profile',
        zh: '正侧轮廓',
        en: 'Side Profile',
        lensMm: 70,
        azimuthDeg: 90,
        elevationDeg: 6,
        margin: 1.16,
    },
    {
        id: 'top_plan',
        zh: '正俯工程图',
        en: 'Top Plan',
        lensMm: 50,
        azimuthDeg: 0,
        elevationDeg: 86,
        margin: 1.18,
    },
];
export const DEFAULT_MULTI_SHOT_IDS = [
    'hero_3q',
    'low_dramatic',
    'macro_dof',
    'top_plan',
];
export const ASPECT_RESOLUTIONS = {
    landscape: [1280, 720],
    portrait: [720, 1280],
    square: [1024, 1024],
};
export const ARTIFACT_MIME_MAP = {
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
};
export const MAX_ACTIVE_PROJECTS = 30;
export const MAX_PROJECT_ASSETS = 24;
export const MAX_ASSET_BYTES = 50 * 1024 * 1024;
export const MAX_PROJECT_ASSETS_BYTES = 120 * 1024 * 1024;
export const MAX_PROJECT_ARTIFACTS = 20;
export const MAX_ARTIFACT_DOWNLOAD_BYTES = 200 * 1024 * 1024;
export const MAX_CUSTOM_SCRIPT_BYTES = 256 * 1024;
export const MAX_PROJECT_JSON_BYTES = 4 * 1024 * 1024;
export const MAX_SCRIPT_CHECKPOINTS = 10;
export const MAX_JOB_LOG_LINES = 80;
export const SCENE_JSON_MARKER = '__DSH_SCENE_JSON__=';
export const SHOT_DONE_MARKER = '__DSH_SHOT_DONE__=';
export const DEFAULT_BRIDGE_HOST = '127.0.0.1';
export const DEFAULT_BRIDGE_PORT = 9876;
const UUID_RE = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
export class BlenderError extends Error {
    code;
    status;
    constructor(message, code, status = 400) {
        super(message);
        this.code = code;
        this.status = status;
        this.name = 'BlenderError';
    }
}
export class BlenderConflict extends BlenderError {
    constructor(message) {
        super(message, 'CONFLICT', 409);
        this.name = 'BlenderConflict';
    }
}
export function blenderId(value) {
    if (typeof value !== 'string' || !UUID_RE.test(value)) {
        throw new BlenderError('项目、素材或任务编号无效。', 'ID_INVALID', 400);
    }
    return value;
}
export function sanitizeFileName(name, maxLength = 100) {
    const cleaned = String(name ?? '')
        .replace(/[\x00-\x1f\x7f<>:"/\\|?*]+/g, '_')
        .replace(/\.{2,}/g, '.')
        .replace(/^[\s._-]+/, '')
        .trim()
        .slice(0, maxLength);
    return cleaned || 'asset';
}
export function defaultProjectFields(overrides = {}) {
    const engine = overrides.engine ?? 'EEVEE';
    const defaultSamples = engine === 'CYCLES' ? 64 : engine === 'WORKBENCH' ? 16 : 32;
    const frameStart = overrides.frameStart ?? 1;
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
        lensMm: overrides.lensMm ?? 50,
        exposure: overrides.exposure ?? 0,
        clayMode: overrides.clayMode ?? false,
        scriptMode: overrides.scriptMode ?? 'template',
        customScript: overrides.customScript ?? '',
    };
}
export function validateProjectFields(value, options = {}) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new BlenderError('请提供有效的工程参数对象。', 'BAD_REQUEST', 400);
    }
    const v = value;
    const { defaults, strict = false } = options;
    const pick = (key, fallback) => {
        if (v[key] !== undefined)
            return v[key];
        if (strict)
            return undefined;
        if (defaults && defaults[key] !== undefined)
            return defaults[key];
        return fallback;
    };
    const rawTemplate = pick('template', 'product-studio');
    if (typeof rawTemplate !== 'string' || !BLENDER_TEMPLATE_IDS.includes(rawTemplate)) {
        throw new BlenderError('请选择支持的 3D 模板。', 'TEMPLATE_INVALID', 400);
    }
    const template = rawTemplate;
    const rawTitle = v.title !== undefined ? v.title : (!strict ? defaults?.title : undefined);
    if (typeof rawTitle !== 'string' || !rawTitle.trim() || rawTitle.trim().length > 72) {
        throw new BlenderError('工程标题需为 1–72 个字符。', 'TITLE_INVALID', 400);
    }
    const title = rawTitle.trim();
    const rawDescription = pick('description', '');
    if (typeof rawDescription !== 'string' || rawDescription.length > 600) {
        throw new BlenderError('工程描述不能超过 600 个字符。', 'DESCRIPTION_TOO_LONG', 400);
    }
    const description = rawDescription.trim();
    const rawHeadline = pick('headline', '');
    if (typeof rawHeadline !== 'string' || rawHeadline.length > 48) {
        throw new BlenderError('场景主标题文本不能超过 48 个字符。', 'HEADLINE_TOO_LONG', 400);
    }
    const headline = rawHeadline.trim();
    const rawEngine = pick('engine', 'EEVEE');
    if (typeof rawEngine !== 'string' || !BLENDER_ENGINES.includes(rawEngine)) {
        throw new BlenderError('渲染引擎必须为 EEVEE、CYCLES 或 WORKBENCH。', 'BAD_REQUEST', 400);
    }
    const engine = rawEngine;
    const defaultSamples = engine === 'CYCLES' ? 64 : engine === 'WORKBENCH' ? 16 : 32;
    const rawSamples = pick('samples', defaultSamples);
    if (typeof rawSamples !== 'number' || !Number.isInteger(rawSamples) || rawSamples < 4 || rawSamples > 1024) {
        throw new BlenderError('采样数需为 4–1024 之间的整数。', 'SAMPLES_INVALID', 400);
    }
    const samples = rawSamples;
    const rawAspect = pick('aspect', 'landscape');
    if (typeof rawAspect !== 'string' || !BLENDER_ASPECTS.includes(rawAspect)) {
        throw new BlenderError('画幅必须为 landscape、portrait 或 square。', 'BAD_REQUEST', 400);
    }
    const aspect = rawAspect;
    const rawResolutionScale = pick('resolutionScale', 100);
    if (typeof rawResolutionScale !== 'number' ||
        !BLENDER_RESOLUTION_SCALES.includes(rawResolutionScale)) {
        throw new BlenderError('分辨率倍率必须为 50、100、150 或 200。', 'BAD_REQUEST', 400);
    }
    const resolutionScale = rawResolutionScale;
    const rawFps = pick('fps', 24);
    if (typeof rawFps !== 'number' || !BLENDER_FPS_VALUES.includes(rawFps)) {
        throw new BlenderError('帧率必须为 24、30 或 60。', 'BAD_REQUEST', 400);
    }
    const fps = rawFps;
    const rawFrameStart = pick('frameStart', 1);
    if (typeof rawFrameStart !== 'number' ||
        !Number.isInteger(rawFrameStart) ||
        rawFrameStart < 1 ||
        rawFrameStart > 100000) {
        throw new BlenderError('起始帧必须为大于等于 1 的整数。', 'FRAMES_INVALID', 400);
    }
    const frameStart = rawFrameStart;
    const defaultEnd = defaults?.frameEnd !== undefined ? defaults.frameEnd : Math.max(frameStart, 48);
    const rawFrameEnd = v.frameEnd !== undefined ? v.frameEnd : (!strict ? defaultEnd : undefined);
    if (typeof rawFrameEnd !== 'number' ||
        !Number.isInteger(rawFrameEnd) ||
        rawFrameEnd < frameStart ||
        rawFrameEnd > frameStart + 600) {
        throw new BlenderError('结束帧需大于等于起始帧，且总跨度不超过 600 帧。', 'FRAMES_INVALID', 400);
    }
    const frameEnd = rawFrameEnd;
    const rawCameraPreset = pick('cameraPreset', 'three_quarter');
    if (typeof rawCameraPreset !== 'string' ||
        !BLENDER_CAMERA_PRESETS.includes(rawCameraPreset)) {
        throw new BlenderError('相机预设无效。', 'BAD_REQUEST', 400);
    }
    const cameraPreset = rawCameraPreset;
    const rawLightingPreset = pick('lightingPreset', 'studio_3point');
    if (typeof rawLightingPreset !== 'string' ||
        !BLENDER_LIGHTING_PRESETS.includes(rawLightingPreset)) {
        throw new BlenderError('布光预设无效。', 'BAD_REQUEST', 400);
    }
    const lightingPreset = rawLightingPreset;
    const rawMaterialPreset = pick('materialPreset', 'ceramic_gloss');
    if (typeof rawMaterialPreset !== 'string' ||
        !BLENDER_MATERIAL_PRESETS.includes(rawMaterialPreset)) {
        throw new BlenderError('材质预设无效。', 'BAD_REQUEST', 400);
    }
    const materialPreset = rawMaterialPreset;
    const rawAccentColor = pick('accentColor', '#3B82F6');
    if (typeof rawAccentColor !== 'string' || !HEX_COLOR_RE.test(rawAccentColor.trim())) {
        throw new BlenderError('主题色必须为 #RRGGBB 十六进制颜色。', 'COLOR_INVALID', 400);
    }
    const accentColor = rawAccentColor.trim().toUpperCase();
    const rawTransparentBg = pick('transparentBg', false);
    if (typeof rawTransparentBg !== 'boolean') {
        throw new BlenderError('透明背景开关必须为布尔值。', 'BAD_REQUEST', 400);
    }
    const transparentBg = rawTransparentBg;
    // Optional v0.4.0 live lookdev override fields stay backward-compatible with pre-0.4.0 project.json files even under strict: true
    const rawLensMm = v.lensMm !== undefined ? v.lensMm : (defaults?.lensMm ?? 50);
    if (typeof rawLensMm !== 'number' || !Number.isFinite(rawLensMm) || rawLensMm < 18 || rawLensMm > 135) {
        throw new BlenderError('相机焦段需在 18–135mm 之间。', 'LENS_INVALID', 400);
    }
    const lensMm = Math.round(rawLensMm * 10) / 10;
    const rawExposure = v.exposure !== undefined ? v.exposure : (defaults?.exposure ?? 0);
    if (typeof rawExposure !== 'number' || !Number.isFinite(rawExposure) || rawExposure < -3 || rawExposure > 3) {
        throw new BlenderError('画面曝光补偿需在 -3 至 +3 EV 之间。', 'EXPOSURE_INVALID', 400);
    }
    const exposure = Math.round(rawExposure * 100) / 100;
    const rawClayMode = v.clayMode !== undefined ? v.clayMode : (defaults?.clayMode ?? false);
    if (typeof rawClayMode !== 'boolean') {
        throw new BlenderError('白模体检开关必须为布尔值。', 'BAD_REQUEST', 400);
    }
    const clayMode = rawClayMode;
    const rawScriptMode = pick('scriptMode', 'template');
    if (typeof rawScriptMode !== 'string' ||
        !BLENDER_SCRIPT_MODES.includes(rawScriptMode)) {
        throw new BlenderError('脚本模式必须为 template 或 custom。', 'BAD_REQUEST', 400);
    }
    const scriptMode = rawScriptMode;
    const rawCustomScript = pick('customScript', '');
    if (typeof rawCustomScript !== 'string') {
        throw new BlenderError('自定义脚本必须为字符串。', 'BAD_REQUEST', 400);
    }
    if (Buffer.byteLength(rawCustomScript, 'utf8') > MAX_CUSTOM_SCRIPT_BYTES) {
        throw new BlenderError('自定义 bpy 脚本不能超过 256 KB。', 'SCRIPT_TOO_LARGE', 400);
    }
    const customScript = rawCustomScript;
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
        lensMm,
        exposure,
        clayMode,
        scriptMode,
        customScript,
    };
}
export function validateShotPresetIds(value) {
    if (value === undefined || value === null)
        return [...DEFAULT_MULTI_SHOT_IDS];
    if (!Array.isArray(value) || value.length === 0 || value.length > BLENDER_SHOT_PRESETS.length) {
        throw new BlenderError('分镜预设列表需包含 1–5 个有效分镜编号。', 'BAD_REQUEST', 400);
    }
    const validIds = new Set(BLENDER_SHOT_PRESETS.map(p => p.id));
    const seen = new Set();
    for (const item of value) {
        if (typeof item !== 'string' || !validIds.has(item)) {
            throw new BlenderError(`不支持的分镜机位预设：${String(item)}`, 'BAD_REQUEST', 400);
        }
        seen.add(item);
    }
    return [...seen];
}
export function validateExportFormat(value) {
    if (typeof value !== 'string' || !BLENDER_EXPORT_FORMATS.includes(value)) {
        throw new BlenderError('导出格式必须为 glb、fbx、obj、stl 或 blend。', 'EXPORT_FORMAT_INVALID', 400);
    }
    return value;
}
export function resolveRenderResolution(aspect, resolutionScale) {
    const [baseW, baseH] = ASPECT_RESOLUTIONS[aspect] ?? ASPECT_RESOLUTIONS.landscape;
    const factor = Math.max(0.25, Math.min(2, resolutionScale / 100));
    const toEven = (n) => Math.max(64, Math.round(n / 2) * 2);
    return {
        width: toEven(baseW * factor),
        height: toEven(baseH * factor),
    };
}
export function scrubLogText(text, maxLength = 1600) {
    return String(text ?? '')
        .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
        .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, '$1[redacted]@')
        .replace(/(token|password|passwd|secret|authorization|api[_-]?key)(\s*[=:]\s*)[^\s,;'"`]+/gi, '$1$2[redacted]')
        .slice(0, maxLength);
}
