---
name: "blender-rendering-export"
description: "Configure EEVEE Next, Cycles, Workbench, denoising, transparent PNGs, FFmpeg MP4 video, and clean GLB/FBX/OBJ/STL/.blend exports across Blender 3.6–5.x."
---

# Blender Rendering & Multi-Format Export (3.6 – 5.x)

Use this skill when optimizing render quality/speed, setting up video encoding, or exporting production 3D assets via `blender_render` (`preview_still`, `contact_sheet`, `render_animation`, `export_model`).

## 1. Engine Selection & Quality/Speed Matrix

| Engine (`engine`) | Best Use | Recommended Samples | Notes |
| :--- | :--- | :--- | :--- |
| `EEVEE` | Fast lookdev, motion graphics, stylized/toon, animations, contact sheets | `16–32` (QC) / `48–64` (final) | Resolves to `BLENDER_EEVEE_NEXT` on 4.2–4.5 and `BLENDER_EEVEE` on 3.6–4.1 / dynamically checked on 5.x |
| `CYCLES` | Photoreal glass/metal/SSS, accurate soft shadows & GI, hero stills | `32–48` (QC) / `96–256` (final) | Always enable `use_adaptive_sampling = True` + OpenImageDenoise |
| `WORKBENCH` | Ultra-fast clay silhouettes, wireframe/topology audits, quick timing tests | `8–16` | Zero shader overhead; great for testing animation curves in seconds |

### Headless Cycles Performance & Firefly Suppression

```python
def configure_cycles(scene, samples: int = 64):
    scene.render.engine = 'CYCLES'
    c = scene.cycles
    c.device = 'CPU'  # Safe baseline in headless CI; switch to GPU only if validated
    c.samples = samples
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.02
    c.use_denoising = True
    if hasattr(c, 'denoiser'):
        denoisers = {i.identifier for i in c.bl_rna.properties['denoiser'].enum_items}
        if 'OPENIMAGEDENOISE' in denoisers:
            c.denoiser = 'OPENIMAGEDENOISE'
    c.max_bounces = 8
    c.diffuse_bounces = 4
    c.glossy_bounces = 4
    c.transmission_bounces = 8
    c.transparent_max_bounces = 8
    c.sample_clamp_indirect = 10.0  # Eliminates stray bright fireflies
```

### EEVEE Next (4.2+) vs EEVEE (3.6–4.1)

```python
def configure_eevee(scene, samples: int = 32):
    items = {i.identifier for i in scene.render.bl_rna.properties['engine'].enum_items}
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in items else 'BLENDER_EEVEE'
    e = scene.eevee
    if hasattr(e, 'taa_render_samples'):
        e.taa_render_samples = samples
    if hasattr(e, 'use_raytracing'):  # 4.2+ EEVEE Next
        e.use_raytracing = True
    if hasattr(e, 'use_gtao'):  # 3.6–4.1
        e.use_gtao = True
    if hasattr(e, 'use_ssr'):   # 3.6–4.1
        e.use_ssr = True
```

## 2. Transparent Stills & Resolution Rules

- For `transparentBg: true`:
  ```python
  scene.render.film_transparent = True
  scene.render.image_settings.file_format = 'PNG'
  scene.render.image_settings.color_mode = 'RGBA'
  scene.render.image_settings.color_depth = '8'
  ```
- Keep `scene.render.resolution_percentage` aligned with `resolutionScale` (`50`, `100`, `150`, `200`).
- **Even-Dimension Rule for H.264 MP4**: FFmpeg `H264` (`yuv420p`) fails if scaled width or height is odd. Always enforce `width = (width // 2) * 2` and `height = (height // 2) * 2` before rendering video.

## 3. Headless MP4 Animation Encoding

Configure FFmpeg MP4 cleanly for universal browser and DSH workbench playback:

```python
def configure_mp4_output(scene, output_path: str, fps: int = 24):
    r = scene.render
    r.fps = fps
    r.fps_base = 1.0
    r.filepath = output_path
    r.image_settings.file_format = 'FFMPEG'
    r.ffmpeg.format = 'MPEG4'
    r.ffmpeg.codec = 'H264'
    r.ffmpeg.constant_rate_factor = 'MEDIUM'  # 'HIGH' for fine gradients
    r.ffmpeg.ffmpeg_preset = 'GOOD'
    r.ffmpeg.gopsize = fps // 2
    r.ffmpeg.audio_codec = 'NONE'
```

If a custom Linux Blender build lacks FFmpeg support, fall back cleanly to a `PNG` frame sequence (`frame_0001.png`...) rather than crashing silently.

## 4. 3D Model Export Checklists (`export_model`)

Before exporting any 3D mesh format, verify:
1. Modifiers are export-ready (set `export_apply=True` / `use_mesh_modifiers=True`, and add `GeometryNodeRealizeInstances` in Geometry Nodes).
2. Face normals point outward (`bmesh.ops.recalc_face_normals`).
3. Object scale is `(1, 1, 1)` where possible and hero origin sits cleanly at `(0, 0, 0)` on the floor.

### 4.1 GLB / glTF 2.0 (Web, Three.js, `<model-viewer>`, AR)
```python
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',
    export_apply=True,
    export_yup=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
)
```
**Important glTF Shader Rule**: glTF 2.0 maps directly to `Principled BSDF` inputs (`Base Color`, `Metallic`, `Roughness`, `Normal`, `Emission`, `IOR`, `Transmission`, `Coat`). Purely procedural Blender shader chains (`Noise` -> `ColorRamp`) do **not** convert automatically to GLB unless baked into image textures; always keep clean constant PBR fallback values on `Principled BSDF` sockets for portable GLB assets.

### 4.2 FBX (Unity, Unreal Engine, Maya)
```python
bpy.ops.export_scene.fbx(
    filepath=out_path,
    use_mesh_modifiers=True,
    path_mode='COPY',
    embed_textures=True,
    axis_forward='-Z',
    axis_up='Y',
    apply_scale_options='FBX_SCALE_ALL',
)
```

### 4.3 OBJ (Universal Mesh Exchange — Blender 3.6 vs 4.0+)
Blender 4.0 removed the legacy Python `bpy.ops.export_scene.obj` operator in favor of the C++ `bpy.ops.wm.obj_export`:

```python
if hasattr(bpy.ops.wm, 'obj_export'):
    bpy.ops.wm.obj_export(filepath=out_path, export_materials=True, apply_modifiers=True)
else:
    bpy.ops.export_scene.obj(filepath=out_path, use_materials=True, use_mesh_modifiers=True)
```

### 4.4 STL (3D Printing & CAD — Blender 3.6–4.1 vs 4.2+)
Blender 4.2 replaced `bpy.ops.export_mesh.stl` with native C++ `bpy.ops.wm.stl_export`:

```python
if hasattr(bpy.ops.wm, 'stl_export'):
    bpy.ops.wm.stl_export(filepath=out_path, apply_modifiers=True, global_scale=1000.0)  # meters -> mm for slicers
else:
    bpy.ops.export_mesh.stl(filepath=out_path, use_mesh_modifiers=True, global_scale=1000.0)
```
For 3D printing, verify meshes are watertight/manifold (no open non-solidified planes, consistent outward normals, minimum wall thickness >= `1.2 mm`).

### 4.5 Native `.blend` Archive
Pack external textures/HDRIs before saving so the `.blend` file opens self-contained in Blender GUI (`open_gui`):
```python
try:
    bpy.ops.file.pack_all()
except RuntimeError:
    pass
bpy.ops.wm.save_as_mainfile(filepath=out_path, compress=True)
```
