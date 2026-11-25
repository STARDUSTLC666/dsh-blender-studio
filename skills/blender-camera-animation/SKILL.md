---
name: "blender-camera-animation"
description: "Configure Blender cameras, focal lengths, framing math, depth of field, Track-To rigs, smooth turntable loops, and cross-version keyframe animation in dsh-blender-studio."
---

# Blender Camera Composition & Keyframe Animation (3.6 – 5.x)

Use this skill when framing scenes, rigging cameras, designing turntable spins, or building keyframe animations in `dsh-blender-studio`.

## 1. Focal Length & Aspect Ratio Framing

`dsh-blender-studio` maps project `aspect` values to base resolutions scaled by `resolutionScale` (`50%`, `100%`, `150%`, `200%`):
- `landscape`: `1280 × 720` (16:9) — product showcases, architecture, motion graphics
- `portrait`: `720 × 1280` (9:16) — vertical reels, tall bottle/phone heroes
- `square`: `1024 × 1024` (1:1) — social thumbnails, isometric dioramas, 3D icons

Choose focal length deliberately (36mm full-frame sensor width default):
- **28–35 mm**: Wide architectural interiors, dramatic low-angle monuments.
- **50 mm**: Natural perspective for props, rooms, and balanced scenes.
- **85–105 mm**: Hero product photography and 3D logos — compresses perspective distortion so verticals stay clean and proportions feel premium.
- **Orthographic (`cam.data.type = 'ORTHO'`)**: True isometric rooms (`isometric-room`) and 2D Grease Pencil canvases (`grease-pencil-2d`), sized via `cam.data.ortho_scale`.

### Automatic Bounding-Sphere Framing Formula
Never guess camera coordinates blindly. Compute exact camera distance from hero bounding radius `R` so the hero occupies ~65–75% of the frame without clipping:

```python
import math
from mathutils import Vector

def frame_camera_to_target(cam_obj, target_center: Vector, radius: float, azimuth_deg: float, elevation_deg: float, padding: float = 1.35):
    cam_data = cam_obj.data
    if cam_data.type == 'ORTHO':
        cam_data.ortho_scale = max(0.5, radius * 2.35 * padding)
        dist = max(4.0, radius * 5.0)
    else:
        fov = min(cam_data.angle_x, cam_data.angle_y)
        dist = (radius / max(0.1, math.sin(fov * 0.5))) * padding

    az = math.radians(azimuth_deg)
    el = math.radians(elevation_deg)
    offset = Vector((
        dist * math.cos(el) * math.sin(az),
        -dist * math.cos(el) * math.cos(az),
        dist * math.sin(el),
    ))
    cam_obj.location = target_center + offset
    direction = target_center - cam_obj.location
    cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
```

## 2. Canonical `dsh-blender-studio` Camera Presets

| Preset (`cameraPreset`) | Lens / Projection | Azimuth / Elevation | Best Use |
| :--- | :--- | :--- | :--- |
| `three_quarter` | `55–85 mm` Persp | `-35°` / `+22°` | Default hero angle showing front + side depth |
| `front` | `65 mm` Persp | `0°` / `+8°` | Logos, UI panels, symmetrical facades |
| `isometric` | `ORTHO` | `-45°` / `+35.264°` (`atan(1/√2)`) | Cutaway rooms, diagrams, miniature worlds |
| `top` | `50 mm` or `ORTHO` | `0°` / `+88°` | Flat-lays, layout verification, data grids |
| `closeup` | `85–100 mm` Persp | `-28°` / `+14°` (`padding=0.92`) | Macro texture, bevels, glass refraction |
| `turntable` | `65 mm` Persp | Orbits `0° → 360°` at `+20°` | 360° product inspection animations |

Always set sensible clip planes (`cam.data.clip_start = 0.05`, `cam.data.clip_end = 500.0`) so close-ups don't clip the front face and wide backdrops don't disappear.

### Live Lookdev Camera Overrides & Single-Launch Multi-Shot Packs (`v0.4.0`)
- **Live Lookdev Overrides (`DSH_OVERRIDES`)**: Set `lensMm` (`18–135 mm`, default `50` keeps a template/exemplar's native focal length) and `exposure` (`-3..+3 EV`) on project fields via `blender_project(action: 'update')` to tweak compression and brightness without editing code.
- **Single-Launch Multi-Shot Batch (`blender_render` `action: 'render_shots'`)**: Builds the scene **once** in a single Blender launch and renders calibrated editorial presets (`BLENDER_SHOT_PRESETS`):
  - `hero_3q` (Hero 3/4 editorial framing)
  - `low_dramatic` (Wide-angle hero low-angle shot, `35 mm` drama)
  - `macro_dof` (Telephoto close-up detail with automatic `dsh_add_dof` shallow focus)
  - `side_profile` (Clean orthographic-style telephoto profile elevation)
  - `top_plan` (Top-down architectural/engineering plan view)
- **Live Bridge v2 Camera Direct Control**: When connected to an open Blender GUI, adjust the active camera live with Undo support using `blender_bridge(action: 'set_camera', location?, target?, lensMm?, dofFstop?)`.

## 3. Target Rig & Subtle Depth of Field

Use an Empty (`CTL_Cam_Target`) + `TRACK_TO` constraint so moving or orbiting the camera always stays locked onto the subject:

```python
target = bpy.data.objects.new("CTL_Cam_Target", None)
target.location = hero_center
cam_col.objects.link(target)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

# Subtle physical depth of field (avoid extreme shallow blur that softens hero edges)
cam_obj.data.dof.use_dof = True
cam_obj.data.dof.focus_object = target
cam_obj.data.dof.aperture_fstop = 5.6  # 2.8–4.0 for closeups, 5.6–8.0 for full products
```

## 4. Seamless Turntable & Keyframe Animation

### Seamless 360° Turntable Loop (Zero Stutter Rule)
To loop smoothly without pausing for two identical frames at the seam, keyframe `0°` at `frame_start` and `360°` at **`frame_end + 1`** with `LINEAR` interpolation:

```python
rig = bpy.data.objects.new("CTL_Turntable_Rig", None)
rig.location = hero_center
cam_col.objects.link(rig)
cam_obj.parent = rig

rig.rotation_euler = (0.0, 0.0, 0.0)
rig.keyframe_insert(data_path="rotation_euler", index=2, frame=scene.frame_start)
rig.rotation_euler = (0.0, 0.0, math.tau)
rig.keyframe_insert(data_path="rotation_euler", index=2, frame=scene.frame_end + 1)
```

### Cross-Version F-Curve Interpolation Helper (Blender 3.6 – 5.x)
Blender 4.4 / 5.0 introduced Slotted Actions (`action.layers` -> `strips` -> `channelbag(slot).fcurves`), whereas Blender 3.6–4.3 expose `action.fcurves` directly. Use this helper so interpolation changes work across every version:

```python
def iter_action_fcurves(obj):
    ad = obj.animation_data
    if not ad or not ad.action:
        return []
    action = ad.action
    if hasattr(action, 'fcurves') and len(action.fcurves) > 0:
        return list(action.fcurves)
    curves = []
    if hasattr(action, 'layers'):
        slot = getattr(ad, 'action_slot', None)
        for layer in action.layers:
            for strip in layer.strips:
                if hasattr(strip, 'channelbag') and slot is not None:
                    bag = strip.channelbag(slot)
                    if bag is not None:
                        curves.extend(bag.fcurves)
                elif hasattr(strip, 'channelbags'):
                    for bag in strip.channelbags:
                        curves.extend(bag.fcurves)
    return curves

def set_fcurve_interpolation(obj, mode: str = 'LINEAR'):
    for fc in iter_action_fcurves(obj):
        for kp in fc.keyframe_points:
            kp.interpolation = mode  # 'LINEAR', 'BEZIER', 'CUBIC', 'BACK', 'EXPO'
```

### Motion Choreography Best Practices
- **Turntable spins**: `LINEAR` interpolation, `72–120` frames at `24` or `30` FPS (3–5 seconds per full revolution).
- **Hero reveal / pop-in**: `BEZIER` with `AUTO_CLAMPED` handles (or `CUBIC` / `EXPO` ease-out) over `18–30` frames, followed by a subtle slow drift (`2–5°` camera push) so the shot feels alive.
- **Data bars (`motion-data`)**: Stagger each bar's start frame by `2–4` frames (`frame_start + idx * 3`) so columns rise in a crisp wave rather than all popping together.
- **Frame budgets in `dsh-blender-studio`**: `fps` supports `24 | 30 | 60`, and `frameEnd` must stay within `frameStart + 600`. Keep test renders short (`24–60` frames at `50%` resolutionScale) before committing to a full-HD `100%` animation render.
