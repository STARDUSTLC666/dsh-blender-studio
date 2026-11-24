# `dsh-blender-studio` Validation Matrix & Verification Guide

[简体中文主页](../README.md) · [English README](../README.en.md) · [Reference (ZH)](REFERENCE.zh.md) · [Reference (EN)](REFERENCE.en.md)

This document defines the automated verification matrix for `dsh-blender-studio` across CI environments (without a local Blender binary) and local workstations with Blender `3.6–5.x` installed. Automated mock tests, static Python AST validation, jsdom UI tests, and live Blender smoke renders are tracked separately and do not substitute for one another.

---

## 1. Automated Test Matrix (`npm test`)

Running `npm test` builds TypeScript + the browser workbench client (`npm run build`) and executes the Node.js native test runner (`node --test "test/*.test.mjs"`).

| Test Suite | Scope & Assertions Verified |
| :--- | :--- |
| `test/manifest.test.mjs` | Validates `package.json` metadata (`dsh-blender-studio`, semver, `engines.dsh >=0.2.2-rc.3`, `exports`, `dsh.bundle.patch`, `dsh.client.inject`), verifies every entry in `files` exists on disk, parses `cordis.patch.yml`, checks all 9 `skills/blender-*/SKILL.md` files exist (including `blender-production-pipeline`), and verifies `assets/plugin-icon.webp` binary header (`RIFF....WEBP`, exact RIFF length, valid `VP8`/`VP8L`/`VP8X` chunk) plus `assets/plugin-icon.svg`. |
| `test/skill-bundle.test.mjs` | Runs `checkBundledSkills()` across all 9 bundled skills, validates strict YAML frontmatter (`name` matches directory name, unique keys, non-empty `description` & body), verifies `apply(ctx)` registers all 9 skills + `blender_health` tool, checks runtime health reporting (`ready`, `changed`, `disposed`), and confirms clean `dispose()`. |
| `test/store-safety.test.mjs` | Exercises `BlenderStore` CRUD, `duplicate()`, automatic & explicit script checkpoints (`saveCheckpoint` / `restoreCheckpoint`, max 10), `revision` optimistic locking (`409 CONFLICT`), `256 KB` `customScript` & `4 MB` `project.json` limits, archive/restore, 30 active project slot limit (`PROJECT_LIMIT`), UUID & `realpath` path traversal rejection (`ID_INVALID` / `STORAGE_UNSAFE`), symlink rejection, corrupted project folder isolation (`corruptedCount`), magic-byte asset upload validation, mid-upload rollback on failure & limits (50 MB/file, 24 assets, 120 MB/project), automatic run-directory retention pruning (`pruneOldRuns`), and `fflate` Store-mode source ZIP extraction integrity. |
| `test/templates-and-python.test.mjs` | Verifies all 8 templates (`product-studio`, `logo-3d`, `isometric-room`, `motion-data`, `grease-pencil-2d`, `blank-stage`, `architectural-pavilion`, `procedural-abstract`), built-in `DSH_KIT` helpers (`dsh_mat_*`, `dsh_bevel`, `dsh_array_radial`, `dsh_tube_along_points`, `dsh_setup_hero_studio`, `dsh_setup_compositor`), auto-wired uploaded HDRI/3D model script generation, `QC-3D` audit emission, and runner harnesses (`preview_still`, `contact_sheet`, `render_animation`, `export_model`, `inspect_scene`, `run_script`) produce valid cross-version Python (Blender 3.6 vs 4.2+ EEVEE Next / Principled BSDF 4.0+ / Cycles OpenImageDenoise / AgX / GPv3 guards), and parses both `blender/dsh_blender_bridge.py` and every generated script with UTF-8 Python `ast.parse`. |
| `test/environment-and-polyhaven.test.mjs` | Tests `BlenderEnvironment` executable probing and version string parsing (`3.6`, `4.2`, `4.3`, `5.0`), EEVEE / GPv3 capability flags, `settings.json` persistence, and `PolyHavenClient` (default-off `POLYHAVEN_DISABLED` guard, strict SSRF host allowlist for `api.polyhaven.com` & `dl.polyhaven.org`, redirect host rejection, search + local cache reuse). |
| `test/bridge-and-safety.test.mjs` | Starts a real local loopback TCP mock server implementing the newline-delimited JSON-RPC Bridge protocol to verify `BlenderBridgeClient` (`ping`, `sceneInfo` including `qc`, `execute`, `viewportCapture`, `loadScript`, token authentication pass/fail, request timeout, and rejecting non-loopback hosts with `BRIDGE_HOST_FORBIDDEN`). Also verifies all 13 `checkScriptSafety()` rules against unsafe payloads and clean `bpy` / `NodeSocket` scripts. |
| `test/workbench-api-tools.test.mjs` | End-to-end tests for `BlenderWorkbench` HTTP API (`GET ?kind=addon|asset|artifact|source`, HTTP `206 Partial Content` byte-range streaming, `POST` `duplicate`, `save_checkpoint` / `restore_checkpoint`, chained `pipeline` + `abortOnQcError` early stop, Desktop `Origin: dsh-app://app` + `Sec-Fetch-Site: cross-site` exemption, untrusted cross-origin & missing `x-dsh-blender-studio: 1` rejection with HTTP `403 ORIGIN_FORBIDDEN`, `/upload` streaming) and all 6 Agent tools (`blender_health`, `blender_project`, `blender_render`, `blender_script`, `blender_bridge`, `blender_assets` including `QC-3D` `output.render` summaries) using an injectable mock Blender runner. |
| `test/workbench-registration.test.mjs` | Executes `lib/client.js` inside an isolated `vm` sandbox proving **zero** eager `require('@deepseek-ai/dsh-client-ui-primitives')` calls at module load/apply time, and validates `main`, `sidebar.panellist`, and `settings.section` registrations plus bilingual zh/en labels. |
| `test/workbench-ui.test.mjs` | Mounts the full OP-DSH 3D Studio workbench in `jsdom` + React 19: verifies default `data-dsh-style="harness"` & `data-dsh-font="arcade"`, all 13 theme & 8 font switchers, 8 templates in Canvas 3D viewport, Quality Presets (`Draft` / `Studio` / `Cycles`), 1-click `Run Pipeline` control, live `QC-3D` badge in Outliner, Script Checkpoints & `DSH_KIT` quick-insert bar, `Duplicate` project action, `data-always-visible="true"` row actions, Drag-and-Drop asset dropzone, Studio keyboard shortcuts (`Space`, `1–4`, `R`, `Ctrl+S`), English header layout, `[data-plugin-update-footer="dsh-blender-studio"]`, and modal `Escape` handling. |
| `.github/scripts/npm-registry-verification.test.mjs` | Verifies npm OIDC release propagation polling, integrity mismatch rejection, timeout error messaging, and non-retryable registry error propagation. |

---

## 2. Running Verification Locally

### Standard Mock CI Verification (No Blender Required)

```bash
pnpm install --frozen-lockfile
npm run typecheck
npm run build
npm test
node --check lib/client.js
```

### Python Syntax Verification (Windows / macOS / Linux)

```bash
# macOS / Linux
python3 -m py_compile blender/dsh_blender_bridge.py

# Windows (PowerShell)
py -m py_compile blender\dsh_blender_bridge.py
```

### Real Local Blender Headless Smoke Test (Optional)

When Blender `3.6–5.x` is installed on the workstation, verify real headless execution end-to-end:

1. Confirm Blender detection:
   ```bash
   blender --version
   # or override with an explicit binary path:
   # export DSH_BLENDER_EXECUTABLE="/Applications/Blender.app/Contents/MacOS/Blender"
   ```
2. Run a quick headless script check using `--background --factory-startup --python`:
   - Create a `product-studio` project via `blender_project` (`action: "create"`).
   - Run `blender_project` (`action: "inspect_scene"`) and verify `__DSH_SCENE_JSON__` returns valid `blenderVersion`, `engine`, `objectCount`, and `totalPolygons > 0`.
   - Run `blender_render` (`action: "contact_sheet"`) and visually inspect the resulting 2×2 PNG in `runs/<jobId>/contact_sheet.png`.
   - Run `blender_render` (`action: "export_model"`, `format: "glb"`) and confirm a non-empty binary GLB (`glTF` header) is written.
3. Optional Live Bridge verification:
   - Install `blender/dsh_blender_bridge.py` in Blender GUI, click **Start DSH Bridge** in `View3D > Sidebar (N) > DSH Bridge`, and run `blender_bridge` (`action: "status"`, `action: "scene_info"`, `action: "viewport_capture"`).

---

## 3. Validation Boundaries

- **CI Environments (GitHub Actions)**: GitHub-hosted runners run a 5-job matrix (`ubuntu-latest` × Node 22/24, `windows-latest` × Node 22/24, `macos-latest` × Node 24) with `concurrency` cancellation and `timeout-minutes: 20`, validating TypeScript types, build outputs (`git diff --exit-code -- lib`), `lib/client.js` syntax, Python bytecode compilation of `blender/dsh_blender_bridge.py`, npm OIDC verification tests, and all mock runner/store/bridge/HTTP/tool/jsdom suites. Hosted runners do **not** install the full Blender binary or exercise GPU drivers.
- **GPU & Driver Differences**: Headless CLI defaults to safe CPU/EEVEE settings so scenes render deterministically even without CUDA/OptiX/Metal/HIP hardware. Local GPU acceleration depends on user Blender preferences and OS graphics drivers.
- **Third-Party CC0 Downloads**: Automated tests mock `fetch` to prove Poly Haven host allowlisting and redirect rejection without hitting live external servers.
