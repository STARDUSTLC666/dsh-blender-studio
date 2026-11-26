# DSH Blender Live Bridge Guide (`dsh_blender_bridge.py`)

[简体中文主页](../README.md) · [English README](../README.en.md) · [Reference (ZH)](REFERENCE.zh.md) · [Reference (EN)](REFERENCE.en.md)

`dsh-blender-studio` works out of the box in **Track A (Headless CLI)** without opening Blender. When you also want real-time two-way inspection, live `bpy` execution with Undo history, viewport captures, or 1-click project syncing into an open Blender GUI window (**Track B — Live Socket Bridge**), install the bundled zero-dependency add-on `blender/dsh_blender_bridge.py`.

Supported Blender versions: **Blender 3.6 LTS, 4.0–4.5, and 5.x** (Windows, macOS, Linux).

---

## 1. Installation & Startup

### Option A — 1-Click Automated Install (`v0.3.0`, Recommended)
When a local Blender `3.6–5.x` executable is detected:
1. **From the Workbench UI**: Open **Blender 3D → Bridge & Env**, click **Install Add-on to Blender** (`一键安装到本机 Blender`), and confirm the dialog. Under the hood, `dsh-blender-studio` executes headless Blender (`--background --factory-startup`) to run `addon_install(overwrite=True)`, `addon_enable('dsh_blender_bridge')`, and `save_userpref()`.
2. **Via Agent Tool**: Ask the assistant to run `blender_bridge` with `{ "action": "install_addon", "confirmed": true }` (requires explicit `confirmed: true`, otherwise returns `CONFIRM_REQUIRED`).

### Option B — Manual Installation

#### Step 1 — Obtain `dsh_blender_bridge.py`
You can get the add-on in any of three ways:
1. **From the Workbench UI**: Open **Blender 3D → Bridge & Env** and click **Download Add-on (`dsh_blender_bridge.py`)** (`GET /api/dsh-blender-studio/workbench?kind=addon`).
2. **Via Agent Tool**: Ask the assistant to run `blender_bridge` with `action: "get_addon_info"` to retrieve the exact local disk path of the bundled file.
3. **Directly from the package**: `<package-root>/blender/dsh_blender_bridge.py`.

#### Step 2 — Install in Blender
1. Open Blender (`3.6` – `5.x`).
2. Go to **Edit → Preferences → Add-ons**:
   - **Blender 4.2+**: Click the top-right dropdown `⌄` → **Install from Disk...** → select `dsh_blender_bridge.py`.
   - **Blender 3.6–4.1**: Click **Install...** → select `dsh_blender_bridge.py`.
3. Enable the checkbox next to **System: DSH Blender Bridge**.
4. *(Optional, off by default for security)*: Expand **DSH Blender Bridge** preferences and check **Auto-start loopback server** (`auto_start`, default `False`) if you want Blender to launch the loopback bridge automatically on startup.

### Step 3 — Start the Loopback Server
1. In any 3D Viewport, press **`N`** to toggle the right Sidebar and select the **`DSH Bridge`** tab (`View3D > Sidebar (N) > DSH Bridge`).
2. Confirm settings:
   - **Host**: locked read-only to `127.0.0.1` (Loopback Only).
   - **Port**: `9876` by default (configurable `1024–65535`).
   - **Token** *(optional, recommended on shared machines)*: enter a shared secret passphrase (masked password input).
3. Click **Start DSH Bridge** (`dsh_bridge.start_server`). The status badge updates to `Running (127.0.0.1:9876)`.
4. In DeepSeek Harness (**Blender 3D → Bridge & Env**), enter the matching Port (and Token if configured), click **Save**, and click **Test Bridge** (`bridge_status`).

---

## 2. Security & Thread-Safety Model

| Safeguard | Implementation |
| :--- | :--- |
| **Loopback-Only Binding** | `dsh_blender_bridge.py` binds exclusively to `BRIDGE_HOST = "127.0.0.1"`. On the Node side, `BlenderBridgeClient` and `BlenderEnvironment` strictly reject any host outside `127.0.0.1`, `localhost`, or `::1` with `BRIDGE_HOST_FORBIDDEN` (`400`). |
| **Optional Shared Secret Token** | When `Token` is set on the Blender side, every request frame must provide a matching `"token"` field verified with constant-time `hmac.compare_digest()`. Missing or mismatched tokens return `BRIDGE_AUTH_FAILED` (`401`). |
| **Static Script Safety Pre-Flight** | Before sending code via `execute` (`blender_script` `run_bridge` or workbench `bridge_execute`), `dsh-blender-studio` runs 13 static safety rules (`checkScriptSafety`) blocking `os.system`, `subprocess`, `shutil.rmtree`, `ctypes`, `socket`, `urllib`, `requests`/`httpx`/`aiohttp`, `http.client`, `eval`/`exec`/`__import__`, `importlib`, path traversal (`..`), and writes to external absolute paths unless explicitly overridden. |
| **Main-Thread `bpy.app.timers` Dispatch** | Blender's `bpy` API is **not thread-safe**. Background socket threads parse frames, authenticate tokens, and enqueue tasks onto a thread-safe `queue.Queue`. A persistent `bpy.app.timers` callback polls every `50 ms` (up to 16 tasks per tick) on Blender's main UI thread so mutations never crash Blender. |
| **Undo Integration** | `execute` (`pushUndo: true` by default) and `load_script` automatically call `bpy.ops.ed.undo_push(...)`, so every AI edit can be rolled back cleanly with `Ctrl+Z` / `Cmd+Z`. |
| **Bounded Frames & Concurrency** | Maximum frame size: `8 MB` (`MAX_FRAME_BYTES`). Maximum concurrent TCP clients: `8`. Clean shutdown on add-on unregister and `atexit`. |

---

## 3. Wire Protocol Specification (JSON-RPC over TCP)

- **Transport**: Local TCP stream on `127.0.0.1:<port>`.
- **Framing**: UTF-8 **newline-delimited JSON** (`\n`, `0x0a`), max `8 MB` per request or response frame.
- **Request Envelope**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "token": "optional-shared-secret",
    "command": "ping | scene_info | execute | viewport_capture | load_script | set_camera | transform_object | set_material_color",
    "params": {}
  }
  ```
- **Response Envelope (Success)**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "ok": true,
    "result": {},
    "error": null
  }
  ```
- **Response Envelope (Error)**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "ok": false,
    "result": null,
    "error": {
      "code": "BRIDGE_AUTH_FAILED | BRIDGE_TIMEOUT | BRIDGE_PROTOCOL_ERROR | BRIDGE_EXECUTION_ERROR | BRIDGE_UNREACHABLE",
      "message": "Human-readable error description",
      "traceback": "Optional truncated Python traceback (last 2000 chars)"
    }
  }
  ```

### Supported Commands

#### 1. `ping`
Health probe returning active Blender metadata and detected Cycles GPU backend status (`v0.3.0`).
- **Params**: `{}`
- **Result**:
  ```json
  {
    "blenderVersion": "5.3.0",
    "sceneName": "Scene",
    "engine": "BLENDER_EEVEE_NEXT",
    "frameCurrent": 1,
    "objectCount": 6,
    "gpu": {
      "available": true,
      "backend": "OPTIX",
      "devices": ["NVIDIA GeForce RTX 4060"]
    }
  }
  ```

#### 2. `scene_info`
Returns a structured `BlenderSceneSummary` (capped at `250` detailed object records to keep payloads compact), using the evaluated depsgraph for accurate modifier & Geometry Nodes polycounts, exposing `rotationDeg`, `scale`, and `materialDetails` (introspected across linked `ColorRamp` / `RGB` / `Checker` / `Mix` / `HueSat` & `Roughness MapRange` nodes), plus a live deterministic **`qc` (`QC-3D`) audit** (`score` 0–100, `grade` `A–D`, and `issues[]` checking `EMPTY_SCENE`, `NO_CAMERA`, `NO_LIGHTS`, `UNASSIGNED_MATERIAL` with Geometry Nodes awareness, `HIGH_POLYCOUNT`, and `OFF_FRAME_HERO`) surfaced directly in the Workbench Outliner and Agent tool output.
- **Params**: `{}`
- **Result**:
  ```json
  {
    "capturedAt": "2026-11-24T06:00:00Z",
    "blenderVersion": "5.3.0",
    "engine": "BLENDER_EEVEE_NEXT",
    "objectCount": 6,
    "meshCount": 3,
    "lightCount": 2,
    "cameraCount": 1,
    "totalPolygons": 1842,
    "activeCamera": "CAM_Main",
    "materials": ["MAT_Hero", "MAT_Stage"],
    "collections": ["Scene Collection", "00_Stage", "01_Hero"],
    "objects": [
      {
        "name": "GEO_Hero",
        "type": "MESH",
        "location": [0.0, 0.0, 0.45],
        "dimensions": [0.8, 0.8, 0.9],
        "materialCount": 1,
        "vertices": 512,
        "polygons": 480
      }
    ],
    "qc": {
      "score": 100,
      "grade": "A",
      "issues": []
    }
  }
  ```

#### 3. `execute`
Executes Python (`bpy`) code on Blender's main thread, capturing `stdout` and `stderr`, updating the view layer, pushing an undo step, and returning the updated `sceneSummary`.
- **Params**:
  - `code` (`string`, required): Python source code (pre-bound globals: `bpy`, `math`, `mathutils`).
  - `pushUndo` (`boolean`, default `true`): Whether to call `bpy.ops.ed.undo_push`.
  - `timeoutMs` (`number`, optional): Main-thread wait timeout (`1000` – `300000` ms, default `60000` ms).
- **Result**: `{ "stdout": "...", "stderr": "...", "sceneSummary": { ... } }`

#### 4. `viewport_capture`
Captures the active `VIEW_3D` viewport via `bpy.ops.render.opengl(write_still=True, view_context=True)` (falling back automatically to a fast Workbench/EEVEE camera render if no 3D Viewport area is open), then restores all original render settings and temporary cameras.
- **Params**:
  - `width` (`integer`, default `960`, range `64–3840`)
  - `height` (`integer`, default `540`, range `64–2160`)
  - `timeoutMs` (`number`, optional, client default `45000` ms)
- **Result**: `{ "mime": "image/png", "base64": "...", "width": 960, "height": 540 }`

#### 5. `load_script`
Synchronizes an entire DSH project into the open Blender scene. Optionally clears existing scene objects and zero-user data blocks (without resetting add-ons or UI preferences), executes the generated scene script, and records a labeled undo step (`DSH Load: <projectTitle>`).
- **Params**:
  - `code` (`string`, required)
  - `clearScene` (`boolean`, default `true`)
  - `projectTitle` (`string`, default `"DSH Project"`)
  - `timeoutMs` (`number`, optional, client default `90000` ms)
- **Result**: `{ "stdout": "...", "stderr": "...", "sceneSummary": { ... } }`

#### 6. `set_camera` *(Live Bridge v2 — `0.4.0`)*
Updates the active scene camera live on Blender's main thread without writing Python, automatically pushing an Undo step.
- **Params**:
  - `location` (`[x, y, z]`, optional): World-space camera coordinates
  - `target` (`[x, y, z]`, optional): World-space look-at target (orients camera via direction tracking)
  - `lensMm` (`number`, optional): Focal length in mm (`18–135`)
  - `dofFstop` (`number`, optional): Aperture f-stop for Depth of Field
- **Result**: `{ "camera": { "name": "...", "location": [...], "lensMm": 58 }, "sceneSummary": { ... } }`

#### 7. `transform_object` *(Live Bridge v2 — upgraded in `0.5.1`)*
Applies precise transform adjustments to any named object in `bpy.data.objects` with automatic Undo. Supports `XYZ`/Euler, `QUATERNION` (including glTF-imported nodes), and `AXIS_ANGLE` rotation modes natively and reports accurate Euler degrees.
- **Params**:
  - `name` (`string`, required): Exact object name
  - `location` (`[x, y, z]`, optional)
  - `rotationDeg` (`[rx, ry, rz]`, optional): Euler angles in degrees
  - `scale` (`[sx, sy, sz]`, optional)
- **Result**: `{ "object": { "name": "...", "location": [...], "rotationDeg": [...], "scale": [...] }, "sceneSummary": { ... } }`

#### 8. `set_material_color` *(Live Bridge v2 — upgraded in `0.5.1`)*
Repaints a named Principled BSDF material live in Blender (compatible across Blender `3.6–5.x`) with automatic Undo. Recursively repaints linked procedural shader nodes (`VALTORGB` ColorRamp, `RGB`, `TEX_CHECKER`, `MIX`/`MIX_RGB`, `HUE_SAT`/`BRIGHTCONTRAST`/`GAMMA`), active `Emission Color`, and linked `Roughness` `MAP_RANGE` / `VALTORGB` ranges so `DSH_KIT` procedural materials repaint cleanly live; accurately returns linked roughness midpoints even when `roughness` is omitted, and reports active emissive colors for dark-base LED shaders in `sceneSummary.materialDetails`.
- **Params**:
  - `materialName` (`string`, required): Material name in `bpy.data.materials`
  - `color` (`string`, required): `#RRGGBB` hex color (converted cleanly to linear sRGB)
  - `metallic` (`number`, optional, `0.0–1.0`)
  - `roughness` (`number`, optional, `0.0–1.0`)
- **Result**: `{ "material": { "name": "...", "color": "#1d4ed8", "metallic": 0.85, "roughness": 0.22 }, "sceneSummary": { ... } }`

---

## 4. Troubleshooting

| Symptom / Error Code | Cause & Resolution |
| :--- | :--- |
| `BRIDGE_UNREACHABLE` (`503`) | Blender is closed, the add-on is not enabled, **Start DSH Bridge** has not been clicked, or the port in Blender (`N → DSH Bridge`) does not match DSH (`Bridge & Env`). |
| `BRIDGE_AUTH_FAILED` (`401`) | A Token is configured in Blender's `DSH Bridge` panel, but DSH's `bridgeToken` is empty or differs. Re-enter the identical token on both sides (stop & restart the bridge in Blender after editing port/token). |
| `BRIDGE_TIMEOUT` (`504`) | Blender's main thread is paused by a modal dialog (e.g., Save/Preferences popup or modal operator like Grab/Rotate), or a heavy script exceeded the timeout. Close blocking popups in Blender and retry. |
| `BRIDGE_HOST_FORBIDDEN` (`400`) | A non-loopback hostname/IP (e.g., LAN IP `192.168.x.x`) was passed as `bridgeHost`. Live Bridge strictly permits `127.0.0.1`, `localhost`, or `::1`. |
| `Address already in use` when starting | Another Blender instance or local service already occupies port `9876`. Change **Port** (e.g., `9877`) in both Blender's `DSH Bridge` panel and DSH's **Bridge & Env** settings. |
| `viewport_capture` looks different from active view | If no `VIEW_3D` area exists in the current Blender workspace, the bridge falls back to a Workbench/EEVEE camera render. Switch to the `Layout` workspace with a visible 3D Viewport for OpenGL viewport captures. |
