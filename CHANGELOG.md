# 更新记录

[返回简介](README.md) · [完整说明](docs/REFERENCE.zh.md) · [Live Bridge 指南](docs/BRIDGE.md) · [验证说明](docs/VALIDATION.md)

## [0.4.0] - 2026-11-25

- **单次启动多机位分镜批量渲染（`render_shots`）与分镜胶片条（Shot Filmstrip）**：
  - 新增 `POST { action: 'render_shots' }` 与 `blender_render(action: 'render_shots')`：仅启动**一次**无头 Blender 即可完成场景构建并连续出图多套专业电影机位（`hero_3q` 主 3/4 · `low_dramatic` 低角度广角 · `macro_dof` 微距景深 · `side_profile` 侧视工程图 · `top_plan` 俯视平面图），通过 `__DSH_SHOT_DONE__=` 实时上报进度并注册为 `kind: 'shot'` 成品（单工程保留上限提升至 `20` 份）。
  - 工作台视口底部新增可点击的**分镜胶片条（Shot Filmstrip）**与一键「对比两镜」，无缝接入 **A/B 对比卷帘**（现同时支持 `still` / `contact_sheet` / `shot` 三类图像成品）。
- **零代码实时 Lookdev 覆盖参数与第 5 套高阶范本（精密陀飞轮机械腕表）**：
  - 新增工程参数 `lensMm`（`18–135 mm` 焦段）、`exposure`（`-3..+3 EV` 曝光）与 `clayMode`（白模轮廓/倒角自检开关），通过 `DSH_OVERRIDES` + `dsh_apply_lookdev_overrides()` 对所有模板、自定义脚本与全部 5 套高阶范本即时生效；同时将 `accentColor` 接入全部 5 套范本主色材质，改色无需手改代码。
  - 新增第 5 套高阶工程范本 **`chronograph-tourbillon-watch`（CHRONO-X1 镂空陀飞轮机械腕表，`horology`）**：拉丝钛金属表壳与 60 槽玫瑰金表圈（默认 `#D97706`，支持实时改色）、旋入式表冠与双计时按钮、倒角镂空夹板、7 枚多齿齿轮系、6 点位飞行陀飞轮与蓝钢游丝、10 颗红宝石轴承、烤蓝剑形指针与防眩蓝宝石表镜（34 对象 · Cycles 64 spp OPTIX 实渲验证 **`QC-3D 100/A`**）。
- **离线 `.glb` 3D 网格查看器 v2 与 Live Bridge v2 结构化直控**：
  - 零外部依赖 Canvas `.glb` 软光栅查看器升级至 **三点棚拍 Phong 光照（Key + Fill + Rim）**，新增第 4 种 **`线框叠加（Shaded + Wire）`** 模式、**Shift+拖拽 / 右键平移**、双击复位、一键 **视口快照 PNG** 下载，并支持直接预览工程已上传的 `.glb` 素材。
  - `blender/dsh_blender_bridge.py` 升级至 `0.4.0`，新增 3 个带自动撤销栈的主线程直控命令：`set_camera`、`transform_object` 与 `set_material_color`（同步暴露于工作台「实时直控」面板、`POST bridge_set_camera` / `bridge_transform_object` / `bridge_set_material` 与 `blender_bridge` 工具）。
- **Multi-Shot Lookdev, Live Overrides, 5th Exemplar & Live Bridge v2 (`0.4.0`)**: introduces single-launch multi-camera batch rendering (`render_shots` with 5 editorial presets + Shot Filmstrip + `MAX_PROJECT_ARTIFACTS = 20`); adds zero-code Live Lookdev overrides (`lensMm`, `exposure`, `clayMode`, plus live `accentColor` repainting across all 5 Pro Exemplars); ships the 5th `QC-3D 100/A` Pro Exemplar (`chronograph-tourbillon-watch`); upgrades the zero-dependency `.glb` viewer to 3-light studio Phong shading, `Shaded + Wire`, pan, PNG snapshot & uploaded `.glb` preview; and adds Live Bridge v2 undo-safe direct controls (`set_camera`, `transform_object`, `set_material_color` in `dsh_blender_bridge.py` v0.4.0).

## [0.3.0] - 2026-11-25

- **零外部依赖交互式 GLB 3D 网格查看器与 A/B 渲染对比卷帘（OP-DSH 3D 工作室）**：
  - **内置纯 JS `.glb` 3D 网格查看器（`3D 网格` 视图）**：零 Three.js/WebGL 依赖，直接在 Canvas 2D 中解析并软光栅渲染本机导出的 `.glb` 模型，支持鼠标轨道旋转、缩放及 **着色（Shaded）/ 白模（Clay）/ 线框（Wireframe）** 三档切换。
  - **A/B 渲染对比卷帘（`A/B 对比` 视图）**：当工程存在 ≥2 份静帧或四视角质检图时，支持指针拖拽（`setPointerCapture`）与键盘方向键对比任意两次修订的渲染成品，清晰展示修订号、引擎与采样参数差异。
- **4 套内置高阶工程范本（Pro Engineering Exemplars）与 `DSH_KIT` v2（24 项辅助函数）**：
  - 新增 `src/exemplars.ts`，内置 4 套经真实 Blender 5.3.0 实渲验证达到 **`QC-3D 100/A`** 的高阶复杂机械范本：`aero-x900-turbofan`（剖视涡扇航发）、`apex-09-racecar`（赛博 GT 超跑）、`vanguard-h145x-helicopter`（双发复合直升机）与全新 **`kuka-6axis-robot-arm`（6 轴工业机械臂装配工作站）**；支持工程库一键「从此范本创建」及 `blender_project` `list_exemplars` / `create_from_exemplar` 供 AI 作为 Few-Shot 参考。
  - **`DSH_KIT` 升级至 v2（16 → 24 项）**：新增 `dsh_loft_profile`、`dsh_bolt_ring`、`dsh_wheel_assembly`、`dsh_louver_panel`、`dsh_mat_anodized_metal`、`dsh_mat_heat_blued_titanium`、`dsh_mat_copper_gold` 与 `dsh_render_clay_override`（白模轮廓/倒角自检），同步升级工作台代码速插条。
- **精准脚本局部补丁（`patch_script`）、Cycles GPU 自动加速与一键 Bridge 安装器**：
  - **精准局部替换（`blender_script` `action: 'patch'` / `POST patch_script`）**：支持对 40–256 KB 大型工程脚本执行 `find`/`replace` 精准局部编辑（写前强制静态安全扫描、防缺失/歧义误改、自动留存脚本快照并递增 `revision`），大幅节省 AI 迭代 Token。
  - **Cycles GPU 自动探测与计算设备切换**：自动探测本机 `OPTIX` / `CUDA` / `METAL` / `HIP` / `ONEAPI` 设备并在工作台「桥接与环境」页展示，支持 `computeDevice`（`auto` / `gpu` / `cpu`）配置与无异常 CPU 安全回退。
  - **一键自动安装 Live Bridge 插件**：`dsh_blender_bridge.py` 升级至 `0.3.0`（新增默认关闭的 `auto_start` 偏好并在 `ping` 返回 GPU 状态）；新增 `POST bridge_install_addon` / `blender_bridge(action: 'install_addon', confirmed: true)` 与工作台确认弹窗，通过无头 Blender 自动完成 `addon_install` + `addon_enable` + `save_userpref`。
- **Next-Gen 3D Studio Release (`0.3.0`)**: adds a zero-dependency pure-JS `.glb` 3D mesh viewer (`Shaded`/`Clay`/`Wireframe`) and pointer/keyboard-draggable **A/B Render Compare** split-wipe in the workbench; ships **4 Pro Engineering Exemplars** (`aero-x900-turbofan`, `apex-09-racecar`, `vanguard-h145x-helicopter`, and new `kuka-6axis-robot-arm`, all verified `QC-3D 100/A` on Blender 5.3.0); expands **`DSH_KIT` v2 to 24 helpers** (`dsh_loft_profile`, `dsh_bolt_ring`, `dsh_wheel_assembly`, `dsh_louver_panel`, `dsh_mat_anodized_metal`, `dsh_mat_heat_blued_titanium`, `dsh_mat_copper_gold`, `dsh_render_clay_override`); adds surgical `patch_script` editing (`blender_script` `action: 'patch'`) with pre-write safety checks and auto-checkpoints; adds automatic **Cycles GPU detection & `computeDevice` (`auto`/`gpu`/`cpu`)** acceleration; and introduces a **1-click headless Live Bridge Add-on installer** (`dsh_blender_bridge.py` v0.3.0 with opt-in `auto_start` and GPU status in `ping`).

## [0.2.3] - 2026-11-24

- **损坏目录清理与一键清空已归档**：黄色损坏工程提示条新增 **「查看并移入回收站清理」** 入口与确认弹窗（`trashCorrupted`），后端二次校验仅清理真实损坏目录并拒绝完好工程（`PROJECT_NOT_CORRUPT`）；「已归档」页新增 **「清空已归档（全部移入回收站）」**（`trashArchived`），单次批量移入系统回收站并受 `workbench-slot` 与活跃任务互斥保护。
- **Windows 单进程批量回收站加速与弹窗布局修复**：升级 `movePathsToTrash` 在 Windows 下以单进程对象列表批量移入回收站并拦截 UNC 网络路径；修复回退模态框在 `container-type: inline-size` 下宽度塌缩问题。
- **Corrupted folder cleanup, clear-all archived & Windows batch Recycle Bin**: add **Inspect & move to Recycle Bin** (`trashCorrupted`, refusing healthy projects with `PROJECT_NOT_CORRUPT`), **Clear archived (Recycle Bin)** (`trashArchived`), single-process Windows batch Recycle Bin with UNC rejection, and fallback modal width fix.

## [0.2.2] - 2026-11-24

- **系统回收站清理 3D 工程**：在活跃工程行、已归档工程行及「素材与成品」页新增 **「移入回收站」** 与确认弹窗（`trash`），采用零依赖跨平台系统原生回收站（Windows / macOS / Linux），包含修订号校验、运行中任务互斥与目录锁先释放保护。
- **外部删目录自动消失与预扫清理**：切回窗口（`focus` / `visibilitychange`）与列表页 8 秒静默同步自动移除磁盘上已删除的 3D 工程；未扫到前点击打开自动刷新列表，未扫到前手动点击「移入回收站」0 报错直接清理列表条目。
- **OS Recycle Bin & stale-folder auto-sync**: add confirmed **Move to Recycle Bin** (`trash`) on active/archived projects and Assets & Exports with revision & running-job guards; auto-hide externally deleted project folders on window focus/visibility return and 8s library sync, with clean zero-error pre-scan manual removal.

## [0.2.1] - 2026-11-24

- **恢复归档工程视图复位**：从「已归档工程」恢复并打开项目时，自动将编辑页签重置回 **3D 工作室**，与新建、打开和复制工程体验保持一致，不再停留在上次切换的旧页签。
- **英文界面（`en-US`）完整本地化**：基于结构化任务字段（`job.pipeline`）与本机环境元数据（`environment.active`）原生拼装英文全流程完成横幅与 Blender 环境状态摘要，消除英文模式下残留中文提示文本。
- **Polish Release (`0.2.1`)**: resets the active editor tab back to **3D Studio** when restoring an archived project, and localizes the `en-US` pipeline completion banner and Blender environment status summary directly from structured metadata (zero Chinese text leakage in English locale).

## [0.2.0] - 2026-11-24

- **高质量 3D 生产全流程（`DSH_KIT` + 一键 `pipeline` + 脚本版本快照）**：
  - **内置 `DSH_KIT` 硬表面建模与电影级 PBR 辅助库**：向全部模板与自定义 `customScript` 自动注入 16 个兼容 Blender 3.6–5.x 的 `dsh_*` 辅助函数（`dsh_bevel`、`dsh_smooth`、`dsh_array_radial`、`dsh_tube_along_points`、`dsh_ground_assembly`、`dsh_frame_camera_to_assembly`；车漆/碳纤维/拉丝金属/深色玻璃/轮胎橡胶/LED 发光/哑光装甲 PBR 材质；`dsh_setup_hero_studio` 四套棚拍舞台、`dsh_setup_compositor` 泛光与 `dsh_add_dof` 景深）。
  - **一键全流程任务（`pipeline`）**：串联 `inspect_scene`（`QC-3D` 体检，支持 `abortOnQcError` 早停）→ `contact_sheet`（2×2 四视角质检）→ `preview_still` / `render_animation`（支持 `draft` / `studio` / `beauty` 三档画质）→ `export_model`；Cycles 默认启用 OpenImageDenoise（`RGB_ALBEDO_NORMAL`）+ 自适应采样 + `AgX - Medium High Contrast`。
  - **无畏迭代快照（Script Checkpoints）**：每次修改 `customScript` 自动留存最近 10 份历史快照，并新增 `save_checkpoint` / `restore_checkpoint`（工作台与 `blender_project` 工具同步支持）。
- **新增 2 套旗舰模板（共 8 套）与零代码自动资产装配**：
  - 新增 `architectural-pavilion`（参数化建筑展馆）与 `procedural-abstract`（跨版本原生 `GeometryNodeTree` 程序化几何雕塑）；支持复制工程（`duplicate`）。
  - 上传 HDRI（`.hdr`/`.exr`）自动接入 World 环境节点，上传 3D 模型（`.glb`/`.gltf`/`.obj`/`.fbx`/`.stl`）自动归一化导入并精准落台，上传贴图自动暴露给脚本。
- **确定性 `QC-3D` 场景体检与第 9 项专业技能**：
  - Headless `inspect_scene`、自定义脚本与 Live Bridge `scene_info` 均自动输出 `QC-3D` 评分（`0–100` / `A–D`）与 8 类结构/构图问题诊断（含装配体感知 `FLOATING_HERO` 与相机视锥 `OFF_FRAME_HERO`），并在工作台「大纲」顶部实时展示。
  - 新增第 9 个内置技能 `blender-production-pipeline`（5 阶段 AAA 3D 生产规范）。
- **OP-DSH 工作台体验、安全边界与 CI 加固**：
  - 工作台新增一键画质预设（`Draft` / `Studio` / `Cycles`）、一键全流程条、`DSH_KIT` 代码速插条、脚本快照管理、拖放式素材上传区、活跃工程「复制」按钮、任务实时计时器与网络瞬断重试、快捷键（`Space` / `1–4` / `R` / `Ctrl+S`）及英文顶栏优化。
  - `customScript` 上限提升至 `256 KB`（`project.json` 上限 `4 MB`，POST JSON 上限 `512 KB`）；优化 `checkScriptSafety` 避免误报 Blender `NodeSocket` 代码；加固 DSH Desktop `Origin: dsh-app://app`（含 `Sec-Fetch-Site: cross-site` 豁免）与跨源 `403 ORIGIN_FORBIDDEN` 拦截；补齐上传失败回滚、旧运行目录自动回收（`pruneOldRuns`）与 Store 模式加速 ZIP 打包；CI 升级为 5 节点并发可控矩阵（Linux/Windows Node 22+24、macOS Node 24）。
- **High-Quality 3D Production Workflow Release (`0.2.0`)**: adds the built-in 16-helper `DSH_KIT` hard-surface & cinema PBR library (Blender 3.6–5.x safe), 1-click chained `pipeline` (`draft`/`studio`/`beauty` Cycles OIDN + AgX with `abortOnQcError`), automatic & explicit script checkpoints (`save_checkpoint`/`restore_checkpoint`), 2 new templates (`architectural-pavilion` & `procedural-abstract`, 8 total), auto-wired uploaded HDRI & 3D model staging, deterministic `QC-3D` auditing across CLI and Live Bridge, 9th bundled skill (`blender-production-pipeline`), `duplicate` project cloning, drag-and-drop asset upload, keyboard shortcuts, `256 KB` custom scripts, tightened `NodeSocket`-safe script scanning, hardened DSH Desktop `Origin: dsh-app://app` + `403 ORIGIN_FORBIDDEN` CSRF guard, run-directory retention pruning, Store-mode ZIP exports, light/dark workflow SVGs, and 5-job CI reliability hardening.

## [0.1.1] - 2026-11-24

- **工作台交互可发现性修复**：为已归档工程卡片与素材/成品导出行操作区显式标记 `data-always-visible="true"`，使「恢复工程 / 下载 / 移除 / 在舞台查看」按钮无需悬停即可始终可见且可点击。
- **2×2 四视角质检取景优化**：将自动四视角质检拼图（`contact_sheet`）正视图、3/4 视角与俯视角的相机距离放宽约 `1.3×`，为主体模型顶部与底座四周留出更充裕的安全构图边距。
- **Windows CI 测试稳定性**：在 Python AST 校验测试中强制开启 UTF-8 编码解码（`PYTHONUTF8=1` 与二进制 UTF-8 stdin/文件读取），消除 Windows CI 下 `cp1252` 编码报错。
- **Maintenance Release (`0.1.1`)**: keeps row action buttons (`Restore` / `Download` / `Remove` / `View on Stage`) always visible (`data-always-visible="true"`) on non-clickable archived project cards and asset/export rows; widens 2×2 four-angle QC contact-sheet auto-camera framing (~1.3× distance margin) for clean headroom across Front, 3/4, and Top quadrants; and enforces UTF-8 decoding in Python AST tests for Windows CI.

## 0.1.0 (2026-11-24)

- **混合双轨 3D 创作与渲染引擎（Hybrid Architecture，`dsh-blender-studio`）**：
  - **Track A — Headless Blender CLI**：默认开箱即用，以 `blender --background --factory-startup --python`（`shell: false`、裁剪环境变量与独立临时目录）执行工程与自定义 `bpy` 脚本，支持静帧预览（PNG）、**2×2 四视角质检拼图（Contact Sheet）**、FFmpeg MP4 动画渲染、多格式 3D 导出（`GLB` / `FBX` / `OBJ` / `STL` / `.blend`）与结构化场景大纲采集（`__DSH_SCENE_JSON__`）。
  - **Track B — Live Socket Bridge**：内置零依赖单文件 Blender 插件 `blender/dsh_blender_bridge.py`（兼容 Blender 3.6 / 4.x / 5.x），仅监听本机回环 `127.0.0.1`（默认端口 `9876`，支持可选共享 Token 鉴权与 `hmac.compare_digest` 校验），通过 `bpy.app.timers` 在 Blender 主线程安全调度执行并自动记录撤销栈，支持实时读取场景、执行 `bpy` 代码、视口抓图与一键工程同步。
  - **Track C — Open in Blender GUI**：支持一键物化并唤起本机桌面 Blender 窗口继续精修。
- **OP-DSH 3D 工作室前端工作台**：
  - 对齐 DSH `>=0.2.2-rc.3` Workbench UI v3 规范，默认进入 **3D 工作室** 视图（支持一键切回「表单」模式），内置零外部依赖 Canvas 3D 交互预览舞台（轨道拖拽、缩放、快捷机位与 Turntable 预演，无缝切换静帧 / 四视角质检图 / MP4 回放及旧修订提醒）。
  - 配备 13 套明亮风格主题、8 套中英双层字体（默认幼圆等宽 `arcade`）、4 步 `? 引导` 聚光灯导览与 `@stardustlc/dsh-updates` 更新保护。
- **6 套跨版本 `bpy` 工程模板与 8 个专业技能**：
  - 模板：`product-studio`、`logo-3d`、`isometric-room`、`motion-data`、`grease-pencil-2d`、`blank-stage`，自动适配 Blender 3.6–5.x 的 `BLENDER_EEVEE_NEXT` / `BLENDER_EEVEE`、Principled BSDF 4.0+ 端口、AgX/Filmic 与 GPv2/GPv3 差异。
  - 原生技能：`blender-scene-architecture`、`blender-bpy-scripting`、`blender-materials-lighting`、`blender-geometry-nodes`、`blender-camera-animation`、`blender-rendering-export`、`blender-grease-pencil`、`blender-visual-qc`。
- **6 个智能体工具与安全边界**：
  - 注册 `blender_health`、`blender_project`、`blender_render`、`blender_script`、`blender_bridge`、`blender_assets`；内置 13 条静态脚本安全校验规则、UUID + `realpath` 路径防穿越与乐观锁（`revision` + `proper-lockfile`）、以及默认关闭的 Poly Haven CC0 严格主机白名单客户端（仅限 `api.polyhaven.com` / `dl.polyhaven.org`）。
- **Flagship Initial Release (`dsh-blender-studio@0.1.0`)**: introduces hybrid Headless Blender CLI + loopback-only Live Socket Bridge (`dsh_blender_bridge.py`) + Open-in-GUI workflow, the zero-dependency Canvas 3D OP-DSH workbench (13 themes × 8 dual-layer fonts, Studio/Form toggle, 4-step `? Tour`), 6 Blender 3.6–5.x compatible `bpy` templates, 8 bundled domain skills, 6 Agent tools, static Python script safety scanning, optimistic locking storage, and opt-in SSRF-safe Poly Haven CC0 asset discovery.
