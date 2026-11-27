---
name: "blender-bpy-scripting"
description: "Write deterministic, headless-safe Blender Python (bpy) scripts compatible across Blender 3.6, 4.x, and 5.x, avoiding bpy.ops context pitfalls and passing dsh-blender-studio static safety checks."
---

# Blender Python (`bpy`) Scripting (3.6 – 5.x)

Use this skill when writing or debugging `customScript` payloads for `dsh-blender-studio`, executing code via `blender_script`, or updating templates so scripts work reliably in headless CLI (`--background --factory-startup`) and Live Bridge modes across Blender 3.6, 4.x, and 5.x.

## 1. Golden Rule: Prefer `bpy.data` + `bmesh` Over `bpy.ops`

`bpy.ops.*` operators rely on active UI regions, selection state, and view-layer refreshes. In headless `--background` mode or inside `bpy.app.timers` (Live Bridge), many `bpy.ops` calls raise `RuntimeError: Operator ... poll() failed, context is incorrect` or degrade to $O(N^2)$ performance.

Use low-level data APIs instead:

```python
import bpy
import bmesh
from mathutils import Matrix

def create_mesh_object(name: str, builder_fn, collection=None, location=(0.0, 0.0, 0.0)):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm = bmesh.new()
    builder_fn(bm)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    target_col = collection or bpy.context.scene.collection
    target_col.objects.link(obj)
    return obj

# Example: beveled box without touching bpy.ops.mesh.primitive_cube_add
def make_pedestal(bm):
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Diagonal((1.4, 1.4, 0.2, 1.0)))
    bmesh.ops.bevel(
        bm,
        geom=list(bm.edges),
        offset=0.02,
        segments=3,
        affect='EDGES',
        clamp_overlap=True,
    )
```

When an operator is unavoidable (e.g., `bpy.ops.export_scene.gltf`, `bpy.ops.object.convert`, or `bpy.ops.wm.save_as_mainfile`), use Blender 3.2+ / 4.x+ `bpy.context.temp_override(...)` — **never** pass a legacy dict as the first positional argument (removed in Blender 4.0):

```python
with bpy.context.temp_override(selected_objects=[obj], active_object=obj):
    bpy.ops.object.convert(target='MESH')
```

## 2. Clean Scene Reset (Headless & Live Bridge Safe)

Avoid `bpy.ops.wm.read_factory_settings()` inside Live Bridge scripts because it wipes active add-on state and timers. Clear data-blocks cleanly instead:

```python
def clear_scene(scene=None):
    scene = scene or bpy.context.scene
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)
    for block_group in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.lights,
        bpy.data.cameras,
        bpy.data.materials,
        bpy.data.node_groups,
        bpy.data.actions,
        bpy.data.images,
    ):
        for block in list(block_group):
            if block.users == 0:
                block_group.remove(block)
```

## 3. Blender 3.6 vs 4.x vs 5.x API Compatibility Matrix

Always feature-detect via `bpy.app.version` or RNA enum introspection instead of hardcoding a single Blender version.

### 3.1 Render Engine (`BLENDER_EEVEE_NEXT` vs `BLENDER_EEVEE`)
- Blender 3.6–4.1 uses `'BLENDER_EEVEE'`.
- Blender 4.2–4.5 uses `'BLENDER_EEVEE_NEXT'`.
- Blender 5.0+ may rename or normalize EEVEE identifiers; probing RNA enum items handles **all** versions cleanly:

```python
def resolve_eevee_engine(scene) -> str:
    items = {item.identifier for item in scene.render.bl_rna.properties['engine'].enum_items}
    if 'BLENDER_EEVEE_NEXT' in items:
        return 'BLENDER_EEVEE_NEXT'
    if 'BLENDER_EEVEE' in items:
        return 'BLENDER_EEVEE'
    return 'CYCLES'
```

### 3.2 Principled BSDF Socket Renames (Blender 4.0+)
Blender 4.0 renamed several core sockets on `ShaderNodeBsdfPrincipled`:

| Concept | Blender 3.6 | Blender 4.0 – 5.x |
| :--- | :--- | :--- |
| Dielectric specular | `Specular` | `Specular IOR Level` |
| Subsurface mix | `Subsurface` | `Subsurface Weight` |
| Transmission mix | `Transmission` | `Transmission Weight` |
| Clearcoat strength | `Clearcoat` | `Coat Weight` |
| Clearcoat roughness | `Clearcoat Roughness` | `Coat Roughness` |
| Sheen strength | `Sheen` | `Sheen Weight` |
| Emission color | `Emission` | `Emission Color` |

Always wrap socket writes in a fallback helper:

```python
def set_socket(node, value, *names: str) -> bool:
    for name in names:
        sock = node.inputs.get(name)
        if sock is not None:
            sock.default_value = value
            return True
    return False

# Usage:
set_socket(bsdf, 0.5, "Specular IOR Level", "Specular")
set_socket(bsdf, 0.92, "Transmission Weight", "Transmission")
set_socket(bsdf, 0.8, "Coat Weight", "Clearcoat")
set_socket(bsdf, (1.0, 0.4, 0.1, 1.0), "Emission Color", "Emission")
```

### 3.3 Mesh Smooth Shading & Normals (Blender 4.1+)
Blender 4.1 **removed** `mesh.use_auto_smooth`, `mesh.auto_smooth_angle`, and `mesh.calc_normals_split()`. Calling them raises `AttributeError`.

Cross-version smooth shading:

```python
def set_smooth_shading(mesh, smooth: bool = True):
    if len(mesh.polygons) > 0:
        mesh.polygons.foreach_set('use_smooth', [smooth] * len(mesh.polygons))
    if hasattr(mesh, 'use_auto_smooth') and bpy.app.version < (4, 1, 0):
        mesh.use_auto_smooth = smooth
    mesh.update()
```

For crisp hard edges on Blender 4.1+, combine smooth faces with a `BEVEL` modifier (`limit_method='ANGLE'`, `harden_normals=False`) or mark sharp edges explicitly (`edge.use_edge_sharp = True` in `bmesh` / `mesh.edges`).

### 3.4 Color Management (`AgX` vs `Filmic`)
Blender 4.0 introduced `AgX`; Blender 3.6 only has `Filmic`. Probe available view transforms before assigning:

```python
def set_color_management(scene, prefer_look: str = "AgX - Medium High Contrast"):
    vs = scene.view_settings
    transforms = {i.identifier for i in vs.bl_rna.properties['view_transform'].enum_items}
    if 'AgX' in transforms:
        vs.view_transform = 'AgX'
    elif 'Filmic' in transforms:
        vs.view_transform = 'Filmic'
    looks = {i.identifier for i in vs.bl_rna.properties['look'].enum_items}
    if prefer_look in looks:
        vs.look = prefer_look
    elif 'Medium High Contrast' in looks:
        vs.look = 'Medium High Contrast'
    else:
        vs.look = 'None'
```

### 3.5 EEVEE Material Transparency & Options (Blender 4.2+)
- Blender 4.2 removed `scene.eevee.use_bloom`, `use_ssr`, `use_gtao`, `mat.blend_method`, and `mat.shadow_method`.
- Use `hasattr` guards and prefer `mat.surface_render_method = 'DITHERED'` on 4.2+ vs `mat.blend_method = 'HASHED'` on 3.6–4.1.
- For EEVEE Next raytracing: `if hasattr(scene.eevee, 'use_raytracing'): scene.eevee.use_raytracing = True`.

### 3.6 Geometry Nodes & Grease Pencil & Actions (4.0 / 4.3 / 4.4+)
- **Geometry Nodes**: Use `ng.interface.new_socket(...)` on 4.0+, fallback to `ng.inputs.new(...)` / `ng.outputs.new(...)` on 3.6.
- **Grease Pencil**: Blender 4.3+ uses GPv3 (`'GREASEPENCIL'`, `layer.frames.new(frame_num)` -> `drawing.add_strokes(...)`); Blender 3.6–4.2 uses GPv2 (`'GPENCIL'`, `bpy.data.grease_pencils`). See `blender-grease-pencil`.
- **Animation F-Curves (4.4 / 5.0 Slotted Actions)**: Always animate via `obj.keyframe_insert(data_path=..., frame=...)`, which works uniformly across 3.6–5.x. When tuning easing on F-Curves, probe `action.layers` / `channelbag.fcurves` (4.4+/5.x) with fallback to `action.fcurves` (3.6–4.3).

## 4. `dsh-blender-studio` Static Safety Scanner Rules

Before executing `customScript` via `blender_script` (`validate`, `run_headless`, or `run_bridge`), `dsh-blender-studio` runs a static AST/regex safety gate. Scripts are rejected with `SCRIPT_UNSAFE` by default if they use:
- Process spawning: `os.system`, `os.popen`, `subprocess`, `pty`, `commands`
- Destructive filesystem ops: `shutil.rmtree`, `os.remove`, `os.unlink`, `os.rmdir`, `pathlib.Path.unlink`
- Network / socket I/O: `socket`, `urllib`, `http.client`, `requests`, `ftplib`, `smtplib`
- Dynamic code execution: `eval(`, `exec(`, `compile(`, `__import__`, `importlib.import_module`
- Arbitrary host filesystem writes outside the job output path.

Keep custom scripts pure and self-contained using `bpy`, `bmesh`, `mathutils`, `math`, `random`, and `json`. Use `random.Random(42)` for reproducible procedural results. Only request `allowUnsafe: true` if the user explicitly approves an advanced local workflow.

## 5. Surgical Reading & Patching, Exact `DSH_KIT` v2 Signatures & Cycles GPU Safety

- **Zero-Guess Script Reading (`blender_script` `action: 'read'`)**: Before patching a large script after several edits, call `blender_script(action: 'read', id, startLine?, endLine?, pattern?)` to inspect exact line-numbered slices or regex matches — never use shell/grep on `project.json`.
- **Surgical & Atomic Multi-Hunk Patching (`blender_script` `action: 'patch'`)**: Prefer `blender_script(action: 'patch', id, revision, find/replace | edits[], note?)` over rewriting the entire script with `update_script`. Patching enforces static safety before write, fails loudly on missing (`SCRIPT_PATCH_NOT_FOUND`) or duplicate (`SCRIPT_PATCH_AMBIGUOUS`) targets, increments `revision`, and automatically saves a checkpoint.
- **Exact `DSH_KIT` v2 Helper Signatures (injected automatically into every script preamble — no imports needed)**:
  ```python
  # Scene / collections / primitives (all return bpy.types.Object)
  dsh_clear_scene()
  dsh_ensure_collection(name)
  dsh_link_object(obj, collection_name="DSH_Scene")
  dsh_hex_to_rgba(hex_color, alpha=1.0)
  dsh_coerce_rgba(color, alpha=1.0)
  dsh_set_smooth(mesh, smooth=True)
  dsh_smooth(obj)
  dsh_bevel(obj, width=0.015, segments=3)
  dsh_set_bsdf(bsdf, socket_names, value)
  dsh_assign_material(obj, mat)
  dsh_make_mesh_box(name, size=(1.0, 1.0, 1.0), location=(0.0, 0.0, 0.0), bevel_width=0.0, collection="DSH_Scene")
  dsh_make_mesh_cylinder(name, radius1=0.5, radius2=0.5, depth=1.0, segments=48, location=(0.0, 0.0, 0.0), bevel_width=0.0, collection="DSH_Scene")
  dsh_make_mesh_sphere(name, radius=0.5, location=(0.0, 0.0, 0.0), u_segments=40, v_segments=24, collection="DSH_Scene")
  dsh_make_mesh_torus(name, major_radius=1.0, minor_radius=0.08, major_seg=48, minor_seg=18, location=(0.0, 0.0, 0.0), collection="DSH_Scene")

  # Hard-surface engineering helpers
  dsh_loft_profile(name, sections, mat=None, closed=False, cap_ends=True, collection="DSH_Hero")
  dsh_bolt_ring(name, radius, count=12, bolt_radius=0.02, bolt_height=0.025, axis="Z", center=(0.0, 0.0, 0.0), mat=None, collection="DSH_Hero")
  dsh_wheel_assembly(name, radius=0.35, width=0.28, spokes=10, tire_mat=None, rim_mat=None, caliper_color="#f59e0b", location=(0.0, 0.0, 0.0), collection="DSH_Hero")
  dsh_louver_panel(name, width=0.6, height=0.25, slots=6, depth=0.04, mat=None, location=(0.0, 0.0, 0.0), collection="DSH_Hero")
  dsh_array_radial(obj, count, axis="Z", center=(0.0, 0.0, 0.0))
  dsh_tube_along_points(name, points, radius=0.02, mat=None, bevel_res=6, collection="DSH_Hero")
  dsh_ground_assembly(objs, z=0.0)
  dsh_frame_camera_to_assembly(cam, objs, azimuth_deg=35.0, elevation_deg=20.0, lens_mm=58.0, margin=1.18)  # scales accurately from 4cm watches to 10m vehicles!

  # Materials (all return bpy.types.Material, Blender 3.6–5.x safe)
  dsh_create_material(name, preset, color_rgba, emission_strength=0.0)  # presets: clay_matte, brushed_metal, frosted_glass, ceramic_gloss, toon_cel
  dsh_mat_car_paint(name, color, metallic=0.82, clearcoat=1.0)
  dsh_mat_carbon_fiber(name="Mat_Carbon_Fiber")
  dsh_mat_brushed_metal(name, color=(0.74, 0.77, 0.82), roughness=0.25)
  dsh_mat_anodized_metal(name, color="#1d4ed8", roughness=0.22)
  dsh_mat_heat_blued_titanium(name="Mat_Heat_Blued_Titanium")
  dsh_mat_copper_gold(name, variant="copper", roughness=0.22)  # variant: 'copper' | 'gold' | 'brass'
  dsh_mat_tinted_glass(name, color=(0.12, 0.18, 0.24), roughness=0.04)
  dsh_mat_rubber_tire(name="Mat_Rubber_Tire")
  dsh_mat_emissive_led(name, color, strength=8.0)
  dsh_mat_matte_armor(name, color=(0.24, 0.28, 0.26))

  # Lighting / Studio / Camera / Post / Compute
  dsh_add_light(name, light_type, location, energy, color=(1.0, 1.0, 1.0), size=2.0, target=(0.0, 0.0, 0.8), collection="DSH_Lights")
  dsh_setup_lighting(preset, accent_hex)
  dsh_setup_hero_studio(style="dark_cyclorama", accent_color="#4176e6", scale=1.0)  # pass scale=0.1 for ~15cm product photography, scale=1.0 for 2-5m vehicles
  dsh_setup_camera(preset, frame_start, frame_end, target=(0.0, 0.0, 0.85), distance_scale=1.0)
  dsh_add_dof(cam, target_obj, fstop=4.0)
  dsh_setup_compositor(glare=True, glare_threshold=1.15)
  dsh_render_clay_override(enable=True, color=(0.76, 0.77, 0.79, 1.0))
  dsh_configure_cycles_device(scene, mode="auto")  # respects host auto GPU->CPU crash fallback when DSH_PROJECT["computeDevice"]=="cpu"
  ```
- **Cycles GPU Crash Auto-Fallback**: When `computeDevice` is `'auto'`, `dsh-blender-studio` automatically retries once on Cycles CPU if a GPU driver/OPTIX/CUDA crash (`Illegal address in CUDA queue`) occurs, so you do not need to hardcode `mode='cpu'` inside custom scripts.
- In `dsh-blender-studio` runner scripts, `customScript` accepts up to `256 KB` of pure `bpy` Python code (`NodeSocket` attributes like `socket.default_value` are safely allowed by `checkScriptSafety`). Uploaded project assets live in the injected `DSH_ASSETS_DIR` / `ASSETS_DIR` (and are cataloged in `DSH_ASSETS` by role: HDRIs auto-wire into World `ShaderNodeTexEnvironment`, 3D models auto-import onto the hero pedestal, and uploaded images stay accessible by filename). Always resolve paths with `os.path.join(ASSETS_DIR, filename)` and check `os.path.isfile(...)` before calling `bpy.data.images.load(...)`.
- Never call `bpy.ops.wm.redraw_timer()` or access `bpy.context.space_data` / `bpy.context.region_3d` without guarding `if not bpy.app.background:` — those objects are `None` in headless mode.
- Keep `print()` logs concise and structured (the runner keeps a rolling 80-line ring buffer); avoid printing per-vertex loops.
