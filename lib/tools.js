import { join } from 'node:path';
import { checkScriptSafety } from './bridge.js';
import { generateSceneScript } from './templates.js';
import { BLENDER_ASPECTS, BLENDER_CAMERA_PRESETS, BLENDER_ENGINES, BLENDER_EXPORT_FORMATS, BLENDER_FPS_VALUES, BLENDER_LIGHTING_PRESETS, BLENDER_MATERIAL_PRESETS, BLENDER_RESOLUTION_SCALES, BLENDER_SCRIPT_MODES, BLENDER_TEMPLATE_IDS, BlenderError, blenderId, validateExportFormat, } from './types.js';
function formatSceneSummaryLines(summary) {
    if (!summary)
        return [];
    const lines = [
        `场景摘要：${summary.objectCount} 个对象（网格 ${summary.meshCount} / 灯光 ${summary.lightCount} / 相机 ${summary.cameraCount}），总多边形 ${summary.totalPolygons}`,
        `Blender ${summary.blenderVersion} · 引擎 ${summary.engine}${summary.activeCamera ? ` · 主相机 ${summary.activeCamera}` : ''}`,
    ];
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
        description: 'dsh-blender-studio 只读自检：检查 8 个内置 Blender 技能文件与注册状态、本机 Blender 可执行路径/版本（EEVEE Next & GPv3 兼容信息）、Live Bridge 实时桥接状态以及 Poly Haven 资产开关。',
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
        description: '管理受管 3D Blender 工程：列出/创建/读取/更新工程参数、更新自定义 bpy 脚本、无头检查场景大纲（inspect_scene）或归档/恢复工程。不会自动启动渲染。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['list', 'create', 'get', 'update', 'update_script', 'inspect_scene', 'archive', 'restore'],
                },
                id: { type: 'string', description: '工程 UUID' },
                revision: { type: 'number', description: '工程乐观锁修订号（更新/归档/恢复时必填）' },
                archived: { type: 'boolean', description: 'get 时是否读取归档工程' },
                confirmed: { type: 'boolean', description: 'archive / restore 时需显式设为 true' },
                scriptMode: { type: 'string', enum: [...BLENDER_SCRIPT_MODES], description: 'update_script 时的脚本模式' },
                customScript: { type: 'string', description: 'update_script 时的自定义 bpy Python 脚本（≤64 KB）' },
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
                if (Array.isArray(value?.projects)) {
                    lines.push(`活跃工程：${value.projects.length} 个（归档 ${value.archivedProjects?.length ?? 0} 个）`);
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
                    lines.push(`工程：${value.title}（v${value.revision} · ${value.template} · ${value.engine} ${value.samples}spp）`, `工程 ID：${value.id}`, `画幅：${value.aspect} (${value.resolutionScale}%) · 帧范围：${value.frameStart}–${value.frameEnd} @ ${value.fps}fps · 模式：${value.scriptMode}`, `素材：${value.assets?.length ?? 0} 个 · 成品：${value.artifacts?.length ?? 0} 个`);
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
                case 'create':
                case 'get':
                case 'update':
                case 'inspect_scene':
                case 'archive':
                case 'restore':
                    return callWorkbenchPost(workbench, args);
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
        description: '启动与管理 Headless Blender CLI 渲染与导出任务：静帧预览（preview_still）、2×2 四视角视觉自检拼图（contact_sheet）、动画渲染（render_animation）、3D 模型导出（export_model：glb/fbx/obj/stl/blend）、查询任务进度（job）或取消任务（cancel）。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['preview_still', 'contact_sheet', 'render_animation', 'export_model', 'job', 'cancel'],
                },
                id: { type: 'string', description: '工程 UUID' },
                revision: { type: 'number', description: '工程修订号（可选但建议传入以防并发修改）' },
                job: { type: 'string', description: '任务 UUID（action 为 job 或 cancel 时必填）' },
                format: {
                    type: 'string',
                    enum: [...BLENDER_EXPORT_FORMATS],
                    description: '导出格式（action 为 export_model 时必填）',
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
                    if (value.state === 'done' && value.artifactId) {
                        lines.push(`成品 ID：${value.artifactId}（类型：${value.artifactKind || 'artifact'}）`);
                        if (value.artifactPath) {
                            lines.push(`成品文件：${value.artifactPath}`);
                        }
                        else if (value.projectId) {
                            lines.push(`成品目录：${join(workbench.store.root, 'projects', value.projectId, 'runs', value.artifactId)}`);
                        }
                    }
                    if (value.sceneSummary) {
                        lines.push(...formatSceneSummaryLines(value.sceneSummary));
                    }
                    if (value.state === 'failed' && Array.isArray(value.lines) && value.lines.length) {
                        lines.push('最近日志：\n' + value.lines.slice(-6).join('\n'));
                    }
                }
                return [{ type: 'text', text: lines.filter(Boolean).join('\n') }];
            },
        },
        async execute(args) {
            const allowed = ['preview_still', 'contact_sheet', 'render_animation', 'export_model', 'job', 'cancel'];
            if (!allowed.includes(args?.action)) {
                throw new BlenderError('blender_render 操作无效。', 'BAD_ACTION', 400);
            }
            if (args.action === 'export_model') {
                validateExportFormat(args.format);
            }
            const res = await callWorkbenchPost(workbench, args);
            if (res?.state === 'done' && res.artifactId && res.projectId) {
                try {
                    const info = await workbench.store.artifactPath(res.projectId, res.artifactId);
                    return { ...res, artifactPath: info.file, artifactFile: info.artifact.file, artifactSize: info.artifact.size };
                }
                catch {
                    return res;
                }
            }
            return res;
        },
    });
    // 4. blender_script
    registerTool({
        name: 'blender_script',
        description: '对 bpy Python 脚本进行静态安全扫描（validate），或在 Headless CLI（run_headless）或运行中的 Blender Live Bridge（run_bridge）中执行脚本，返回输出日志与最新场景摘要。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['validate', 'run_headless', 'run_bridge'],
                },
                code: { type: 'string', description: '待校验或执行的 bpy Python 代码' },
                id: { type: 'string', description: '工程 UUID（run_headless 必填；validate 可选用于检查该工程脚本）' },
                revision: { type: 'number', description: '工程修订号（run_headless 可选）' },
                allowUnsafe: { type: 'boolean', description: '显式确认放行安全警告（默认 false）' },
                pushUndo: { type: 'boolean', description: 'run_bridge 执行后是否写入 Blender 撤销栈（默认 true）' },
            },
            required: ['action'],
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render(_args, value) {
                const lines = ['Blender bpy 脚本工具'];
                if (typeof value?.safe === 'boolean' && Array.isArray(value?.findings)) {
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
        description: '与本机桌面 Blender 实时交互（仅限 127.0.0.1 回环）：查询连接状态（status）、获取内置 Add-on 安装信息（get_addon_info）、读取实时场景树（scene_info）、截取视口画面（viewport_capture）、同步 DSH 工程到打开的 Blender（sync_project），或在桌面 Blender 中打开工程 .blend（open_gui）。',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['status', 'get_addon_info', 'scene_info', 'viewport_capture', 'sync_project', 'open_gui'],
                },
                id: { type: 'string', description: '工程 UUID（sync_project / open_gui 必填）' },
                revision: { type: 'number', description: '工程修订号（open_gui 可选）' },
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
                else if (value?.addonPath) {
                    lines.push(`内置 Add-on 路径：${value.addonPath}`, `下载地址：${value.downloadUrl}`, `默认监听地址：${value.host}:${value.port}（严格仅限本机回环）`, '安装步骤：Blender -> 编辑 -> 偏好设置 -> 插件 -> 从磁盘安装 -> 选择 dsh_blender_bridge.py -> 勾选启用 -> View3D 右侧 N 面板「DSH Bridge」点击 Start。');
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
                            '打开 Blender -> Edit -> Preferences -> Add-ons -> Install from Disk',
                            '选择 dsh_blender_bridge.py 并勾选启用 "System: DSH Blender Bridge"',
                            '在 3D 视口按 N 打开右侧栏，切换至 "DSH Bridge" 标签页并点击 "Start DSH Bridge"',
                        ],
                    };
                }
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
