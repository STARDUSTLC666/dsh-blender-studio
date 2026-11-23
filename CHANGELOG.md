# 更新记录

[返回简介](README.md) · [完整说明](docs/REFERENCE.zh.md) · [Live Bridge 指南](docs/BRIDGE.md) · [验证说明](docs/VALIDATION.md)

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
