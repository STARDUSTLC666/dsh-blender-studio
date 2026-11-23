---
name: "blender-grease-pencil"
description: "Create 2D and 2.5D Grease Pencil illustrations, storyboards, parallax layers, and 3D Line Art inks in Blender, handling GPv2 (3.6–4.2) and GPv3 (4.3–5.x) APIs cleanly."
---

# Blender Grease Pencil 2D / 2.5D Workflow (GPv2 & GPv3)

Use this skill when building `grease-pencil-2d` projects, 2D vector-like illustrations, multi-plane parallax scenes, or cel-inked 3D Line Art renders in `dsh-blender-studio`.

## 1. GPv2 (3.6–4.2) vs GPv3 (4.3–5.x) Architecture

Blender 4.3 completely replaced legacy Grease Pencil v2 (`'GPENCIL'`) with **Grease Pencil v3 (`'GREASEPENCIL'`)**, built on generic mesh/curve attribute storage (`Drawing` + `add_strokes`).

Check which API the active Blender executable exposes (also reported by `blender_health` as `greasePencilApi: 'gpv3' | 'gpv2'`):

```python
import bpy

def is_gpv3() -> bool:
    return bpy.app.version >= (4, 3, 0)
```

Key API differences:

| Concept | GPv2 (Blender 3.6 – 4.2) | GPv3 (Blender 4.3 – 5.x) |
| :--- | :--- | :--- |
| Object type | `'GPENCIL'` | `'GREASEPENCIL'` |
| Data collection | `bpy.data.grease_pencils` | `bpy.data.grease_pencils_v3` (4.3+) / `bpy.data.grease_pencils` (alias in 4.3+/5.0) |
| Layer creation | `gp.layers.new(name, set_active=True)` | `gp.layers.new(name)` |
| Frame drawing | `frame = layer.frames.new(1); stroke = frame.strokes.new()` | `frame = layer.frames.new(1); drawing = frame.drawing; drawing.add_strokes([n])` |
| Point coords & width | `p.co = (x,y,z)`, `p.pressure`, `stroke.line_width` | `stroke.points[i].position = (x,y,z)`, `stroke.points[i].radius = r` (meters) |
| Cyclic closed fill | `stroke.use_cyclic = True` | `stroke.cyclic = True` |

## 2. Cross-Version Grease Pencil Stroke Builder

Use this unified helper to create stroke + fill layers that work identically on Blender 3.6, 4.2, 4.3, 4.5, and 5.x:

```python
def create_gp_material(name: str, stroke_rgba=(0.08, 0.08, 0.10, 1.0), fill_rgba=None):
    mat = bpy.data.materials.new(name=name)
    bpy.data.materials.create_gpencil_data(mat)
    gp_mat = mat.grease_pencil
    gp_mat.show_stroke = stroke_rgba is not None
    if stroke_rgba is not None:
        gp_mat.color = stroke_rgba
    gp_mat.show_fill = fill_rgba is not None
    if fill_rgba is not None:
        gp_mat.fill_color = fill_rgba
    return mat

def create_gp_object(name: str, collection=None):
    if is_gpv3():
        pool = getattr(bpy.data, 'grease_pencils_v3', None) or bpy.data.grease_pencils
        gp_data = pool.new(name)
    else:
        gp_data = bpy.data.grease_pencils.new(name)
    obj = bpy.data.objects.new(name, gp_data)
    (collection or bpy.context.scene.collection).objects.link(obj)
    return obj, gp_data

def add_gp_stroke(gp_data, layer_name: str, points, frame_num: int = 1, material_index: int = 0, radius: float = 0.02, cyclic: bool = False):
    layer = gp_data.layers.get(layer_name)
    if layer is None:
        layer = gp_data.layers.new(layer_name)

    frame = next((f for f in layer.frames if f.frame_number == frame_num), None)
    if frame is None:
        frame = layer.frames.new(frame_num)

    if is_gpv3():
        drawing = frame.drawing
        start_idx = len(drawing.strokes)
        drawing.add_strokes([len(points)])
        stroke = drawing.strokes[start_idx]
        stroke.material_index = material_index
        if hasattr(stroke, 'cyclic'):
            stroke.cyclic = cyclic
        for i, co in enumerate(points):
            pt = stroke.points[i]
            pt.position = co
            pt.radius = radius
            if hasattr(pt, 'opacity'):
                pt.opacity = 1.0
    else:
        stroke = frame.strokes.new()
        stroke.display_mode = '3DSPACE'
        stroke.material_index = material_index
        stroke.line_width = max(1, int(radius * 1200))
        stroke.use_cyclic = cyclic
        stroke.points.add(len(points))
        for i, co in enumerate(points):
            pt = stroke.points[i]
            pt.co = co
            pt.pressure = 1.0
            pt.strength = 1.0
```

## 3. 2.5D Multi-Plane Parallax Staging

Grease Pencil lives in full 3D space! Position layers along the depth axis (`+Y` away from a `-Y` camera) to create crisp anime/storybook parallax when panning or orbiting:

- **`BG_Sky_Hills`** (`Y = +2.5 m`): Soft pastel fills, no heavy dark ink outlines.
- **`MG_Architecture`** (`Y = +0.8 m`): Clean mid-weight outlines (`radius = 0.014 m`), desaturated fills.
- **`FG_Hero`** (`Y = 0.0 m`): Bold crisp ink lines (`radius = 0.022 m`), saturated `accentColor` fills, subtle `use_lights = True` if combining with 3D rim lights.
- **`FX_Foreground`** (`Y = -0.7 m`): Framing leaves, sparkles, speed lines, or floating accents that drift faster across the lens.

Set `gp_data.stroke_depth_order = '3D'` (when available) so strokes sort naturally against 3D meshes, or `'2D'` (layer stack order) for strict cel-animation compositing.

## 4. Combining 3D Meshes with Grease Pencil Line Art

To get crisp 2.5D NPR outlines on real 3D geometry without hand-drawing every edge:
1. Build your 3D meshes in a dedicated collection (e.g., `01_Hero`) with flat/cel materials.
2. Add an empty Grease Pencil object (`GP_LineArt`) with a dark ink material (`slot 0`) and one layer `"Lines"` with a blank keyframe at frame `1`.
3. Add the Line Art modifier:
   - Blender 4.3+ (GPv3): `mod = gp_obj.modifiers.new("LineArt", 'GREASE_PENCIL_LINEART')`
   - Blender 3.6–4.2 (GPv2): `mod = gp_obj.grease_pencil_modifiers.new("LineArt", 'GP_LINEART')`
4. Configure `mod.source_type = 'COLLECTION'`, `mod.source_collection = hero_col`, `mod.target_layer = "Lines"`, `mod.target_material = ink_mat`, `mod.use_contour = True`, `mod.use_crease = True`, `mod.crease_threshold = math.radians(130)`.

## 5. Color & Render Pitfalls for Grease Pencil

- **Why colors look washed out under `AgX`/`Filmic`**: High-saturation flat 2D colors desaturate under filmic tone mapping. For pure flat 2D illustration styles, switch `scene.view_settings.view_transform = 'Standard'` (with `look = 'None'`); keep `AgX` only when blending Grease Pencil into realistic lit 3D scenes.
- **Turn off layer lights for flat cel look**: Set `layer.use_lights = False` when you want exact hex colors unshaded by scene lamps; enable `layer.use_lights = True` when casting 3D studio shadows across strokes.
- **Anti-aliasing**: Ensure `EEVEE` samples >= `16` and `scene.grease_pencil_settings.antialias_threshold` (if present) stays around `0.5–1.0` for razor-sharp ink lines.
