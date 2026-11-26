---
name: "blender-production-pipeline"
description: "Orchestrate the 5-phase AAA 3D production workflow in dsh-blender-studio v0.5.1: 5 live-repaintable Pro Exemplars, 24-helper DSH_KIT v2, OPTIX-safe clay & live lookdev overrides, single-launch multi-shot rendering, atomic multi-hunk patching, synchronous wait: true, and Live Bridge 0.5.1 deep PBR controls."
---

# High-Quality 3D Production Pipeline (`dsh-blender-studio` v0.5.1)

Use this skill whenever building complex, portfolio-grade 3D vehicles, industrial machinery, robotics, horology, architectural hero pieces, or detailed product assemblies inside `dsh-blender-studio`. Rather than writing one blind monolithic script and hoping the final Cycles render looks good, follow this deterministic **5-Phase AAA Production Loop**.

---

## Phase 1 — Design Brief, 5 Live-Repaintable Pro Exemplars & Sub-Assemblies

Before writing geometry code:
1. **Bootstrap from 5 Built-In Pro Engineering Exemplars (Few-Shot Reference)**:
   - Call `blender_project(action: 'list_exemplars')` to inspect all **5 built-in `QC-3D 100/A` engineering masterpieces**:
     - `aero-x900-turbofan` (Cutaway High-Bypass Turbofan Jet Engine · default `#2563eb`)
     - `apex-09-racecar` (Cyber GT Hypercar · default `#b91c1c`)
     - `vanguard-h145x-helicopter` (Twin-Turbine Tactical Helicopter · default `#ea580c`)
     - `kuka-6axis-robot-arm` (6-Axis Industrial Robot Arm Workstation · default `#ea580c`)
     - `chronograph-tourbillon-watch` (Mechanical Tourbillon Chronograph · openworked titanium & rose-gold horology movement)
   - Every exemplar wires `DSH_PROJECT.get("accentColor")` directly into its hero clearcoat / livery / anodized / dial shader — changing `accentColor` in the Inspector or via `blender_project(action: 'update')` repaints the masterpiece with **zero code edits**!
   - Clone any exemplar directly via `blender_project(action: 'create_from_exemplar', exemplarId)` (auto-saves `'Exemplar baseline'` checkpoint) or inspect its `customScript` via `get` as a proven few-shot reference.
2. **Lock real-world metric dimensions** (`1 BU = 1 m`): e.g. GT racecar (`4.8 m × 2.0 m × 1.15 m`), twin-turbine helicopter (`11 m` rotor span, `3.2 m` height), high-bypass turbofan (`2.4 m` fan diameter, `3.6 m` length), 6-axis industrial robot (`2.1 m` reach). Real-world meters keep Cycles inverse-square lighting, bevel radii, depth-of-field f-stops, and auto-framing physically accurate.
3. **Partition into logical sub-assembly collections**:
   - `00_Studio`: cyclorama / wet asphalt / helipad / engineering bay, overhead strip softboxes, key/fill/rim rigs
   - `01_Primary`: main monocoque fuselage, engine core, robot arm castings, or architectural shell
   - `02_Mechanical`: rotors, fan blades, brake discs, calipers, servo joint housings, hydraulic manifolds, bolt rings
   - `03_Details`: glass canopy, cockpit interior, louver grilles, umbilical cables, LED strips, decals, fasteners
4. **Create a clean workspace**: Start from `blank-stage` (or any of the 8 starter templates / 4 pro exemplars), set `scriptMode: 'custom'` (`customScript` accepts up to **`256 KB`** of pure `bpy`/`bmesh` code), and use `blender_project(action: 'duplicate')` whenever branching a risky lookdev experiment.
5. **Auto-wired assets**: Upload `.hdr`/`.exr` to automatically light the World node tree, or drop `.glb`/`.gltf`/`.obj`/`.fbx`/`.stl` parts to auto-import and ground onto the stage.

---

## Phase 2 — Fast Blockout → `QC-3D` Audit → EEVEE 4-View Silhouette Check

Validate silhouette, scale, and proportions **before** adding 200 bolts or running slow Cycles renders:

1. Build primary bounding volumes and key silhouette landmarks first.
2. Save your milestone immediately (`blender_project` `action: 'save_checkpoint'`, `note: 'Phase 2 blockout'`).
3. Run fast draft pipeline validation:
   ```json
   {
     "action": "pipeline",
     "id": "<project-uuid>",
     "revision": 2,
     "qualityTier": "draft",
     "includeContactSheet": true,
     "renderKind": "still",
     "exportFormat": "none",
     "abortOnQcError": true
   }
   ```
4. Check the returned **`QC-3D` report** (`EMPTY_SCENE`, `NO_CAMERA`, `NO_LIGHTS`, `UNASSIGNED_MATERIAL`, `FLAT_UNBEVELED_PRIMITIVE`, `FLOATING_HERO`, `OFF_FRAME_HERO`, `HIGH_POLYCOUNT`). `abortOnQcError: true` halts immediately if a critical error (`EMPTY_SCENE`, `NO_CAMERA`, `OFF_FRAME_HERO`) is detected so zero render time is wasted.
5. Visually inspect the 2×2 `contact_sheet` PNG at the exact local path reported by `blender_render` to confirm silhouette proportions, wheelbase/stance, and camera clearance across Front, 3/4, Top, and Active Camera views.

---

## Phase 3 — Hard-Surface Engineering Detailing with Built-In `DSH_KIT` v2 (24 Helpers)

`dsh-blender-studio` injects the cross-version **`DSH_KIT` v2** helper library (**24** `dsh_*` helpers) directly into the shared script preamble for every template, exemplar, and `customScript` (compatible with Blender `3.6`, `4.x`, and `5.x` with zero deprecation warnings).

Use these hard-surface primitives to add realistic engineering density quickly and reliably:

| Helper | Purpose & Typical Parameters |
| :--- | :--- |
| `dsh_bevel(obj, width=0.015, segments=3)` | Adds clamped angle-based edge bevels so every mechanical edge catches crisp studio highlights instead of razor-sharp CG artifacts |
| `dsh_smooth(obj)` | Cross-version smooth shading (`foreach_set('use_smooth', ...)` safe on Blender 4.1–5.x without removed `use_auto_smooth`) |
| `dsh_loft_profile(name, sections, mat=None, closed=False, cap_ends=True)` | Smooth multi-section `bmesh` lofted hulls, aerodynamic fuselages, cowlings, and contoured robot arm castings |
| `dsh_bolt_ring(name, radius, count=12, bolt_radius=0.02, bolt_height=0.025, axis='Z', center=(0,0,0), mat=None)` | Single merged mesh of precision 6-sided hex flange bolts for turbine casings, servo joints, and mechanical couplings |
| `dsh_wheel_assembly(name, radius=0.35, width=0.28, spokes=10, tire_mat=None, rim_mat=None, caliper_color='#f59e0b', location=(0,0,0))` | Complete grounded tire + forged multi-spoke concave rim + ventilated brake disc + colored brake caliper |
| `dsh_louver_panel(name, width=0.6, height=0.25, slots=6, depth=0.04, mat=None, location=(0,0,0))` | Recessed angled cooling louver vents for engine bays, nacelles, and industrial enclosures |
| `dsh_array_radial(obj, count, axis='Z', center=(0, 0, 0))` | Generates precision circular arrays for turbofan blades (`22–36` blades), wheel spokes, flange features, and rotor hubs |
| `dsh_tube_along_points(name, points, radius=0.02, mat=None, bevel_res=6)` | Sweeps smooth beveled 3D curves into braided hydraulic pipes, robot umbilical dress packs, roll-cage bars, and tubular landing skids |
| `dsh_ground_assembly(objs, z=0.0)` | Computes exact evaluated world-space bounding minimum Z across an entire multi-part assembly and seats it flush at `z = 0.0` |
| `dsh_frame_camera_to_assembly(cam, objs, azimuth_deg=35, elevation_deg=20, lens_mm=58, margin=1.18)` | Auto-computes optimal telephoto distance and `TRACK_TO` aim so wide vehicles or tall assemblies fill the frame cleanly with balanced margin |

Tip: Name pure backdrop/floor/softbox objects with prefixes `Studio_`, `Backdrop_`, `Softbox_`, `Cyclorama`, or `Stage_Floor` so `QC-3D` and 4-view `contact_sheet` auto-framing focus tightly on your hero assembly.

---

## Phase 4 — Cinema PBR Lookdev, Clay Audit, Surgical Patching & Checkpoints

Replace flat clay placeholders with physically layered **`DSH_KIT` v2** shaders, studio lighting rigs, and optical post-processing:

### Cinema Procedural PBR Shaders (`DSH_KIT` v2 — 10 Shaders)
- `dsh_mat_car_paint(name, color, metallic=0.82, clearcoat=1.0)` — metallic flake base + glossy clearcoat for automotive bodywork and cowlings
- `dsh_mat_carbon_fiber(name)` — woven anisotropic-feel carbon weave for splitters, diffusers, wings, and interior tubs
- `dsh_mat_brushed_metal(name, color=(0.74, 0.77, 0.82), roughness=0.25)` — directional brushed titanium/aluminum/steel for blades, exhausts, rotors, and housings
- `dsh_mat_anodized_metal(name, color='#1d4ed8', roughness=0.22)` — aerospace anodized aluminum for bleed ducts, fixtures, and precision CNC housings
- `dsh_mat_heat_blued_titanium(name)` — procedural thermal blue/purple/gold gradient titanium for jet turbines and high-temp exhausts
- `dsh_mat_copper_gold(name, variant='copper', roughness=0.22)` — precision copper fuel manifolds or gold thermal-foil combustion shrouds
- `dsh_mat_tinted_glass(name, color=(0.12, 0.18, 0.24), roughness=0.04)` — sleek cockpit canopy / visor / architectural glazing (EEVEE & Cycles safe)
- `dsh_mat_rubber_tire(name)` — low-albedo satin rubber with micro-roughness grain for tires, hoses, umbilical packs, and dampeners
- `dsh_mat_emissive_led(name, color, strength=8.0)` — clean light-bar, navigation beacon, and instrumentation glow
- `dsh_mat_matte_armor(name, color=(0.24, 0.28, 0.26))` — tactical satin composite/ceramic finish with subtle micro-grain

### Hero Studio Environments, Clay Override & Post (`DSH_KIT` v2 — 4 Helpers)
- `dsh_setup_hero_studio(style='dark_cyclorama', accent_color='#4176e6')` — one-call studio backdrop + calibrated strip softboxes & rim lighting supporting `'dark_cyclorama'`, `'wet_asphalt'`, `'engineering_bay'`, and `'helipad'`.
- `dsh_render_clay_override(enable=True, color=(0.76, 0.77, 0.79, 1.0))` — applies a neutral matte clay override across hero geometry for pure silhouette, proportion, and edge-bevel QC audits without shader distractions.
- `dsh_setup_compositor(glare=True, glare_threshold=1.15)` — Blender 4.x & 5.x safe `FOG_GLOW` glare bloom for LED light-bars, exhaust cores, and specular metallic catchlights.
- `dsh_add_dof(cam, target_obj, fstop=4.0)` — subtle photographic depth of field locked onto the hero focal target.

### Surgical & Atomic Multi-Hunk Script Patching + Fearless Checkpoints
- **Never resend a 50 KB script to tweak camera angles or material parameters!** Use surgical single or **atomic multi-hunk** patching via `blender_script(action: 'patch')`:
  ```json
  {
    "action": "patch",
    "id": "<project-uuid>",
    "revision": 4,
    "edits": [
      { "find": "lens_mm=58, margin=1.18", "replace": "lens_mm=65, margin=1.24" },
      { "find": "roughness=0.28", "replace": "roughness=0.14" }
    ],
    "note": "Tighter 65mm telephoto compression + sharper metallic polish"
  }
  ```
  `patch` supports either single `{ find, replace, replaceAll? }` or batched `edits[]` (up to 50 hunks applied atomically—if any hunk or `checkScriptSafety` fails, nothing is written), increments `revision`, and **automatically captures a single checkpoint** of the prior script!
- **Pass `wait: true` on `blender_project(inspect_scene)`, `blender_render`, and `blender_script(run_headless)`** to await job completion in one turn and immediately receive artifact paths and `QC-3D` diagnostics without manual polling loops.
- Explicit checkpoints remain available anytime:
  - `blender_project(action: 'save_checkpoint', id, revision, note: 'Pre-Cycles metallic pass')`
  - `blender_project(action: 'restore_checkpoint', id, revision, checkpointId)`

---

## Phase 5 — Live Lookdev Overrides, Single-Launch Multi-Shot Packs & Live Bridge v2

1. **Tune Lookdev Without Touching Code (`DSH_OVERRIDES` / `dsh_apply_lookdev_overrides`)**:
   - Adjust `accentColor` (hero livery/finish repaint), `lensMm` (`18–135 mm`, default `50` preserves exemplar signature lens), `exposure` (`-3..+3 EV`), `clayMode` (`true` engages neutral studio clay override for silhouette/bevel review), and `transparentBg` via `blender_project(action: 'update')` or the Studio Inspector — overrides apply cleanly after scene build on templates, custom scripts, and all 5 Pro Exemplars.
2. **Configure Cycles GPU Acceleration**: Check detected GPU backends (`OPTIX` / `CUDA` / `METAL` / `HIP` / `ONEAPI`) via `blender_health`. `computeDevice` defaults to `'auto'` (automatically activates Cycles GPU when available and safely falls back to `'cpu'`).
3. **Single-Launch Multi-Shot Lookdev Pack (`blender_render(action: 'render_shots')`)**:
   Build the 3D scene **once** in a single headless Blender launch and capture up to 5 calibrated editorial angles (`hero_3q`, `low_dramatic`, `macro_dof`, `side_profile`, `top_plan`) in one job:
   ```json
   {
     "action": "render_shots",
     "id": "<project-uuid>",
     "revision": 6,
     "shots": ["hero_3q", "low_dramatic", "macro_dof", "top_plan"],
     "qualityTier": "studio"
   }
   ```
   Every rendered `shot` registers into the project's **Shot Filmstrip** (`MAX_PROJECT_ARTIFACTS = 20`) and opens directly in **A/B Compare** split-wipe alongside `still` and `contact_sheet` renders.
4. **Final Cinema Beauty Pipeline (`qualityTier: 'beauty'`)**:
   ```json
   {
     "action": "pipeline",
     "id": "<project-uuid>",
     "revision": 7,
     "qualityTier": "beauty",
     "includeContactSheet": true,
     "renderKind": "still",
     "exportFormat": "glb",
     "abortOnQcError": true
   }
   ```
   `qualityTier: 'beauty'` runs **Cycles** with GPU auto-acceleration (`computeDevice`), **OpenImageDenoise (`RGB_ALBEDO_NORMAL`)**, adaptive sampling, and **`AgX - Medium High Contrast`**, verifies `QC-3D`, produces the 2×2 QC sheet + denoised hero still, and exports a clean backdrop-stripped `.glb` (inspectable directly in the workbench **3D Mesh** viewer v3 with PBR metallic/roughness/emissive shading, `Shaded + Wire`, pan, and PNG snapshot!).
5. **Live Bridge v2 Direct Controls & 1-Click Setup**:
   - Install the Bridge add-on into local Blender in one step: `blender_bridge(action: 'install_addon', confirmed: true)` after explicit user confirmation.
   - Manipulate an open Blender scene directly without writing Python (each command pushes a clean Blender Undo step):
     - `blender_bridge(action: 'set_camera', location?, target?, lensMm?, dofFstop?)`
     - `blender_bridge(action: 'transform_object', name, location?, rotationDeg?, scale?)`
     - `blender_bridge(action: 'set_material', materialName, color, metallic?, roughness?)`
