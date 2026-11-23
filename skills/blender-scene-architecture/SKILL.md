---
name: "blender-scene-architecture"
description: "Plan and structure Blender 3D scenes in DeepSeek Harness: Z-Up metric scale, collection hierarchy, non-destructive modifiers, template selection, and dsh-blender-studio tool choreography."
---

# Blender Scene Architecture & DSH Workflow

Use this skill whenever designing, structuring, or refactoring a 3D scene in `dsh-blender-studio` (from initial project setup through organized collections, scale discipline, and non-destructive modeling).

## 1. DSH Tool Choreography (`dsh-blender-studio`)

Follow this deterministic loop when building a 3D asset or render in DeepSeek Harness:

1. **Check environment first (`blender_health`)**: Verify installed Blender version (`3.6` / `4.x` / `5.x`), resolved EEVEE engine (`BLENDER_EEVEE_NEXT` vs `BLENDER_EEVEE`), Grease Pencil API (`gpv3` vs `gpv2`), and whether Live Bridge is connected.
2. **Create or inspect the project (`blender_project`)**:
   - Pick the closest built-in template (`product-studio`, `logo-3d`, `isometric-room`, `motion-data`, `grease-pencil-2d`, `blank-stage`) and set `aspect`, `engine`, `samples`, `lightingPreset`, `materialPreset`, `cameraPreset`, and `accentColor`.
   - Always pass the current `revision` on `update` / `update_script` to respect optimistic locking (avoids `409 CONFLICT`).
3. **Prepare optional external assets (`blender_assets`)**: List uploaded local assets (`hdr`, `exr`, `png`, `glb`, `obj`, `fbx`, `blend`) or—only when enabled and needed—search/import CC0 HDRIs, textures, or models via `search_polyhaven` / `import_polyhaven`.
4. **Author & validate custom `bpy` logic (`blender_script`)**:
   - Run `validate` before execution so static safety checks catch forbidden host calls or syntax issues early.
   - Persist custom code to the project (`blender_project` `update_script`, `scriptMode: 'custom'`) before headless rendering so artifacts stay tied to a saved revision.
5. **Render fast QC before final export (`blender_render`)**:
   - Start with `contact_sheet` (2×2 multi-angle sheet: front, three-quarter, top, active camera) at low samples (`16–32` EEVEE or `32` Cycles) to catch floating objects, clipping, scale errors, and framing flaws.
   - Run `inspect_scene` to verify object counts, polygon budget, active camera, and world-space bounding dimensions.
   - Only after visual QC passes (see `blender-visual-qc`), run final `preview_still`, `render_animation`, or `export_model` (`glb`, `fbx`, `obj`, `stl`, `blend`).
6. **Optional live handoff (`blender_bridge`)**: If the user has Blender open with `dsh_blender_bridge.py`, use `sync_project`, `viewport_capture`, or `open_gui` for interactive refinement.

## 2. Selecting the Right Built-In Template

| Template ID | Best For | Default Camera & Stage |
| :--- | :--- | :--- |
| `product-studio` | Hardware, packaging, hero gadgets, studio lookdev | Seamless infinity cyclorama, 3-point softbox studio, `three_quarter` 50–85mm |
| `logo-3d` | Extruded 3D typography, brand stings, emblem reveals | Beveled 3D text/emblem stage driven by `headline`, rim lighting |
| `isometric-room` | Miniature architectural dioramas, cutaway rooms | Orthogonal/telephoto `isometric` framing, cutaway walls + floor slab |
| `motion-data` | 3D bar charts, KPI monuments, procedural data columns | Grid floor, parametric instanced bars, clean architectural contrast |
| `grease-pencil-2d` | 2D / 2.5D hand-drawn storyboard & NPR cel art | GPv3/GPv2 multi-layer canvas with parallax depth |
| `blank-stage` | Fully custom `bpy` scenes built from scratch | Clean world + minimal floor/camera scaffold ready for `customScript` |

Use `scriptMode: 'template'` when tuning visual presets quickly; switch to `scriptMode: 'custom'` when building bespoke geometry, custom rigs, or multi-part hero assemblies.

## 3. Coordinate System & Real-World Metric Scale

Blender uses a **right-handed Z-Up** coordinate system:
- `+X`: Right
- `+Y`: Forward / Depth (into the scene away from a default front camera)
- `+Z`: Up
- Default front/three-quarter cameras sit in `-Y` looking toward the origin `(0, 0, 0)` along `+Y`.

Always enforce real-world metric units (`1 BU = 1 meter`):

```python
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0
```

Why real-world scale is mandatory:
- **Cycles & EEVEE light falloff** obeys inverse-square distance (`1/r²`); a 10-meter coffee mug requires absurd wattage and produces flat shadows.
- **Depth of Field (f-stop)**, **Subsurface Scattering radius**, **Bevel widths**, and **Ambient Occlusion distances** are physically calibrated in meters.

Target scale budgets:
- Handheld product / hero gadget: `0.15 m – 0.45 m` tall.
- Furniture / tabletop prop: `0.50 m – 1.20 m`.
- Isometric diorama room: `3.6 m × 3.6 m × 2.6 m` walls, wall thickness `0.12 m – 0.18 m`.
- 3D logo / title monument: `2.0 m – 4.0 m` wide, depth `0.15 m – 0.35 m`.

## 4. Collection Hierarchy & Naming Conventions

Organize every non-trivial scene into deterministic top-level collections linked directly under `scene.collection`:

```text
Scene Collection
├── 00_Stage       # Floor, cyclorama backdrop, plinths, architectural shell
├── 01_Hero        # Primary focal subject and child sub-assemblies
├── 02_Props       # Secondary storytelling props and scatter instances
├── 03_Lighting    # Area/Spot/Sun lights, gobo blockers, bounce cards
└── 04_Cameras     # Main camera, QC cameras, camera target empties
```

Prefix objects by role so `inspect_scene` and outliner queries stay unambiguous:
- `GEO_` for renderable meshes/curves/text (`GEO_Hero_Body`, `GEO_Stage_Cyclorama`)
- `LGT_` for lights (`LGT_Key`, `LGT_Fill`, `LGT_Rim`)
- `CAM_` for cameras (`CAM_Main`, `CAM_QC_Front`)
- `CTL_` for empties, pivots, and animation rigs (`CTL_Hero_Pivot`, `CTL_Cam_Target`)
- `MAT_` for materials (`MAT_Brushed_Aluminum`, `MAT_Stage_Matte`)

Helper for idempotent collection creation:

```python
def ensure_collection(name: str, parent=None):
    parent = parent or bpy.context.scene.collection
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
    if col.name not in parent.children:
        parent.children.link(col)
    return col
```

## 5. Grounding, Origins & Non-Destructive Modifiers

### Zero-Float / Zero-Clip Grounding Rule
Never eyeball object height on the floor plane (`Z = 0`). After creating or modifying a mesh (and updating the depsgraph if modifiers exist), compute its exact world-space minimum Z and shift it onto `Z = 0`:

```python
from mathutils import Vector

def ground_object_to_z(obj, target_z: float = 0.0):
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = obj.evaluated_get(depsgraph)
    corners = [eval_obj.matrix_world @ Vector(c) for c in eval_obj.bound_box]
    min_z = min(v.z for v in corners)
    obj.location.z += target_z - min_z
```

### Non-Uniform Scale Hazard
Never leave non-uniform object scale (`obj.scale != (1, 1, 1)`) on modeled geometry—it distorts `BEVEL` widths, `SOLIDIFY` thickness, UV unwrapping, and Cycles normals. Bake dimensions directly into mesh vertices (`bmesh.ops.scale` or `mesh.transform(Matrix.Diagonal((sx, sy, sz, 1.0)))`) while keeping `obj.scale = (1.0, 1.0, 1.0)`.

### Canonical Non-Destructive Modifier Order
Stack modifiers in predictable geometric order:
1. `MIRROR` (symmetry before thickness/bevels)
2. `SOLIDIFY` (wall thickness for shells and open surfaces)
3. `BEVEL` (`limit_method='ANGLE'`, `angle_limit=math.radians(30)`, `segments=3`, `use_clamp_overlap=True` — gives every hard edge realistic specular catchlights!)
4. `SUBSURF` (`levels=1`, `render_levels=2` for organic/curved surfaces)
5. `WEIGHTED_NORMAL` (when mixing sharp hard-surface bevels with flat faces)
6. `ARRAY` / `CURVE` / `NODES` (procedural repetition after base detail)

## 6. Scene Complexity & Performance Budgets

- **Fast preview / web GLB**: `5,000 – 50,000` triangles total; prefer smooth shading + 3-segment bevels over dense subdivision.
- **Hero product still**: `30,000 – 250,000` triangles; cap `SUBSURF` `render_levels` at `2` unless extreme macro close-up.
- **Avoid accidental explosion**: Never stack `ARRAY` × `SUBSURF` × `SOLIDIFY` with high counts without calculating resulting polygon count first. Verify via `inspect_scene` (`totalPolygons`).
