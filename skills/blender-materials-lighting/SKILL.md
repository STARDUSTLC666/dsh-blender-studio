---
name: "blender-materials-lighting"
description: "Build physically based Principled BSDF materials, 3-point/HDRI/stylized lighting rigs, cyclorama stages, and AgX/Filmic color management in Blender 3.6–5.x."
---

# Blender Materials, Lighting & Lookdev (3.6 – 5.x)

Use this skill when designing shaders, studio lighting rigs, HDRI environments, backdrop stages, and color management in `dsh-blender-studio`.

## 1. Physically Plausible PBR Guardrails

Bad 3D renders usually stem from extreme values rather than low polygon counts:
- **Never use pure black (`0.0`) or pure white (`1.0`) albedo**: Keep dark dielectrics at `0.03 – 0.06` linear (charcoal/rubber) and bright matte whites at `0.72 – 0.82` linear so highlights keep tonal separation under `AgX`.
- **Metallic is binary**: `0.0` for dielectrics (plastic, ceramic, wood, paint, glass), `1.0` for bare metals (aluminum, brass, chrome). Intermediate values (`0.3–0.7`) look muddy unless masking dust/rust.
- **Dielectric IOR**: `1.45` (plastics/rubber), `1.50 – 1.52` (glass/ceramic glaze), `1.333` (water).
- **Never leave roughness uniform on hero surfaces**: Break up `Roughness` with subtle procedural `ShaderNodeTexNoise` mapped into a narrow band (e.g., `0.18 – 0.28`) plus a micro `ShaderNodeBump` (`Strength <= 0.06`, `Distance <= 0.002`).

## 2. Principled BSDF Cross-Version Material Recipes

Always use a socket helper (`set_socket(bsdf, val, "New Name", "Old Name")`) so Blender 3.6 and 4.0–5.x both succeed.

### 2.1 `clay_matte` (Architectural / Product Clay)
- `Base Color`: Warm neutral `(0.76, 0.73, 0.69, 1.0)` or tinted accent
- `Metallic`: `0.0`
- `Roughness`: `Noise(scale=45, detail=6)` -> `MapRange(0.25..0.75 -> 0.60..0.78)`
- `Specular IOR Level` / `Specular`: `0.35`
- `Subsurface Weight` / `Subsurface`: `0.04` (softens thin edges under strong rim light)
- `Bump`: Fine grain `Strength=0.04`, `Distance=0.0015`

### 2.2 `brushed_metal` (Anodized Aluminum / Steel / Brass)
- `Base Color`: Aluminum `(0.80, 0.82, 0.85, 1.0)`, Titanium `(0.58, 0.56, 0.54, 1.0)`, Brass `(0.85, 0.66, 0.30, 1.0)`
- `Metallic`: `1.0`
- `Texture Coordinate (Object)` -> `Mapping(scale=(1.0, 24.0, 1.0))` -> `Noise(scale=18, detail=8, roughness=0.6)` -> `MapRange` -> `Roughness` (`0.16 – 0.32`) and `Bump` (`Strength=0.035`, `Distance=0.0008`)
- `Anisotropic`: `0.55` (Cycles)

### 2.3 `frosted_glass` (Translucent Acrylic / Satin Glass)
- `Base Color`: Subtle tint `(0.93, 0.97, 1.0, 1.0)`
- `Metallic`: `0.0`, `IOR`: `1.49`
- `Transmission Weight` / `Transmission`: `0.94`
- `Roughness`: `0.14 – 0.22` (satin frost) or `0.02` (crystal clear)
- `Coat Weight` / `Clearcoat`: `0.35`, `Coat Roughness` / `Clearcoat Roughness`: `0.04`
- **EEVEE compatibility**:
  - Blender 4.2+: `mat.surface_render_method = 'DITHERED'` and `scene.eevee.use_raytracing = True`.
  - Blender 3.6–4.1: `mat.use_screen_refraction = True` and `scene.eevee.use_ssr_refraction = True`.
- **Cycles shadow optimization**: Mix `Principled BSDF` with `ShaderNodeBsdfTransparent` driven by `ShaderNodeLightPath.outputs['Is Shadow Ray']` so glass doesn't cast noisy opaque black shadows without caustics.

### 2.4 `ceramic_gloss` (Glazed Porcelain / Lacquer)
- `Base Color`: Rich pigment or accent color
- `Metallic`: `0.0`, `IOR`: `1.52`
- `Roughness`: `0.14`
- `Coat Weight` / `Clearcoat`: `0.85`
- `Coat Roughness` / `Clearcoat Roughness`: `0.04`
- Subtle low-frequency orange-peel `Noise(scale=12)` -> `Bump(Strength=0.015, Distance=0.001)` plugged into `Coat Normal` (4.0+) or `Normal`.

### 2.5 `toon_cel` (Stylized NPR / 2.5D Cel Shading)
- **EEVEE**: `ShaderNodeBsdfDiffuse` -> `ShaderNodeShaderToRGB` -> `ShaderNodeValToRGB` (`color_ramp.interpolation = 'CONSTANT'`, stops at `0.0` shadow tint, `0.38` midtone, `0.78` highlight) -> `ShaderNodeEmission` (strength `1.0`) -> `Material Output`.
- **Cycles-safe NPR** (since `ShaderToRGB` is EEVEE-only): Use `ShaderNodeLayerWeight` (`Facing` / `Fresnel`) + stylized low-roughness `Principled BSDF` or `Diffuse` with flat lighting.
- **Ink Outline**: Add a `SOLIDIFY` modifier (`thickness=-0.012`, `use_flip_normals=True`, `material_offset=1`) with a dark `Emission` material where `mat.use_backface_culling = True`.

## 3. Studio Lighting Formulas (Scaled to Subject Radius `R`)

Always compute light distance, size, and energy from the hero bounding radius `R` and center `C` so lighting looks identical on a 0.2m watch or a 3m sculpture.

### 3.1 `studio_3point` (Default Commercial Product Rig)
- **Key Light (`LGT_Key`)**: `AREA` (`shape='RECTANGLE'`), placed at azimuth `-38°` (camera-left), elevation `+36°`, distance `4.5 * R`, size `(1.6 * R, 1.2 * R)`, color warm daylight `(1.0, 0.96, 0.90)` (~5400K), energy `180 * R²` W.
- **Fill Light (`LGT_Fill`)**: `AREA` (`shape='RECTANGLE'`), azimuth `+52°` (camera-right), elevation `+20°`, distance `5.5 * R`, size `(2.8 * R, 2.0 * R)`, cool sky tint `(0.86, 0.93, 1.0)` (~7200K), energy `55 * R²` W (~30% of key).
- **Rim / Back Light (`LGT_Rim`)**: `AREA` (`shape='RECTANGLE'`), azimuth `+155°` (behind subject), elevation `+42°`, distance `4.0 * R`, size `(1.8 * R, 0.7 * R)`, narrow `spread = math.radians(65)` (prevents spilling onto the backdrop), slight accent tint, energy `140 * R²` W.

Aim every light cleanly at `C` using a `TRACK_TO` constraint (`track_axis='TRACK_NEGATIVE_Z'`, `up_axis='UP_Y'`) or direct quaternion (`(C - light.location).to_track_quat('-Z', 'Y')`).

### 3.2 Alternate Built-In Lighting Presets
- **`soft_daylight`**: `SUN` (`energy=3.2`, `angle=math.radians(3.0)`, elevation `34°`, azimuth `-45°`) + sky world gradient/Nishita + large low-energy warm ground bounce card.
- **`dramatic_rim`**: Low ambient world (`strength=0.05`), tight `SPOT` or narrow-spread (`45°`) high-contrast key light, strong colored rim separating silhouette from dark slate backdrop.
- **`neon_cyber`**: Dual opposing magenta/cyan `AREA` strip lights (`size_x=0.35*R, size_y=2.2*R`) flanking the hero, low glossy floor (`Roughness=0.18`) to catch crisp neon reflections.
- **`clay_overcast`**: Overhead softbox (`size=4.0*R`, elevation `75°`) + uniform neutral world (`strength=0.45`) for clean silhouette and topology inspection.

## 4. HDRI World Setup & Clean Backdrop Separation

When an `.hdr` or `.exr` asset is uploaded or imported via `blender_assets` (`import_polyhaven`):

```python
def setup_hdri_world(scene, hdri_path: str, strength: float = 1.0, rotation_z_deg: float = 0.0, bg_color=(0.08, 0.09, 0.11, 1.0)):
    world = scene.world or bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()

    tex_coord = nt.nodes.new('ShaderNodeTexCoord')
    mapping = nt.nodes.new('ShaderNodeMapping')
    mapping.inputs['Rotation'].default_value[2] = math.radians(rotation_z_deg)

    env = nt.nodes.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(hdri_path, check_existing=True)

    bg_light = nt.nodes.new('ShaderNodeBackground')
    bg_light.inputs['Strength'].default_value = strength

    bg_cam = nt.nodes.new('ShaderNodeBackground')
    bg_cam.inputs['Color'].default_value = bg_color
    bg_cam.inputs['Strength'].default_value = 1.0

    lp = nt.nodes.new('ShaderNodeLightPath')
    mix = nt.nodes.new('ShaderNodeMixShader')
    out = nt.nodes.new('ShaderNodeOutputWorld')

    nt.links.new(tex_coord.outputs['Generated'], mapping.inputs['Vector'])
    nt.links.new(mapping.outputs['Vector'], env.inputs['Vector'])
    nt.links.new(env.outputs['Color'], bg_light.inputs['Color'])
    nt.links.new(lp.outputs['Is Camera Ray'], mix.inputs['Fac'])
    nt.links.new(bg_light.outputs['Background'], mix.inputs[1])
    nt.links.new(bg_cam.outputs['Background'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
```

Using `LightPath -> Is Camera Ray` lets the HDRI drive rich realistic reflections and global illumination while presenting a clean studio backdrop (or alpha transparency when `scene.render.film_transparent = True`).

## 5. Seamless Studio Cyclorama & Color Management

- **Cyclorama backdrop**: Build an L-profile mesh (`floor -> quarter-circle curve of radius 1.5*R -> vertical back wall`) extruded along `X` (`width >= 10*R`), shaded smooth with matte roughness `0.85`. This removes distracting horizon seams.
- **Color management**:
  - Prefer `AgX` (`AgX - Medium High Contrast` or `AgX - Punchy`) on Blender 4.0–5.x for natural highlight desaturation without neon clipping.
  - Fall back to `Filmic` (`Medium High Contrast`) on Blender 3.6.
  - Keep `display_device = 'sRGB'`, `gamma = 1.0`, and adjust brightness via light energy or small `exposure` tweaks (`-0.5` to `+0.5`).
