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
| `test/store-safety.test.mjs` | Exercises `BlenderStore` CRUD, `duplicate()`, surgical `patchScript()` (`SCRIPT_PATCH_NOT_FOUND`, `SCRIPT_PATCH_AMBIGUOUS`, `replaceAll`, auto-checkpoint), automatic & explicit script checkpoints (`saveCheckpoint` / `restoreCheckpoint`, max 10), `revision` optimistic locking (`409 CONFLICT`), `256 KB` `customScript` & `4 MB` `project.json` limits, archive/restore, 30 active project slot limit (`PROJECT_LIMIT`), UUID & `realpath` path traversal rejection (`ID_INVALID` / `STORAGE_UNSAFE`), symlink rejection, corrupted project folder isolation (`corruptedCount`), magic-byte asset upload validation, mid-upload rollback on failure & limits (50 MB/file, 24 assets, 120 MB/project), automatic run-directory retention pruning (`pruneOldRuns`), and `fflate` Store-mode source ZIP extraction integrity. |
| `test/templates-and-python.test.mjs` | Verifies all 8 templates (`product-studio`, `logo-3d`, `isometric-room`, `motion-data`, `grease-pencil-2d`, `blank-stage`, `architectural-pavilion`, `procedural-abstract`), all **5 Pro Engineering Exemplars** (`aero-x900-turbofan`, `apex-09-racecar`, `vanguard-h145x-helicopter`, `kuka-6axis-robot-arm`, `chronograph-tourbillon-watch` with live `accentColor` override), built-in `DSH_KIT` v2 (24 helpers), Live Lookdev overrides (`DSH_OVERRIDES`: `lensMm`, `exposure`, `clayMode`, `dsh_apply_lookdev_overrides`), single-launch `render_shots` (`__DSH_SHOT_DONE__=`, `BLENDER_SHOT_PRESETS`), Cycles GPU `dsh_configure_cycles_device`, auto-wired uploaded HDRI/3D model script generation, `QC-3D` audit emission, and runner harnesses pass `checkScriptSafety()` and UTF-8 Python `ast.parse` alongside `blender/dsh_blender_bridge.py` v0.4.0. |
| `test/environment-and-polyhaven.test.mjs` | Tests `BlenderEnvironment` executable probing, Cycles GPU backend/device probing (`OPTIX`/`CUDA`/`METAL`/`HIP`/`ONEAPI`/`CPU`), `computeDevice` (`auto`/`gpu`/`cpu`) persistence, version string parsing (`3.6`, `4.2`, `4.3`, `5.0`), EEVEE / GPv3 capability flags, `settings.json` persistence, and `PolyHavenClient` (default-off `POLYHAVEN_DISABLED` guard, strict SSRF host allowlist for `api.polyhaven.com` & `dl.polyhaven.org`, redirect host rejection, search + local cache reuse). |
| `test/bridge-and-safety.test.mjs` | Starts a real local loopback TCP mock server implementing the newline-delimited JSON-RPC Bridge v2 protocol to verify `BlenderBridgeClient` (`ping` with GPU info, `sceneInfo` including `qc`, `execute`, `viewportCapture`, `loadScript`, `setCamera`, `transformObject`, `setMaterialColor`, token authentication pass/fail, request timeout, and rejecting non-loopback hosts with `BRIDGE_HOST_FORBIDDEN`), tests `installBridgeAddon()` with a mock executor, and verifies all 13 `checkScriptSafety()` rules against unsafe payloads and clean `bpy` / `NodeSocket` scripts. |
| `test/workbench-api-tools.test.mjs` | End-to-end tests for `BlenderWorkbench` HTTP API (`GET ?kind=addon|asset|artifact|source`, HTTP `206 Partial Content` byte-range streaming, `POST` `render_shots` + `shot` artifact registration, Live Lookdev `lensMm`/`exposure`/`clayMode`, `bridge_set_camera` / `bridge_transform_object` / `bridge_set_material`, `list_exemplars` (5), `create_from_exemplar`, `patch_script`, `bridge_install_addon` requiring `confirmed: true`, `configure` `computeDevice`, `duplicate`, `save_checkpoint` / `restore_checkpoint`, chained `pipeline` + `abortOnQcError`, Desktop `Origin: dsh-app://app` + `Sec-Fetch-Site: cross-site` exemption, untrusted cross-origin & missing `x-dsh-blender-studio: 1` rejection with HTTP `403 ORIGIN_FORBIDDEN`, `/upload` streaming) and all 6 Agent tools (`blender_health`, `blender_project`, `blender_render`, `blender_script`, `blender_bridge`, `blender_assets`). |
| `test/workbench-registration.test.mjs` | Executes `lib/client.js` inside an isolated `vm` sandbox proving **zero** eager `require('@deepseek-ai/dsh-client-ui-primitives')` calls at module load/apply time, and validates `main`, `sidebar.panellist`, and `settings.section` registrations plus bilingual zh/en labels. |
| `test/workbench-ui.test.mjs` | Mounts the full OP-DSH 3D Studio workbench in `jsdom` + React 19: verifies default `data-dsh-style="harness"` & `data-dsh-font="arcade"`, all 13 theme & 8 font switchers, 8 templates, **5 Pro Exemplars** strip & 1-click create, **`Multi-Shot`** button + **Shot Filmstrip** + Compare link, Live Lookdev controls (`lensMm`, `exposure`, `clayMode`), pure-JS `.glb` viewer v2 (3-light Phong, `wire-overlay`, pan, PNG snapshot, uploaded `.glb` preview), `A/B Compare` split-wipe across `still`/`contact_sheet`/`shot`, Quality Presets, `Run Pipeline`, live `QC-3D` badge, Script Checkpoints & `DSH_KIT` v2 quick-insert bar, `Duplicate`, `data-always-visible="true"`, Drag-and-Drop asset dropzone, shortcuts, Live Bridge v2 Direct Controls + 1-click Install modal, Cycles GPU selector, zero CJK leakage in `en-US`, `[data-plugin-update-footer="dsh-blender-studio"]`, and modal `Escape` handling. |
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
