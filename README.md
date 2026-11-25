**简体中文** · [English](README.en.md)

# Blender 3D Studio

> **在 DeepSeek Harness 中完成高精度 3D 建模、单进程多机位摄影批渲、实时 Lookdev 调光换色、自动体检（QC-3D）、Live Bridge v2 实时直控与 Cycles GPU 电影级渲染导出。**

内置 **OP-DSH 3D 工作室**（含**零依赖 `.glb` 3D 网格查看器 v2**、**多机位分镜底片条**与 **A/B 渲染对比卷帘**）、**Headless Blender CLI（Cycles GPU 自动加速 + 单启多机位 `render_shots`）**、**24 项 `DSH_KIT` v2 硬表面与 PBR 辅助库**、**5 套可实时换色高阶工程范本 + 8 套跨版本 `bpy` 模板**、**Live Bridge v2 结构化直控与一键安装**以及 9 个 Blender 3.6–5.x 专业技能。

[![npm](https://img.shields.io/npm/v/dsh-blender-studio)](https://www.npmjs.com/package/dsh-blender-studio) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-blender-studio-downloads.svg)](https://www.npmjs.com/package/dsh-blender-studio) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-blender-studio-total-downloads.svg)](https://www.npmjs.com/package/dsh-blender-studio)

**[核心能力](#核心能力) · [内置高阶范本画廊](#内置高阶范本画廊) · [安装](#安装) · [快速上手](#开始使用) · [完整说明](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/REFERENCE.zh.md) · [Live Bridge 指南](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/BRIDGE.md)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/workflow-zh-dark.svg">
  <img src="https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/workflow-zh-light.svg" alt="dsh-blender-studio v0.4.0 高质量 3D 生产四步流程示意" width="100%">
</picture>

## 内置高阶范本画廊

以下 **5 套复杂机械与精密制表工程作品**全部**内置于插件中**（工程库 1 键「从此范本创建」或 `blender_project(action: 'create_from_exemplar')` 启动，并可供 AI 读取作为 Few-Shot 脚本参考；全系支持零改码实时 `accentColor` 换色、`lensMm` 焦段、`exposure` 曝光与 `clayMode` 白模覆写），均通过本机 **Blender 5.3.0 Cycles + OpenImageDenoise + AgX** 实渲验证并达到 **`QC-3D 100/A`** 零缺陷：

| **NEW · CHRONO-X1 镂空陀飞轮机械腕表（34 对象 · 13.1K 面 · 64 spp Cycles OPTIX · 实时换色）** |
| :---: |
| ![CHRONO-X1 镂空陀飞轮机械腕表实渲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-tourbillon-watch.webp) |

| AERO-X900 剖视涡扇航发（37 对象 · 64 spp Cycles） | KUKA 6 轴工业机械臂工作站（42 对象 · 64 spp Cycles OPTIX） |
| :---: | :---: |
| ![AERO-X900 剖视涡扇航发实渲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-turbofan.webp) | ![6 轴工业机械臂工作站实渲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-robot-arm.webp) |
| **APEX-09 赛博 GT 超跑（81 对象 · 96 spp Cycles）** | **VANGUARD H-145X 双发救援直升机（43 对象 · 64 spp Cycles）** |
| ![APEX-09 赛博 GT 超跑实渲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-racecar.webp) | ![VANGUARD H-145X 双发直升机实渲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-helicopter.webp) |

<details>
<summary>查看 OP-DSH 3D 工作室实景截图（交互视口、一键全流程、QC-3D 大纲与四视角质检）</summary>

![OP-DSH 3D 工作室实时视口与工作台](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/screen-zh.webp)

![OP-DSH 3D 工作室四视角质检与 QC-3D 场景大纲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/screen-qc.webp)

图片来自本地 DeepSeek Harness 验证环境与本机 Blender 5.3.0 Cycles / EEVEE 实渲输出。

</details>

## 核心能力

| 模块 | 核心特性 |
| :--- | :--- |
| **OP-DSH 3D 工作室、GLB 查看器 v2 与分镜对比** | 零外部依赖 Canvas 3D 舞台（8 套模板轮廓、快捷键 `Space`/`1–4`/`R`/`Ctrl+S`、实时 **Lookdev 控制条** `lensMm` 18–135mm / `exposure` -3..+3 EV / `clayMode` 白模开关）、**`.glb` 3D 网格查看器 v2**（三光源棚拍 Phong 着色、`Shaded` / `Shaded + Wire` / `Clay` / `Wireframe` 四模式、`Shift+拖拽`/右键平移、一键 PNG 快照，同时支持预览上传的 `.glb` 素材）、底部 **多机位分镜底片条（Shot Filmstrip）** 与 **A/B 渲染对比卷帘**（支持 `still` / `contact_sheet` / `shot`） |
| **单启多机位批渲、24 项 `DSH_KIT` v2 与精准补丁** | **`render_shots` 单进程多机位摄影包**：单次启动 Blender 构建一次场景并连续出图 1–5 组专业摄影机位（`hero_3q` / `low_dramatic` / `macro_dof` / `side_profile` / `top_plan`，单工程保留上限扩至 20 份成品）；内置 **24 个跨版本 `dsh_*` 辅助函数**、**精准局部补丁 `patch_script`**（自动安全扫描与 10 份快照回滚）与 **一键 4 阶段 `pipeline`**（`Draft` / `Studio` / `Beauty Cycles`） |
| **Cycles GPU 自动加速与 Live Bridge v2 直控** | **Track A（默认）**：自动探测本机 Blender 3.6–5.x 与 **Cycles GPU 后端（`OPTIX`/`CUDA`/`METAL`/`HIP`/`ONEAPI`，安全回退 CPU）**，支持 `computeDevice` 切换与拖放 HDRI/3D 模型自动落台；**Track B（可选）**：**一键安装 `dsh_blender_bridge.py` (`0.4.0`)**（仅 `127.0.0.1` 回环），新增带自动撤销栈的结构化直控命令 **`set_camera` / `transform_object` / `set_material`**，无需手写 `bpy` 即可实时推拉机位、摆件与改材质；**Track C**：一键桌面 Blender 打开 `.blend` |
| **8 模板 + 5 范本、6 工具、9 技能与安全边界** | 内置 8 套场景模板与 **5 套全系可实时换色的 `QC-3D 100/A` 高阶工程范本**、6 个智能体工具与 9 个开放格式原生技能；支持 `256 KB` 自定义脚本、13 条 `NodeSocket` 友好静态安全校验、UUID 乐观锁、默认关闭的白名单 Poly Haven CC0 客户端与 DSH v3 的 13 套明亮主题 × 8 套双层字体 |

## 安装

在 DSH 桌面版「插件」面板安装 `dsh-blender-studio`，或使用命令行：

```bash
dsh plugin --profile desktop add dsh-blender-studio
```

网页版将 `desktop` 改为 `web`，安装后重启 DSH。宿主要求：`>=0.2.2-rc.3`（Node `^22.19.0 || >=24.0.0`）。

## 开始使用

1. **检查本机 Blender 与 GPU 加速**：从左侧栏打开 **Blender 3D**，进入「桥接与环境」页确认已自动探测到本机 Blender `3.6–5.x` 及 Cycles GPU 后端（如 `OPTIX` / `CUDA` / `METAL`，可按需切换 `自动 / 优先 GPU / 仅 CPU`）。
2. **从模板、5 套高阶范本或 `DSH_KIT` v2 起稿**：在工程库挑选 8 套基础模板或 **5 套高阶工程范本**（一键「从此范本创建」），无需改代码即可用顶部 Lookdev 控件实时切换 `accentColor` 主色、`lensMm` 焦段、`exposure` 曝光与 `clayMode` 白模体检。
3. **拖放素材自动装配与实时检视**：在「素材与成品」页直接拖放本地 HDRI（`.hdr`/`.exr` 自动打光）、贴图或 3D 模型（`.glb`/`.obj`/`.fbx`/`.stl` 自动归一化落台）；上传的 `.glb` 也可在舞台 **3D 网格 v2** 中直接三光源旋转检视并导出 PNG 快照。
4. **单启多机位摄影包、`QC-3D` 与 A/B 对比**：运行 **`render_shots` 多机位分镜包** 单次启动即批量获得英雄 3/4、低角度仰拍、微距景深特写、正侧轮廓与正俯工程图，在底部 **分镜底片条** 点击切换或进入 **A/B 卷帘对比**；或运行 **一键全流程（Pipeline）** 完成体检、精渲与 GLB 导出。
5. **一键安装并直控 Live Bridge v2**：在「桥接与环境」页点击 **「一键安装到本机 Blender」**（自动安装启用 `dsh_blender_bridge.py` v0.4.0），在 Blender `N → DSH Bridge` 启动后即可实时同步工程、使用「实时直控」面板或 `blender_bridge` 调整机位、物体变换与材质参数（全操作支持 `Ctrl+Z` 撤销）；详见 [Live Bridge 指南](docs/BRIDGE.md)。

### 常用对话示例

> 从内置范本 `chronograph-tourbillon-watch` 创建一个陀飞轮腕表工程，把 `accentColor` 改为 `#E11D48`（酒红玫瑰金）、`lensMm` 设为 `85`、`exposure` 设为 `0.3`，运行 `blender_render(action: 'render_shots', shots: ['hero_3q', 'macro_dof', 'low_dramatic', 'top_plan'], qualityTier: 'studio')` 一次出齐 4 机位摄影包。

> 按 `blender-production-pipeline` 5 阶段流程用 `DSH_KIT` v2 构建一台概念燃气轮机，先设 `clayMode: true` 跑 2×2 四视角白模体检，确认 `QC-3D 100/A` 后关闭 `clayMode` 并运行 `pipeline` (`qualityTier: 'beauty'`) 用 Cycles GPU 精渲静帧并导出 GLB。

> 用 `blender_bridge` 把当前工程同步到打开的 Blender 窗口，再用 `set_camera` 推近到 85mm 景深特写、`set_material` 把主体金属改为钴蓝色并截取视口图。

## 开始前要知道

- **本机依赖**：插件不自带 Blender 二进制，需本机已安装 [Blender 3.6–5.x](https://www.blender.org/download/)。若未加入系统 `PATH`，可在「桥接与环境」页手动配置路径或设置 `DSH_BLENDER_EXECUTABLE`。
- **默认安全策略**：自定义 `bpy` 脚本与局部 `patch_script` 写入前均经过 13 条静态安全扫描（拦截系统命令、破坏性删除、网络套接字与目录穿越，不误报 Blender `NodeSocket` 代码）；Poly Haven 外部资产检索默认关闭，开启后严格限制官方 HTTPS 主机白名单；Live Bridge 仅绑定 `127.0.0.1` 回环且自动启动默认关闭。
- **跨平台技能复用**：`skills/` 下 9 个技能采用开放 Agent Skills（`SKILL.md`）格式，可复制到 Claude Code、Cursor、Gemini CLI 或 OpenAI Codex 直接使用。

## 插件更新

在工作台或原生插件详情页底部检查更新。默认自动检查，**默认不自动安装**；有运行中渲染任务或未保存修改时自动暂停安装。Suite 管理的组件随整包更新。

## 文档与反馈

- [完整工具、API 与 `DSH_KIT` v2 参考](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/REFERENCE.zh.md) · [Live Bridge v2 协议与直控](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/BRIDGE.md) · [更新记录](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/CHANGELOG.md) · [测试与验证说明](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/VALIDATION.md)
- 欢迎 Star、提交 [Issues](https://github.com/STARDUSTLC666/dsh-blender-studio/issues) 与 [PR](https://github.com/STARDUSTLC666/dsh-blender-studio/pulls)（反馈请附插件版本、Blender 版本与复现步骤，并移除令牌等敏感信息）。

## License

[MIT](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/LICENSE)
