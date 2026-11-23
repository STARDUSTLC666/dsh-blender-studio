[简体中文](README.md) · **English**

# Blender 3D Studio

> **Create, preview, visually QC, and export 3D scenes, renders, MP4 animations, and GLB/FBX/OBJ/STL assets with Blender inside DeepSeek Harness.**

Ships with the **OP-DSH 3D Studio Interactive Workbench**, **Headless Blender CLI Runner**, **Loopback-Only Live Socket Bridge**, 6 cross-version `bpy` starter templates, and 8 specialized Blender 3.6–5.x skills.

[![npm](https://img.shields.io/npm/v/dsh-blender-studio)](https://www.npmjs.com/package/dsh-blender-studio) [![downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-blender-studio-downloads.svg)](https://www.npmjs.com/package/dsh-blender-studio) [![total downloads](https://raw.githubusercontent.com/STARDUSTLC666/dsh-suite/npm-downloads/assets/dsh-blender-studio-total-downloads.svg)](https://www.npmjs.com/package/dsh-blender-studio)

**[Features](#features) · [Install](#install) · [Workflow](#start-using-it) · [Full Reference](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/REFERENCE.en.md) · [Live Bridge Guide](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/BRIDGE.md)**

## Features

| Pillar | Capabilities |
| :--- | :--- |
| **OP-DSH 3D Studio** | Zero-dependency interactive Canvas 3D viewport (orbit drag, zoom, 3-axis gizmo, 6 template proxies & turntable preview), seamless switching to rendered PNGs / **2×2 4-View QC Contact Sheets** / MP4 playback, Scene Outliner & `bpy` script inspector; 1-click toggle to classic **Form** |
| **Hybrid Dual-Track Engine** | **Track A (Default)**: Zero-window Headless CLI execution (`blender --background --factory-startup`) with auto-detected Blender 3.6–5.x; **Track B (Optional)**: Bundled single-file `dsh_blender_bridge.py` add-on bound strictly to `127.0.0.1` for live viewport sync; **Track C**: 1-click open `.blend` in desktop Blender GUI |
| **6 Templates & 8 Native Skills** | Built-in `product-studio`, `logo-3d`, `isometric-room`, `motion-data`, `grease-pencil-2d`, and `blank-stage` templates plus 8 domain skills covering `BLENDER_EEVEE_NEXT`, Principled BSDF 4.0+, AgX, GPv3, and AI visual self-checks |
| **Security & Unified Themes** | 13 static `bpy` safety rules, UUID optimistic-lock storage, opt-in allowlisted Poly Haven CC0 client; adapted for DSH `>=0.2.2-rc.3` with 13 bright themes and 8 dual-layer font pairings (default: YouYuan Mono) synced across plugins |

<details>
<summary>See workbench screenshots & live Blender renders</summary>

#### OP-DSH 3D Studio (Interactive Canvas Stage & 2×2 4-View QC + Scene Outliner)

![OP-DSH 3D Studio interactive viewport](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/screen-zh.webp)

![OP-DSH 3D Studio 4-view visual QC and Scene Outliner](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/screen-qc.webp)

#### Real Headless Blender Template Renders

| Isometric Room (`isometric-room`) | 3D Logo & Title (`logo-3d`) |
| :---: | :---: |
| ![Isometric Room render](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/render-isometric.webp) | ![3D Logo render](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/render-logo.webp) |
| **Motion 3D Data (`motion-data`)** | **Grease Pencil 2D (`grease-pencil-2d`)** |
| ![Motion 3D Data render](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/render-motion.webp) | ![Grease Pencil 2D render](https://raw.githubusercontent.com/STARDUSTLC666/dsh-blender-studio/main/docs/assets/intro/render-gp2d.webp) |

Captured in a local DeepSeek Harness environment with live headless Blender 5.3.0 renders using built-in starter templates.

</details>

## Install

Open **Plugins** in the DSH desktop app and install `dsh-blender-studio`, or use the CLI:

```bash
dsh plugin --profile desktop add dsh-blender-studio
```

For the web profile, replace `desktop` with `web` and restart DSH. Requires DSH `>=0.2.2-rc.3` and Node `^22.19.0 || >=24.0.0`.

## Start using it

1. **Verify local Blender**: Open **Blender 3D** in the sidebar and check **Bridge & Env** to confirm auto-detected Blender `3.6–5.x` (or configure an explicit executable path / `DSH_BLENDER_EXECUTABLE`).
2. **Stage in 3D Studio or custom `bpy`**: Create a project to enter **OP-DSH 3D Studio** (switch to **Form** anytime in 1 click). Pick a template, aspect (`16:9` / `9:16` / `1:1`), engine (`EEVEE` / `CYCLES` / `WORKBENCH`), samples, lighting, material, and camera presets, orbit the interactive Canvas viewport, or switch to custom `bpy` scripting.
3. **Attach local or CC0 assets**: Save the project, then upload HDRIs (`.hdr`/`.exr`), textures (`.png`/`.jpg`/`.webp`), or models (`.glb`/`.gltf`/`.obj`/`.fbx`/`.stl`/`.blend`) in **Assets & Exports**. Optionally enable Poly Haven CC0 search in settings.
4. **4-View QC & Export**: Run a **2×2 Contact Sheet** first to verify grounding, clipping, framing, and lighting. Once approved, render final PNG stills, Turntable/keyframe MP4 videos, or export `GLB` / `FBX` / `OBJ` / `STL` / `.blend` plus full source ZIP archives.
5. **Optional Live Bridge**: Download `dsh_blender_bridge.py` from **Bridge & Env** and enable it in Blender to sync scenes live, capture the active viewport, or execute `bpy` snippets with undo support. See [Live Bridge Guide](docs/BRIDGE.md).

### Example prompts

> Build a product studio scene featuring frosted glass and brushed aluminum. Render a 2×2 contact sheet first to check grounding and lighting, then render a 1280×720 Cycles still and export GLB.

> Create an isometric cutaway room (`isometric-room`) with a 72-frame 360° turntable animation in EEVEE, export MP4, and sync the scene to my open Blender window via Live Bridge.

> Generate a multi-layer Grease Pencil 2D illustration compatible with Blender 4.4+ GPv3 and save a self-contained `.blend` archive.

## Before you start

- **Local Blender required**: The plugin does not bundle the Blender binary. Install [Blender 3.6–5.x](https://www.blender.org/download/) locally; if it is outside your default `PATH`, set `DSH_BLENDER_EXECUTABLE` or configure the path in **Bridge & Env**.
- **Safe defaults**: Custom `bpy` scripts are statically scanned before execution (blocking shell calls, destructive deletion, network sockets, and path traversal unless explicitly overridden). Poly Haven CC0 downloads are disabled by default and restricted to official hosts when enabled.
- **Portable skills**: All 8 bundled skills in `skills/` use the open Agent Skills (`SKILL.md`) format and can be copied into Claude Code, Cursor, Gemini CLI, or OpenAI Codex.

## Plugin updates

Check updates at the bottom of the workbench or native plugin details. Automatic checks are on by default; **automatic installation is off**, and installs pause whenever render jobs are running or unsaved drafts exist. Suite-managed components update with their bundle.

## Documentation & feedback

- [Full Reference (Tools, HTTP API & Limits)](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/REFERENCE.en.md) · [Live Bridge Protocol & Troubleshooting](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/BRIDGE.md) · [Changelog](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/CHANGELOG.md) · [Validation Matrix](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/docs/VALIDATION.md)
- Stars, [Issues](https://github.com/STARDUSTLC666/dsh-blender-studio/issues), and [PRs](https://github.com/STARDUSTLC666/dsh-blender-studio/pulls) are welcome (include plugin + Blender versions and strip tokens/secrets first).

## License

[MIT](https://github.com/STARDUSTLC666/dsh-blender-studio/blob/main/LICENSE)
