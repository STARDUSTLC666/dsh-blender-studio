> Full technical reference. See [README.en.md](../README.en.md) for the quickstart overview; this document covers all 6 Agent tools, the HTTP Workbench API, starter templates, bundled skills, environment variables, security boundaries, and troubleshooting.

# `dsh-blender-studio` Technical Reference

[简体中文](REFERENCE.zh.md) · **English** · [Home](../README.en.md) · [Live Bridge Guide](BRIDGE.md) · [Validation Matrix](VALIDATION.md) · [Changelog](../CHANGELOG.md)

---

## 1. Architecture & Execution Tracks

`dsh-blender-studio` uses a **hybrid dual-track + desktop handoff** architecture:

| Track | Execution Mechanism | Primary Use Cases |
| :--- | :--- | :--- |
| **Track A: Headless Blender CLI (Default)** | `spawn(executable, ['--background', '--factory-startup', '--python', scriptFile], { shell: false })` | Zero-window renders: PNG stills, 2×2 4-View QC contact sheets, FFmpeg MP4 animations, GLB/FBX/OBJ/STL/`.blend` exports, and structured scene summaries |
| **Track B: Live Socket Bridge (Optional)** | Connects over `127.0.0.1:9876` to `blender/dsh_blender_bridge.py` inside a running Blender GUI | Live project sync into Blender, real-time scene inspection, Undo-tracked `bpy` execution, and OpenGL viewport captures |
| **Track C: Open in Blender GUI** | Materializes `.blend` (if needed) and spawns desktop Blender detached | Manual lookdev/sculpting refinement in native Blender |

---

## 2. Agent Tool Reference (6 Tools)

| Tool Name | Actions / Scope | Key Parameters & Behavior |
| :--- | :--- | :--- |
| **`blender_health`** | Read-only health check | Verifies all 8 bundled `SKILL.md` files and host registration state, active local Blender version (`BLENDER_EEVEE_NEXT`/`BLENDER_EEVEE`, `gpv3`/`gpv2`), Live Bridge connectivity, and Poly Haven toggle. Does not mutate disk or registry state. |
| **`blender_project`** | `list` \| `create` \| `get` \| `update` \| `update_script` \| `inspect_scene` \| `archive` \| `restore` | Full project CRUD. Mutating actions (`update`, `update_script`, `archive`, `restore`) require the current `revision` (returns `409 CONFLICT` on stale writes). `inspect_scene` executes a headless inspection returning `BlenderSceneSummary` (counts, polygons, lights, cameras, materials, collections, world bounds). |
| **`blender_render`** | `preview_still` \| `contact_sheet` \| `render_animation` \| `export_model` \| `job` \| `cancel` | Drives Headless CLI jobs: `preview_still` (PNG), `contact_sheet` (2×2 4-angle QC PNG), `render_animation` (H.264 MP4 / PNG fallback), `export_model` (`format`: `glb` \| `fbx` \| `obj` \| `stl` \| `blend`). Poll or abort running jobs with `jobId`. |
| **`blender_script`** | `validate` \| `run_headless` \| `run_bridge` | Runs the 13-rule static safety scanner (`validate`) or executes custom `bpy` code in headless mode (`run_headless`) or Live Bridge (`run_bridge`), returning scrubbed logs and updated `sceneSummary`. Rejects unsafe payloads (`SCRIPT_UNSAFE`) unless explicitly authorized with `allowUnsafe: true`. |
| **`blender_bridge`** | `status` \| `get_addon_info` \| `scene_info` \| `viewport_capture` \| `sync_project` \| `open_gui` | Checks bridge status, locates `dsh_blender_bridge.py`, inspects live scene state, captures the Blender 3D viewport (`width` 64–3840, `height` 64–2160), syncs a project script into Blender, or launches desktop Blender GUI. |
| **`blender_assets`** | `list` \| `remove` \| `search_polyhaven` \| `import_polyhaven` | Manages uploaded project assets and—when `polyHavenEnabled` is explicitly turned on—searches and imports allowlisted CC0 `hdris`, `textures`, or `models` (`resolution`: `1k` \| `2k`) from Poly Haven. |

---

## 3. HTTP Workbench API Contract

- **Primary endpoint**: `/api/dsh-blender-studio/workbench` (`GET`, `POST`)
- **Streaming upload endpoint**: `/api/dsh-blender-studio/workbench/upload` (`POST`, `requestBody: 'streaming'`)
- **CSRF & Origin Guard**: Every `POST` request must include `x-dsh-blender-studio: 1` and pass origin validation (exempts DSH Desktop `Origin: dsh-app://app`). Invalid requests receive HTTP `403 ORIGIN_FORBIDDEN`.

### 3.1 `GET /api/dsh-blender-studio/workbench`

| Query Parameters | Response |
| :--- | :--- |
| `?kind=addon` | Downloads `dsh_blender_bridge.py` (`text/x-python`, `Content-Disposition: attachment`) |
| `?id=<uuid>&kind=asset&asset=<uuid>` | Streams an uploaded/imported asset with HTTP `Range` (`206`) support and optional `&download=1` |
| `?id=<uuid>&kind=artifact&artifact=<uuid>` | Streams a rendered PNG, 2×2 contact sheet, MP4, or 3D export (`Range` + `&download=1`, 200 MB cap) |
| `?id=<uuid>&kind=source` | Builds and streams a full backup ZIP (`dsh-blender-studio-<id>.zip` via `fflate`) containing `project.json`, `scene.py`, `assets/*`, and `README.txt` |

### 3.2 `POST /api/dsh-blender-studio/workbench`

`Content-Type: application/json`, returning `{ "ok": true, "value": ... }` or `{ "ok": false, "message": "...", "code": "..." }`:

- **Projects**: `list`, `create`, `get`, `update`, `removeAsset`, `archive`, `restore`, `generatedScript`
- **Jobs & Rendering**: `preview_still`, `contact_sheet`, `render_animation`, `export_model` (`format`), `inspect_scene`, `run_script` (`code?`, `allowUnsafe?`), `open_gui`, `job`, `cancel`
- **Environment & Settings**: `environment`, `configure` (`blenderPath?`, `bridgeHost?`, `bridgePort?`, `bridgeToken?`, `polyHavenEnabled?`), `detect_blender`
- **Live Bridge**: `bridge_status`, `bridge_scene`, `bridge_execute` (`code`), `bridge_viewport` (`width?`, `height?`), `bridge_sync` (`id`)
- **External Assets**: `polyhaven_search` (`query`, `type?`, `limit?`), `polyhaven_import` (`id`, `revision`, `assetId`, `assetType`, `resolution?`)

### 3.3 `POST /api/dsh-blender-studio/workbench/upload`

Raw binary request body with headers:
- `x-dsh-blender-studio: 1`
- `x-project-id: <project-uuid>`
- `x-project-revision: <integer>`
- `x-file-name: <uri-encoded-filename>`

---

## 4. Starter Templates & Project Field Constraints

| Template ID | Display Name | Recommended Engine | Default Camera | Default Lighting | Default Material | Default Frames |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `product-studio` | Product Studio | `EEVEE` | `three_quarter` | `studio_3point` | `ceramic_gloss` | `48` |
| `logo-3d` | 3D Logo & Title | `EEVEE` | `front` | `dramatic_rim` | `brushed_metal` | `48` |
| `isometric-room` | Isometric Room | `CYCLES` | `isometric` | `soft_daylight` | `clay_matte` | `48` |
| `motion-data` | Motion 3D Data | `EEVEE` | `three_quarter` | `neon_cyber` | `frosted_glass` | `72` |
| `grease-pencil-2d` | Grease Pencil 2D | `EEVEE` | `front` | `clay_overcast` | `toon_cel` | `48` |
| `blank-stage` | Blank Calibrated Stage | `EEVEE` | `three_quarter` | `studio_3point` | `clay_matte` | `48` |

### Valid Field Ranges

- **`aspect`**: `landscape` (`1280×720`), `portrait` (`720×1280`), `square` (`1024×1024`)
- **`resolutionScale`**: `50` \| `100` \| `150` \| `200` (%)
- **`engine`**: `EEVEE` (resolves to `BLENDER_EEVEE_NEXT` on 4.2+ automatically) \| `CYCLES` \| `WORKBENCH`
- **`samples`**: integer `4`–`1024` (defaults: `32` EEVEE, `64` Cycles, `16` Workbench)
- **`fps` / `frameStart` / `frameEnd`**: `24` \| `30` \| `60`; `frameStart >= 1`; `frameEnd <= frameStart + 600`
- **`cameraPreset`**: `three_quarter` \| `front` \| `isometric` \| `top` \| `closeup` \| `turntable`
- **`lightingPreset`**: `studio_3point` \| `soft_daylight` \| `dramatic_rim` \| `neon_cyber` \| `clay_overcast`
- **`materialPreset`**: `clay_matte` \| `brushed_metal` \| `frosted_glass` \| `ceramic_gloss` \| `toon_cel`
- **`scriptMode`**: `template` \| `custom` (`customScript` up to `64 KB`)
- **`accentColor`**: `#RRGGBB`; `transparentBg`: RGBA transparent PNG output

---

## 5. Bundled Blender 3.6–5.x Skills (8 Skills)

| Skill Name (`skills/<name>/SKILL.md`) | Domain Coverage |
| :--- | :--- |
| `blender-scene-architecture` | DSH tool choreography, Z-Up metric 1m scale, collection layout, non-destructive modifiers, and zero-float grounding |
| `blender-bpy-scripting` | `bpy.data`/`bmesh` over `bpy.ops`, headless safety, Blender 3.6/4.x/5.x API compatibility matrix, and static safety rules |
| `blender-materials-lighting` | Physical PBR limits, Principled BSDF 4.0+ recipes, radius-scaled 3-point lighting, HDRI world nodes, and AgX/Filmic |
| `blender-geometry-nodes` | `GeometryNodeTree`, 4.0+ `interface.new_socket` + 3.6 fallback, radial/grid arrays, Poisson scattering, curves, and data bars |
| `blender-camera-animation` | Focal length psychology, bounding-sphere auto-framing, DoF + `TRACK_TO`, seamless 360° turntables, and Slotted Actions |
| `blender-rendering-export` | EEVEE Next vs Cycles denoising/clamping, even-dimension H.264 MP4, and cross-version GLB/FBX/OBJ/STL/`.blend` exports |
| `blender-grease-pencil` | Unified GPv2 (3.6–4.2 `GPENCIL`) and GPv3 (4.3–5.x `GREASEPENCIL`) drawing, 2.5D parallax planes, and Line Art |
| `blender-visual-qc` | 6-gate visual & structural inspection protocol over 2×2 `contact_sheet` renders and `sceneSummary` with remediation table |

All 8 skills follow the open Agent Skills format and can be copied into `~/.claude/skills/`, `.cursor/skills/`, `~/.gemini/skills/`, or `~/.codex/skills/`.

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
- Max stored artifacts per project: **20**; max artifact download size: **200 MB**; max rolling job log buffer: **80 lines**

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
| `CONFLICT` (`409`) | The project was updated elsewhere. Reload the latest `revision` before saving or resolving draft changes. |
| `POLYHAVEN_DISABLED` (`403`) | Poly Haven integration is opt-in. Enable `polyHavenEnabled` in **Bridge & Env** first. |
| `JOB_TIMEOUT` (`504`) | Heavy Cycles samples or long frame spans exceeded the timeout. Validate at `resolutionScale: 50` or `EEVEE` first before final high-sample renders. |
| `BRIDGE_UNREACHABLE` / `BRIDGE_AUTH_FAILED` | Confirm `dsh_blender_bridge.py` is enabled and started in Blender (`N → DSH Bridge`) with matching port & token. See [Live Bridge Guide](BRIDGE.md). |

---

## Plugin Updates & License

- **Updates**: Requires DSH `>=0.2.2-rc.3`. Update controls appear at the bottom of the workbench or native plugin details; automatic checks are on while **automatic installation is off**, pausing whenever jobs run or drafts are unsaved.
- **License**: [MIT](../LICENSE)
