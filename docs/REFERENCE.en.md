> Full technical reference. See [README.en.md](../README.en.md) for the quickstart overview; this document covers all 6 Agent tools, the HTTP Workbench API, 8 starter templates + 5 Pro Engineering Exemplars, the built-in 24-helper `DSH_KIT` v2 library, single-launch multi-shot batch rendering (`render_shots`), Live Lookdev overrides (`lensMm` / `exposure` / `clayMode` / `accentColor`), surgical `patch_script`, Cycles GPU auto-acceleration, Live Bridge v2 direct controls & 1-click installer, 1-click `pipeline`, script checkpoints, auto-wired assets, QC-3D scene auditing, 9 bundled skills, environment variables, security boundaries, and troubleshooting.

# `dsh-blender-studio` Technical Reference

[简体中文](REFERENCE.zh.md) · **English** · [Home](../README.en.md) · [Live Bridge Guide](BRIDGE.md) · [Validation Matrix](VALIDATION.md) · [Changelog](../CHANGELOG.md)

---

## 1. Architecture & Execution Tracks

`dsh-blender-studio` uses a **hybrid dual-track + desktop handoff** architecture:

| Track | Execution Mechanism | Primary Use Cases |
| :--- | :--- | :--- |
| **Track A: Headless Blender CLI (Default)** | `spawn(executable, ['--background', '--factory-startup', '--python', scriptFile], { shell: false })` | Zero-window renders: PNG stills, 2×2 4-View QC contact sheets, single-launch multi-camera lookdev packs (`render_shots`), FFmpeg MP4 animations, GLB/FBX/OBJ/STL/`.blend` exports, and structured scene summaries |
| **Track B: Live Socket Bridge v2 (Optional)** | Connects over `127.0.0.1:9876` to `blender/dsh_blender_bridge.py` (`0.5.0`) inside a running Blender GUI | Live project sync into Blender (with Lookdev overrides), real-time evaluated depsgraph scene inspection & linked shader introspection, Undo-tracked `bpy` execution, structured direct controls (`set_camera`, `transform_object`, deep linked-node `set_material`), and OpenGL viewport captures |
| **Track C: Open in Blender GUI** | Materializes `.blend` (if needed) and spawns desktop Blender detached | Manual lookdev/sculpting refinement in native Blender |

---

## 2. Agent Tool Reference (6 Tools)

| Tool Name | Actions / Scope | Key Parameters & Behavior |
| :--- | :--- | :--- |
| **`blender_health`** | Read-only health check | Verifies all 9 bundled `SKILL.md` files and host registration state, active local Blender version (`BLENDER_EEVEE_NEXT`/`BLENDER_EEVEE`, `gpv3`/`gpv2`, and **Cycles GPU backend/device probe**), `computeDevice` setting, Live Bridge connectivity, and Poly Haven toggle. Does not mutate disk or registry state. |
| **`blender_project`** | `list` \| `create` \| `get` \| `update` \| `update_script` \| `duplicate` \| `list_exemplars` \| `create_from_exemplar` \| `save_checkpoint` \| `restore_checkpoint` \| `inspect_scene` \| `archive` \| `restore` | Full project CRUD plus **5 Pro Engineering Exemplars** (`aero-x900-turbofan`, `apex-09-racecar`, `vanguard-h145x-helicopter`, `kuka-6axis-robot-arm`, `chronograph-tourbillon-watch` — inspectable via `get` as few-shot references). Supports **Live Lookdev overrides** (`accentColor` zero-code live repainting on all 5 exemplars, `lensMm` `18–135 mm`, `exposure` `-3..+3 EV`, OPTIX-safe `clayMode` audit). `duplicate` clones project fields and uploaded assets; editing `customScript` automatically saves up to 10 checkpoints with `save_checkpoint`/`restore_checkpoint`; `inspect_scene` supports `wait: true` and returns evaluated depsgraph polycounts plus the deterministic **`QC-3D` score (`0–100`, Grade `A–D`)**. |
| **`blender_render`** | `preview_still` \| `contact_sheet` \| `render_shots` \| `render_animation` \| `export_model` \| `pipeline` \| `job` \| `cancel` | Drives Headless CLI jobs (all 6 async actions support synchronous **`wait: true`** to await completion and return artifact paths & `QC-3D` directly): `preview_still` (PNG), `contact_sheet` (zero-Pillow `numpy`-accelerated 2×2 4-angle QC PNG), **`render_shots` (single Blender launch building the scene once and batch-rendering 1–5 camera presets `hero_3q` / `low_dramatic` / `macro_dof` / `side_profile` / `top_plan` with optional `shots[]` & `qualityTier` and monotonic per-shot progress)**, `render_animation` (Blender 5.x `media_type`-safe H.264 MP4 / PNG fallback), `export_model` (`format`: `glb` \| `fbx` \| `obj` \| `stl` \| `blend`, RNA-safe `export_apply=True` with automatic backdrop stripping for interchange formats and packed compressed `.blend`), and **1-click `pipeline`** (`draft` \| `studio` \| `beauty` with optional `abortOnQcError`). Cycles auto-accelerates via `computeDevice` (`OPTIX`/`CUDA`/`METAL`/`HIP`/`ONEAPI` with safe `CPU` fallback) + OIDN + AgX; EEVEE 4.2+/5.x enables raytracing & denoising. |
| **`blender_script`** | `validate` \| `patch` \| `run_headless` \| `run_bridge` | Runs the 13-rule static safety scanner (`validate`), applies surgical single (`find`/`replace`/`replaceAll?`) or **atomic multi-hunk `edits[]` (up to 50 edits, all-or-nothing rollback, single checkpoint)** **`patch`** replacements on large 40–256 KB scripts with pre-write safety check, or executes custom `bpy` code in headless mode (`run_headless`, supports `wait: true`) / Live Bridge (`run_bridge`) returning logs and `sceneSummary` (with `QC-3D`). |
| **`blender_bridge`** | `status` \| `get_addon_info` \| `install_addon` \| `scene_info` \| `viewport_capture` \| `sync_project` \| `set_camera` \| `transform_object` \| `set_material` \| `open_gui` | Checks bridge status & GPU backend, locates `dsh_blender_bridge.py`, runs **1-click headless `install_addon`** (requires `confirmed: true`), inspects live scene state (with live `QC-3D` audit), captures the Blender 3D viewport (`width` 64–3840, `height` 64–2160), syncs a project script into Blender, drives **Live Bridge v2 Undo-safe direct controls** (`set_camera`, `transform_object`, `set_material`), or launches desktop Blender GUI. |
| **`blender_assets`** | `list` \| `remove` \| `search_polyhaven` \| `import_polyhaven` | Manages uploaded project assets and—when `polyHavenEnabled` is explicitly turned on—searches and imports allowlisted CC0 `hdris`, `textures`, or `models` (`resolution`: `1k` \| `2k`) from Poly Haven. |

---

## 3. HTTP Workbench API Contract

- **Primary endpoint**: `/api/dsh-blender-studio/workbench` (`GET`, `POST`)
- **Streaming upload endpoint**: `/api/dsh-blender-studio/workbench/upload` (`POST`, `requestBody: 'streaming'`)
- **CSRF & Origin Guard**: Every `POST` request must include `x-dsh-blender-studio: 1` (also accepts `x-dsh-blender: 1` for backward compat). Explicitly allows DeepSeek Harness Desktop Electron `Origin: dsh-app://app` (including `Sec-Fetch-Site: cross-site` exemption) and loopback same-origin requests while rejecting untrusted third-party/cross-site origins with HTTP `403 ORIGIN_FORBIDDEN`; JSON body cap `512 KB`.

### 3.1 `GET /api/dsh-blender-studio/workbench`

| Query Parameters | Response |
| :--- | :--- |
| `?kind=addon` | Downloads `dsh_blender_bridge.py` (`text/x-python`, `Content-Disposition: attachment`) |
| `?id=<uuid>&kind=asset&asset=<uuid>` | Streams an uploaded/imported asset with HTTP `Range` (`206`) support and optional `&download=1` (also feeds uploaded `.glb` files directly into the Workbench GLB Viewer v2) |
| `?id=<uuid>&kind=artifact&artifact=<uuid>` | Streams a rendered PNG, 2×2 contact sheet, multi-shot `shot` frame, MP4, or 3D export (`Range` + `&download=1`, 200 MB cap) |
| `?id=<uuid>&kind=source` | Builds and streams a full backup ZIP (`dsh-blender-studio-<id>.zip` via `fflate`) containing `project.json`, `scene.py`, `assets/*`, and `README.txt` |

### 3.2 `POST /api/dsh-blender-studio/workbench`

`Content-Type: application/json`, returning `{ "ok": true, "value": ... }` or `{ "ok": false, "message": "...", "code": "..." }`:

- **Projects & Exemplars**: `list` (includes `exemplars` summaries and `shotPresets`), `list_exemplars`, `create_from_exemplar` (`exemplarId`, `title?`), `create`, `get`, `update` (including `lensMm`, `exposure`, `clayMode`, `accentColor`), `patch_script` (`id`, `revision`, single `find`/`replace`/`replaceAll?` or atomic multi-hunk `edits[]`, `note?`, `allowUnsafe?`), `duplicate` (`id`, `title?`), `save_checkpoint` (`id`, `revision`, `note?`), `restore_checkpoint` (`id`, `revision`, `checkpointId`), `removeAsset`, `archive`, `restore`, `generatedScript`
- **Jobs & Rendering**: `preview_still`, `contact_sheet`, `render_shots` (`id`, `revision?`, `shots?`, `qualityTier?`, `frame?`, `allowUnsafe?`), `render_animation`, `export_model` (`format`), `pipeline` (`includeContactSheet?`, `renderKind?`, `exportFormat?`, `qualityTier?`, `abortOnQcError?`), `inspect_scene`, `run_script` (`code?`, `allowUnsafe?`), `open_gui`, `job`, `cancel`
- **Environment & Settings**: `environment` (includes `gpu` & `computeDevice`), `configure` (`blenderPath?`, `computeDevice?`, `bridgeHost?`, `bridgePort?`, `bridgeToken?`, `polyHavenEnabled?`), `detect_blender`
- **Live Bridge v2**: `bridge_status`, `bridge_install_addon` (`confirmed: true`), `bridge_scene`, `bridge_execute` (`code`), `bridge_viewport` (`width?`, `height?`), `bridge_sync` (`id`), `bridge_set_camera` (`location?`, `target?`, `lensMm?`, `dofFstop?`), `bridge_transform_object` (`name`, `location?`, `rotationDeg?`, `scale?`), `bridge_set_material` (`materialName`, `color`, `metallic?`, `roughness?`)
- **External Assets**: `polyhaven_search` (`query`, `type?`, `limit?`), `polyhaven_import` (`id`, `revision`, `assetId`, `assetType`, `resolution?`)

### 3.3 `POST /api/dsh-blender-studio/workbench/upload`

Raw binary request body with headers:
- `x-dsh-blender-studio: 1`
- `x-project-id: <project-uuid>`
- `x-project-revision: <integer>`
- `x-file-name: <uri-encoded-filename>`

---

## 4. 8 Starter Templates, 5 Pro Exemplars, Auto-Wired Assets & Field Constraints

| Template ID | Display Name | Recommended Engine | Default Camera | Default Lighting | Default Material | Default Frames |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `product-studio` | Product Studio | `EEVEE` | `three_quarter` | `studio_3point` | `ceramic_gloss` | `48` |
| `logo-3d` | 3D Logo & Title | `EEVEE` | `front` | `dramatic_rim` | `brushed_metal` | `48` |
| `isometric-room` | Isometric Room | `CYCLES` | `isometric` | `soft_daylight` | `clay_matte` | `48` |
| `motion-data` | Motion 3D Data | `EEVEE` | `three_quarter` | `neon_cyber` | `frosted_glass` | `72` |
| `grease-pencil-2d` | Grease Pencil 2D | `EEVEE` | `front` | `clay_overcast` | `toon_cel` | `48` |
| `blank-stage` | Blank Calibrated Stage | `EEVEE` | `three_quarter` | `studio_3point` | `clay_matte` | `48` |
| `architectural-pavilion` | Architectural Pavilion | `EEVEE` | `three_quarter` | `soft_daylight` | `clay_matte` | `48` |
| `procedural-abstract` | Procedural GeoNodes Art | `EEVEE` | `three_quarter` | `dramatic_rim` | `brushed_metal` | `72` |

### Zero-Code Auto-Wired Assets
- **Uploaded HDRIs (`.hdr` / `.exr`)**: Automatically wired into World `ShaderNodeTexEnvironment -> Background` (preserving studio fallback lighting when absent).
- **Uploaded 3D Models (`.glb` / `.gltf` / `.obj` / `.fbx` / `.stl`)**: Automatically imported onto the stage, normalized to ~`1.6 m`, and grounded onto the hero pedestal for instant zero-code rendering. Uploaded `.glb` assets can also be inspected directly inside the **Interactive GLB Viewer v2**.
- **Uploaded Textures / References (`.png` / `.jpg` / `.webp`)**: Exposed cleanly to scripts via the injected `DSH_ASSETS` helper dict.

### 5 Pro Engineering Exemplars (`v0.4.0`, Live `accentColor` Repaintable)
Five Blender 5.3.0 visually verified **`QC-3D 100/A`** engineering & horology masterpieces shipped directly inside the package — launchable in 1 click from the Workbench Library or `blender_project(action: 'create_from_exemplar')` and readable via `get` as few-shot `bpy` references. All 5 exemplars respond live to `accentColor`, `lensMm`, `exposure`, and `clayMode` without code edits:
- `aero-x900-turbofan` — AERO-X900 Cutaway High-Bypass Turbofan Jet Engine (`aerospace` · Cycles 64 spp · default `#2563EB`)
- `apex-09-racecar` — APEX-09 Cyber GT Hypercar (`vehicle` · Cycles 96 spp · default `#B91C1C`)
- `vanguard-h145x-helicopter` — VANGUARD H-145X Twin-Turbine Helicopter (`aerospace` · Cycles 64 spp · default `#EA580C`)
- `kuka-6axis-robot-arm` — 6-Axis Industrial Robot Arm Workstation (`robotics` · Cycles 64 spp · default `#EA580C`)
- `chronograph-tourbillon-watch` — CHRONO-X1 Skeleton Tourbillon Watch (`horology` · Cycles 64 spp · default `#D97706` · brushed titanium case with 60-flute bezel, chamfered skeleton bridges, 7 spoked gears, 6 o'clock flying tourbillon with blued hairspring, 10 ruby jewels, heat-blued Dauphine hands & AR domed sapphire crystal)

### Single-Launch Multi-Shot Lookdev Pack (`render_shots` / `BLENDER_SHOT_PRESETS`)
Builds the 3D scene **once** in a single headless Blender process, then sweeps through 1–5 auto-framed photographic camera presets, emitting `__DSH_SHOT_DONE__=<json>` as each shot finishes. Rendered shots populate the Workbench **Shot Filmstrip** and work seamlessly inside **A/B Split-Wipe Compare** (supporting `still`, `contact_sheet`, and `shot` artifacts):

| Shot Preset ID | English Label | Chinese Label | Lens (`lensMm`) | Azimuth / Elevation | Framing Margin / DoF |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hero_3q` | Hero 3/4 | 英雄 3/4 透视 | `50 mm` | `35°` / `18°` | `margin 1.18` (default) |
| `low_dramatic` | Low Dramatic | 低角度仰拍 | `35 mm` | `-42°` / `8°` | `margin 1.15` (default) |
| `macro_dof` | Macro DOF | 微距景深特写 | `85 mm` | `22°` / `14°` | `margin 0.78` · `f/2.8` (default) |
| `side_profile` | Side Profile | 正侧轮廓 | `70 mm` | `90°` / `6°` | `margin 1.16` |
| `top_plan` | Top Plan | 正俯工程图 | `50 mm` | `0°` / `86°` | `margin 1.18` (default) |

### Built-In `DSH_KIT` v2 Hard-Surface & Cinema PBR Library (24 Helpers)
Every generated template, exemplar, and `customScript` automatically receives 24 cross-version `dsh_*` helpers (Blender 3.6–5.x safe, zero deprecation warnings):
- **Hard-Surface Geometry & Framing (10)**: `dsh_bevel`, `dsh_smooth`, `dsh_loft_profile`, `dsh_bolt_ring`, `dsh_wheel_assembly`, `dsh_louver_panel`, `dsh_array_radial`, `dsh_tube_along_points`, `dsh_ground_assembly`, `dsh_frame_camera_to_assembly`
- **Cinema Procedural PBR Shaders (10)**: `dsh_mat_car_paint`, `dsh_mat_carbon_fiber`, `dsh_mat_brushed_metal`, `dsh_mat_anodized_metal`, `dsh_mat_heat_blued_titanium`, `dsh_mat_copper_gold`, `dsh_mat_tinted_glass`, `dsh_mat_rubber_tire`, `dsh_mat_emissive_led`, `dsh_mat_matte_armor`
- **Hero Studios, Clay Audit & Post (4)**: `dsh_setup_hero_studio` (`dark_cyclorama`, `wet_asphalt`, `engineering_bay`, `helipad`), `dsh_render_clay_override`, `dsh_setup_compositor` (`FOG_GLOW` glare), `dsh_add_dof`; plus `dsh_configure_cycles_device` for automatic Cycles GPU/CPU acceleration and `dsh_apply_lookdev_overrides` to apply `DSH_OVERRIDES` (`lensMm`, `exposure`, `clayMode`, `transparentBg`) non-destructively after scene build.

### Built-In PBR Interactive GLB Viewer v3 (Zero-Dependency Canvas)
The Workbench Stage embeds a zero-dependency Canvas 2D GLB mesh inspector v3 that opens both exported `.glb` artifacts (auto-focusing on export) and uploaded `.glb` assets, featuring glTF PBR metallic/roughness/emissive 3-light shading, cofactor (inverse-transpose) normal transforms for non-uniform/mirrored scales, `TRIANGLE_STRIP` & `TRIANGLE_FAN` support, material-boundary-preserving decimation, 4 shading modes (`Shaded`, `Shaded + Wire`, `Clay`, `Wireframe`), `ResizeObserver` redraw, `Shift+Drag` / right-click pan, scroll zoom, double-click camera reset, and 1-click PNG Snapshot download.

### Deterministic `QC-3D` Scene Quality Audit
Headless `inspect_scene`, `blender_script`, and Live Bridge `scene_info` return `sceneSummary.qc` (`score`: `0–100`, `grade`: `A|B|C|D`, `issues[]`) checking 8 rules: `EMPTY_SCENE`, `NO_CAMERA`, `NO_LIGHTS`, `UNASSIGNED_MATERIAL`, `FLAT_UNBEVELED_PRIMITIVE`, `FLOATING_HERO` (assembly-aware), `OFF_FRAME_HERO` (camera NDC frustum projection), and `HIGH_POLYCOUNT`.

### Valid Field Ranges

- **`aspect`**: `landscape` (`1280×720`), `portrait` (`720×1280`), `square` (`1024×1024`)
- **`resolutionScale`**: `50` \| `100` \| `150` \| `200` (%)
- **`engine`**: `EEVEE` (resolves to `BLENDER_EEVEE_NEXT` on 4.2+ automatically) \| `CYCLES` (auto OpenImageDenoise + adaptive sampling) \| `WORKBENCH`
- **Workbench 1-Click Quality Presets**: `Draft` (`EEVEE` 16 spp 50%) \| `Studio` (`EEVEE` 32 spp 100%) \| `Cycles` (`CYCLES` 128 spp 100%)
- **`samples`**: integer `4`–`1024` (defaults: `32` EEVEE, `64` Cycles, `16` Workbench)
- **`fps` / `frameStart` / `frameEnd`**: `24` \| `30` \| `60`; `frameStart >= 1`; `frameEnd <= frameStart + 600`
- **`cameraPreset`**: `three_quarter` \| `front` \| `isometric` \| `top` \| `closeup` \| `turntable`
- **`lightingPreset`**: `studio_3point` \| `soft_daylight` \| `dramatic_rim` \| `neon_cyber` \| `clay_overcast`
- **`materialPreset`**: `clay_matte` \| `brushed_metal` \| `frosted_glass` \| `ceramic_gloss` \| `toon_cel`
- **Live Lookdev Overrides (`v0.4.0`)**:
  - **`accentColor`**: `#RRGGBB` (live-repaints templates and all 5 Pro Exemplars)
  - **`lensMm`**: number `18`–`135` mm (default `50`; out-of-range throws `LENS_INVALID`; non-default overrides active camera focal length)
  - **`exposure`**: number `-3` to `+3` EV (default `0`; out-of-range throws `EXPOSURE_INVALID`; non-zero writes `scene.view_settings.exposure`)
  - **`clayMode`**: boolean (default `false`; applies `dsh_render_clay_override(True)` for uniform matte clay geometry inspection)
  - **`transparentBg`**: boolean (RGBA transparent PNG output)
- **`scriptMode`**: `template` \| `custom` (`customScript` up to `256 KB`)

---

## 5. Bundled Blender 3.6–5.x Skills (9 Skills)

| Skill Name (`skills/<name>/SKILL.md`) | Domain Coverage |
| :--- | :--- |
| `blender-production-pipeline` | 5-phase AAA 3D production loop: `DSH_KIT` v2 hard-surface & cinema PBR library, 5 live-repaintable exemplars, Lookdev overrides, `render_shots` multi-camera packs, Live Bridge v2 direct controls, script checkpoints, and Cycles OIDN `pipeline` exports |
| `blender-scene-architecture` | DSH tool choreography, Z-Up metric 1m scale, 8 templates, collection layout, non-destructive modifiers, and zero-float grounding |
| `blender-bpy-scripting` | `bpy.data`/`bmesh` over `bpy.ops`, headless safety, Blender 3.6/4.x/5.x API compatibility matrix, and static safety rules |
| `blender-materials-lighting` | Physical PBR limits, Principled BSDF 4.0+ recipes, radius-scaled 3-point lighting, HDRI world nodes, and AgX/Filmic |
| `blender-geometry-nodes` | `GeometryNodeTree`, 4.0+ `interface.new_socket` + 3.6 fallback, radial/grid arrays, Poisson scattering, curves, and data bars |
| `blender-camera-animation` | Focal length psychology, bounding-sphere auto-framing, live `lensMm`/`exposure` overrides, `render_shots` 5-preset packs, Live Bridge v2 `set_camera`, DoF + `TRACK_TO`, seamless 360° turntables, and Slotted Actions |
| `blender-rendering-export` | EEVEE Next vs Cycles denoising/clamping, even-dimension H.264 MP4, and cross-version GLB/FBX/OBJ/STL/`.blend` exports |
| `blender-grease-pencil` | Unified GPv2 (3.6–4.2 `GPENCIL`) and GPv3 (4.3–5.x `GREASEPENCIL`) drawing, 2.5D parallax planes, and Line Art |
| `blender-visual-qc` | 6-gate visual & structural inspection protocol over 2×2 `contact_sheet` renders, `clayMode` clay audits, `render_shots` packs, A/B Split-Wipe compare, and `sceneSummary` remediation |

All 9 skills follow the open Agent Skills format and can be copied into `~/.claude/skills/`, `.cursor/skills/`, `~/.gemini/skills/`, or `~/.codex/skills/`.

---

## 6. Environment Variables, Storage & Quotas

### Environment Variables
- **`DSH_HOME`**: Overrides the DSH data root (default `~/.dsh`). Plugin data lives at `${DSH_HOME}/data/dsh-blender-studio/` (`projects/`, `settings.json`, `cache/polyhaven/`, `blender-home/`, `tmp/`).
- **`DSH_BLENDER_EXECUTABLE`**: Highest-priority override pointing directly to the local Blender binary.

### Executable Discovery Order
1. `DSH_BLENDER_EXECUTABLE` environment variable
2. Persisted `blenderPath` in `settings.json`
3. `blender` / `blender.exe` on `PATH`
4. Standard platform install paths:
   - **Windows**: `Program Files\Blender Foundation\Blender *\blender.exe`, `%LOCALAPPDATA%\Programs\Blender Foundation\...`, Steam, and Scoop
   - **macOS**: `/Applications/Blender*.app/Contents/MacOS/Blender`, `~/Applications/Blender.app/...`, `/opt/homebrew/bin/blender`, `/usr/local/bin/blender`
   - **Linux**: `/usr/bin/blender`, `/usr/local/bin/blender`, `/snap/bin/blender`, Flatpak `org.blender.Blender`, `~/.local/bin/blender`

### Quotas & Validated Asset Types
- Max active projects: **30** (archived projects do not consume active slots and can be restored anytime)
- Max assets per project: **24** files, **50 MB** per file, **120 MB** total per project
- Accepted formats (validated by both extension and magic bytes): `.hdr`, `.exr`, `.png`, `.jpg`/`.jpeg`, `.webp`, `.glb`, `.gltf`, `.obj`, `.fbx`, `.stl`, `.blend` (uncompressed, gzip, or zstd)
- Automatic artifact retention (latest **20** artifacts via `MAX_PROJECT_ARTIFACTS = 20`, accommodating multi-shot `render_shots` lookdev packs alongside stills, contact sheets, animations, and 3D exports) & orphaned run-directory pruning (`pruneOldRuns`, plus automatic cleanup of failed/cancelled runs); max project metadata size: **4 MB** (`customScript` up to **256 KB**, up to **10** auto-saved script checkpoints); max artifact download size: **200 MB**; max rolling job log buffer: **80 lines**; source backup ZIP uses Store mode (`level: 0`) for already-compressed media (`.png`/`.jpg`/`.webp`/`.mp4`/`.glb`/`.blend`/`.exr`).

---

## 7. Security Boundaries

1. **Process Isolation**: Child processes strictly run with `shell: false`, allowlisted environment variables, isolated `HOME` / `TEMP` / `BLENDER_USER_*` directories, and `PYTHONNOUSERSITE=1`. Cancellation and timeouts terminate process trees (`taskkill /PID /T /F` on Windows; process group `-pid` on POSIX).
2. **Static `bpy` Safety Scanner (13 Rules)**: Blocks `os.system`/`os.popen`/`os.exec*`/`os.spawn*`/`os.remove`/`os.unlink`/`os.rmdir`, `subprocess`, `shutil.rmtree`, `ctypes`, `socket`, `urllib`, `requests`/`httpx`/`aiohttp`, `http.client`/`http.server`, `eval`/`exec`/`__import__`, `importlib`, `..` path traversal, and writes to external absolute paths unless explicitly bypassed with `allowUnsafe: true`.
3. **Storage Integrity**: Strict UUID identifiers, `realpath` root containment rejecting symlinks/traversal, `proper-lockfile` write locks + optimistic `revision` checks, and isolated reporting for corrupted project directories.
4. **Network Containment**: Live Bridge refuses non-loopback hosts (`BRIDGE_HOST_FORBIDDEN`). Poly Haven is disabled by default (`POLYHAVEN_DISABLED`) and, when enabled, enforces HTTPS-only requests to `api.polyhaven.com` and `dl.polyhaven.org` with per-hop redirect host verification (max 3 redirects).

---

## 8. Troubleshooting

| Error Code / Symptom | Cause & Fix |
| :--- | :--- |
| `ENV_NOT_READY` | No local Blender executable detected. Install Blender `3.6–5.x`, or set `blenderPath` in **Bridge & Env** / `DSH_BLENDER_EXECUTABLE` and re-detect. |
| `SCRIPT_UNSAFE` | Custom `bpy` code triggered a static safety rule. Inspect the returned rule/line and rewrite using pure `bpy`/`bmesh`/`mathutils`, or pass `allowUnsafe: true` only for trusted local scripts. |
| `LENS_INVALID` / `EXPOSURE_INVALID` | Lookdev override out of range: `lensMm` must be `18–135` mm and `exposure` must be `-3` to `+3` EV. |
| `CONFLICT` (`409`) | The project was updated elsewhere. Reload the latest `revision` before saving or resolving draft changes. |
| `POLYHAVEN_DISABLED` (`403`) | Poly Haven integration is opt-in. Enable `polyHavenEnabled` in **Bridge & Env** first. |
| `JOB_TIMEOUT` (`504`) | Heavy Cycles samples or long frame spans exceeded the timeout. Validate at `resolutionScale: 50` or `EEVEE` first before final high-sample renders. |
| `BRIDGE_UNREACHABLE` / `BRIDGE_AUTH_FAILED` | Confirm `dsh_blender_bridge.py` is enabled and started in Blender (`N → DSH Bridge`) with matching port & token. See [Live Bridge Guide](BRIDGE.md). |

---

## Plugin Updates & License

- **Updates**: Requires DSH `>=0.2.2-rc.3`. Update controls appear at the bottom of the workbench or native plugin details; automatic checks are on while **automatic installation is off**, pausing whenever jobs run or drafts are unsaved.
- **License**: [MIT](../LICENSE)
