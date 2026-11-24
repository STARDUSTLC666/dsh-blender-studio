---
name: "blender-visual-qc"
description: "Audit 3D scenes with QC-3D automated scoring (A-D) and 2x2 4-view contact sheets in dsh-blender-studio to catch clipping, floating geometry, bad framing, missing materials, or exposure defects before final delivery."
---

# Blender Visual Quality Control & `QC-3D` Audit Loop

Use this skill after building or editing any Blender scene in `dsh-blender-studio`, **before** producing high-sample final stills, long animations, or final 3D exports.

A `bpy` script that exits with code `0` can still produce a broken image: a hero facing away from the camera, an object floating above the floor, a camera stuck inside a wall, blown-out highlights, or magenta missing textures. Combining deterministic **`QC-3D` telemetry** with **2×2 visual contact sheets** eliminates broken deliveries.

## 1. The Mandatory Two-Layer QC Protocol in `dsh-blender-studio`

1. **Run Automated `QC-3D` Telemetry (`inspect_scene` / `scene_info`)**:
   Call `blender_project` (`action: "inspect_scene"`), `blender_script`, or Live Bridge `blender_bridge` (`action: "scene_info"`).
   Every returned `sceneSummary` includes a deterministic `qc` object:
   ```json
   {
     "score": 100,
     "grade": "A",
     "issues": [
       { "code": "UNASSIGNED_MATERIAL", "severity": "warn", "message": "...", "object": "GEO_Wheel" }
     ]
   }
   ```
   Target **Grade `A` (`>= 90`)** with **zero `error` findings** before spending time on high-sample Cycles renders.
2. **Generate the 2×2 Contact Sheet (`contact_sheet`)**:
   Call `blender_render` with `action: "contact_sheet"` on the saved project (`id`, `revision`).
   `dsh-blender-studio` automatically renders 4 calibrated angles and stitches them into one PNG:
   - **Top-Left**: Front orthographic/elevation view (`-Y → +Y`) — verifies vertical alignment, symmetry, and floor grounding (`Z = 0`).
   - **Top-Right**: Three-quarter hero view — verifies overall silhouette, depth, and lighting modeling.
   - **Bottom-Left**: Top-down plan view (`+Z → -Z`) — reveals hidden interpenetration, spacing, and wall clearance.
   - **Bottom-Right**: Active project camera — verifies exact final framing, lens distortion, backdrop edges, and exposure.
3. **Evaluate All `QC-3D` Codes + All 6 Visual Gates** before approving final output.

## 2. Deterministic `QC-3D` Issue Codes Reference

| Issue Code | Severity | What It Detects | Immediate Fix |
| :--- | :--- | :--- | :--- |
| `EMPTY_SCENE` | `error` | Zero renderable geometry objects (`meshCount === 0` and no Grease Pencil / Curve / Font) | Verify mesh creation linked objects to `scene.collection` or a child collection |
| `NO_CAMERA` | `error` | No camera object or `scene.camera` is `None` | Create `CAM_Main` and assign `scene.camera = cam_obj` |
| `NO_LIGHTS` | `warn` | Zero scene light objects and no HDRI world illumination | Add 3-point `AREA` rig or upload an `.hdr`/`.exr` asset for automatic World HDRI wiring |
| `UNASSIGNED_MATERIAL` | `warn` | Hero mesh has `0` material slots (renders dull default gray) | Assign a configured `Principled BSDF` material (`obj.data.materials.append(mat)`) |
| `FLAT_UNBEVELED_PRIMITIVE` | `info`/`warn` | Low-poly primitive hero (e.g. raw cube/cylinder) lacks smooth shading and bevel/subsurf modifiers | Add `BEVEL` (`limit_method='ANGLE'`, `segments=3`) and enable smooth shading |
| `FLOATING_HERO` | `warn` | Isolated hero assembly hovers `> 0.35 m` above stage without contact (assembly-aware: intentional elevated sub-parts like helicopter rotors, wings, or halos attached to an assembly are not flagged) | Run `ground_object_to_z(obj, stage_z)` on the assembly root/pedestal |
| `OFF_FRAME_HERO` | `error`/`warn` | Projected world bounding corners via `bpy_extras.object_utils.world_to_camera_view` fall outside the active camera NDC `[0, 1]` frame | Re-aim camera via `TRACK_TO` and recompute distance with `frame_camera_to_target(...)` |
| `HIGH_POLYCOUNT` | `info`/`warn` | Total scene polygons exceed `500,000` (especially costly on EEVEE or GLB export) | Cap `SUBSURF` `render_levels <= 2`, decimate or reduce `ARRAY`/scatter counts |

## 3. The 6 Visual & Structural QC Gates

### Gate 1 — Framing & Safe Margins (Bottom-Right Panel)
- Does the hero fill roughly **55%–80%** of the frame without touching or getting cropped by any border?
- Is the subject oriented toward the camera (check text readability on `logo-3d`, front face on `product-studio`, open cutaway sides on `isometric-room`)?
- Does the backdrop/cyclorama fully cover the frame with no exposed world void corners (unless `transparentBg: true`)?

### Gate 2 — Grounding & Contact (Top-Left + Top-Right Panels)
- Does the hero rest flush on `Z = 0` (or its pedestal top surface) with a grounded contact shadow?
- **Fail signals**: visible air gap under the base, shadow detached sideways below the object, or bottom bevel submerged into the floor.

### Gate 3 — Interpenetration & Proportions (Bottom-Left + Top-Left Panels)
- Check the top-down view for overlapping geometry: furniture cutting through walls, floating handles, colliding bars in `motion-data`, or misaligned stacked rings.
- Verify real-world proportions across parts (e.g., thin walls not thicker than furniture, bevels subtle rather than eating entire faces).

### Gate 4 — Exposure, Contrast & Silhouette Readability
- Can you immediately read the outer silhouette against the background?
- **Fail signals**:
  - Pitch-black / muddy dark image → missing/weak lights, light aimed away, or camera blocked by a wall/cyclorama back-face.
  - Clipped pure-white blob → light wattage too high for real-world metric scale (`R`), albedo `> 0.85`, or World strength `> 2.5`.
  - Flat lifeless shading → ambient World too bright (`strength >= 1.0`) washing out Key/Fill ratio; lower World to `0.15–0.35` and rely on directional Key + Rim lights.

### Gate 5 — Shading, Normals & Texture Integrity
- Look for bright **magenta (`#FF00FF`)** surfaces → broken image/HDRI file path in `ShaderNodeTexImage` / `ShaderNodeTexEnvironment`.
- Look for **coplanar Z-fighting** (striped flickering faces) → two meshes occupying the exact same plane; offset by at least `0.002 m`.
- Look for **unwanted faceting or black shading bands** → flipped normals (`recalc_face_normals`), missing smooth shading, or missing edge bevels on hard surfaces.

### Gate 6 — Scene Hygiene (`sceneSummary`)
- `activeCamera` is set and exists in `objects`.
- `meshCount >= 1` (or Grease Pencil object exists for `grease-pencil-2d`).
- `lightCount >= 1` (or HDRI world active).
- `totalPolygons` matches intent (not `0`, and not runaway `> 1,000,000` from unchecked `SUBSURF`/`ARRAY` nesting).

## 4. Defect → Root Cause → Exact Fix Table

| Observed Defect | Likely Root Cause | Exact `bpy` Fix |
| :--- | :--- | :--- |
| Solid black frame | Camera inside backdrop/object, or light aimed wrong way (`+Z` instead of `-Z`) | Check `cam.location` vs bounding box; aim lights with `to_track_quat('-Z', 'Y')`; increase light energy to `~150 * R²` |
| Bright magenta surface | Missing texture/HDRI image file | Verify `os.path.isfile(path)` against `ASSETS_DIR`; check `blender_assets` `list` for exact saved filename |
| Hero floating above floor | Primitive centered at `Z = 0` or offset manually | Run `ground_object_to_z(obj, 0.0)` using evaluated `bound_box` transformed by `matrix_world` |
| Cropped edges / tiny hero | Hardcoded camera coordinates mismatched with object size | Recompute camera distance with `frame_camera_to_target(cam, center, radius, padding=1.35)` |
| Harsh horizon line behind hero | Flat floor plane ending inside camera frustum | Replace flat plane with curved L-profile seamless cyclorama wider than `10 * R` |
| Blown-out neon / white highlights | `Standard` view transform or over-driven key/world | Switch to `AgX` (`AgX - Medium High Contrast`), cap albedo luminance `<= 0.80`, dial key light down 40% |
| Jagged dark crease artifacts | Non-uniform object scale or missing angle bevel | Bake scale into mesh (`obj.scale = (1,1,1)`), add `BEVEL` (`limit_method='ANGLE'`, `segments=3`), recalculate normals |
| Un-realized GN missing in GLB | Geometry Nodes instances not realized | Insert `GeometryNodeRealizeInstances` before `Group Output` and enable `export_apply=True` |

## 5. Disciplined Iteration Loop

- Fix concrete root causes in the project settings or `customScript`, save with the latest `revision` (`blender_project` `update` / `update_script`), and re-run `contact_sheet`.
- Cap visual QC loops at **2–3 focused iterations**; summarize what changed each pass rather than tweaking blindly.
- Once all 6 gates pass, scale up `samples` (`48–64` EEVEE or `96–128` Cycles) and `resolutionScale: 100` for the final `preview_still`, `render_animation`, or `export_model`.
