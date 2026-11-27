import { randomUUID } from 'node:crypto';
import { lstat, mkdir, readdir, readFile, realpath, rename, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import lockfile from 'proper-lockfile';
import { BLENDER_ASPECTS, BLENDER_CAMERA_PRESETS, BLENDER_ENGINES, BLENDER_EXPORT_FORMATS, BLENDER_FPS_VALUES, BLENDER_LIGHTING_PRESETS, BLENDER_MATERIAL_PRESETS, BLENDER_QUALITY_TIERS, BLENDER_RESOLUTION_SCALES, BLENDER_WORKFLOW_REPLAYABLE_KINDS, BlenderError, blenderId, MAX_WORKFLOW_JSON_BYTES, MAX_WORKFLOW_RECIPES, MAX_WORKFLOW_STEPS, validateExportFormat, validateShotPresetIds, } from './types.js';
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const BUILTIN_ID_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
const REPLAYABLE_KIND_SET = new Set(BLENDER_WORKFLOW_REPLAYABLE_KINDS);
const LOOKDEV_ALLOWED_KEYS = new Set([
    'engine',
    'samples',
    'aspect',
    'resolutionScale',
    'fps',
    'frameStart',
    'frameEnd',
    'cameraPreset',
    'lightingPreset',
    'materialPreset',
    'accentColor',
    'transparentBg',
    'lensMm',
    'exposure',
    'clayMode',
]);
export const BUILTIN_WORKFLOW_RECIPES = [
    {
        id: 'aaa-product-lookdev-pack',
        schemaVersion: 1,
        name: '旗舰产品棚拍 Lookdev 全套',
        nameEn: 'AAA Product Studio Lookdev Pack',
        description: '标准 4 阶段商业棚拍流程：QC-3D 自动体检 → Draft 四视角构图审查 → Studio 多机位分镜组图 → Cycles 高画质成片 + GLB 导出。',
        descriptionEn: 'Standard 4-stage commercial studio workflow: QC-3D audit → Draft 4-view check → Studio 4-angle multi-shot pack → Cycles Beauty still + GLB export.',
        tags: ['lookdev', 'multi-shot', 'cycles', 'glb'],
        builtin: true,
        created: '2026-11-27T00:00:00.000Z',
        updated: '2026-11-27T00:00:00.000Z',
        steps: [
            {
                id: 'step-qc',
                kind: 'inspect_scene',
                label: 'QC-3D 结构与接地体检',
                labelEn: 'QC-3D Structure & Grounding Audit',
                enabled: true,
                params: { abortOnQcError: true },
            },
            {
                id: 'step-contact',
                kind: 'contact_sheet',
                label: 'Draft 2×2 四视角构图快检',
                labelEn: 'Draft 2×2 4-View Framing Check',
                enabled: true,
                params: { qualityTier: 'draft' },
            },
            {
                id: 'step-shots',
                kind: 'render_shots',
                label: 'Studio 多机位分镜组图（4 镜）',
                labelEn: 'Studio Multi-Shot Pack (4 Angles)',
                enabled: true,
                params: {
                    shots: ['hero_3q', 'low_dramatic', 'macro_dof', 'top_plan'],
                    qualityTier: 'studio',
                },
            },
            {
                id: 'step-beauty',
                kind: 'pipeline',
                label: 'Cycles Beauty 成品 + GLB 交付',
                labelEn: 'Cycles Beauty Still + GLB Delivery',
                enabled: true,
                params: {
                    qualityTier: 'beauty',
                    includeContactSheet: false,
                    renderKind: 'still',
                    exportFormat: 'glb',
                    abortOnQcError: true,
                },
            },
        ],
    },
    {
        id: 'clay-silhouette-audit',
        schemaVersion: 1,
        name: '白模轮廓与四视角体检流',
        nameEn: 'Clay Silhouette & 4-View Audit',
        description: '非破坏式开启中性黏土白模（clayMode）剥离材质干扰，依次运行 QC-3D、白模四视角拼图与三机位轮廓审校，不改动工程原始 PBR 材质配置。',
        descriptionEn: 'Non-destructively enables matte clay override to audit silhouette, proportions, and bevels via QC-3D, 4-view sheet, and 3-angle shots without modifying saved PBR materials.',
        tags: ['clay', 'qc', 'silhouette'],
        builtin: true,
        created: '2026-11-27T00:00:00.000Z',
        updated: '2026-11-27T00:00:00.000Z',
        steps: [
            {
                id: 'step-qc',
                kind: 'inspect_scene',
                label: 'QC-3D 场景结构与材质体检',
                labelEn: 'QC-3D Scene Structure & Material Audit',
                enabled: true,
                params: { abortOnQcError: true },
            },
            {
                id: 'step-contact',
                kind: 'contact_sheet',
                label: '白模四视角拼图（Draft · 非破坏覆盖）',
                labelEn: 'Clay 4-View Contact Sheet (Draft · Non-Destructive)',
                enabled: true,
                params: { qualityTier: 'draft', clayMode: true },
            },
            {
                id: 'step-shots',
                kind: 'render_shots',
                label: '白模三角度轮廓快检（非破坏覆盖）',
                labelEn: 'Clay 3-Angle Silhouette Check (Non-Destructive)',
                enabled: true,
                params: {
                    shots: ['hero_3q', 'side_profile', 'top_plan'],
                    qualityTier: 'draft',
                    clayMode: true,
                },
            },
        ],
    },
    {
        id: 'rapid-eevee-delivery',
        schemaVersion: 1,
        name: '极速 EEVEE 预览 + GLB/.blend 交付流',
        nameEn: 'Rapid EEVEE Preview + GLB/.blend Delivery',
        description: '适合高频方案评审：QC-3D 校验后输出 Studio EEVEE 静帧，并打包去背景 GLB 模型与完整可编辑 .blend 工程。',
        descriptionEn: 'Fast design review loop: QC-3D check, Studio EEVEE hero still, clean backdrop-stripped GLB model, and packed editable .blend archive.',
        tags: ['eevee', 'fast', 'glb', 'blend'],
        builtin: true,
        created: '2026-11-27T00:00:00.000Z',
        updated: '2026-11-27T00:00:00.000Z',
        steps: [
            {
                id: 'step-qc',
                kind: 'inspect_scene',
                label: 'QC-3D 快速校验',
                labelEn: 'QC-3D Fast Check',
                enabled: true,
                params: { abortOnQcError: true },
            },
            {
                id: 'step-still',
                kind: 'preview_still',
                label: 'Studio EEVEE 静帧预览',
                labelEn: 'Studio EEVEE Still Preview',
                enabled: true,
                params: { qualityTier: 'studio' },
            },
            {
                id: 'step-glb',
                kind: 'export_model',
                label: '导出干净 PBR GLB 模型',
                labelEn: 'Export Clean PBR GLB Model',
                enabled: true,
                params: { format: 'glb' },
            },
            {
                id: 'step-blend',
                kind: 'export_model',
                label: '打包完整 .blend 源文件',
                labelEn: 'Pack Full Editable .blend Source',
                enabled: true,
                params: { format: 'blend' },
            },
        ],
    },
    {
        id: 'cycles-hero-delivery',
        schemaVersion: 1,
        name: 'Cycles 高画质终版交付流',
        nameEn: 'Cycles Hero Beauty Delivery',
        description: '最终交付标准流程：先保存交付前脚本快照，再执行 Cycles OIDN Beauty 全流程（含四视角 + 主成片 + GLB），最后导出打包贴图的 .blend 归档。',
        descriptionEn: 'Final delivery workflow: save a pre-delivery script checkpoint, run Cycles OIDN Beauty pipeline (4-view + hero still + GLB), and export a packed .blend archive.',
        tags: ['cycles', 'beauty', 'delivery'],
        builtin: true,
        created: '2026-11-27T00:00:00.000Z',
        updated: '2026-11-27T00:00:00.000Z',
        steps: [
            {
                id: 'step-cp',
                kind: 'checkpoint_save',
                label: '保存终版交付前脚本快照',
                labelEn: 'Save Pre-Delivery Script Checkpoint',
                enabled: true,
                params: { note: 'Pre-delivery workflow snapshot' },
            },
            {
                id: 'step-pipeline',
                kind: 'pipeline',
                label: 'Cycles Beauty 全流程（四视角 + 成品 + GLB）',
                labelEn: 'Cycles Beauty Pipeline (4-View + Still + GLB)',
                enabled: true,
                params: {
                    qualityTier: 'beauty',
                    includeContactSheet: true,
                    renderKind: 'still',
                    exportFormat: 'glb',
                    abortOnQcError: true,
                },
            },
            {
                id: 'step-blend',
                kind: 'export_model',
                label: '导出完整 .blend 工程包',
                labelEn: 'Export Packed .blend Package',
                enabled: true,
                params: { format: 'blend' },
            },
        ],
    },
];
export function isReplayableWorkflowKind(kind) {
    return REPLAYABLE_KIND_SET.has(kind);
}
export function defaultStepLabel(kind, params = {}) {
    switch (kind) {
        case 'lookdev_update': {
            const fields = (params.fields && typeof params.fields === 'object' ? params.fields : params);
            const keys = Object.keys(fields).filter(k => LOOKDEV_ALLOWED_KEYS.has(k));
            return keys.length ? `调整 Lookdev（${keys.slice(0, 4).join(' / ')}）` : '调整 Lookdev 参数';
        }
        case 'script_patch': {
            const note = typeof params.note === 'string' && params.note.trim() ? params.note.trim() : '';
            return note ? `脚本补丁：${note.slice(0, 48)}` : '应用局部脚本补丁';
        }
        case 'checkpoint_save': {
            const note = typeof params.note === 'string' && params.note.trim() ? params.note.trim() : '';
            return note ? `保存快照：${note.slice(0, 48)}` : '保存脚本快照';
        }
        case 'inspect_scene':
            return 'QC-3D 场景体检';
        case 'preview_still':
            return params.qualityTier ? `静帧渲染（${String(params.qualityTier)}）` : '静帧预览渲染';
        case 'contact_sheet':
            return params.qualityTier ? `四视角 QC 拼图（${String(params.qualityTier)}）` : '2×2 四视角 QC 拼图';
        case 'render_shots': {
            const shots = Array.isArray(params.shots) ? params.shots : [];
            return `多机位分镜批量渲染（${shots.length || 4} 镜）`;
        }
        case 'render_animation':
            return '渲染动画序列';
        case 'export_model':
            return `导出 3D 模型（${String(params.format || 'glb').toUpperCase()}）`;
        case 'pipeline':
            return `一键全流程（${String(params.qualityTier || 'default')}）`;
        case 'bridge_sync':
            return 'Live Bridge 同步工程';
        case 'bridge_set_camera':
            return 'Live Bridge 调整相机';
        case 'bridge_transform_object':
            return `Live Bridge 变换对象${typeof params.name === 'string' ? ` ${params.name}` : ''}`;
        case 'bridge_set_material':
            return `Live Bridge 调整材质${typeof params.materialName === 'string' ? ` ${params.materialName}` : ''}`;
    }
}
function validateLookdevFields(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new BlenderError('lookdev_update 步骤缺少有效的 fields 参数对象。', 'WORKFLOW_INVALID', 400);
    }
    const src = raw;
    const out = {};
    for (const [k, v] of Object.entries(src)) {
        if (!LOOKDEV_ALLOWED_KEYS.has(k) || v === undefined)
            continue;
        switch (k) {
            case 'engine':
                if (typeof v !== 'string' || !BLENDER_ENGINES.includes(v)) {
                    throw new BlenderError(`lookdev_update 引擎无效：${String(v)}`, 'WORKFLOW_INVALID', 400);
                }
                out.engine = v;
                break;
            case 'samples':
                if (typeof v !== 'number' || !Number.isInteger(v) || v < 4 || v > 1024) {
                    throw new BlenderError('lookdev_update samples 需为 4–1024 的整数。', 'WORKFLOW_INVALID', 400);
                }
                out.samples = v;
                break;
            case 'aspect':
                if (typeof v !== 'string' || !BLENDER_ASPECTS.includes(v)) {
                    throw new BlenderError(`lookdev_update aspect 无效：${String(v)}`, 'WORKFLOW_INVALID', 400);
                }
                out.aspect = v;
                break;
            case 'resolutionScale':
                if (typeof v !== 'number' || !BLENDER_RESOLUTION_SCALES.includes(v)) {
                    throw new BlenderError('lookdev_update resolutionScale 需为 50/100/150/200。', 'WORKFLOW_INVALID', 400);
                }
                out.resolutionScale = v;
                break;
            case 'fps':
                if (typeof v !== 'number' || !BLENDER_FPS_VALUES.includes(v)) {
                    throw new BlenderError('lookdev_update fps 需为 24/30/60。', 'WORKFLOW_INVALID', 400);
                }
                out.fps = v;
                break;
            case 'frameStart':
            case 'frameEnd':
                if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 100000) {
                    throw new BlenderError(`lookdev_update ${k} 需为正整数。`, 'WORKFLOW_INVALID', 400);
                }
                out[k] = v;
                break;
            case 'cameraPreset':
                if (typeof v !== 'string' || !BLENDER_CAMERA_PRESETS.includes(v)) {
                    throw new BlenderError(`lookdev_update cameraPreset 无效：${String(v)}`, 'WORKFLOW_INVALID', 400);
                }
                out.cameraPreset = v;
                break;
            case 'lightingPreset':
                if (typeof v !== 'string' || !BLENDER_LIGHTING_PRESETS.includes(v)) {
                    throw new BlenderError(`lookdev_update lightingPreset 无效：${String(v)}`, 'WORKFLOW_INVALID', 400);
                }
                out.lightingPreset = v;
                break;
            case 'materialPreset':
                if (typeof v !== 'string' || !BLENDER_MATERIAL_PRESETS.includes(v)) {
                    throw new BlenderError(`lookdev_update materialPreset 无效：${String(v)}`, 'WORKFLOW_INVALID', 400);
                }
                out.materialPreset = v;
                break;
            case 'accentColor':
                if (typeof v !== 'string' || !HEX_COLOR_RE.test(v.trim())) {
                    throw new BlenderError('lookdev_update accentColor 需为 #RRGGBB。', 'WORKFLOW_INVALID', 400);
                }
                out.accentColor = v.trim().toUpperCase();
                break;
            case 'transparentBg':
            case 'clayMode':
                if (typeof v !== 'boolean') {
                    throw new BlenderError(`lookdev_update ${k} 必须为布尔值。`, 'WORKFLOW_INVALID', 400);
                }
                out[k] = v;
                break;
            case 'lensMm':
                if (typeof v !== 'number' || !Number.isFinite(v) || v < 18 || v > 135) {
                    throw new BlenderError('lookdev_update lensMm 需在 18–135mm 之间。', 'WORKFLOW_INVALID', 400);
                }
                out.lensMm = Math.round(v * 10) / 10;
                break;
            case 'exposure':
                if (typeof v !== 'number' || !Number.isFinite(v) || v < -3 || v > 3) {
                    throw new BlenderError('lookdev_update exposure 需在 -3 至 +3 之间。', 'WORKFLOW_INVALID', 400);
                }
                out.exposure = Math.round(v * 100) / 100;
                break;
        }
    }
    if (Object.keys(out).length === 0) {
        throw new BlenderError('lookdev_update 步骤至少需要一个有效的 Lookdev 字段。', 'WORKFLOW_INVALID', 400);
    }
    if (typeof out.frameStart === 'number' &&
        typeof out.frameEnd === 'number' &&
        out.frameEnd < out.frameStart) {
        throw new BlenderError('lookdev_update 中 frameEnd 不能小于 frameStart。', 'WORKFLOW_INVALID', 400);
    }
    return out;
}
export function validateWorkflowReplayOverrides(raw) {
    if (raw === undefined || raw === null)
        return {};
    if (typeof raw !== 'object' || Array.isArray(raw)) {
        throw new BlenderError('工作流重放 overrides 必须为对象。', 'WORKFLOW_INVALID', 400);
    }
    const obj = raw;
    const out = {};
    if (obj.accentColor !== undefined) {
        if (typeof obj.accentColor !== 'string' || !HEX_COLOR_RE.test(obj.accentColor.trim())) {
            throw new BlenderError('overrides.accentColor 需为 #RRGGBB 十六进制颜色。', 'WORKFLOW_INVALID', 400);
        }
        out.accentColor = obj.accentColor.trim().toUpperCase();
    }
    if (obj.lensMm !== undefined) {
        if (typeof obj.lensMm !== 'number' || !Number.isFinite(obj.lensMm) || obj.lensMm < 18 || obj.lensMm > 135) {
            throw new BlenderError('overrides.lensMm 需为 18–135mm 的有限数值。', 'WORKFLOW_INVALID', 400);
        }
        out.lensMm = Math.round(obj.lensMm * 10) / 10;
    }
    if (obj.exposure !== undefined) {
        if (typeof obj.exposure !== 'number' || !Number.isFinite(obj.exposure) || obj.exposure < -3 || obj.exposure > 3) {
            throw new BlenderError('overrides.exposure 需为 -3 至 +3 的有限数值。', 'WORKFLOW_INVALID', 400);
        }
        out.exposure = Math.round(obj.exposure * 100) / 100;
    }
    if (obj.clayMode !== undefined) {
        if (typeof obj.clayMode !== 'boolean') {
            throw new BlenderError('overrides.clayMode 必须为布尔值。', 'WORKFLOW_INVALID', 400);
        }
        out.clayMode = obj.clayMode;
    }
    if (obj.qualityTier !== undefined) {
        if (typeof obj.qualityTier !== 'string' ||
            !BLENDER_QUALITY_TIERS.includes(obj.qualityTier)) {
            throw new BlenderError(`overrides.qualityTier 无效：${String(obj.qualityTier)}`, 'WORKFLOW_INVALID', 400);
        }
        out.qualityTier = obj.qualityTier;
    }
    if (obj.exportFormat !== undefined) {
        if (typeof obj.exportFormat !== 'string' ||
            !BLENDER_EXPORT_FORMATS.includes(obj.exportFormat)) {
            throw new BlenderError(`overrides.exportFormat 无效：${String(obj.exportFormat)}`, 'WORKFLOW_INVALID', 400);
        }
        out.exportFormat = obj.exportFormat;
    }
    return out;
}
export function isWorkflowEventReplayable(ev) {
    if (!ev || !isReplayableWorkflowKind(ev.kind))
        return false;
    const params = ev.params && typeof ev.params === 'object' ? ev.params : {};
    if (ev.kind === 'script_patch') {
        const hasEdits = Array.isArray(params.edits) && params.edits.length > 0;
        const hasFind = typeof params.find === 'string' && params.find.length > 0 && typeof params.replace === 'string';
        return hasEdits || hasFind;
    }
    if (ev.kind === 'lookdev_update') {
        const fields = (params.fields && typeof params.fields === 'object' ? params.fields : params);
        return Object.keys(fields).some(k => LOOKDEV_ALLOWED_KEYS.has(k));
    }
    return true;
}
function validateFrameOptional(v, stepNum) {
    if (v === undefined)
        return undefined;
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 100000) {
        throw new BlenderError(`第 ${stepNum} 步 frame 需为 1–100000 的正整数。`, 'WORKFLOW_INVALID', 400);
    }
    return v;
}
function validateClayModeOptional(v, stepNum) {
    if (v === undefined)
        return undefined;
    if (typeof v !== 'boolean') {
        throw new BlenderError(`第 ${stepNum} 步 clayMode 必须为布尔值。`, 'WORKFLOW_INVALID', 400);
    }
    return v;
}
function validateVec3Optional(v, label) {
    if (v === undefined)
        return undefined;
    if (!Array.isArray(v) || v.length !== 3 || v.some(x => typeof x !== 'number' || !Number.isFinite(x))) {
        throw new BlenderError(`${label} 需为 3 元有限数值数组 [x, y, z]。`, 'WORKFLOW_INVALID', 400);
    }
    return [v[0], v[1], v[2]];
}
export function validateWorkflowStep(raw, index) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new BlenderError(`工作流第 ${index + 1} 步格式无效。`, 'WORKFLOW_INVALID', 400);
    }
    const obj = raw;
    const kind = obj.kind;
    if (typeof kind !== 'string' || !isReplayableWorkflowKind(kind)) {
        throw new BlenderError(`工作流第 ${index + 1} 步类型不支持：${String(kind)}`, 'WORKFLOW_INVALID', 400);
    }
    const rawParams = obj.params && typeof obj.params === 'object' && !Array.isArray(obj.params)
        ? obj.params
        : {};
    const cleanParams = {};
    switch (kind) {
        case 'lookdev_update': {
            const fieldsSource = rawParams.fields && typeof rawParams.fields === 'object' && !Array.isArray(rawParams.fields)
                ? rawParams.fields
                : rawParams;
            cleanParams.fields = validateLookdevFields(fieldsSource);
            break;
        }
        case 'script_patch': {
            if (Array.isArray(rawParams.edits) && rawParams.edits.length > 0) {
                if (rawParams.edits.length > 50) {
                    throw new BlenderError(`第 ${index + 1} 步 script_patch 最多包含 50 组补丁。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.edits = rawParams.edits.map((item, idx) => {
                    if (!item || typeof item !== 'object' || typeof item.find !== 'string' || !item.find.length || typeof item.replace !== 'string') {
                        throw new BlenderError(`第 ${index + 1} 步 script_patch.edits[${idx}] 需要非空 find 与 replace。`, 'WORKFLOW_INVALID', 400);
                    }
                    return {
                        find: item.find,
                        replace: item.replace,
                        ...(item.replaceAll === true ? { replaceAll: true } : {}),
                    };
                });
            }
            else if (typeof rawParams.find === 'string' && rawParams.find.length > 0 && typeof rawParams.replace === 'string') {
                cleanParams.find = rawParams.find;
                cleanParams.replace = rawParams.replace;
                if (rawParams.replaceAll === true)
                    cleanParams.replaceAll = true;
            }
            else {
                throw new BlenderError(`第 ${index + 1} 步 script_patch 需要 find/replace 或 edits 数组。`, 'WORKFLOW_INVALID', 400);
            }
            if (typeof rawParams.note === 'string' && rawParams.note.trim()) {
                cleanParams.note = rawParams.note.trim().slice(0, 120);
            }
            break;
        }
        case 'checkpoint_save': {
            if (typeof rawParams.note === 'string' && rawParams.note.trim()) {
                cleanParams.note = rawParams.note.trim().slice(0, 120);
            }
            break;
        }
        case 'inspect_scene': {
            if (typeof rawParams.abortOnQcError === 'boolean')
                cleanParams.abortOnQcError = rawParams.abortOnQcError;
            break;
        }
        case 'preview_still':
        case 'contact_sheet': {
            if (rawParams.qualityTier !== undefined) {
                if (typeof rawParams.qualityTier !== 'string' || !BLENDER_QUALITY_TIERS.includes(rawParams.qualityTier)) {
                    throw new BlenderError(`第 ${index + 1} 步 qualityTier 无效。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.qualityTier = rawParams.qualityTier;
            }
            const frame = validateFrameOptional(rawParams.frame, index + 1);
            if (frame !== undefined)
                cleanParams.frame = frame;
            const clayMode = validateClayModeOptional(rawParams.clayMode, index + 1);
            if (clayMode !== undefined)
                cleanParams.clayMode = clayMode;
            break;
        }
        case 'render_shots': {
            if (rawParams.shots !== undefined) {
                cleanParams.shots = validateShotPresetIds(rawParams.shots);
            }
            if (rawParams.qualityTier !== undefined) {
                if (typeof rawParams.qualityTier !== 'string' || !BLENDER_QUALITY_TIERS.includes(rawParams.qualityTier)) {
                    throw new BlenderError(`第 ${index + 1} 步 qualityTier 无效。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.qualityTier = rawParams.qualityTier;
            }
            const frame = validateFrameOptional(rawParams.frame, index + 1);
            if (frame !== undefined)
                cleanParams.frame = frame;
            const clayMode = validateClayModeOptional(rawParams.clayMode, index + 1);
            if (clayMode !== undefined)
                cleanParams.clayMode = clayMode;
            break;
        }
        case 'render_animation': {
            const clayMode = validateClayModeOptional(rawParams.clayMode, index + 1);
            if (clayMode !== undefined)
                cleanParams.clayMode = clayMode;
            break;
        }
        case 'export_model': {
            cleanParams.format = validateExportFormat(rawParams.format ?? 'glb');
            break;
        }
        case 'pipeline': {
            if (typeof rawParams.includeContactSheet === 'boolean') {
                cleanParams.includeContactSheet = rawParams.includeContactSheet;
            }
            if (rawParams.renderKind !== undefined) {
                if (rawParams.renderKind !== 'still' && rawParams.renderKind !== 'animation') {
                    throw new BlenderError(`第 ${index + 1} 步 renderKind 无效。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.renderKind = rawParams.renderKind;
            }
            if (rawParams.exportFormat !== undefined) {
                if (rawParams.exportFormat !== 'none')
                    validateExportFormat(rawParams.exportFormat);
                cleanParams.exportFormat = rawParams.exportFormat;
            }
            if (rawParams.qualityTier !== undefined) {
                if (typeof rawParams.qualityTier !== 'string' || !BLENDER_QUALITY_TIERS.includes(rawParams.qualityTier)) {
                    throw new BlenderError(`第 ${index + 1} 步 qualityTier 无效。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.qualityTier = rawParams.qualityTier;
            }
            if (typeof rawParams.abortOnQcError === 'boolean') {
                cleanParams.abortOnQcError = rawParams.abortOnQcError;
            }
            const frame = validateFrameOptional(rawParams.frame, index + 1);
            if (frame !== undefined)
                cleanParams.frame = frame;
            const clayMode = validateClayModeOptional(rawParams.clayMode, index + 1);
            if (clayMode !== undefined)
                cleanParams.clayMode = clayMode;
            break;
        }
        case 'bridge_sync': {
            if (typeof rawParams.clearScene === 'boolean')
                cleanParams.clearScene = rawParams.clearScene;
            break;
        }
        case 'bridge_set_camera': {
            const loc = validateVec3Optional(rawParams.location, 'location');
            const tgt = validateVec3Optional(rawParams.target, 'target');
            if (loc)
                cleanParams.location = loc;
            if (tgt)
                cleanParams.target = tgt;
            if (rawParams.lensMm !== undefined) {
                if (typeof rawParams.lensMm !== 'number' || !Number.isFinite(rawParams.lensMm) || rawParams.lensMm < 10 || rawParams.lensMm > 300) {
                    throw new BlenderError(`第 ${index + 1} 步 bridge_set_camera lensMm 需在 10–300mm 之间。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.lensMm = rawParams.lensMm;
            }
            if (rawParams.dofFstop !== undefined) {
                if (typeof rawParams.dofFstop !== 'number' || !Number.isFinite(rawParams.dofFstop) || rawParams.dofFstop < 0.7 || rawParams.dofFstop > 64) {
                    throw new BlenderError(`第 ${index + 1} 步 bridge_set_camera dofFstop 需在 0.7–64 之间。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.dofFstop = rawParams.dofFstop;
            }
            if (Object.keys(cleanParams).length === 0) {
                throw new BlenderError(`第 ${index + 1} 步 bridge_set_camera 至少需要提供 location、target、lensMm 或 dofFstop 之一。`, 'WORKFLOW_INVALID', 400);
            }
            break;
        }
        case 'bridge_transform_object': {
            if (typeof rawParams.name !== 'string' || !rawParams.name.trim()) {
                throw new BlenderError(`第 ${index + 1} 步 bridge_transform_object 缺少对象名称 name。`, 'WORKFLOW_INVALID', 400);
            }
            cleanParams.name = rawParams.name.trim().slice(0, 128);
            const loc = validateVec3Optional(rawParams.location, 'location');
            const rot = validateVec3Optional(rawParams.rotationDeg, 'rotationDeg');
            const scl = validateVec3Optional(rawParams.scale, 'scale');
            if (loc)
                cleanParams.location = loc;
            if (rot)
                cleanParams.rotationDeg = rot;
            if (scl)
                cleanParams.scale = scl;
            if (!loc && !rot && !scl) {
                throw new BlenderError(`第 ${index + 1} 步 bridge_transform_object 至少需要提供 location、rotationDeg 或 scale 之一。`, 'WORKFLOW_INVALID', 400);
            }
            break;
        }
        case 'bridge_set_material': {
            if (typeof rawParams.materialName !== 'string' || !rawParams.materialName.trim()) {
                throw new BlenderError(`第 ${index + 1} 步 bridge_set_material 缺少材质名称 materialName。`, 'WORKFLOW_INVALID', 400);
            }
            if (typeof rawParams.color !== 'string' || !HEX_COLOR_RE.test(rawParams.color.trim())) {
                throw new BlenderError(`第 ${index + 1} 步 bridge_set_material 缺少有效 #RRGGBB 颜色。`, 'WORKFLOW_INVALID', 400);
            }
            cleanParams.materialName = rawParams.materialName.trim().slice(0, 128);
            cleanParams.color = rawParams.color.trim().toUpperCase();
            if (rawParams.metallic !== undefined) {
                if (typeof rawParams.metallic !== 'number' || !Number.isFinite(rawParams.metallic) || rawParams.metallic < 0 || rawParams.metallic > 1) {
                    throw new BlenderError(`第 ${index + 1} 步 bridge_set_material metallic 需在 0–1 之间。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.metallic = rawParams.metallic;
            }
            if (rawParams.roughness !== undefined) {
                if (typeof rawParams.roughness !== 'number' || !Number.isFinite(rawParams.roughness) || rawParams.roughness < 0 || rawParams.roughness > 1) {
                    throw new BlenderError(`第 ${index + 1} 步 bridge_set_material roughness 需在 0–1 之间。`, 'WORKFLOW_INVALID', 400);
                }
                cleanParams.roughness = rawParams.roughness;
            }
            break;
        }
    }
    const stepId = typeof obj.id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(obj.id.trim())
        ? obj.id.trim()
        : `step-${index + 1}-${randomUUID().slice(0, 8)}`;
    const label = typeof obj.label === 'string' && obj.label.trim()
        ? obj.label.trim().slice(0, 100)
        : defaultStepLabel(kind, cleanParams);
    return {
        id: stepId,
        kind,
        label,
        enabled: obj.enabled !== false,
        params: cleanParams,
    };
}
export function validateWorkflowRecipeInput(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new BlenderError('请提供有效的工作流配方 JSON 对象。', 'WORKFLOW_INVALID', 400);
    }
    const obj = raw;
    if (obj.schemaVersion !== undefined && obj.schemaVersion !== 1) {
        throw new BlenderError(`不支持的工作流配方版本：${String(obj.schemaVersion)}（仅支持 schemaVersion: 1）。`, 'WORKFLOW_INVALID', 400);
    }
    const rawName = typeof obj.name === 'string' ? obj.name.trim() : '';
    if (!rawName || rawName.length > 72) {
        throw new BlenderError('工作流名称需为 1–72 个字符。', 'WORKFLOW_INVALID', 400);
    }
    const rawDesc = typeof obj.description === 'string' ? obj.description.trim() : '';
    if (rawDesc.length > 400) {
        throw new BlenderError('工作流描述不能超过 400 个字符。', 'WORKFLOW_INVALID', 400);
    }
    const tags = [];
    if (Array.isArray(obj.tags)) {
        for (const item of obj.tags) {
            if (typeof item === 'string' && item.trim()) {
                const clean = item.trim().toLowerCase().slice(0, 24);
                if (!tags.includes(clean))
                    tags.push(clean);
                if (tags.length >= 8)
                    break;
            }
        }
    }
    if (!Array.isArray(obj.steps) || obj.steps.length === 0) {
        throw new BlenderError('工作流至少需要包含 1 个可重放步骤。', 'WORKFLOW_INVALID', 400);
    }
    if (obj.steps.length > MAX_WORKFLOW_STEPS) {
        throw new BlenderError(`单个工作流最多包含 ${MAX_WORKFLOW_STEPS} 个步骤。`, 'WORKFLOW_INVALID', 400);
    }
    const steps = obj.steps.map((s, idx) => validateWorkflowStep(s, idx));
    const byteSize = Buffer.byteLength(JSON.stringify({ name: rawName, description: rawDesc, tags, steps }), 'utf8');
    if (byteSize > MAX_WORKFLOW_JSON_BYTES) {
        throw new BlenderError('工作流配方 JSON 体积超过 256 KB 上限。', 'WORKFLOW_INVALID', 400);
    }
    const sourceProjectId = typeof obj.sourceProjectId === 'string' && obj.sourceProjectId.trim() ? obj.sourceProjectId.trim().slice(0, 64) : undefined;
    const sourceProjectTitle = typeof obj.sourceProjectTitle === 'string' && obj.sourceProjectTitle.trim() ? obj.sourceProjectTitle.trim().slice(0, 72) : undefined;
    return {
        name: rawName,
        description: rawDesc,
        tags,
        steps,
        ...(sourceProjectId ? { sourceProjectId } : {}),
        ...(sourceProjectTitle ? { sourceProjectTitle } : {}),
    };
}
export function buildRecipeFromHistory(events, options) {
    const selectedIds = Array.isArray(options.eventIds) && options.eventIds.length > 0 ? new Set(options.eventIds) : null;
    const includeScriptPatches = options.includeScriptPatches !== false;
    const coalesceLookdev = options.coalesceLookdev !== false;
    const candidateSteps = [];
    for (const ev of events) {
        if (!ev || !isReplayableWorkflowKind(ev.kind))
            continue;
        if (selectedIds && !selectedIds.has(ev.id))
            continue;
        if (!selectedIds && ev.status !== 'ok')
            continue;
        if (ev.kind === 'script_patch' && !includeScriptPatches)
            continue;
        const params = ev.params && typeof ev.params === 'object' ? structuredClone(ev.params) : {};
        if (ev.kind === 'script_patch') {
            const hasEdits = Array.isArray(params.edits) && params.edits.length > 0;
            const hasFind = typeof params.find === 'string' && params.find.length > 0 && typeof params.replace === 'string';
            if (!hasEdits && !hasFind)
                continue;
        }
        if (ev.kind === 'lookdev_update') {
            const fields = (params.fields && typeof params.fields === 'object' ? params.fields : params);
            const validKeys = Object.keys(fields).filter(k => LOOKDEV_ALLOWED_KEYS.has(k));
            if (validKeys.length === 0)
                continue;
            const filtered = {};
            for (const k of validKeys)
                filtered[k] = fields[k];
            if (coalesceLookdev && candidateSteps.length > 0 && candidateSteps.at(-1).kind === 'lookdev_update') {
                const prev = candidateSteps.at(-1);
                const prevFields = prev.params.fields || {};
                prev.params = { fields: { ...prevFields, ...filtered } };
                prev.label = defaultStepLabel('lookdev_update', prev.params);
                continue;
            }
            candidateSteps.push({ kind: 'lookdev_update', label: ev.label, params: { fields: filtered } });
            continue;
        }
        candidateSteps.push({
            kind: ev.kind,
            label: ev.label,
            params,
        });
    }
    if (candidateSteps.length === 0) {
        throw new BlenderError('当前工程录制记录中没有可提取的可重放步骤（请先执行 Lookdev 调整、脚本补丁、QC 体检、渲染或导出操作）。', 'WORKFLOW_INVALID', 400);
    }
    const trimmedSteps = candidateSteps.slice(-MAX_WORKFLOW_STEPS);
    const autoTags = [...new Set(trimmedSteps.map(s => {
            if (s.kind === 'lookdev_update')
                return 'lookdev';
            if (s.kind === 'script_patch')
                return 'script';
            if (s.kind === 'render_shots')
                return 'multi-shot';
            if (s.kind === 'contact_sheet' || s.kind === 'inspect_scene')
                return 'qc';
            if (s.kind === 'export_model')
                return String(s.params.format || 'export');
            if (s.kind.startsWith('bridge_'))
                return 'bridge';
            return s.kind;
        }))].slice(0, 6);
    return validateWorkflowRecipeInput({
        schemaVersion: 1,
        name: options.name,
        description: options.description?.trim() ||
            `从工程「${options.sourceProjectTitle || '3D 工程'}」录制提取的 ${trimmedSteps.length} 步可复用工作流。`,
        tags: Array.isArray(options.tags) && options.tags.length > 0 ? options.tags : autoTags,
        steps: trimmedSteps,
        sourceProjectId: options.sourceProjectId,
        sourceProjectTitle: options.sourceProjectTitle,
    });
}
export function summarizeWorkflowRecipe(recipe) {
    return {
        id: recipe.id,
        name: recipe.name,
        ...(recipe.nameEn ? { nameEn: recipe.nameEn } : {}),
        description: recipe.description,
        ...(recipe.descriptionEn ? { descriptionEn: recipe.descriptionEn } : {}),
        tags: [...recipe.tags],
        ...(recipe.builtin ? { builtin: true } : {}),
        stepCount: recipe.steps.length,
        stepKinds: recipe.steps.map(s => s.kind),
        ...(recipe.sourceProjectId ? { sourceProjectId: recipe.sourceProjectId } : {}),
        ...(recipe.sourceProjectTitle ? { sourceProjectTitle: recipe.sourceProjectTitle } : {}),
        created: recipe.created,
        updated: recipe.updated,
    };
}
export function extractLookdevDiff(before, after) {
    const diff = {};
    for (const key of LOOKDEV_ALLOWED_KEYS) {
        if (after[key] !== undefined && before[key] !== after[key]) {
            diff[key] = after[key];
        }
    }
    return diff;
}
export class BlenderWorkflowStore {
    root;
    dir;
    constructor(root) {
        this.root = resolve(root ?? join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'data', 'dsh-blender-studio'));
        this.dir = join(this.root, 'workflows');
    }
    async ensureDir() {
        await mkdir(this.dir, { recursive: true, mode: 0o700 });
        const st = await lstat(this.dir);
        if (st.isSymbolicLink() || !st.isDirectory()) {
            throw new BlenderError('工作流存储目录安全校验失败。', 'STORAGE_UNSAFE', 400);
        }
    }
    recipeFile(id) {
        const validId = blenderId(id);
        const file = resolve(this.dir, `${validId}.json`);
        const rel = relative(this.dir, file);
        if (rel.startsWith('..') || rel.includes('/') || rel.includes('\\')) {
            throw new BlenderError('工作流路径不合法。', 'STORAGE_UNSAFE', 400);
        }
        return file;
    }
    async assertSafeFile(filePath) {
        const dirReal = await realpath(this.dir);
        const st = await lstat(filePath);
        if (st.isSymbolicLink() || !st.isFile()) {
            throw new BlenderError('工作流文件安全校验失败。', 'STORAGE_UNSAFE', 400);
        }
        const fileReal = await realpath(filePath);
        const rel = relative(dirReal, fileReal);
        if (rel.startsWith('..')) {
            throw new BlenderError('工作流文件逃逸存储目录。', 'STORAGE_UNSAFE', 400);
        }
    }
    getBuiltin(id) {
        const found = BUILTIN_WORKFLOW_RECIPES.find(r => r.id === id);
        return found ? structuredClone(found) : undefined;
    }
    async list() {
        const userRecipes = await this.listUserRecipes();
        return [
            ...userRecipes.map(summarizeWorkflowRecipe),
            ...BUILTIN_WORKFLOW_RECIPES.map(summarizeWorkflowRecipe),
        ];
    }
    async listFull() {
        const userRecipes = await this.listUserRecipes();
        return [...userRecipes, ...BUILTIN_WORKFLOW_RECIPES.map(r => structuredClone(r))];
    }
    async listUserRecipes() {
        await this.ensureDir();
        const entries = await readdir(this.dir, { withFileTypes: true }).catch(() => []);
        const recipes = [];
        for (const entry of entries) {
            if (!entry.isFile() || !entry.name.endsWith('.json'))
                continue;
            const id = entry.name.slice(0, -5);
            try {
                blenderId(id);
            }
            catch {
                continue;
            }
            const file = join(this.dir, entry.name);
            try {
                await this.assertSafeFile(file);
                const raw = JSON.parse(await readFile(file, 'utf8'));
                const validated = validateWorkflowRecipeInput(raw);
                recipes.push({
                    id,
                    schemaVersion: 1,
                    ...validated,
                    created: typeof raw.created === 'string' ? raw.created : new Date().toISOString(),
                    updated: typeof raw.updated === 'string' ? raw.updated : new Date().toISOString(),
                });
            }
            catch {
                // isolate malformed recipe files without breaking list()
            }
        }
        recipes.sort((a, b) => Date.parse(b.updated || b.created) - Date.parse(a.updated || a.created));
        return recipes;
    }
    async get(id) {
        if (typeof id !== 'string' || !id.trim()) {
            throw new BlenderError('请提供有效的工作流编号。', 'WORKFLOW_NOT_FOUND', 404);
        }
        const trimmed = id.trim();
        const builtin = this.getBuiltin(trimmed);
        if (builtin)
            return builtin;
        let validId;
        try {
            validId = blenderId(trimmed);
        }
        catch {
            if (BUILTIN_ID_RE.test(trimmed)) {
                throw new BlenderError(`未找到工作流「${trimmed}」。`, 'WORKFLOW_NOT_FOUND', 404);
            }
            throw new BlenderError(`未找到工作流「${trimmed}」。`, 'WORKFLOW_NOT_FOUND', 404);
        }
        await this.ensureDir();
        const file = this.recipeFile(validId);
        try {
            await this.assertSafeFile(file);
            const raw = JSON.parse(await readFile(file, 'utf8'));
            const validated = validateWorkflowRecipeInput(raw);
            return {
                id: validId,
                schemaVersion: 1,
                ...validated,
                created: typeof raw.created === 'string' ? raw.created : new Date().toISOString(),
                updated: typeof raw.updated === 'string' ? raw.updated : new Date().toISOString(),
            };
        }
        catch (err) {
            if (err instanceof BlenderError)
                throw err;
            throw new BlenderError(`未找到工作流「${validId}」。`, 'WORKFLOW_NOT_FOUND', 404);
        }
    }
    async save(input) {
        const validated = validateWorkflowRecipeInput(input);
        await this.ensureDir();
        const unlock = await lockfile.lock(this.dir, {
            retries: { retries: 8, minTimeout: 30, maxTimeout: 60 },
        });
        try {
            const existing = await this.listUserRecipes();
            if (existing.length >= MAX_WORKFLOW_RECIPES) {
                throw new BlenderError(`最多可保存 ${MAX_WORKFLOW_RECIPES} 套自定义工作流配方，请先删除旧配方。`, 'WORKFLOW_LIMIT', 400);
            }
            const now = new Date().toISOString();
            const recipe = {
                id: randomUUID(),
                schemaVersion: 1,
                ...validated,
                created: now,
                updated: now,
            };
            const target = this.recipeFile(recipe.id);
            const tmp = join(this.dir, `tmp-${randomUUID()}.json`);
            try {
                await writeFile(tmp, JSON.stringify(recipe, null, 2), { flag: 'wx', mode: 0o600 });
                await rename(tmp, target);
            }
            finally {
                await unlink(tmp).catch(() => { });
            }
            return recipe;
        }
        finally {
            await unlock().catch(() => { });
        }
    }
    async delete(id) {
        if (typeof id === 'string' && this.getBuiltin(id.trim())) {
            throw new BlenderError('内置工作流配方为只读模板，不可删除。', 'WORKFLOW_BUILTIN_READONLY', 400);
        }
        const validId = blenderId(id);
        await this.ensureDir();
        const target = this.recipeFile(validId);
        try {
            await this.assertSafeFile(target);
            await unlink(target);
        }
        catch (err) {
            if (err instanceof BlenderError)
                throw err;
            throw new BlenderError(`未找到工作流「${validId}」。`, 'WORKFLOW_NOT_FOUND', 404);
        }
        return { deleted: true, id: validId };
    }
    async exportRecipe(id) {
        const recipe = await this.get(id);
        return {
            ...structuredClone(recipe),
            schemaVersion: 1,
        };
    }
    async importRecipe(payload) {
        let raw = payload;
        if (typeof payload === 'string') {
            if (Buffer.byteLength(payload, 'utf8') > MAX_WORKFLOW_JSON_BYTES) {
                throw new BlenderError('导入的工作流 JSON 超过 256 KB 上限。', 'WORKFLOW_INVALID', 400);
            }
            try {
                raw = JSON.parse(payload);
            }
            catch {
                throw new BlenderError('导入的工作流 JSON 格式解析失败。', 'WORKFLOW_INVALID', 400);
            }
        }
        return this.save(raw);
    }
}
