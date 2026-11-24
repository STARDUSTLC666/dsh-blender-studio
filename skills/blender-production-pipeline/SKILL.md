---
name: "blender-production-pipeline"
description: "Orchestrate the 5-phase AAA 3D production workflow in dsh-blender-studio: metric sub-assembly planning, QC-3D blockout checks, DSH_KIT hard-surface and cinema PBR shaders, script checkpoints, and Cycles OIDN beauty pipeline exports."
---

# High-Quality 3D Production Pipeline (`dsh-blender-studio` v0.2.0)

Use this skill whenever building complex, portfolio-grade 3D vehicles, industrial machinery, architectural hero pieces, or detailed product assemblies inside `dsh-blender-studio`. Rather than writing one blind monolithic script and hoping the final Cycles render looks good, follow this deterministic **5-Phase AAA Production Loop**.

---

## Phase 1 — Design Brief, Metric Scale & Sub-Assembly Architecture

Before writing geometry code:
1. **Lock real-world metric dimensions** (`1 BU = 1 m`): e.g. GT racecar (`4.8 m × 2.0 m × 1.15 m`), twin-turbine helicopter (`11 m` rotor span, `3.2 m` height), high-bypass turbofan (`2.4 m` fan diameter, `3.6 m` length). Real-world meters keep Cycles inverse-square lighting, bevel radii, depth-of-field f-stops, and auto-framing physically accurate.
2. **Partition into logical sub-assembly collections**:
   - `00_Studio`: cyclorama / wet asphalt / helipad / engineering bay, overhead strip softboxes, key/fill/rim rigs
   - `01_Primary`: main monocoque fuselage, engine core, or architectural shell
   - `02_Mechanical`: rotors, fan blades, brake discs, calipers, suspension arms, hydraulic manifolds, bolt rings
   - `03_Details`: glass canopy, cockpit interior, intake grilles, LED strips, decals, fasteners
3. **Create a clean workspace**: Start from `blank-stage` (or the closest template among the 8 built-ins), set `scriptMode: 'custom'` (`customScript` accepts up to **`256 KB`** of pure `bpy`/`bmesh` code), and use `blender_project(action: 'duplicate')` whenever branching a risky lookdev experiment.
4. **Auto-wired assets**: Upload `.hdr`/`.exr` to automatically light the World node tree, or drop `.glb`/`.gltf`/`.obj`/`.fbx`/`.stl` parts to auto-import and ground onto the stage.

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

## Phase 3 — Hard-Surface Engineering Detailing with Built-In `DSH_KIT`

`dsh-blender-studio` injects the cross-version **`DSH_KIT`** helper library (`dsh_*`) directly into the shared script preamble for every template and every `customScript` (compatible with Blender `3.6`, `4.x`, and `5.x` with zero deprecation warnings).

Use these hard-surface primitives to add realistic engineering density quickly and reliably:

| Helper | Purpose & Typical Parameters |
| :--- | :--- |
| `dsh_bevel(obj, width=0.015, segments=3)` | Adds clamped angle-based edge bevels so every mechanical edge catches crisp studio highlights instead of razor-sharp CG artifacts |
| `dsh_smooth(obj)` | Cross-version smooth shading (`foreach_set('use_smooth', ...)` safe on Blender 4.1–5.x without removed `use_auto_smooth`) |
| `dsh_array_radial(obj, count, axis='Z', center=(0, 0, 0))` | Generates precision circular arrays for turbofan blades (`22–36` blades), wheel spokes, flange bolt rings, and rotor hubs |
| `dsh_tube_along_points(name, points, radius=0.02, mat=None, bevel_res=6)` | Sweeps smooth beveled 3D curves into braided hydraulic pipes, roll-cage bars, tubular landing skids, and exhaust manifolds |
| `dsh_ground_assembly(objs, z=0.0)` | Computes exact evaluated world-space bounding minimum Z across an entire multi-part assembly and seats it flush at `z = 0.0` (zero floating, zero floor clipping) |
| `dsh_frame_camera_to_assembly(cam, objs, azimuth_deg=35, elevation_deg=20, lens_mm=58, margin=1.18)` | Auto-computes optimal telephoto distance and `TRACK_TO` aim so wide vehicles or tall assemblies fill the frame cleanly with balanced margin |

Tip: Name pure backdrop/floor/softbox objects with prefixes `Studio_`, `Backdrop_`, `Softbox_`, `Cyclorama`, or `Stage_Floor` so `QC-3D` and 4-view `contact_sheet` auto-framing focus tightly on your hero assembly.

---

## Phase 4 — Cinema PBR Lookdev, Hero Studios & Fearless Checkpoints

Replace flat clay placeholders with physically layered **`DSH_KIT`** shaders, studio lighting rigs, and optical post-processing:

### Cinema Procedural PBR Shaders (`DSH_KIT`)
- `dsh_mat_car_paint(name, color, metallic=0.82, clearcoat=1.0)` — metallic flake base + glossy clearcoat for automotive bodywork and cowlings
- `dsh_mat_carbon_fiber(name)` — woven anisotropic-feel carbon weave for splitters, diffusers, wings, and interior tubs
- `dsh_mat_brushed_metal(name, color=(0.74, 0.77, 0.82), roughness=0.25)` — directional brushed titanium/aluminum/steel for blades, exhausts, rotors, and housings
- `dsh_mat_tinted_glass(name, color=(0.12, 0.18, 0.24), roughness=0.04)` — sleek cockpit canopy / visor / architectural glazing (EEVEE & Cycles safe)
- `dsh_mat_rubber_tire(name)` — low-albedo satin rubber with micro-roughness grain for tires, hoses, and dampeners
- `dsh_mat_emissive_led(name, color, strength=8.0)` — clean light-bar, navigation beacon, and instrumentation glow
- `dsh_mat_matte_armor(name, color=(0.24, 0.28, 0.26))` — tactical satin composite/ceramic finish with subtle micro-grain

### Hero Studio Environments & Post (`DSH_KIT`)
- `dsh_setup_hero_studio(style='dark_cyclorama', accent_color='#4176e6')` — one-call studio backdrop + calibrated strip softboxes & rim lighting supporting `'dark_cyclorama'`, `'wet_asphalt'`, `'engineering_bay'`, and `'helipad'`.
- `dsh_setup_compositor(glare=True, glare_threshold=1.15)` — Blender 4.x & 5.x safe `FOG_GLOW` glare bloom for LED light-bars, exhaust cores, and specular metallic catchlights.
- `dsh_add_dof(cam, target_obj, fstop=4.0)` — subtle photographic depth of field locked onto the hero focal target.

### Fearless Iteration with Script Checkpoints
- Every time `customScript` changes via `update` / `update_script`, `dsh-blender-studio` **automatically saves** the prior script snapshot into `project.checkpoints` (keeping the latest 10 revisions with timestamp and `QC-3D` score).
- Save explicit named milestones before major lookdev or geometry rewrites:
  - `blender_project(action: 'save_checkpoint', id, revision, note: 'Pre-Cycles metallic pass')`
- If an experiment degrades framing, geometry, or lookdev, roll back cleanly in one call:
  - `blender_project(action: 'restore_checkpoint', id, revision, checkpointId)`

---

## Phase 5 — Multi-Angle Critique Loop → Cycles OIDN Beauty Pipeline & Export

1. **Studio Pass Check (`qualityTier: 'studio'`)**: Render a full-resolution `1280×720` EEVEE still + 4-view `contact_sheet`. Inspect the actual PNG files visually:
   - Are dark mechanical areas readable (sufficient key/fill bounce and overhead strip reflections)?
   - Do metallic bevels and carbon panels separate cleanly from the backdrop?
   - Does `QC-3D` report **Grade `A` (`>= 90`)** with **0 errors**?
2. **Refine & Checkpoint**: Adjust studio lighting energy, camera azimuth/lens (`50–85 mm`), glare threshold, or material contrast over 1–3 focused passes, saving a checkpoint at each clean gain.
3. **Final Cinema Beauty Pipeline (`qualityTier: 'beauty'`)**:
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
   `qualityTier: 'beauty'` runs **Cycles** with automatic **OpenImageDenoise (`RGB_ALBEDO_NORMAL`)**, adaptive sampling, and **`AgX - Medium High Contrast`** color management (300 s render budget), verifies `QC-3D`, produces the 2×2 QC sheet + crisp denoised hero still (or animation if `renderKind: 'animation'`), and exports a clean, applied-modifier `GLB` (or `FBX`/`OBJ`/`STL`/`.blend`).
4. **Final Visual Sign-Off**: Inspect the final beauty PNG at its saved path before delivering it to the user, and optionally open in Blender GUI (`blender_bridge` `open_gui` / `sync_project`) for manual post-polish.
