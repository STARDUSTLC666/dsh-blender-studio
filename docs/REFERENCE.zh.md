> 完整参考说明。首页 [README.md](../README.md) 聚焦核心能力、安装与上手流程；本文档集中记录 **7 个智能体工具**（含 `blender_workflow` 工作流录制/配方库/便携 JSON 导入导出与跨工程一键重放）、HTTP 工作台 API、8 套工程模板 + 5 套高阶工程范本（支持 `get_exemplar` 只读查阅）、内置 `DSH_KIT` v2（24 项辅助函数，含尺度自适应 `dsh_setup_hero_studio(..., scale=...)` 与产品级取景）、单进程多机位分镜批渲（`render_shots`）、实时 Lookdev 覆写（`lensMm` / `exposure` / `clayMode` / `accentColor`）、行号读取（`blender_script(read)`）与原子多段 `patch_script`、Cycles GPU 自动加速与崩溃回退 CPU、Live Bridge v2 结构化直控与一键安装、一键全流程 `pipeline`、自动资产装配、QC-3D 自动体检、脚本快照、9 个内置技能、环境变量、安全边界与常见问题排错。

# `dsh-blender-studio` 完整技术参考

**简体中文** · [English](REFERENCE.en.md) · [返回首页](../README.md) · [Live Bridge 指南](BRIDGE.md) · [验证矩阵](VALIDATION.md) · [更新记录](../CHANGELOG.md)

---

## 1. 架构概览与运行模式

`dsh-blender-studio` 采用**混合双轨 + 桌面接力**架构：

| 模式 | 触发方式 | 适用场景 |
| :--- | :--- | :--- |
| **Track A：Headless Blender CLI（默认）** | 通过 `spawn(executable, ['--background', '--factory-startup', '--python', scriptFile], { shell: false })` 无头执行 | 开箱即用；静帧 PNG、2×2 四视角质检拼图、单进程多机位分镜包（`render_shots`）、MP4 动画、GLB/FBX/OBJ/STL/`.blend` 导出与场景大纲采集 |
| **Track B：Live Socket Bridge v2（可选）** | 连接本机运行中的 Blender GUI 所加载的 `blender/dsh_blender_bridge.py`（`0.5.1`，仅 `127.0.0.1:9876`） | 实时同步工程到打开的 Blender（含 Lookdev 覆写）、查看实时场景树（Depsgraph 真实面数与节点材质/发光色详情）、带撤销栈在线执行 `bpy`、结构化直控相机/全旋转模式 3 轴物体变换/深度节点链材质重绘（`set_camera` / `transform_object` / `set_material`）、抓取视口 OpenGL 预览图 |
| **Track C：Open in Blender GUI** | 一键物化 `.blend` 并以分离进程启动本机桌面 Blender | 人工精修材质/建模/打光后继续回到 DSH 管线 |

---

## 2. 智能体工具参考（7 个工具）

插件向 DeepSeek Harness 注册 **7 个结构化工具**，全部经 `toLosslessJson` 严格清洗后返回人类可读摘要与无损 JSON 数据（杜绝 `undefined` / `-0` / `NaN` / 稀疏数组 / 循环引用）：

| 工具名 | 动作 (`action`) / 能力 | 关键参数与说明 |
| :--- | :--- | :--- |
| **`blender_health`** | 只读全局自检 | 验证 9 个内置技能文件与宿主注册状态、本机 Blender 可执行路径/版本（含 `BLENDER_EEVEE_NEXT`/`BLENDER_EEVEE`、`gpv3`/`gpv2` 与 **Cycles GPU 后端/设备探测**）、`computeDevice` 配置、Live Bridge 连接状态及 Poly Haven 开关；不修改文件或注册表。 |
| **`blender_project`** | `list` \| `create` \| `get` \| `update` \| `update_script` \| `duplicate` \| `list_exemplars` \| `get_exemplar` \| `create_from_exemplar` \| `save_checkpoint` \| `restore_checkpoint` \| `inspect_scene` \| `archive` \| `restore` | 管理 3D 工程生命周期。支持列出、**只读查阅（`get_exemplar`；向 `get` 传入范本 slug 亦自动兼容回落，不占用活跃工程槽位）**与一键创建 **5 套高阶工程范本**（`aero-x900-turbofan` / `apex-09-racecar` / `vanguard-h145x-helicopter` / `kuka-6axis-robot-arm` / `chronograph-tourbillon-watch`）；支持 **实时 Lookdev 覆写参数**（`accentColor` 零改码重绘 5 套范本主色、`lensMm` `18–135mm`、`exposure` `-3..+3 EV`、`clayMode` OPTIX 安全白模体检）；`duplicate` 一键克隆工程与素材；更新 `customScript` 时自动保留最近 10 份快照，支持 `save_checkpoint` / `restore_checkpoint` 回滚；`inspect_scene` 支持 `wait: true` 同步等待并直接输出 Depsgraph 真实面数与 **`QC-3D` 质量评分（`0–100` / `A–D`）**。 |
| **`blender_render`** | `preview_still` \| `contact_sheet` \| `render_shots` \| `render_animation` \| `export_model` \| `pipeline` \| `job` \| `cancel` | 驱动 Headless CLI 渲染与导出（6 个异步动作均支持 **`wait: true`** 同步等待并直接返回成品路径、`QC-3D` 与完整 Python 异常诊断 `formatBlenderFailureDiagnostic`，自动将 `run.py` 行号映射回 `customScript` 行号）：`preview_still`（单帧 PNG，支持 `qualityTier`）、`contact_sheet`（零依赖内置 `numpy` 加速 2×2 四视角质检 PNG，支持 `qualityTier` 与 4cm 腕表至 10m 载具全尺度自适应取景/`clip_start`）、**`render_shots`（单次 Blender 启动构建一次场景后批量出图 1–5 组摄影机位预设 `hero_3q` / `low_dramatic` / `macro_dof` / `side_profile` / `top_plan`，支持 `shots[]` 与 `qualityTier`，单调精准采样进度，每帧以 `kind: 'shot'` 注册）**、`render_animation`（兼容 Blender 5.x `media_type` 与 `Video append frame` 进度的 FFmpeg H.264 MP4 或 PNG 序列）、`export_model`（`format`: `glb` \| `fbx` \| `obj` \| `stl` \| `blend`，自动烘焙修改器 `export_apply=True` 并在交换格式中自动剥离影棚背景，`.blend` 自动应用 Lookdev 覆写、打包并压缩），以及 **`pipeline` 一键全流程**（串联 `inspect_scene` → `contact_sheet` → `preview_still`/`render_animation` → `export_model`，支持 `qualityTier`: `draft` \| `studio` \| `beauty` 与 `abortOnQcError` 早停）。Cycles 按 `computeDevice` 自动启用 GPU（`OPTIX`/`CUDA`/`METAL`/`HIP`/`ONEAPI`）并在 `auto` 模式下遭遇 GPU/CUDA/OPTIX 驱动崩溃时自动回退至 CPU 重试一次 + OpenImageDenoise + AgX；EEVEE 4.2+/5.x 自动开启光追与降噪。 |
| **`blender_script`** | `read` \| `validate` \| `patch` \| `run_headless` \| `run_bridge` | 支持 **`read`** 按行号区间（`startLine` / `endLine`，默认最多 160 行）或正则/子串检索（`pattern` / `maxMatches`）零猜测精准查阅工程脚本；对 `bpy` 代码执行 13 条静态安全扫描（`validate`）；使用 **`patch`** 支持单处（`find`/`replace`/`replaceAll?`）或**原子多段 `edits[]`（最多 50 处修改，任一处失败整批回滚且仅保存 1 份快照）**对 40–256 KB 大型脚本精准迭代（写前安全扫描 + 自动快照，节省 Token）；或在无头环境（`run_headless`，支持 `wait: true`）/ Live Bridge（`run_bridge`）运行并返回 `sceneSummary`（含 `QC-3D` 评分）。 |
| **`blender_bridge`** | `status` \| `get_addon_info` \| `install_addon` \| `scene_info` \| `viewport_capture` \| `sync_project` \| `set_camera` \| `transform_object` \| `set_material` \| `open_gui` | 检测 Live Bridge 状态与 GPU 信息、获取 `dsh_blender_bridge.py` 路径、**`install_addon`（需 `confirmed: true`，无头自动向本机 Blender 安装并启用 Bridge 插件）**、拉取实时场景大纲（含实时 `QC-3D`）、截取视口 PNG、同步工程至 Blender、**Live Bridge v2 结构化直控**（全部带 Undo 撤销栈：`set_camera` 调机位/焦点/焦段/景深、`transform_object` 调物体位移/旋转/缩放、`set_material` 实时改色/金属度/粗糙度；可选传入目标工程 `id` 自动记录到工程工作流时间线），或直接启动桌面 Blender 打开 `.blend`。 |
| **`blender_assets`** | `list` \| `remove` \| `search_polyhaven` \| `import_polyhaven` | 查看/移除工程素材；在用户显式启用 `polyHavenEnabled` 后，按白名单检索与导入 Poly Haven CC0 的 `hdris` / `textures` / `models`（`resolution`: `1k` \| `2k`）。 |
| **`blender_workflow`** | `history` \| `clear_history` \| `toggle_recording` \| `list` \| `get` \| `save_from_history` \| `create` \| `delete` \| `export` \| `import` \| `replay` | 3D 生产工作流录制、配方管理与跨工程复现重放：查看工程自动录制的操作时间线（`history`，最近 120 条）、开启/暂停实时录制（`toggle_recording`）、清空历史（`clear_history`，需 `confirmed: true`）、从工程历史一键提炼可复用配方（`save_from_history`，支持 `eventIds` 勾选提取、`includeScriptPatches` 与 `coalesceLookdev` 自动合并连续 Lookdev 修改）、自定义新建配方（`create`）、列出与查看 4 套内置 AAA 配方及自定义配方（`list` / `get`）、便携 `schemaVersion: 1` JSON 导入导出（`export` / `import`）、删除自定义配方（`delete`，需 `confirmed: true`；内置配方只读防删），以及一键跨工程重放（`replay`，支持 `dryRun` 预演、`stopOnError`、`skipIfBridgeOffline`、非破坏参数覆盖 `overrides`：`accentColor` / `lensMm` / `exposure` / `clayMode` / `qualityTier` / `exportFormat` 与 `wait: true` 同步等待）。 |

---

## 3. HTTP 工作台 API 契约

插件通过 DSH 宿主的内部工作台路由提供接口：

- **主路由**：`/api/dsh-blender-studio/workbench`（`GET` / `POST`）
- **流式上传路由**：`/api/dsh-blender-studio/workbench/upload`（`POST`，`requestBody: 'streaming'`）
- **CSRF / 同源校验**：所有 `POST` 请求须携带自定义头 `x-dsh-blender-studio: 1`（兼容 `x-dsh-blender: 1`），显式放行 DeepSeek Harness Desktop 桌面端 `Origin: dsh-app://app`（含 `Sec-Fetch-Site: cross-site` 豁免）与本地回环同源请求，拒绝外部不可信跨源请求并返回 HTTP `403 ORIGIN_FORBIDDEN`；JSON 请求体上限 `512 KB`。

### 3.1 `GET /api/dsh-blender-studio/workbench`

| 查询参数 | 返回内容与响应头 |
| :--- | :--- |
| `?kind=addon` | 下载单文件 Live Bridge 插件 `dsh_blender_bridge.py`（`text/x-python`，`Content-Disposition: attachment`） |
| `?id=<uuid>&kind=asset&asset=<uuid>` | 流式返回工程素材文件，支持 HTTP `Range`（`206 Partial Content`）与 `&download=1`（同时支持工作台 GLB 预览器直接加载已上传的 `.glb` 素材） |
| `?id=<uuid>&kind=artifact&artifact=<uuid>` | 流式返回静帧、四视角质检图、多机位分镜（`shot`）、MP4 或 3D 导出成品，支持 `Range` 与 `&download=1`（单文件下载上限 200 MB） |
| `?id=<uuid>&kind=source` | 动态异步打包（`fflate`）返回工程备份 ZIP（`dsh-blender-studio-<id>.zip`，含 `project.json`、`scene.py`、`assets/*`、`README.txt`） |

### 3.2 `POST /api/dsh-blender-studio/workbench`

`Content-Type: application/json`，统一返回 `{ "ok": true, "value": ... }` 或 `{ "ok": false, "message": "...", "code": "..." }`：

- **工程管理与范本**：`list`（同时返回 `exemplars` 摘要、`shotPresets` 列表、`workflows` 配方摘要与 `workflowRecordingEnabled`）、`list_exemplars`、`get_exemplar`（`exemplarId`）、`create_from_exemplar`（`exemplarId`、`title?`）、`create`、`get`、`update`（支持 `lensMm`、`exposure`、`clayMode`、`accentColor` 等全量字段）、`read_script`（`id`、`startLine?`、`endLine?`、`pattern?`、`maxMatches?`）、`patch_script`（`id`、`revision`、单处 `find`/`replace`/`replaceAll?` 或原子多段 `edits[]`、`note?`、`allowUnsafe?`）、`duplicate`（`id`、`title?`）、`save_checkpoint`（`id`、`revision`、`note?`）、`restore_checkpoint`（`id`、`revision`、`checkpointId`）、`removeAsset`、`archive`、`restore`、`generatedScript`
- **任务与渲染**：`preview_still`（支持 `qualityTier?`）、`contact_sheet`（支持 `qualityTier?`）、`render_shots`（`id`、`revision?`、`shots?`、`qualityTier?`、`frame?`、`allowUnsafe?`）、`render_animation`、`export_model`（`format`）、`pipeline`（`includeContactSheet?`、`renderKind?`、`exportFormat?`、`qualityTier?`、`abortOnQcError?`）、`inspect_scene`、`run_script`（`code?`、`allowUnsafe?`）、`open_gui`、`job`、`cancel`
- **环境与设置**：`environment`（含 `gpu` 与 `computeDevice`）、`configure`（`blenderPath?`、`computeDevice?`、`bridgeHost?`、`bridgePort?`、`bridgeToken?`、`polyHavenEnabled?`、`workflowRecordingEnabled?`）、`detect_blender`
- **实时桥接（Live Bridge v2）**：`bridge_status`、`bridge_install_addon`（`confirmed: true`）、`bridge_scene`、`bridge_execute`（`code`）、`bridge_viewport`（`width?`、`height?`）、`bridge_sync`（`id`）、`bridge_set_camera`（`projectId?`、`location?`、`target?`、`lensMm?`、`dofFstop?`）、`bridge_transform_object`（`projectId?`、`name`、`location?`、`rotationDeg?`、`scale?`）、`bridge_set_material`（`projectId?`、`materialName`、`color`、`metallic?`、`roughness?`）
- **工作流录制、配方库与重放（Workflow）**：`workflow_list`、`workflow_get`（`workflowId`）、`workflow_history`（`id`、`limit?`）、`workflow_clear_history`（`id`、`revision`、`confirmed: true`）、`workflow_toggle_recording`（`enabled`）、`workflow_save_from_history`（`id`、`name?`、`description?`、`tags?`、`eventIds?`、`includeScriptPatches?`、`coalesceLookdev?`）、`workflow_create`（`name`、`description?`、`tags?`、`steps[]`）、`workflow_delete`（`workflowId`、`confirmed: true`）、`workflow_export`（`workflowId`）、`workflow_import`（`recipe` 或 `json`）、`workflow_replay`（`workflowId`、`id`、`revision?`、`dryRun?`、`stopOnError?`、`skipIfBridgeOffline?`、`overrides?`、`allowUnsafe?`）
- **外部资产**：`polyhaven_search`（`query`、`type?`、`limit?`）、`polyhaven_import`（`id`、`revision`、`assetId`、`assetType`、`resolution?`）

### 3.3 `POST /api/dsh-blender-studio/workbench/upload`

流式二进制请求体，请求头：
- `x-dsh-blender-studio: 1`
- `x-project-id: <project-uuid>`
- `x-project-revision: <integer>`
- `x-file-name: <uri-encoded-filename>`

---

## 4. 8 套跨版本工程模板、5 套工程范本、自动资产装配与参数规格

| 模板 ID | 名称 | 推荐引擎 | 默认机位 | 默认灯光 | 默认材质 | 默认帧数 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `product-studio` | 产品影棚 | `EEVEE` | `three_quarter` | `studio_3point` | `ceramic_gloss` | `48` |
| `logo-3d` | 3D 立体徽标 | `EEVEE` | `front` | `dramatic_rim` | `brushed_metal` | `48` |
| `isometric-room` | 等距微缩房间 | `CYCLES` | `isometric` | `soft_daylight` | `clay_matte` | `48` |
| `motion-data` | 动态 3D 数据柱 | `EEVEE` | `three_quarter` | `neon_cyber` | `frosted_glass` | `72` |
| `grease-pencil-2d` | 蜡笔 2D / 三渲二 | `EEVEE` | `front` | `clay_overcast` | `toon_cel` | `48` |
| `blank-stage` | 空白校准舞台 | `EEVEE` | `three_quarter` | `studio_3point` | `clay_matte` | `48` |
| `architectural-pavilion` | 参数化建筑展馆 | `EEVEE` | `three_quarter` | `soft_daylight` | `clay_matte` | `48` |
| `procedural-abstract` | 程序化几何雕塑 | `EEVEE` | `three_quarter` | `dramatic_rim` | `brushed_metal` | `72` |

### 零代码自动资产装配（Auto-Wired Assets）
- **上传 HDRI（`.hdr` / `.exr`）**：自动接入 World `ShaderNodeTexEnvironment -> Background` 提供环境光与反射（无 HDRI 时回退内置棚拍布光）。
- **上传 3D 模型（`.glb` / `.gltf` / `.obj` / `.fbx` / `.stl`）**：自动导入舞台、归一化缩放至约 `1.6 m` 并精准落台对齐底座顶面，拖拽即渲；上传的 `.glb` 也可在工作台 **PBR 3D 网格预览器 v3** 中直接旋转检视。
- **上传贴图 / 参考图（`.png` / `.jpg` / `.webp`）**：通过 `DSH_ASSETS` 字典注入脚本上下文，模板与自定义 `bpy` 均可直接复用。

### 5 套高阶工程范本（Pro Engineering Exemplars，`v0.4.0` 全系支持实时 `accentColor` 零改码重绘）
内置 5 个经实机 Blender 5.3.0 验证达到 **`QC-3D 100/A`** 的复杂机械/精密工程范本，支持工作台一键创建、`blender_project(action: 'get_exemplar')` 只读查阅 Few-Shot 脚本参考或 `blender_project(action: 'create_from_exemplar')` 启动；全部 5 套均实时响应工作台与工具传入的 `accentColor`、`lensMm`、`exposure` 与 `clayMode`：
- `aero-x900-turbofan`：AERO-X900 高涵道比剖视涡扇航发（`aerospace` · Cycles 64 spp · 默认 `#2563EB`）
- `apex-09-racecar`：APEX-09 Cyber GT 超级赛车（`vehicle` · Cycles 96 spp · 默认 `#B91C1C`）
- `vanguard-h145x-helicopter`：VANGUARD H-145X 双发复合直升机（`aerospace` · Cycles 64 spp · 默认 `#EA580C`）
- `kuka-6axis-robot-arm`：6 轴工业机械臂装配工作站（`robotics` · Cycles 64 spp · 默认 `#EA580C`）
- `chronograph-tourbillon-watch`：CHRONO-X1 镂空陀飞轮机械腕表（`horology` · Cycles 64 spp · 默认 `#D97706` · 拉丝钛金属表壳与 60 槽表圈、镂空夹板、7 枚齿轮系、6 点位飞行陀飞轮、10 颗红宝石轴承、烤蓝剑形指针与防眩蓝宝石表镜）

### 单进程多机位摄影分镜批渲（`render_shots` / `BLENDER_SHOT_PRESETS`）
在单次 Headless Blender 启动中构建一次 3D 场景，依次切机位自动包围球取景渲染 1–5 组专业摄影机位并逐帧流式汇报（`__DSH_SHOT_DONE__=<json>`），无需重复重建场景；支持在工作台 **分镜底片条（Shot Filmstrip）** 切换检视并进入 **A/B 卷帘对比**（覆盖 `still` / `contact_sheet` / `shot`）：

| 分镜预设 ID | 中文名 | 英文名 | 焦段 (`lensMm`) | 方位角 / 俯仰角 | 取景边距 / 景深 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hero_3q` | 主 3/4 视 | Hero 3/4 | `58 mm` | `35°` / `22°` | `margin 1.18`（默认开启） |
| `low_dramatic` | 低角度仰拍 | Low Dramatic | `35 mm` | `-42°` / `8°` | `margin 1.15`（默认开启） |
| `macro_dof` | 微距景深特写 | Macro DOF | `85 mm` | `22°` / `14°` | `margin 0.78` · `f/2.8`（默认开启） |
| `side_profile` | 正侧轮廓 | Side Profile | `70 mm` | `90°` / `6°` | `margin 1.16` |
| `top_plan` | 正俯工程图 | Top Plan | `50 mm` | `0°` / `86°` | `margin 1.18`（默认开启） |

### 内置 `DSH_KIT` v2 硬表面建模与电影级 PBR 辅助库（24 项）
所有模板、范本与自定义 `customScript` 执行前自动注入跨 Blender 3.6–5.x 的 24 个 `dsh_*` 辅助函数（零废弃警告）：
- **硬表面几何与取景（10 项）**：`dsh_bevel`、`dsh_smooth`、`dsh_loft_profile`、`dsh_bolt_ring`、`dsh_wheel_assembly`、`dsh_louver_panel`、`dsh_array_radial`、`dsh_tube_along_points`、`dsh_ground_assembly`、`dsh_frame_camera_to_assembly`（支持从 4 cm 微距腕表/产品到 10 m 载具的无下限产品级自动取景与自适应 `clip_start`）
- **电影级程序化 PBR 材质（10 项）**：`dsh_mat_car_paint`、`dsh_mat_carbon_fiber`、`dsh_mat_brushed_metal`、`dsh_mat_anodized_metal`、`dsh_mat_heat_blued_titanium`、`dsh_mat_copper_gold`、`dsh_mat_tinted_glass`、`dsh_mat_rubber_tire`、`dsh_mat_emissive_led`、`dsh_mat_matte_armor`
- **棚拍环境、白模覆盖与后期（4 项）**：`dsh_setup_hero_studio`（`dark_cyclorama` / `wet_asphalt` / `engineering_bay` / `helipad`，支持 `scale=1.0` 尺度自适应参数，如 10–25 cm 精密产品传入 `scale=0.1` 自动按平方律缩放地台、柔光箱与灯光功率）、`dsh_render_clay_override`、`dsh_setup_compositor`（`FOG_GLOW` 泛光）、`dsh_add_dof`；另提供 `dsh_configure_cycles_device` 自动调度 Cycles GPU/CPU 加速（配合宿主 `auto` 崩溃自动回退 CPU），以及 `dsh_apply_lookdev_overrides` 在场景构建后非破坏应用 `DSH_OVERRIDES`（`lensMm`、`exposure`、`clayMode`、`transparentBg`）。

### 工作流录制、4 套内置 AAA 配方与跨工程非破坏重放（Workflow Recording & Replay）
工作室与智能体的每一步关键操作（Lookdev 调整、脚本补丁、快照保存、QC-3D 体检、渲染/分镜/导出/全流程与 Live Bridge 直控）均自动记录至工程的 `workflowHistory` 时间线，支持 **14 种可重放步骤类型**：`lookdev_update`、`script_patch`、`checkpoint_save`、`inspect_scene`、`preview_still`、`contact_sheet`、`render_shots`、`render_animation`、`export_model`、`pipeline`、`bridge_sync`、`bridge_set_camera`、`bridge_transform_object`、`bridge_set_material`。插件内置 **4 套只读 AAA 标准工作流配方**，支持工作台「工作流」页或 `blender_workflow(action: 'replay')` 一键预演（`dryRun`）与跨工程非破坏参数覆写重放：
- `aaa-product-lookdev-pack`：**旗舰产品棚拍 Lookdev 全套**（4 步：`inspect_scene` → `contact_sheet` Draft → `render_shots` Studio 4 镜 → `pipeline` Cycles Beauty + GLB）
- `clay-silhouette-audit`：**白模轮廓与四视角体检流**（3 步：`inspect_scene` → `contact_sheet` Draft `clayMode: true` → `render_shots` Draft 3 镜 `clayMode: true`；全程非破坏覆写，不改写工程原始 PBR 材质与 `clayMode` 字段）
- `rapid-eevee-delivery`：**极速 EEVEE 预览 + GLB/.blend 交付流**（4 步：`inspect_scene` → `preview_still` Studio → `export_model` GLB → `export_model` `.blend`）
- `cycles-hero-delivery`：**Cycles 高画质终版交付流**（3 步：`checkpoint_save` → `pipeline` Beauty 含四视角/静帧/GLB → `export_model` `.blend`）

### 内置 PBR 3D 网格预览器 v3（Zero-Dependency Canvas GLB Viewer）
工作台舞台内置零依赖 Canvas 2D 3D 网格预览器 v3，同时支持预览导出的 `.glb` 成品（导出后自动聚焦）与已上传的 `.glb` 素材，提供 glTF PBR（金属度高光着色、粗糙度波瓣、自发光、`alphaMode: "BLEND"` 与 `KHR_materials_transmission` 半透明玻璃/蓝宝石表镜分层透视渲染）3 光源着色、散度定理闭体背面剔除与超大三角自动细分、余子式法线矩阵（精确处理非均匀/镜像缩放）、`TRIANGLE_STRIP` / `TRIANGLE_FAN` 支持、材质边界感知减面、4 种视图模式（`Shaded`、`Shaded + Wire`、`Clay`、`Wireframe`）、`ResizeObserver` 响应式重绘、`Shift+拖拽` / 右键平移、滚轮缩放、双击复位视角与一键导出当前画布 PNG 快照。

### `QC-3D` 确定性场景体检
无头 `inspect_scene`、自定义脚本运行与 Live Bridge `scene_info` 均自动计算 `sceneSummary.qc`（`score`: `0–100`、`grade`: `A|B|C|D`、`issues[]`），内置 8 类检查项：`EMPTY_SCENE`、`NO_CAMERA`、`NO_LIGHTS`、`UNASSIGNED_MATERIAL`、`FLAT_UNBEVELED_PRIMITIVE`、`FLOATING_HERO`（装配体感知）、`OFF_FRAME_HERO`（相机 NDC 视锥投影检测）与 `HIGH_POLYCOUNT`。

### 关键工程字段与取值约束

- **画幅 (`aspect`)**：`landscape`（`1280×720`）、`portrait`（`720×1280`）、`square`（`1024×1024`）
- **分辨率缩放 (`resolutionScale`)**：`50` \| `100` \| `150` \| `200`（%）
- **渲染引擎 (`engine`)**：`EEVEE`（4.2+ 自动映射 `BLENDER_EEVEE_NEXT`）\| `CYCLES`（自动开启 OpenImageDenoise + 自适应采样）\| `WORKBENCH`
- **工作台一键画质预设**：`草稿 Draft`（`EEVEE` 16 spp 50%）\| `标准 Studio`（`EEVEE` 32 spp 100%）\| `电影级 Cycles`（`CYCLES` 128 spp 100%）
- **采样数 (`samples`)**：`4`–`1024` 整数（默认 EEVEE `32`、Cycles `64`、Workbench `16`）
- **帧率与范围 (`fps` / `frameStart` / `frameEnd`)**：`24` \| `30` \| `60`；`frameStart >= 1`，单次动画范围 `frameEnd <= frameStart + 600`
- **机位 (`cameraPreset`)**：`three_quarter` \| `front` \| `isometric` \| `top` \| `closeup` \| `turntable`
- **灯光 (`lightingPreset`)**：`studio_3point` \| `soft_daylight` \| `dramatic_rim` \| `neon_cyber` \| `clay_overcast`
- **材质 (`materialPreset`)**：`clay_matte` \| `brushed_metal` \| `frosted_glass` \| `ceramic_gloss` \| `toon_cel`
- **实时 Lookdev 覆写（`v0.4.0`）**：
  - `accentColor`：`#RRGGBB`（实时重绘模板与 5 套高阶范本主色调）
  - `lensMm`：`18`–`135` mm 数值（默认 `50`；越界返回 `LENS_INVALID`；非默认值自动覆写活动相机焦段）
  - `exposure`：`-3` 至 `+3` EV 数值（默认 `0`；越界返回 `EXPOSURE_INVALID`；非零值自动写入 `scene.view_settings.exposure`）
  - `clayMode`：`boolean`（默认 `false`；开启后自动调用 `dsh_render_clay_override(True)` 输出统一哑光灰白模体检图）
  - `transparentBg`：`boolean`（透明底 RGBA PNG 输出）
- **脚本模式 (`scriptMode`)**：`template` \| `custom`（`customScript` 上限 `256 KB`）

---

## 5. 9 个内置 Blender 3.6–5.x 专业技能

| 技能名 (`skills/<name>/SKILL.md`) | 核心覆盖范围 |
| :--- | :--- |
| `blender-production-pipeline` | 5 阶段高质量 3D 生产全流程：`DSH_KIT` v2 硬表面建模与电影级 PBR 材质、5 套可实时重绘范本（`get_exemplar` / `create_from_exemplar`）、Lookdev 覆写、`render_shots` 多机位摄影包、Live Bridge v2 直控、`blender_workflow` 工作流录制与重放、版本快照回滚与 Cycles OIDN `pipeline` 导出 |
| `blender-scene-architecture` | DSH 工具编排顺序、右手 Z-Up 公制 1m 尺度、8 套模板选型、Collection 组织、非破坏修改器栈与零悬空接地 |
| `blender-bpy-scripting` | `bpy.data`/`bmesh` 优先于 `bpy.ops`、无头避坑、Blender 3.6/4.x/5.x API 兼容对照与静态安全规则 |
| `blender-materials-lighting` | PBR 物理基线、Principled BSDF 4.0+ 端口配方、按半径 `R` 缩放的三点布光、HDRI 世界节点与 AgX/Filmic |
| `blender-geometry-nodes` | `GeometryNodeTree`、`interface.new_socket`（4.0+）与 3.6 兼容、阵列/散射/曲线成面与数据可视化 |
| `blender-camera-animation` | 焦段构图、包围球自动取景公式、实时 `lensMm`/`exposure` 覆写、`render_shots` 5 机位摄影包、Live Bridge v2 `set_camera`、景深与 `TRACK_TO`、无停顿 360° Turntable 与 Slotted Actions |
| `blender-rendering-export` | EEVEE Next vs Cycles 降噪/防萤火虫、FFmpeg 偶数尺寸 H.264、GLB/FBX/OBJ/STL/`.blend` 跨版本导出 |
| `blender-grease-pencil` | GPv2（3.6–4.2 `GPENCIL`）与 GPv3（4.3–5.x `GREASEPENCIL`）双 API 绘图、2.5D 视差图层与 Line Art |
| `blender-visual-qc` | 基于 `contact_sheet` 2×2 四视角图、`clayMode` 白模覆写、`render_shots` 多机位包、A/B 卷帘对比与 `sceneSummary` 的 6 项视觉质检门禁闭环 |

技能遵循开放 Agent Skills 规范，可复制到 `~/.claude/skills/`、`.cursor/skills/`、`~/.gemini/skills/` 或 `~/.codex/skills/` 复用。

---

## 6. 环境变量、存储路径与配额限制

### 环境变量
- **`DSH_HOME`**：控制数据根目录位置，默认 `~/.dsh`，本插件持久化目录为 `${DSH_HOME}/data/dsh-blender-studio/`（含 `projects/`、`workflows/`、`settings.json`、`cache/polyhaven/`、`blender-home/`、`tmp/`）。
- **`DSH_BLENDER_EXECUTABLE`**：最高优先级指定本机 Blender 可执行文件完整路径，覆盖 `settings.json` 与系统自动扫描。

### 自动扫描顺序
1. 环境变量 `DSH_BLENDER_EXECUTABLE`
2. 工作台保存的 `settings.json` (`blenderPath`)
3. 系统 `PATH` 中的 `blender` / `blender.exe`
4. 各平台标准安装路径：
   - **Windows**：`Program Files\Blender Foundation\Blender *\blender.exe`、`%LOCALAPPDATA%\Programs\Blender Foundation\...`、Steam 与 Scoop 路径
   - **macOS**：`/Applications/Blender*.app/Contents/MacOS/Blender`、`~/Applications/Blender.app/...`、Homebrew `/opt/homebrew/bin/blender` & `/usr/local/bin/blender`
   - **Linux**：`/usr/bin/blender`、`/usr/local/bin/blender`、`/snap/bin/blender`、Flatpak `org.blender.Blender`、`~/.local/bin/blender`

### 存储与资源配额
- 活跃工程数上限：**30**（归档工程不占活跃名额，可随时恢复）
- 单工程素材数上限：**24** 个，单文件上限 **50 MB**，单工程素材总计上限 **120 MB**
- 支持的上传格式（同时校验扩展名与二进制魔数）：`.hdr`、`.exr`、`.png`、`.jpg`/`.jpeg`、`.webp`、`.glb`、`.gltf`、`.obj`、`.fbx`、`.stl`、`.blend`（含未压缩、gzip 与 zstd 压缩 `.blend`）
- 单工程自动保留最近 **20** 份成品（`MAX_PROJECT_ARTIFACTS = 20`，完整容纳多机位 `render_shots` 分镜包、四视角质检、静帧、动画与导出文件）并回收孤立运行目录（`pruneOldRuns`，失败/取消任务自动清理临时目录），单工程元信息上限 **4 MB**（`customScript` 上限 **256 KB**，自动保留最近 **10** 份脚本快照），单成品下载上限 **200 MB**，单任务滚动日志上限 **80 行**；源工程备份 ZIP 对已压缩媒体（`.png`/`.jpg`/`.webp`/`.mp4`/`.glb`/`.blend`/`.exr`）使用零压缩 Store 模式加速导出。
- 工作流配额：单工程自动保留最近 **120** 条录制事件（`MAX_WORKFLOW_EVENTS = 120`）；自定义工作流配方上限 **40** 套（`MAX_WORKFLOW_RECIPES = 40`，另内置 4 套只读 AAA 配方），单配方最多 **50** 个步骤（`MAX_WORKFLOW_STEPS = 50`），便携导出/导入配方 JSON 上限 **256 KB**（`MAX_WORKFLOW_JSON_BYTES = 256 KB`，`schemaVersion: 1`）。

---

## 7. 安全边界

1. **进程隔离**：全部子进程强制 `shell: false`，环境变量按白名单裁剪，重定向 `HOME` / `TEMP` / `BLENDER_USER_*` 至插件隔离目录，设置 `PYTHONNOUSERSITE=1`；超时或取消时 Windows 使用 `taskkill /PID /T /F`、POSIX 使用进程组 `-pid` 回收进程树。
2. **静态脚本安全校验（13 条规则）**：拦截 `os.system`/`os.popen`/`os.exec*`/`os.spawn*`/`os.remove`/`os.unlink`/`os.rmdir`、`subprocess`、`shutil.rmtree`、`ctypes`、`socket`、`urllib`、`requests`/`httpx`/`aiohttp`、`http.client`/`http.server`、`eval`/`exec`/`__import__`、`importlib`、路径穿越 `..` 及向外部绝对路径写入文件。
3. **存储与并发保护**：所有工程与资源 ID 强制严格 UUID，读写路径经 `realpath` 校验限制在插件根目录内并拒绝符号链接；使用 `proper-lockfile` 文件锁与 `revision` 乐观锁防止并发写覆盖；损坏工程目录自动隔离计数。
4. **网络边界**：Live Bridge 严格限定 `127.0.0.1` / `localhost` / `::1`；Poly Haven 客户端默认关闭（`POLYHAVEN_DISABLED`），开启后仅放行 HTTPS 的 `api.polyhaven.com` 与 `dl.polyhaven.org`（最多 3 跳且逐跳校验重定向目标主机），杜绝 SSRF。

---

## 8. 常见问题排错

| 问题 / 错误码 | 原因与解决方法 |
| :--- | :--- |
| `ENV_NOT_READY` | 本机未检测到 Blender。请安装 Blender `3.6–5.x`，或在「环境与桥接」页填入可执行路径 / 设置 `DSH_BLENDER_EXECUTABLE` 后点「重新探测」。 |
| `SCRIPT_UNSAFE` | 自定义 `bpy` 脚本命中了静态安全规则。请查看返回的规则名与行号并改用纯 `bpy`/`bmesh`/`mathutils` 实现；仅在完全信任脚本时再显式启用 `allowUnsafe: true`。 |
| `LENS_INVALID` / `EXPOSURE_INVALID` | Lookdev 覆写参数越界：`lensMm` 须在 `18–135` mm 之间，`exposure` 须在 `-3` 至 `+3` EV 之间。 |
| `CONFLICT` (`409`) | 该工程已在另一个标签页或由 AI 工具更新。刷新加载最新 `revision` 后再保存，或在表单中决定保留草稿。 |
| `POLYHAVEN_DISABLED` (`403`) | Poly Haven 外部资产检索默认关闭。前往「环境与桥接」页显式开启 `polyHavenEnabled` 即可使用。 |
| `JOB_TIMEOUT` (`504`) | Cycles 采样过高或帧数过大导致单次渲染超时。先将 `resolutionScale` 调至 `50%` 或切换 `EEVEE` 验证，再按需提升采样。 |
| `BRIDGE_UNREACHABLE` / `BRIDGE_AUTH_FAILED` | 请确认已在 Blender 启用 `dsh_blender_bridge.py` 并在 `N → DSH Bridge` 点击启动，且端口与 Token 两端一致；详见 [Live Bridge 指南](BRIDGE.md)。 |
| `WORKFLOW_INVALID` / `WORKFLOW_NOT_FOUND` / `WORKFLOW_LIMIT` / `WORKFLOW_BUILTIN_READONLY` | 工作流配方参数越界、导入 JSON 非 `schemaVersion: 1`、超出 40 套自定义配方上限，或尝试删除只读内置 AAA 配方；请核对步骤参数、先用 `dryRun: true` 预演或删除旧自定义配方后重试。 |

---

## 插件更新与许可证

- **插件更新**：要求 DSH `>=0.2.2-rc.3`。更新控件位于工作台或原生插件详情页底部；自动检查默认开启，**自动安装默认关闭**，且在存在运行中渲染任务或未保存草稿时暂停安装。
- **License**：[MIT](../LICENSE)
