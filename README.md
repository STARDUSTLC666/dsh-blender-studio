**简体中文** · [English](README.en.md)

# Blender 3D Studio

> **在 DeepSeek Harness 中完成高精度 3D 建模、实时预览、自动体检（QC-3D）、快照迭代与 Cycles 电影级渲染导出。**

内置 **OP-DSH 3D 工作室交互预览工作台**、**Headless Blender CLI 无头渲染引擎**、**16 项内置 `DSH_KIT` 硬表面与 PBR 辅助库**、**一键全流程 `pipeline`**、**本地回环 Live Bridge 插件**、8 套跨版本 `bpy` 模板与 9 个 Blender 3.6–5.x 专业技能。

[![npm](https://img.shields.io/npm/v/dsh-blender-studio)](https://www.npmjs.com/package/dsh-blender-studio) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-blender-studio-downloads.svg)](https://www.npmjs.com/package/dsh-blender-studio) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-blender-studio-total-downloads.svg)](https://www.npmjs.com/package/dsh-blender-studio)

**[核心能力](#核心能力) · [实渲画廊](#实渲画廊) · [安装](#安装) · [快速上手](#开始使用) · [完整说明](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/REFERENCE.zh.md) · [Live Bridge 指南](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/BRIDGE.md)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/workflow-zh-dark.svg">
  <img src="https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/workflow-zh-light.svg" alt="dsh-blender-studio 高质量 3D 生产四步流程示意" width="100%">
</picture>

## 实渲画廊

以下全部复杂机械与工程作品均直接通过 **`dsh-blender-studio` v0.2.0** 工作台 API、`DSH_KIT` 后期泛光、脚本快照与本机 **Blender 5.3.0 Cycles + OpenImageDenoise + AgX** 端到端构建渲染，均通过 **`QC-3D 100/A`** 零缺陷体检：

![AERO-X900 高涵道比剖视涡扇发动机（Blender 5.3.0 Cycles 实渲 · QC-3D 100/A）](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-turbofan.webp)

| APEX-09 赛博 GT 超跑（81 对象 · 96 spp Cycles） | VANGUARD H-145X 双发救援直升机（43 对象 · 64 spp Cycles） |
| :---: | :---: |
| ![APEX-09 赛博 GT 超跑实渲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-racecar.webp) | ![VANGUARD H-145X 双发直升机实渲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-helicopter.webp) |

<details>
<summary>查看 OP-DSH 3D 工作室实景截图（v0.2.0 交互视口、一键全流程、QC-3D 大纲与四视角质检）</summary>

![OP-DSH 3D 工作室实时视口与工作台](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/screen-zh.webp)

![OP-DSH 3D 工作室四视角质检与 QC-3D 场景大纲](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/screen-qc.webp)

图片来自本地 DeepSeek Harness 验证环境与本机 Blender 5.3.0 Cycles / EEVEE 实渲输出。

</details>

## 核心能力

| 模块 | 核心特性 |
| :--- | :--- |
| **高质量 3D 生产全流程** | 内置 **16 项 `DSH_KIT` 硬表面与电影级 PBR 辅助库**（车漆 / 碳纤维 / 拉丝金属 / 深色玻璃 / 轮胎 / LED / 装甲 + 四套棚拍舞台 + Fog Glow 泛光）、**一键全流程 `pipeline`**（`Draft` / `Studio` / `Beauty Cycles` 串联体检→四视角→渲染→导出 GLB）与**自动脚本版本快照（Checkpoints）**一键回滚 |
| **OP-DSH 3D 工作室** | 零外部依赖 Canvas 3D 交互舞台（8 套模板轮廓、轨道拖拽、缩放、快捷键 `Space`/`1–4`/`R`/`Ctrl+S` 与一键画质预设），无缝切换静帧 PNG / **2×2 四视角质检图** / MP4 回放、顶部 **`QC-3D` 评分徽章**大纲与 `DSH_KIT` 代码速插条；1 键切回经典「表单」 |
| **双轨驱动与自动资产装配** | **Track A（默认）**：无需打开 Blender 窗口，自动探测本机 Blender 3.6–5.x 无头执行（Cycles 自动启用 OpenImageDenoise + AgX），拖放上传 HDRI 自动打光、拖放 GLB/OBJ/FBX/STL 自动落台；**Track B（可选）**：`dsh_blender_bridge.py` 仅监听 `127.0.0.1` 实时同步与直播 `QC-3D`；**Track C**：一键桌面 Blender 打开 `.blend` |
| **8 套模板、9 项技能与安全边界** | 内置 `product-studio` / `logo-3d` / `isometric-room` / `motion-data` / `grease-pencil-2d` / `blank-stage` / `architectural-pavilion` / `procedural-abstract` 与 9 个原生技能；支持 `256 KB` 自定义脚本、13 条静态安全校验、UUID 乐观锁、默认关闭的 Poly Haven CC0 白名单客户端；配备 DSH v3 的 13 套明亮主题与 8 套双层字体 |

## 安装

在 DSH 桌面版「插件」面板安装 `dsh-blender-studio`，或使用命令行：

```bash
dsh plugin --profile desktop add dsh-blender-studio
```

网页版将 `desktop` 改为 `web`，安装后重启 DSH。宿主要求：`>=0.2.2-rc.3`（Node `^22.19.0 || >=24.0.0`）。

## 开始使用

1. **检查本机 Blender**：从左侧栏打开 **Blender 3D**，进入「桥接与环境」页确认已自动探测到本机 Blender `3.6–5.x`（或设置 `DSH_BLENDER_EXECUTABLE`）。
2. **模板起稿或 `DSH_KIT` 建模**：新建工程进入 **OP-DSH 3D 工作室**（随时 1 键切「表单」），选择 8 套跨版本模板之一，或切换到自定义 `bpy` 脚本模式使用内置 `dsh_*` 硬表面与 PBR 辅助函数；点击「复制」可随时拉出方案分支。
3. **拖放素材自动装配**：在「素材与成品」页直接拖放本地 HDRI（`.hdr`/`.exr` 自动打光）、贴图或 3D 模型（`.glb`/`.obj`/`.fbx`/`.stl` 自动归一化落台）；也可显式开启 Poly Haven 检索 CC0 资产。
4. **`QC-3D` 体检、快照迭代与一键全流程**：点击 **一键全流程（Pipeline）** 或分步运行 `QC-3D` 大纲体检与 **2×2 四视角质检**；每次修改脚本都会自动保存快照，支持随时 1 键回滚；确认构图和布光后切换 `Beauty Cycles` 导出高清 PNG、MP4 或 `GLB` / `FBX` / `OBJ` / `STL` / `.blend` 与源工程 ZIP 备份。
5. **可选实时桥接（Live Bridge）**：在「桥接与环境」页下载 `dsh_blender_bridge.py` 并在 Blender 中启用，即可实时同步工程、拉取实时 `QC-3D`、抓取视口或在线执行 `bpy`；详见 [Live Bridge 指南](docs/BRIDGE.md)。

### 常用对话示例

> 按 `blender-production-pipeline` 5 阶段流程建一台剖视高涵道比涡扇发动机：先用 `DSH_KIT` 搭建转子叶片、压气机与铜管流道，保存快照后跑 `QC-3D` 和 2×2 四视角自检确认无穿模无悬空，最后用 `pipeline` (`qualityTier: 'beauty'`) 渲染 1280×720 Cycles OIDN 精渲图并导出 GLB。

> 用 `architectural-pavilion` 模板新建一个建筑展馆工程，拖入我的 HDRI 环境图自动打光，先用 Draft 预演，确认后用 Cycles 精渲静帧。

> 用 `procedural-abstract` 创建一个 Geometry Nodes 扭转参数化几何雕塑，开启 72 帧 360° Turntable 动画导出 MP4，并同步到我本机打开的 Blender 窗口。

## 开始前要知道

- **本机依赖**：插件不自带 Blender 二进制，需本机已安装 [Blender 3.6–5.x](https://www.blender.org/download/)。若未加入系统 `PATH`，可在「桥接与环境」页手动配置路径或设置 `DSH_BLENDER_EXECUTABLE`。
- **默认安全策略**：自定义 `bpy` 脚本执行前自动经过 13 条静态安全扫描（拦截系统命令、破坏性删除、网络套接字与目录穿越，不误报 Blender `NodeSocket` 代码），除非显式放行；Poly Haven 外部资产检索默认关闭，开启后严格限制官方 HTTPS 主机白名单。
- **跨平台技能复用**：`skills/` 下 9 个技能采用开放 Agent Skills（`SKILL.md`）格式，可复制到 Claude Code、Cursor、Gemini CLI 或 OpenAI Codex 直接使用。

## 插件更新

在工作台或原生插件详情页底部检查更新。默认自动检查，**默认不自动安装**；有运行中渲染任务或未保存修改时自动暂停安装。Suite 管理的组件随整包更新。

## 文档与反馈

- [完整工具、API 与 `DSH_KIT` 参考](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/REFERENCE.zh.md) · [Live Bridge 协议与排错](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/BRIDGE.md) · [更新记录](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/CHANGELOG.md) · [测试与验证说明](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/VALIDATION.md)
- 欢迎 Star、提交 [Issues](https://github.com/STARDUSTLC666/dsh-blender-studio/issues) 与 [PR](https://github.com/STARDUSTLC666/dsh-blender-studio/pulls)（反馈请附插件版本、Blender 版本与复现步骤，并移除令牌等敏感信息）。

## License

[MIT](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/LICENSE)
