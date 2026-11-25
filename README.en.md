[简体中文](README.md) · **English**

# Blender 3D Studio

> **Build precision 3D assemblies, orbit exported GLBs, compare renders A/B, auto-audit with QC-3D, iterate via surgical patches, and render with Cycles GPU acceleration inside DeepSeek Harness.**

Ships with the **OP-DSH 3D Studio Workbench** (featuring a **zero-dependency pure-JS `.glb` 3D mesh viewer** and **A/B Render Compare split-wipe**), **Headless Blender CLI with Cycles GPU auto-acceleration**, the **24-helper `DSH_KIT` v2 Hard-Surface & Cinema PBR Library**, **4 Pro Engineering Exemplars + 8 starter templates**, **1-Click Live Bridge Add-on installer**, and 9 Blender 3.6–5.x skills.

[![npm](https://img.shields.io/npm/v/dsh-blender-studio)](https://www.npmjs.com/package/dsh-blender-studio) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-blender-studio-downloads.svg)](https://www.npmjs.com/package/dsh-blender-studio) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-blender-studio-total-downloads.svg)](https://www.npmjs.com/package/dsh-blender-studio)

**[Features](#features) · [Built-In Pro Exemplars](#built-in-pro-exemplar-showcase) · [Install](#install) · [Workflow](#start-using-it) · [Full Reference](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/REFERENCE.en.md) · [Live Bridge Guide](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/BRIDGE.md)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/workflow-en-dark.svg">
  <img src="https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/workflow-en-light.svg" alt="dsh-blender-studio v0.3.0 4-stage high-quality 3D production workflow" width="100%">
</picture>

## Built-In Pro Exemplar Showcase

All four mechanical engineering scenes below **ship directly inside `dsh-blender-studio` v0.3.0** (launchable in 1 click from the Workbench Library or via `blender_project(action: 'create_from_exemplar')` and readable as few-shot `bpy` references). Every exemplar is verified end-to-end on **Blender 5.3.0 Cycles + OpenImageDenoise + AgX** at **`QC-3D 100/A`** with zero issues:

| AERO-X900 Cutaway Turbofan (37 objs · 64 spp Cycles) | KUKA 6-Axis Robot Arm Workstation (42 objs · 64 spp OPTIX) |
| :---: | :---: |
| ![AERO-X900 Cutaway Turbofan render](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-turbofan.webp) | ![KUKA 6-Axis Robot Arm render](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-robot-arm.webp) |
| **APEX-09 Cyber GT Hypercar (81 objs · 96 spp Cycles)** | **VANGUARD H-145X Twin-Turbine Helicopter (43 objs · 64 spp Cycles)** |
| ![APEX-09 Cyber GT Hypercar render](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-racecar.webp) | ![VANGUARD H-145X Twin-Turbine Helicopter render](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/hero-helicopter.webp) |

<details>
<summary>See OP-DSH 3D Studio workbench screenshots (Interactive Stage, 1-Click Pipeline, QC-3D Outliner & 4-View Check)</summary>

![OP-DSH 3D Studio interactive workbench](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/screen-zh.webp)

![OP-DSH 3D Studio 4-view visual QC and QC-3D Scene Outliner](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/screen-qc.webp)

Captured in a local DeepSeek Harness environment with live Blender 5.3.0 Cycles & EEVEE renders.

</details>

## Features

| Pillar | Capabilities |
| :--- | :--- |
| **OP-DSH 3D Studio & Interactive Monitor** | Zero-dependency Canvas 3D stage (8 template silhouettes, shortcuts `Space`/`1–4`/`R`/`Ctrl+S`, Quality Presets), **pure-JS `.glb` 3D Mesh Viewer** (`Shaded` / `Clay` / `Wireframe` orbit without Three.js/WebGL), **A/B Render Compare** pointer/keyboard split-wipe, PNG stills / **2×2 4-View QC** / MP4 playback, live **`QC-3D` grade badge** in Outliner & `DSH_KIT` v2 snippet chips; 1-click toggle to classic **Form** |
| **24-Helper `DSH_KIT` v2, Surgical Patch & Pipeline** | **24 cross-version `dsh_*` helpers** (lofted hulls, bolt rings, wheel assemblies, louver panels, radial arrays, 10 cinema PBR shaders including anodized metal / heat-blued titanium / copper-gold, 4 hero studios, clay override & `FOG_GLOW` compositor), **surgical `patch_script`** editing (pre-write safety scan + auto-checkpoints without resending 40–256 KB scripts), and **1-click 4-stage `pipeline`** (`Draft` / `Studio` / `Beauty Cycles`) |
| **Cycles GPU Auto-Acceleration & 1-Click Bridge** | **Track A (Default)**: Auto-detects local Blender 3.6–5.x and **Cycles GPU backends (`OPTIX`/`CUDA`/`METAL`/`HIP`/`ONEAPI` with safe `CPU` fallback)** controlled by `computeDevice` (`auto`/`gpu`/`cpu`), plus drag-and-drop auto-wired HDRIs & GLB/OBJ/FBX/STL models; **Track B (Optional)**: **1-click headless installer** for loopback-only `dsh_blender_bridge.py` (with live `QC-3D` & GPU info); **Track C**: 1-click open `.blend` in desktop Blender |
| **8 Templates + 4 Exemplars, 9 Skills & Safety** | 8 starter templates + 4 `QC-3D 100/A` Pro Engineering Exemplars, 6 Agent tools, 9 bundled skills, `256 KB` custom scripts, 13 `NodeSocket`-safe static checks, UUID optimistic locking, opt-in allowlisted Poly Haven CC0 client, and 13 bright themes × 8 dual-layer fonts |

## Install

Open **Plugins** in the DSH desktop app and install `dsh-blender-studio`, or use the CLI:

```bash
dsh plugin --profile desktop add dsh-blender-studio
```

For the web profile, replace `desktop` with `web` and restart DSH. Requires DSH `>=0.2.2-rc.3` and Node `^22.19.0 || >=24.0.0`.

## Start using it

1. **Verify local Blender & Cycles GPU**: Open **Blender 3D** in the sidebar and check **Bridge & Env** to confirm auto-detected Blender `3.6–5.x` and GPU acceleration (`OPTIX` / `CUDA` / `METAL` / `HIP` / `ONEAPI`, toggleable between `Auto` / `GPU` / `CPU`).
2. **Start from Templates, Pro Exemplars, or `DSH_KIT` v2**: Pick any of the 8 starter templates or launch one of the **4 Pro Exemplars** in 1 click from the Library, or open the `bpy Script` tab in **OP-DSH 3D Studio** to insert any of the 24 `dsh_*` engineering/PBR helpers.
3. **Drag-and-drop auto-wired assets**: Drop local HDRIs (`.hdr`/`.exr` auto-light the World), textures, or 3D models (`.glb`/`.obj`/`.fbx`/`.stl` auto-normalize & ground on stage) in **Assets & Exports**, or optionally enable Poly Haven CC0 search.
4. **Audit, Patch, Orbit GLB & Compare A/B**: Run **Run Pipeline** (`Draft` / `Studio` / `Beauty Cycles`) for chained `QC-3D` + 4-View QC + Cycles GPU render + GLB export. Inspect exported `.glb` geometry directly in the **`3D Mesh`** viewer, wipe between revisions in **`A/B Compare`**, and iterate via surgical `patch_script` with automatic checkpoint rollback.
5. **1-Click Live Bridge Setup**: Click **Install Add-on to Blender** in **Bridge & Env** (or call `blender_bridge(action: 'install_addon', confirmed: true)`) to install and enable `dsh_blender_bridge.py` automatically, then start the server in Blender (`N → DSH Bridge`) for live scene sync & viewport captures. See [Live Bridge Guide](docs/BRIDGE.md).

### Example prompts

> Create a project from the built-in `kuka-6axis-robot-arm` exemplar, use `blender_script(action: 'patch')` to change the arm paint to cobalt metallic and brighten the overhead softbox, save a checkpoint, and run `pipeline` (`qualityTier: 'beauty'`) with Cycles GPU to render a still and export GLB.

> Follow `blender-production-pipeline` using `DSH_KIT` v2 (`dsh_loft_profile`, `dsh_bolt_ring`, `dsh_mat_heat_blued_titanium`) to build a concept gas turbine. Run `dsh_render_clay_override(True)` for a 2×2 clay QC sheet first, then render the final PBR beauty pass.

> Install the Live Bridge add-on into my local Blender using `blender_bridge(action: 'install_addon', confirmed: true)` and sync this project into my open Blender window.

## Before you start

- **Local Blender required**: The plugin does not bundle the Blender binary. Install [Blender 3.6–5.x](https://www.blender.org/download/) locally; if it is outside your default `PATH`, set `DSH_BLENDER_EXECUTABLE` or configure the path in **Bridge & Env**.
- **Safe defaults**: Custom `bpy` scripts and surgical `patch_script` updates pass 13 static safety rules before writing or running (blocking shell calls, destructive deletion, network sockets, and path traversal without false-positiving on Blender `NodeSocket` code). Poly Haven CC0 downloads are opt-in and host-allowlisted; Live Bridge binds exclusively to `127.0.0.1` with `auto_start` off by default.
- **Portable skills**: All 9 bundled skills in `skills/` use the open Agent Skills (`SKILL.md`) format and can be copied into Claude Code, Cursor, Gemini CLI, or OpenAI Codex.

## Plugin updates

Check updates at the bottom of the workbench or native plugin details. Automatic checks are on by default; **automatic installation is off**, and installs pause whenever render jobs are running or unsaved drafts exist. Suite-managed components update with their bundle.

## Documentation & feedback

- [Full Reference (Tools, HTTP API & `DSH_KIT` v2)](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/REFERENCE.en.md) · [Live Bridge Protocol & 1-Click Installer](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/BRIDGE.md) · [Changelog](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/CHANGELOG.md) · [Validation Matrix](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/VALIDATION.md)
- Stars, [Issues](https://github.com/STARDUSTLC666/dsh-blender-studio/issues), and [PRs](https://github.com/STARDUSTLC666/dsh-blender-studio/pulls) are welcome (include plugin + Blender versions and strip tokens/secrets first).

## License

[MIT](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/LICENSE)
