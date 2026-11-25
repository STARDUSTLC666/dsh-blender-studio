import { join } from 'node:path';
import { checkScriptSafety } from './bridge.js';
import { generateSceneScript } from './templates.js';
import { BLENDER_ASPECTS, BLENDER_CAMERA_PRESETS, BLENDER_ENGINES, BLENDER_EXPORT_FORMATS, BLENDER_FPS_VALUES, BLENDER_LIGHTING_PRESETS, BLENDER_MATERIAL_PRESETS, BLENDER_QUALITY_TIERS, BLENDER_RESOLUTION_SCALES, BLENDER_SCRIPT_MODES, BLENDER_TEMPLATE_IDS, BlenderError, blenderId, validateExportFormat, } from './types.js';
const QC_FIX_HINTS = {
    EMPTY_SCENE: '建议：使用 dsh_make_mesh_* / bmesh 构建主装配体几何。',
    NO_CAMERA: '建议：调用 dsh_frame_camera_to_assembly(cam, hero_objs) 或 dsh_setup_camera() 配置主相机。',
    NO_LIGHTS: '建议：调用 dsh_setup_hero_studio("dark_cyclorama") 或 dsh_setup_lighting() 添加影棚光。',
    UNASSIGNED_MATERIAL: '建议：使用 dsh_mat_car_paint / dsh_mat_brushed_metal / dsh_mat_carbon_fiber 并通过 dsh_assign_material 赋 PBR 材质。',
    FLAT_UNBEVELED_PRIMITIVE: '建议：对机械/建筑硬边调用 dsh_bevel(obj, width=0.015, segments=3) 与 dsh_smooth(obj)。',
    FLOATING_HERO: '建议：调用 dsh_ground_assembly(hero_objs, z=0.0) 将装配体稳固接地。',
    OFF_FRAME_HERO: '建议：调用 dsh_frame_camera_to_assembly(cam, hero_objs, margin=1.18) 自动重构图。',
    HIGH_POLYCOUNT: '建议：适当收敛细分级别，或改用 Cycles（自动开启 OIDN 降噪）。',
};
function summarizeBoundsLine(summary) {
    const objs = Array.isArray(summary.objects) ? summary.objects : [];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    let count = 0;
    for (const obj of objs) {
        if (!['MESH', 'FONT', 'CURVE', 'GPENCIL', 'GREASEPENCIL'].includes(obj.type))
            continue;
        if (!Array.isArray(obj.location) || obj.location.length < 3)
            continue;
        const [lx, ly, lz] = obj.location;
        const [dx, dy, dz] = Array.isArray(obj.dimensions) && obj.dimensions.length >= 3 ? obj.dimensions : [0, 0, 0];
        minX = Math.min(minX, lx - dx * 0.5);
        maxX = Math.max(maxX, lx + dx * 0.5);
        minY = Math.min(minY, ly - dy * 0.5);
        maxY = Math.max(maxY, ly + dy * 0.5);
        minZ = Math.min(minZ, lz - dz * 0.5);
        maxZ = Math.max(maxZ, lz + dz * 0.5);
        count++;
    }
    if (!count || !Number.isFinite(minX))
        return null;
    return `包围尺寸（估算）：X ${(maxX - minX).toFixed(2)}m × Y ${(maxY - minY).toFixed(2)}m × Z ${(maxZ - minZ).toFixed(2)}m（Z 范围 ${minZ.toFixed(2)}..${maxZ.toFixed(2)}m）`;
}
function formatSceneSummaryLines(summary) {
    if (!summary)
        return [];
    const lines = [
        `场景摘要：${summary.objectCount} 个对象（网格 ${summary.meshCount} / 灯光 ${summary.lightCount} / 相机 ${summary.cameraCount}），总多边形 ${summary.totalPolygons}`,
        `Blender ${summary.blenderVersion} · 引擎 ${summary.engine}${summary.activeCamera ? ` · 主相机 ${summary.activeCamera}` : ''}`,
    ];
    const boundsLine = summarizeBoundsLine(summary);
    if (boundsLine)
        lines.push(boundsLine);
    if (summary.qc) {
        const issueCount = Array.isArray(summary.qc.issues) ? summary.qc.issues.length : 0;
        lines.push(`QC-3D 评分: ${summary.qc.score}/100 (Grade ${summary.qc.grade})${issueCount === 0 ? ' — 无异常项' : ''}`);
        if (issueCount > 0) {
            for (const issue of summary.qc.issues.slice(0, 10)) {
                const objTag = issue.object ? ` (${issue.object})` : '';
                const hint = QC_FIX_HINTS[issue.code] ? ` → ${QC_FIX_HINTS[issue.code]}` : '';
                lines.push(`- [${issue.severity}] ${issue.code}${objTag}: ${issue.message}${hint}`);
            }
        }
    }
    if (summary.materials?.length) {
        lines.push(`材质（${summary.materials.length}）：${summary.materials.slice(0, 8).join(', ')}`);
    }
    if (summary.collections?.length) {
        lines.push(`集合（${summary.collections.length}）：${summary.collections.slice(0, 8).join(', ')}`);
    }
    return lines;
}
function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 1024)
        return `${Math.max(0, Math.round(bytes || 0))} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
async function callWorkbenchPost(workbench, payload) {
    const response = await workbench.fetch(new Request('http://dsh.internal' + workbench.route, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-dsh-blender-studio': '1',
        },
        body: JSON.stringify(payload),
    }));
    const result = (await response.json());
    if (!result.ok) {
        throw new BlenderError(result.message || 'Blender 工作台请求失败。', result.code || 'BAD_REQUEST', response.status);
    }
    return result.value;
}
export function registerBlenderTools(ctx, workbench, options = {}) {
    const disposers = [];
    if (typeof ctx.tools?.register !== 'function') {
        return disposers;
    }
    const registerTool = (definition) => {
        const dispose = ctx.tools.register(definition);
        if (typeof dispose === 'function')
            disposers.push(dispose);
    };
    // 1. blender_health
    registerTool({
        name: 'blender_health',
        description: 'dsh-blender-studio 只读自检：检查 9 个内置 Blender 技能（含 blender-production-pipeline）文件与注册状态、本机 Blender 可执行路径/版本（EEVEE Next & GPv3 兼容信息）、Live Bridge 实时桥接状态以及 Poly Haven 资产开关。',
        parameters: {
            type: 'object',
            properties: {
                forceDetect: { type: 'boolean', description: '是否强制重新扫描系统 Blender 安装路径' },
            },
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render(_args, value) {
                const lines = [
                    `dsh-blender-studio 自检：${value.ok ? '技能完整且已注册' : '存在技能或注册异常'}`,
                ];
                if (Array.isArray(value.skills)) {
                    const readyCount = value.skills.filter((s) => s.ok).length;
                    lines.push(`内置技能（${readyCount}/${value.skills.length}）：`);
                    for (const skill of value.skills) {
                        lines.push(`- ${skill.name}：${skill.ok ? '✅' : '❌ ' + skill.detail}`);
                    }
                }
                const env = value.environment;
                if (env) {
                    if (env.active) {
                        lines.push(`本机 Blender：✅ ${env.active.version}（${env.active.path}，${env.active.eeveeEngine} / ${env.active.greasePencilApi.toUpperCase()}）`);
                    }
                    else {
                        lines.push(`本机 Blender：⚠️ 未检测到（${env.hint}）`);
                    }
                    const gpuInfo = env.gpu ?? env.active?.gpu;
                    lines.push(`Cycles 计算设备：${env.computeDevice || 'auto'} · ${gpuInfo?.available ? `✅ GPU ${gpuInfo.backend} (${gpuInfo.devices.join(', ')})` : 'CPU'}`);
                    lines.push(`Live Bridge：${env.bridge.connected ? `✅ 已连接 ${env.bridge.host}:${env.bridge.port}（Blender ${env.bridge.blenderVersion || '?'}，场景 ${env.bridge.activeScene || '?'}）` : `未连接（${env.bridge.host}:${env.bridge.port}${env.bridge.error ? ' · ' + env.bridge.error : ''}）`}`);
                    lines.push(`Poly Haven CC0 资产库：${env.polyHavenEnabled ? '已启用' : '默认关闭（可在设置中开启）'}`);
                }
                return [{ type: 'text', text: lines.join('\n') }];
            },
        },
        async execute(args = {}) {
            const skillsReport = options.checkSkillsHealth
                ? await options.checkSkillsHealth()
                : { ok: true, plugin: 'dsh-blender-studio', skills: [] };
            const environment = await workbench.environmentStatus({
                probeBridge: true,
                bridgeTimeoutMs: 600,
                forceDetect: Boolean(args?.forceDetect),
            });
            return {
                ok: skillsReport.ok,
                plugin: skillsReport.plugin,
                skills: skillsReport.skills,
                skillsOk: skillsReport.ok,
                blenderReady: environment.ready,
                bridgeConnected: environment.bridge.connected,
                polyHavenEnabled: environment.polyHavenEnabled,
                environment,
                addonPath: workbench.addonPath,
            };
        },
    });
    // 2. blender_project
    registerTool({
        name: 'blender_project',
        description: '管理受管 3D Blender 工程（8 套入门模板 + 4 套视觉验收通过的 Pro 高阶工程范本：涡扇航发/GT赛车/双发直升机/6轴机械臂，内置 24 个 DSH_KIT 电影级建模与 PBR 助手）：支持 list / create / list_exemplars / create_from_exemplar / get / update / duplicate / update_script / save_checkpoint / restore_checkpoint / inspect_scene / archive / restore。3D 美术导演建议：创作复杂机械或载具前，可先用 list_exemplars + create_from_exemplar 创建高阶工程范本并用 get 参阅其完整 bpy 结构作为 Few-Shot 参考，随后用 blender_script(action: "patch") 局部精修，确保 inspect_scene 的 QC-3D ≥85（Grade A）并用 contact_sheet 四视角视觉复核。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: [
                        'list',
                        'list_exemplars',
                        'create',
                        'create_from_exemplar',
                        'get',
                        'update',
                        'duplicate',
                        'update_script',
                        'save_checkpoint',
                        'restore_checkpoint',
                        'inspect_scene',
                        'archive',
                        'restore',
                    ],
                },
                id: { type: 'string', description: '工程 UUID' },
                exemplarId: {
                    type: 'string',
                    description: 'create_from_exemplar 时的范本 ID（如 aero-x900-turbofan / apex-09-racecar / vanguard-h145x-helicopter / kuka-6axis-robot-arm）',
                },
                revision: { type: 'number', description: '工程乐观锁修订号（更新/快照/归档/恢复时必填）' },
                title: { type: 'string', description: 'duplicate 或 create_from_exemplar 时的可选新标题（1–72 字符）' },
                note: { type: 'string', description: 'save_checkpoint 时的快照备注（≤120 字符）' },
                checkpointId: { type: 'string', description: 'restore_checkpoint 时的目标快照 UUID' },
                archived: { type: 'boolean', description: 'get 时是否读取归档工程' },
                confirmed: { type: 'boolean', description: 'archive / restore 时需显式设为 true' },
                scriptMode: { type: 'string', enum: [...BLENDER_SCRIPT_MODES], description: 'update_script 时的脚本模式' },
                customScript: { type: 'string', description: 'update_script 时的自定义 bpy Python 脚本（≤256 KB）' },
                allowUnsafe: { type: 'boolean', description: 'inspect_scene 时若包含高危脚本调用是否显式放行' },
                fields: {
                    type: 'object',
                    description: '工程字段（create 时至少提供 title；update 时可部分更新）',
                    properties: {
                        template: { type: 'string', enum: [...BLENDER_TEMPLATE_IDS] },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        headline: { type: 'string' },
                        engine: { type: 'string', enum: [...BLENDER_ENGINES] },
                        samples: { type: 'number' },
                        aspect: { type: 'string', enum: [...BLENDER_ASPECTS] },
                        resolutionScale: { type: 'number', enum: [...BLENDER_RESOLUTION_SCALES] },
                        fps: { type: 'number', enum: [...BLENDER_FPS_VALUES] },
                        frameStart: { type: 'number' },
                        frameEnd: { type: 'number' },
                        cameraPreset: { type: 'string', enum: [...BLENDER_CAMERA_PRESETS] },
                        lightingPreset: { type: 'string', enum: [...BLENDER_LIGHTING_PRESETS] },
                        materialPreset: { type: 'string', enum: [...BLENDER_MATERIAL_PRESETS] },
                        accentColor: { type: 'string' },
                        transparentBg: { type: 'boolean' },
                        scriptMode: { type: 'string', enum: [...BLENDER_SCRIPT_MODES] },
                        customScript: { type: 'string' },
                    },
                },
            },
            required: ['action'],
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render(_args, value) {
                const lines = ['Blender 3D 工程工作台'];
                if (Array.isArray(value?.exemplars) && !Array.isArray(value?.projects)) {
                    lines.push(`高阶工程范本（Pro Exemplars，共 ${value.exemplars.length} 套，均已通过 QC-3D 100/A）：`);
                    for (const ex of value.exemplars) {
                        lines.push(`- [${ex.id}] ${ex.titleZh} / ${ex.titleEn}（${ex.category} · ${ex.engine} ${ex.samples}spp · ${ex.estimatedPolys}）— ${ex.summaryZh}`);
                    }
                    lines.push('提示：调用 action: "create_from_exemplar" + exemplarId 一键实例化，并用 action: "get" 查看其完整 bpy 代码作为高精工程参考。');
                }
                else if (Array.isArray(value?.projects)) {
                    lines.push(`活跃工程：${value.projects.length} 个（归档 ${value.archivedProjects?.length ?? 0} 个；内置范本 ${value.exemplars?.length ?? 0} 套）`);
                    for (const p of value.projects) {
                        lines.push(`- ${p.title} [${p.template} · ${p.engine} ${p.samples}spp · v${p.revision}]（ID: ${p.id}）`);
                    }
                    if (value.corruptedCount) {
                        lines.push(`注意：检测到 ${value.corruptedCount} 个损坏工程目录（原文件已保留）。`);
                    }
                    lines.push(value.environment?.ready ? `Blender 环境就绪（${value.environment.active?.version}）。` : '本机 Blender 尚未配置或检测到。');
                }
                else if (value?.state && value?.kind) {
                    lines.push(`场景检查任务：${value.state}（任务 ID: ${value.id}）`, value.stage || '');
                    if (value.sceneSummary)
                        lines.push(...formatSceneSummaryLines(value.sceneSummary));
                }
                else if (value?.title && value?.id) {
                    lines.push(`工程：${value.title}（v${value.revision} · ${value.template} · ${value.engine} ${value.samples}spp）`, `工程 ID：${value.id}`, `画幅：${value.aspect} (${value.resolutionScale}%) · 帧范围：${value.frameStart}–${value.frameEnd} @ ${value.fps}fps · 模式：${value.scriptMode}`, `素材：${value.assets?.length ?? 0} 个 · 成品：${value.artifacts?.length ?? 0} 个 · 脚本快照：${value.checkpoints?.length ?? 0} 个`);
                    if (Array.isArray(value.checkpoints) && value.checkpoints.length > 0) {
                        const latestCp = value.checkpoints[0];
                        lines.push(`最新快照：${latestCp.note}（R${latestCp.revision} · ${latestCp.scriptLength} chars${typeof latestCp.qcScore === 'number' ? ` · QC ${latestCp.qcScore}` : ''} · ID: ${latestCp.id}）`);
                    }
                    if (value.safety) {
                        lines.push(value.safety.safe
                            ? '脚本静态安全检查：✅ 通过'
                            : `脚本静态安全检查：⚠️ 发现 ${value.safety.findings.length} 项风险`);
                    }
                    if (value.sceneSummary)
                        lines.push(...formatSceneSummaryLines(value.sceneSummary));
                }
                return [{ type: 'text', text: lines.filter(Boolean).join('\n') }];
            },
        },
        async execute(args) {
            const action = args?.action;
            switch (action) {
                case 'list':
                case 'list_exemplars':
                case 'create':
                case 'get':
                case 'update':
                case 'inspect_scene':
                case 'archive':
                case 'restore':
                    return callWorkbenchPost(workbench, args);
                case 'create_from_exemplar':
                    return callWorkbenchPost(workbench, {
                        action: 'create_from_exemplar',
                        exemplarId: args.exemplarId ?? args.id,
                        ...(typeof args.title === 'string' && args.title.trim() ? { title: args.title.trim() } : {}),
                    });
                case 'duplicate':
                    return callWorkbenchPost(workbench, {
                        action: 'duplicate',
                        id: blenderId(args.id),
                        ...(typeof args.title === 'string' && args.title.trim() ? { title: args.title.trim() } : {}),
                    });
                case 'save_checkpoint':
                    return callWorkbenchPost(workbench, {
                        action: 'save_checkpoint',
                        id: blenderId(args.id),
                        revision: args.revision,
                        ...(typeof args.note === 'string' && args.note.trim() ? { note: args.note.trim() } : {}),
                    });
                case 'restore_checkpoint':
                    return callWorkbenchPost(workbench, {
                        action: 'restore_checkpoint',
                        id: blenderId(args.id),
                        revision: args.revision,
                        checkpointId: blenderId(args.checkpointId),
                    });
                case 'update_script': {
                    const id = blenderId(args.id);
                    const scriptMode = args.scriptMode ?? 'custom';
                    const customScript = typeof args.customScript === 'string' ? args.customScript : '';
                    const updated = await callWorkbenchPost(workbench, {
                        action: 'update',
                        id,
                        revision: args.revision,
                        fields: { scriptMode, customScript },
                    });
                    const safety = checkScriptSafety(customScript);
                    return { ...updated, safety };
                }
                default:
                    throw new BlenderError('blender_project 操作无效。', 'BAD_ACTION', 400);
            }
        },
    });
    // 3. blender_render
    registerTool({
        name: 'blender_render',
        description: '启动与管理 Headless Blender CLI 渲染、导出与一键全流程任务：静帧预览（preview_still）、2×2 四视角视觉自检拼图（contact_sheet）、动画渲染（render_animation）、3D 模型导出（export_model：glb/fbx/obj/stl/blend）、一键全流程生产管线（pipeline：QC-3D 体检 → 四视角拼图 → 按 qualityTier 精渲 → 可选模型导出）、查询进度（job）或取消（cancel）。建议工作流：先用 EEVEE / draft 跑 contact_sheet 并用 read_file 视觉审查四视角构图/悬空/倒角/曝光，确认无误后再以 qualityTier: "beauty"（Cycles + OIDN 降噪 + AgX）输出最终成片。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['preview_still', 'contact_sheet', 'render_animation', 'export_model', 'pipeline', 'job', 'cancel'],
                },
                id: { type: 'string', description: '工程 UUID' },
                revision: { type: 'number', description: '工程修订号（可选但建议传入以防并发修改）' },
                job: { type: 'string', description: '任务 UUID（action 为 job 或 cancel 时必填）' },
                format: {
                    type: 'string',
                    enum: [...BLENDER_EXPORT_FORMATS],
                    description: '导出格式（action 为 export_model 时必填）',
                },
                includeContactSheet: {
                    type: 'boolean',
                    description: 'pipeline 时是否生成 2×2 四视角质检拼图（默认 true）',
                },
                renderKind: {
                    type: 'string',
                    enum: ['still', 'animation'],
                    description: 'pipeline 主渲染类型（默认 still）',
                },
                exportFormat: {
                    type: 'string',
                    enum: [...BLENDER_EXPORT_FORMATS, 'none'],
                    description: 'pipeline 模型导出格式（默认 glb，传 none 跳过导出）',
                },
                qualityTier: {
                    type: 'string',
                    enum: [...BLENDER_QUALITY_TIERS],
                    description: 'pipeline 临时质量档位（draft=EEVEE 16spp 50% / studio=EEVEE 32spp 100% / beauty=CYCLES OIDN 64spp 100%；不改动已保存工程参数）',
                },
                abortOnQcError: {
                    type: 'boolean',
                    description: 'pipeline 当 QC-3D 存在 error 级别问题时是否提前中止以避免浪费渲染时间（默认 false）',
                },
                frame: { type: 'number', description: '静帧或四视角渲染的目标帧号（可选）' },
                allowUnsafe: { type: 'boolean', description: '是否显式允许执行包含高危调用的自定义脚本' },
            },
            required: ['action'],
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render(_args, value) {
                const lines = ['Blender 渲染与导出工作台'];
                if (value?.state) {
                    lines.push(`任务状态：${value.state}（${value.progress ?? 0}%）· 类型：${value.kind}`, `任务 ID：${value.id}`, value.stage ? `当前阶段：${value.stage}` : '');
                    if (value.projectId)
                        lines.push(`工程 ID：${value.projectId}（v${value.revision}）`);
                    if (value.state === 'running') {
                        lines.push('提示：可使用 action: "job" 查询最新进度，或 action: "cancel" 取消任务。');
                    }
                    let hasPngOutput = false;
                    if (value.pipeline) {
                        if (value.pipeline.stoppedEarly) {
                            lines.push(`全流程提前中止：${value.pipeline.stopReason || 'QC-3D 检测到阻断错误'}`);
                        }
                        else {
                            lines.push(`全流程产出成品：${value.pipeline.artifactIds?.length ?? 0} 项`);
                        }
                        if (value.artifactPaths?.contactSheet) {
                            lines.push(`四视角质检图 (contact_sheet)：${value.artifactPaths.contactSheet}`);
                            hasPngOutput = true;
                        }
                        if (value.artifactPaths?.primaryRender) {
                            lines.push(`主画面渲染成品：${value.artifactPaths.primaryRender}`);
                            if (/\.png$/i.test(String(value.artifactPaths.primaryRender)))
                                hasPngOutput = true;
                        }
                        if (value.artifactPaths?.model) {
                            lines.push(`3D 模型导出文件：${value.artifactPaths.model}`);
                        }
                    }
                    else if (value.state === 'done' && value.artifactId) {
                        lines.push(`成品 ID：${value.artifactId}（类型：${value.artifactKind || 'artifact'}）`);
                        if (value.artifactPath) {
                            lines.push(`成品文件：${value.artifactPath}`);
                            if (/\.png$/i.test(String(value.artifactPath)))
                                hasPngOutput = true;
                        }
                        else if (value.projectId) {
                            lines.push(`成品目录：${join(workbench.store.root, 'projects', value.projectId, 'runs', value.artifactId)}`);
                            if (value.artifactKind === 'still' || value.artifactKind === 'contact_sheet')
                                hasPngOutput = true;
                        }
                    }
                    if (value.sceneSummary) {
                        lines.push(...formatSceneSummaryLines(value.sceneSummary));
                    }
                    else if (value.pipeline?.qc) {
                        const qc = value.pipeline.qc;
                        lines.push(`QC-3D 评分: ${qc.score}/100 (Grade ${qc.grade})`);
                        for (const issue of (qc.issues || []).slice(0, 10)) {
                            const objTag = issue.object ? ` (${issue.object})` : '';
                            const hint = QC_FIX_HINTS[issue.code] ? ` → ${QC_FIX_HINTS[issue.code]}` : '';
                            lines.push(`- [${issue.severity}] ${issue.code}${objTag}: ${issue.message}${hint}`);
                        }
                    }
                    if (value.state === 'done' && hasPngOutput) {
                        lines.push('视觉自检提示：请立即使用 read_file 查看上述 PNG 渲染图/四视角拼图，核验比例、接地、倒角高光、曝光与构图后再决定是否继续迭代或交付。');
                    }
                    if (value.state === 'failed' && Array.isArray(value.lines) && value.lines.length) {
                        lines.push('最近日志：\n' + value.lines.slice(-6).join('\n'));
                    }
                }
                return [{ type: 'text', text: lines.filter(Boolean).join('\n') }];
            },
        },
        async execute(args) {
            const allowed = ['preview_still', 'contact_sheet', 'render_animation', 'export_model', 'pipeline', 'job', 'cancel'];
            if (!allowed.includes(args?.action)) {
                throw new BlenderError('blender_render 操作无效。', 'BAD_ACTION', 400);
            }
            if (args.action === 'export_model') {
                validateExportFormat(args.format);
            }
            const res = await callWorkbenchPost(workbench, args);
            if (res?.state === 'done' && res.projectId) {
                const enriched = { ...res };
                if (res.artifactId) {
                    try {
                        const info = await workbench.store.artifactPath(res.projectId, res.artifactId);
                        enriched.artifactPath = info.file;
                        enriched.artifactFile = info.artifact.file;
                        enriched.artifactSize = info.artifact.size;
                    }
                    catch {
                        // ignore missing file lookup
                    }
                }
                if (res.pipeline) {
                    const artifactPaths = {};
                    const lookup = async (key, artId) => {
                        if (!artId)
                            return;
                        try {
                            artifactPaths[key] = (await workbench.store.artifactPath(res.projectId, artId)).file;
                        }
                        catch {
                            // ignore
                        }
                    };
                    await Promise.all([
                        lookup('contactSheet', res.pipeline.contactSheetId),
                        lookup('primaryRender', res.pipeline.primaryRenderId),
                        lookup('model', res.pipeline.modelArtifactId),
                    ]);
                    if (Object.keys(artifactPaths).length > 0) {
                        enriched.artifactPaths = artifactPaths;
                    }
                }
                return enriched;
            }
            return res;
        },
    });
    // 4. blender_script
    registerTool({
        name: 'blender_script',
        description: '对 bpy Python 脚本进行静态安全扫描（validate）、精准局部补丁替换（patch：仅发送 find/replace 即可修改大型 40–256 KB 工程脚本，自动安全校验并保存快照，极大节省 Token）、或在 Headless CLI（run_headless）/ Live Bridge（run_bridge）中执行脚本，返回日志、场景摘要与 QC-3D 体检报告。内置 24 个 DSH_KIT 电影级建模与 PBR 助手（dsh_loft_profile / dsh_bolt_ring / dsh_wheel_assembly / dsh_louver_panel / dsh_mat_* / dsh_render_clay_override 等）。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['validate', 'patch', 'run_headless', 'run_bridge'],
                },
                code: { type: 'string', description: '待校验或执行的 bpy Python 代码' },
                id: { type: 'string', description: '工程 UUID（patch / run_headless 必填；validate 可选）' },
                revision: { type: 'number', description: '工程修订号（patch 建议传入乐观锁修订号；run_headless 可选）' },
                find: { type: 'string', description: 'patch 动作：精确查找的原始脚本文本片段（非空）' },
                replace: { type: 'string', description: 'patch 动作：替换后的新脚本文本片段' },
                replaceAll: { type: 'boolean', description: 'patch 动作：是否允许替换全部多处匹配（默认 false，匹配多处时报错防误改）' },
                note: { type: 'string', description: 'patch 动作：自动快照备注（可选）' },
                allowUnsafe: { type: 'boolean', description: '显式确认放行安全警告（默认 false）' },
                pushUndo: { type: 'boolean', description: 'run_bridge 执行后是否写入 Blender 撤销栈（默认 true）' },
            },
            required: ['action'],
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render(_args, value) {
                const lines = ['Blender bpy 脚本工具'];
                if (typeof value?.replacements === 'number' && value?.id) {
                    lines.push(`局部脚本补丁完成：已替换 ${value.replacements} 处片段 → 工程「${value.title}」已更新至 v${value.revision}（已自动保存先前快照）。`, `脚本长度：${value.customScript?.length ?? 0} 字符 · 静态安全检查：${value.safety?.safe ? '✅ 通过' : '⚠️ 已按 allowUnsafe 放行'}`);
                }
                else if (typeof value?.safe === 'boolean' && Array.isArray(value?.findings)) {
                    lines.push(value.safe ? '静态安全检查：✅ 未发现高危调用。' : `静态安全检查：⚠️ 发现 ${value.findings.length} 项高危模式：`);
                    for (const f of value.findings) {
                        lines.push(`- 第 ${f.line} 行 [${f.rule}]：${f.detail}`);
                    }
                }
                else if (value?.state && value?.id) {
                    lines.push(`无头脚本任务：${value.state}（任务 ID: ${value.id}）`, value.stage || '');
                    if (value.scriptOutput)
                        lines.push('输出：\n' + String(value.scriptOutput).slice(0, 1200));
                    if (value.sceneSummary)
                        lines.push(...formatSceneSummaryLines(value.sceneSummary));
                }
                else if (value?.sceneSummary || typeof value?.stdout === 'string') {
                    lines.push('Live Bridge 脚本执行完成。');
                    if (value.stdout)
                        lines.push('stdout:\n' + String(value.stdout).slice(0, 1200));
                    if (value.stderr)
                        lines.push('stderr:\n' + String(value.stderr).slice(0, 800));
                    if (value.sceneSummary)
                        lines.push(...formatSceneSummaryLines(value.sceneSummary));
                }
                return [{ type: 'text', text: lines.filter(Boolean).join('\n') }];
            },
        },
        async execute(args) {
            switch (args?.action) {
                case 'validate': {
                    let code = typeof args.code === 'string' ? args.code : '';
                    if (!code && args.id) {
                        const project = await workbench.store.get(blenderId(args.id));
                        code = project.scriptMode === 'custom' ? project.customScript : generateSceneScript(project, './assets');
                    }
                    const safety = checkScriptSafety(code);
                    return {
                        ...safety,
                        byteLength: Buffer.byteLength(code, 'utf8'),
                    };
                }
                case 'patch':
                    return callWorkbenchPost(workbench, {
                        action: 'patch_script',
                        id: blenderId(args.id),
                        revision: args.revision,
                        find: args.find,
                        replace: args.replace,
                        replaceAll: args.replaceAll === true,
                        note: typeof args.note === 'string' ? args.note : undefined,
                        allowUnsafe: args.allowUnsafe === true,
                    });
                case 'run_headless':
                    return callWorkbenchPost(workbench, {
                        action: 'run_script',
                        id: blenderId(args.id),
                        revision: args.revision,
                        code: typeof args.code === 'string' ? args.code : undefined,
                        allowUnsafe: args.allowUnsafe === true,
                    });
                case 'run_bridge':
                    return callWorkbenchPost(workbench, {
                        action: 'bridge_execute',
                        code: args.code,
                        pushUndo: args.pushUndo ?? true,
                        allowUnsafe: args.allowUnsafe === true,
                    });
                default:
                    throw new BlenderError('blender_script 操作无效。', 'BAD_ACTION', 400);
            }
        },
    });
    // 5. blender_bridge
    registerTool({
        name: 'blender_bridge',
        description: '与本机桌面 Blender 实时交互（仅限 127.0.0.1 回环）：查询连接状态（status）、获取内置 Add-on 安装信息（get_addon_info）、一键自动安装并启用 Bridge 插件到本机 Blender（install_addon，需 confirmed: true）、读取实时场景树与 QC-3D（scene_info）、截取视口画面（viewport_capture）、同步 DSH 工程到打开的 Blender（sync_project），或在桌面 Blender 中打开工程 .blend（open_gui）。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: [
                        'status',
                        'get_addon_info',
                        'install_addon',
                        'scene_info',
                        'viewport_capture',
                        'sync_project',
                        'open_gui',
                    ],
                },
                id: { type: 'string', description: '工程 UUID（sync_project / open_gui 必填）' },
                revision: { type: 'number', description: '工程修订号（open_gui 可选）' },
                confirmed: { type: 'boolean', description: 'install_addon 时需显式设为 true 以确认写入本机 Blender 用户插件配置' },
                clearScene: { type: 'boolean', description: 'sync_project 时是否先清空当前 Blender 场景（默认 true）' },
                allowUnsafe: { type: 'boolean', description: 'sync_project 时若包含自定义高危脚本是否显式放行' },
                width: { type: 'number', description: 'viewport_capture 宽度（默认 960）' },
                height: { type: 'number', description: 'viewport_capture 高度（默认 540）' },
            },
            required: ['action'],
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render(_args, value) {
                const lines = ['Blender Live Bridge'];
                if (typeof value?.connected === 'boolean') {
                    lines.push(value.connected
                        ? `状态：✅ 已连接 ${value.host}:${value.port}（Blender ${value.blenderVersion || '?'}，当前场景 ${value.activeScene || '?'}）`
                        : `状态：未连接（${value.host}:${value.port}${value.error ? ' · ' + value.error : ''}）`);
                }
                else if (value?.installed && value?.enabled) {
                    lines.push('✅ 已一键安装并启用 DSH Blender Bridge 插件！', `Blender 可执行路径：${value.executablePath}`, `插件源文件：${value.addonPath}`, '下一步：打开桌面 Blender，在 3D 视口按 N 打开右侧栏「DSH Bridge」标签页并点击 Start DSH Bridge。');
                }
                else if (value?.addonPath) {
                    lines.push(`内置 Add-on 路径：${value.addonPath}`, `下载地址：${value.downloadUrl}`, `默认监听地址：${value.host}:${value.port}（严格仅限本机回环）`, '安装步骤：可直接调用 action: "install_addon" (confirmed: true) 一键安装，或在 Blender -> 偏好设置 -> 插件 -> 从磁盘安装选择 dsh_blender_bridge.py 并勾选启用。');
                }
                else if (value?.mime === 'image/png' && value?.base64) {
                    lines.push(`视口抓图完成：${value.width}×${value.height} PNG（${formatBytes(Math.floor((value.base64.length * 3) / 4))}）`);
                }
                else if (value?.launched) {
                    lines.push(`已启动桌面 Blender：${value.executable}`, value.blendFile ? `工程文件：${value.blendFile}` : '', value.pid ? `进程 PID：${value.pid}` : '');
                }
                else if (value?.sceneSummary) {
                    lines.push('工程已同步至运行中的 Blender 窗口。');
                    lines.push(...formatSceneSummaryLines(value.sceneSummary));
                }
                else if (typeof value?.objectCount === 'number') {
                    lines.push(...formatSceneSummaryLines(value));
                }
                return [{ type: 'text', text: lines.filter(Boolean).join('\n') }];
            },
        },
        async execute(args) {
            switch (args?.action) {
                case 'status':
                    return callWorkbenchPost(workbench, { action: 'bridge_status' });
                case 'get_addon_info': {
                    const settings = await workbench.environment.getSettings();
                    return {
                        addonPath: workbench.addonPath,
                        downloadUrl: workbench.route + '?kind=addon',
                        host: workbench.bridge.host || settings.bridgeHost,
                        port: workbench.bridge.port || settings.bridgePort,
                        hasToken: workbench.bridge.hasToken || Boolean(settings.bridgeToken),
                        compatibleVersions: 'Blender 3.6 / 4.x / 5.x',
                        installSteps: [
                            '推荐：调用 blender_bridge(action: "install_addon", confirmed: true) 一键安装并启用',
                            '手动：打开 Blender -> Edit -> Preferences -> Add-ons -> Install from Disk 选择 dsh_blender_bridge.py 并勾选启用',
                            '在 3D 视口按 N 打开右侧栏，切换至 "DSH Bridge" 标签页并点击 "Start DSH Bridge"',
                        ],
                    };
                }
                case 'install_addon':
                    return callWorkbenchPost(workbench, {
                        action: 'bridge_install_addon',
                        confirmed: args.confirmed === true,
                    });
                case 'scene_info':
                    return callWorkbenchPost(workbench, { action: 'bridge_scene' });
                case 'viewport_capture':
                    return callWorkbenchPost(workbench, {
                        action: 'bridge_viewport',
                        width: args.width,
                        height: args.height,
                    });
                case 'sync_project':
                    return callWorkbenchPost(workbench, {
                        action: 'bridge_sync',
                        id: blenderId(args.id),
                        clearScene: args.clearScene ?? true,
                        allowUnsafe: args.allowUnsafe === true,
                    });
                case 'open_gui':
                    return callWorkbenchPost(workbench, {
                        action: 'open_gui',
                        id: blenderId(args.id),
                        revision: args.revision,
                    });
                default:
                    throw new BlenderError('blender_bridge 操作无效。', 'BAD_ACTION', 400);
            }
        },
    });
    // 6. blender_assets
    registerTool({
        name: 'blender_assets',
        description: '管理 3D 工程素材（HDRI、纹理、GLB/FBX/OBJ/STL 模型、.blend）：列出工程素材（list）、移除素材（remove），或在用户显式开启后从 Poly Haven 检索（search_polyhaven）与导入 CC0 资产（import_polyhaven）。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['list', 'remove', 'search_polyhaven', 'import_polyhaven'],
                },
                id: { type: 'string', description: '工程 UUID（list / remove / import_polyhaven 必填）' },
                revision: { type: 'number', description: '工程修订号（remove / import_polyhaven 必填）' },
                asset: { type: 'string', description: '素材 UUID（remove 时必填）' },
                query: { type: 'string', description: 'Poly Haven 检索关键词（search_polyhaven）' },
                type: {
                    type: 'string',
                    enum: ['hdris', 'textures', 'models'],
                    description: 'Poly Haven 资产类型（默认 hdris）',
                },
                assetId: { type: 'string', description: 'Poly Haven 资产 ID（import_polyhaven 必填）' },
                assetType: {
                    type: 'string',
                    enum: ['hdris', 'textures', 'models'],
                    description: 'Poly Haven 资产类型（import_polyhaven）',
                },
                resolution: {
                    type: 'string',
                    enum: ['1k', '2k'],
                    description: 'Poly Haven 下载分辨率（默认 1k）',
                },
                limit: { type: 'number', description: 'search_polyhaven 返回上限（1..50，默认 12）' },
            },
            required: ['action'],
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render(_args, value) {
                const lines = ['Blender 3D 素材管理'];
                if (Array.isArray(value?.assets) && !value?.asset) {
                    lines.push(`工程素材共 ${value.assets.length} 个（工程 ID: ${value.projectId || value.id || '-'}）：`);
                    for (const a of value.assets) {
                        lines.push(`- ${a.name} [${a.kind} · .${a.ext} · ${formatBytes(a.size)}]（ID: ${a.id}）`);
                    }
                }
                else if (Array.isArray(value?.items)) {
                    lines.push(`Poly Haven CC0 检索结果（${value.items.length} 项）：`);
                    for (const item of value.items) {
                        lines.push(`- ${item.name}（assetId: ${item.id} · ${item.type} · ${item.categories?.slice(0, 3).join('/') || '-'}）`);
                    }
                }
                else if (value?.asset && value?.project) {
                    lines.push(`已导入 Poly Haven 资产：${value.asset.name}（${value.asset.kind} · ${formatBytes(value.asset.size)}${value.cached ? ' · 命中本地缓存' : ''}）`, `工程：${value.project.title}（v${value.project.revision}）`);
                }
                else if (value?.id && value?.title) {
                    lines.push(`已更新工程素材列表：${value.title}（v${value.revision}，剩余 ${value.assets?.length ?? 0} 个素材）`);
                }
                return [{ type: 'text', text: lines.join('\n') }];
            },
        },
        async execute(args) {
            switch (args?.action) {
                case 'list': {
                    const project = await workbench.store.get(blenderId(args.id));
                    return {
                        projectId: project.id,
                        revision: project.revision,
                        assets: project.assets,
                    };
                }
                case 'remove':
                    return callWorkbenchPost(workbench, {
                        action: 'removeAsset',
                        id: blenderId(args.id),
                        revision: args.revision,
                        asset: blenderId(args.asset),
                    });
                case 'search_polyhaven':
                    return callWorkbenchPost(workbench, {
                        action: 'polyhaven_search',
                        query: typeof args.query === 'string' ? args.query : '',
                        type: (args.type ?? 'hdris'),
                        limit: typeof args.limit === 'number' ? args.limit : 12,
                    });
                case 'import_polyhaven':
                    return callWorkbenchPost(workbench, {
                        action: 'polyhaven_import',
                        id: blenderId(args.id),
                        revision: args.revision,
                        assetId: args.assetId,
                        assetType: (args.assetType ?? args.type ?? 'hdris'),
                        resolution: args.resolution === '2k' ? '2k' : '1k',
                    });
                default:
                    throw new BlenderError('blender_assets 操作无效。', 'BAD_ACTION', 400);
            }
        },
    });
    return disposers;
}
