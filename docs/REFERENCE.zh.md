> 完整参考说明。首页 [README.md](../README.md) 聚焦核心能力、安装与上手流程；本文档集中记录 6 个智能体工具、HTTP 工作台 API、8 套工程模板、内置 `DSH_KIT` 建模与材质库、一键全流程 `pipeline`、自动资产装配、QC-3D 自动体检、脚本快照、9 个内置技能、环境变量、安全边界与常见问题排错。

# `dsh-blender-studio` 完整技术参考

**简体中文** · [English](REFERENCE.en.md) · [返回首页](../README.md) · [Live Bridge 指南](BRIDGE.md) · [验证矩阵](VALIDATION.md) · [更新记录](../CHANGELOG.md)

---

## 1. 架构概览与运行模式

`dsh-blender-studio` 采用**混合双轨 + 桌面接力**架构：

| 模式 | 触发方式 | 适用场景 |
| :--- | :--- | :--- |
| **Track A：Headless Blender CLI（默认）** | 通过 `spawn(executable, ['--background', '--factory-startup', '--python', scriptFile], { shell: false })` 无头执行 | 开箱即用；静帧 PNG、2×2 四视角质检拼图、MP4 动画、GLB/FBX/OBJ/STL/`.blend` 导出与场景大纲采集 |
| **Track B：Live Socket Bridge（可选）** | 连接本机运行中的 Blender GUI 所加载的 `blender/dsh_blender_bridge.py`（仅 `127.0.0.1:9876`） | 实时同步工程到打开的 Blender、查看实时场景树、带撤销栈在线执行 `bpy`、抓取视口 OpenGL 预览图 |
| **Track C：Open in Blender GUI** | 一键物化 `.blend` 并以分离进程启动本机桌面 Blender | 人工精修材质/建模/打光后继续回到 DSH 管线 |

---

## 2. 智能体工具参考（6 个工具）

插件向 DeepSeek Harness 注册 6 个结构化工具，全部返回人类可读摘要与结构化 JSON 数据：

| 工具名 | 动作 (`action`) / 能力 | 关键参数与说明 |
| :--- | :--- | :--- |
| **`blender_health`** | 只读全局自检 | 验证 9 个内置技能文件与宿主注册状态、本机 Blender 可执行路径/版本（含 `BLENDER_EEVEE_NEXT`/`BLENDER_EEVEE` 与 `gpv3`/`gpv2`）、Live Bridge 连接状态及 Poly Haven 开关；不修改文件或注册表。 |
| **`blender_project`** | `list` \| `create` \| `get` \| `update` \| `update_script` \| `duplicate` \| `save_checkpoint` \| `restore_checkpoint` \| `inspect_scene` \| `archive` \| `restore` | 管理 3D 工程生命周期。`duplicate` 一键克隆工程参数与已上传素材；更新 `customScript` 时自动保留最近 10 份版本快照，并支持 `save_checkpoint` / `restore_checkpoint` 一键回滚；`update` / `update_script` / `archive` / `restore` 需传当前 `revision`（冲突返回 `409 CONFLICT`）。`inspect_scene` 采集 `BlenderSceneSummary` 与确定性 **`QC-3D` 质量评分（`0–100` / `A–D`）与问题诊断清单**。 |
| **`blender_render`** | `preview_still` \| `contact_sheet` \| `render_animation` \| `export_model` \| `pipeline` \| `job` \| `cancel` | 驱动 Headless CLI 渲染与导出：`preview_still`（单帧 PNG）、`contact_sheet`（2×2 四视角质检 PNG）、`render_animation`（FFmpeg H.264 MP4 或 PNG 序列）、`export_model`（`format`: `glb` \| `fbx` \| `obj` \| `stl` \| `blend`），以及 **`pipeline` 一键全流程**（串联 `inspect_scene` → `contact_sheet` → `preview_still`/`render_animation` → `export_model`，支持 `qualityTier`: `draft` \| `studio` \| `beauty` 与 `abortOnQcError` 早停）。Cycles 自动启用 OpenImageDenoise（`RGB_ALBEDO_NORMAL`）+ 自适应采样 + AgX。 |
| **`blender_script`** | `validate` \| `run_headless` \| `run_bridge` | 对 `bpy` 代码执行 13 条静态安全扫描（`validate`），或在指定工程的无头环境（`run_headless`）或 Live Bridge（`run_bridge`）中运行，返回截断清理后的日志与最新 `sceneSummary`（含 `QC-3D` 评分）。触发高危规则时默认拒绝（`SCRIPT_UNSAFE`），除非显式传参 `allowUnsafe: true`。 |
| **`blender_bridge`** | `status` \| `get_addon_info` \| `scene_info` \| `viewport_capture` \| `sync_project` \| `open_gui` | 检测 Live Bridge 状态、获取 `dsh_blender_bridge.py` 路径与安装说明、拉取实时场景大纲（含实时 `QC-3D` 评分）、截取当前 Blender 视口 PNG（`width` 64–3840、`height` 64–2160）、同步 DSH 工程至 Blender 窗口、或直接启动桌面 Blender 打开 `.blend`。 |
| **`blender_assets`** | `list` \| `remove` \| `search_polyhaven` \| `import_polyhaven` | 查看/移除工程素材；在用户显式启用 `polyHavenEnabled` 后，按白名单检索与导入 Poly Haven CC0 的 `hdris` / `textures` / `models`（`resolution`: `1k` \| `2k`）。 |

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
| `?id=<uuid>&kind=asset&asset=<uuid>` | 流式返回工程素材文件，支持 HTTP `Range`（`206 Partial Content`）与 `&download=1` |
| `?id=<uuid>&kind=artifact&artifact=<uuid>` | 流式返回静帧、四视角质检图、MP4 或 3D 导出成品，支持 `Range` 与 `&download=1`（单文件下载上限 200 MB） |
| `?id=<uuid>&kind=source` | 动态异步打包（`fflate`）返回工程备份 ZIP（`dsh-blender-studio-<id>.zip`，含 `project.json`、`scene.py`、`assets/*`、`README.txt`） |

### 3.2 `POST /api/dsh-blender-studio/workbench`

`Content-Type: application/json`，统一返回 `{ "ok": true, "value": ... }` 或 `{ "ok": false, "message": "...", "code": "..." }`：

- **工程管理**：`list`、`create`、`get`、`update`、`duplicate`（`id`、`title?`）、`save_checkpoint`（`id`、`revision`、`note?`）、`restore_checkpoint`（`id`、`revision`、`checkpointId`）、`removeAsset`、`archive`、`restore`、`generatedScript`
- **任务与渲染**：`preview_still`、`contact_sheet`、`render_animation`、`export_model`（`format`）、`pipeline`（`includeContactSheet?`、`renderKind?`、`exportFormat?`、`qualityTier?`、`abortOnQcError?`）、`inspect_scene`、`run_script`（`code?`、`allowUnsafe?`）、`open_gui`、`job`、`cancel`
- **环境与设置**：`environment`、`configure`（`blenderPath?`、`bridgeHost?`、`bridgePort?`、`bridgeToken?`、`polyHavenEnabled?`）、`detect_blender`
- **实时桥接**：`bridge_status`、`bridge_scene`、`bridge_execute`（`code`）、`bridge_viewport`（`width?`、`height?`）、`bridge_sync`（`id`）
- **外部资产**：`polyhaven_search`（`query`、`type?`、`limit?`）、`polyhaven_import`（`id`、`revision`、`assetId`、`assetType`、`resolution?`）

### 3.3 `POST /api/dsh-blender-studio/workbench/upload`

流式二进制请求体，请求头：
- `x-dsh-blender-studio: 1`
- `x-project-id: <project-uuid>`
- `x-project-revision: <integer>`
- `x-file-name: <uri-encoded-filename>`

---

## 4. 8 套跨版本工程模板、自动资产装配与参数规格

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
- **上传 3D 模型（`.glb` / `.gltf` / `.obj` / `.fbx` / `.stl`）**：自动导入舞台、归一化缩放至约 `1.6 m` 并精准落台对齐底座顶面，拖拽即渲。
- **上传贴图 / 参考图（`.png` / `.jpg` / `.webp`）**：通过 `DSH_ASSETS` 字典注入脚本上下文，模板与自定义 `bpy` 均可直接复用。

### 内置 `DSH_KIT` 硬表面建模与电影级 PBR 辅助库
所有模板与自定义 `customScript` 执行前自动注入跨 Blender 3.6–5.x 的 `dsh_*` 辅助函数（零废弃警告）：
- **硬表面几何与取景**：`dsh_bevel`、`dsh_smooth`、`dsh_array_radial`、`dsh_tube_along_points`、`dsh_ground_assembly`、`dsh_frame_camera_to_assembly`
- **电影级程序化 PBR 材质**：`dsh_mat_car_paint`、`dsh_mat_carbon_fiber`、`dsh_mat_brushed_metal`、`dsh_mat_tinted_glass`、`dsh_mat_rubber_tire`、`dsh_mat_emissive_led`、`dsh_mat_matte_armor`
- **棚拍环境与后期**：`dsh_setup_hero_studio`（`dark_cyclorama` / `wet_asphalt` / `engineering_bay` / `helipad`）、`dsh_setup_compositor`（`FOG_GLOW` 泛光）、`dsh_add_dof`

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
- **脚本模式 (`scriptMode`)**：`template` \| `custom`（`customScript` 上限 `256 KB`）
- **主题色 (`accentColor`)**：`#RRGGBB`；支持 `transparentBg` 透明底 PNG

---

## 5. 9 个内置 Blender 3.6–5.x 专业技能

| 技能名 (`skills/<name>/SKILL.md`) | 核心覆盖范围 |
| :--- | :--- |
| `blender-production-pipeline` | 5 阶段高质量 3D 生产全流程：`DSH_KIT` 硬表面建模与电影级 PBR 材质、版本快照回滚、`QC-3D` + 四视角迭代闭环与 Cycles OIDN `pipeline` 导出 |
| `blender-scene-architecture` | DSH 工具编排顺序、右手 Z-Up 公制 1m 尺度、8 套模板选型、Collection 组织、非破坏修改器栈与零悬空接地 |
| `blender-bpy-scripting` | `bpy.data`/`bmesh` 优先于 `bpy.ops`、无头避坑、Blender 3.6/4.x/5.x API 兼容对照与静态安全规则 |
| `blender-materials-lighting` | PBR 物理基线、Principled BSDF 4.0+ 端口配方、按半径 `R` 缩放的三点布光、HDRI 世界节点与 AgX/Filmic |
| `blender-geometry-nodes` | `GeometryNodeTree`、`interface.new_socket`（4.0+）与 3.6 兼容、阵列/散射/曲线成面与数据可视化 |
| `blender-camera-animation` | 焦段构图、包围球自动取景公式、景深与 `TRACK_TO`、无停顿 360° Turntable 与 Slotted Actions 曲线 |
| `blender-rendering-export` | EEVEE Next vs Cycles 降噪/防萤火虫、FFmpeg 偶数尺寸 H.264、GLB/FBX/OBJ/STL/`.blend` 跨版本导出 |
| `blender-grease-pencil` | GPv2（3.6–4.2 `GPENCIL`）与 GPv3（4.3–5.x `GREASEPENCIL`）双 API 绘图、2.5D 视差图层与 Line Art |
| `blender-visual-qc` | 基于 `contact_sheet` 2×2 四视角图与 `sceneSummary` 的 6 项视觉质检门禁及缺陷→修复映射闭环 |

技能遵循开放 Agent Skills 规范，可复制到 `~/.claude/skills/`、`.cursor/skills/`、`~/.gemini/skills/` 或 `~/.codex/skills/` 复用。

---

## 6. 环境变量、存储路径与配额限制

### 环境变量
- **`DSH_HOME`**：控制数据根目录位置，默认 `~/.dsh`，本插件持久化目录为 `${DSH_HOME}/data/dsh-blender-studio/`（含 `projects/`、`settings.json`、`cache/polyhaven/`、`blender-home/`、`tmp/`）。
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
- 单工程自动保留最近 12 份成品并回收孤立运行目录（`pruneOldRuns`，失败/取消任务自动清理临时目录），单工程元信息上限 **4 MB**（`customScript` 上限 **256 KB**，自动保留最近 **10** 份脚本快照），单成品下载上限 **200 MB**，单任务滚动日志上限 **80 行**；源工程备份 ZIP 对已压缩媒体（`.png`/`.jpg`/`.webp`/`.mp4`/`.glb`/`.blend`/`.exr`）使用零压缩 Store 模式加速导出。

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
| `CONFLICT` (`409`) | 该工程已在另一个标签页或由 AI 工具更新。刷新加载最新 `revision` 后再保存，或在表单中决定保留草稿。 |
| `POLYHAVEN_DISABLED` (`403`) | Poly Haven 外部资产检索默认关闭。前往「环境与桥接」页显式开启 `polyHavenEnabled` 即可使用。 |
| `JOB_TIMEOUT` (`504`) | Cycles 采样过高或帧数过大导致单次渲染超时。先将 `resolutionScale` 调至 `50%` 或切换 `EEVEE` 验证，再按需提升采样。 |
| `BRIDGE_UNREACHABLE` / `BRIDGE_AUTH_FAILED` | 请确认已在 Blender 启用 `dsh_blender_bridge.py` 并在 `N → DSH Bridge` 点击启动，且端口与 Token 两端一致；详见 [Live Bridge 指南](BRIDGE.md)。 |

---

## 插件更新与许可证

- **插件更新**：要求 DSH `>=0.2.2-rc.3`。更新控件位于工作台或原生插件详情页底部；自动检查默认开启，**自动安装默认关闭**，且在存在运行中渲染任务或未保存草稿时暂停安装。
- **License**：[MIT](../LICENSE)
