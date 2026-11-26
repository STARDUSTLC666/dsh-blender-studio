# OP-DSH 3D Studio Workbench Design Spec (`dsh-blender-studio`)

This note defines the visual identity, interaction model, and guardrails for the `dsh-blender-studio` 3D Studio workbench (`templates/client.js`, `templates/workbench-ui.js`, and `templates/panels/`), aligned with DeepSeek Harness (`>=0.2.2-rc.3`) Unified Workbench UI & Motion Spec v3.

## 1. Visual Philosophy: Bright Instrument, Recessed Optical Viewport

- **Airy Daylight Default**: The workbench shell defaults to `[data-dsh-style="harness"]` and `[data-dsh-font="arcade"]` (YouYuan Mono), keeping chrome, inspector rails, and project cards crisp and breathable. Under host dark mode (`body[data-ds-dark-theme]`), surfaces soften to breathable slate (`#1f232b` / `#272c36` / `#2f3542`) rather than pitch black.
- **13 Themes × 8 Dual-Layer Fonts**: Full cross-plugin style and typography sync via `localStorage['dsh-stardust:ui-style']` (`dsh-stardust-style`) and `localStorage['dsh-stardust:ui-font']` (`dsh-stardust-font`), including portaled `Modal` / `Menu` synchronization (`HostModalWithStyle` / `HostMenuWithStyle`).
- **Tactile Hardware Accent**: Inspired by studio camera monitors and Blender's orange-and-cobalt identity:
  - Studio Amber / Render Accent: `#EA7600` (primary action cues, turntable playhead, Z-axis/hero accent)
  - Optical Cobalt: `#2D6CB5` / `#3B82F6` (camera gizmos, active mode badges, focus rings)
  - Axis Reticle Triad: `X` `#EF4444` · `Y` `#10B981` · `Z` `#3B82F6`
  - Recessed Viewport Canvas: calibrated dark studio slate (`#1A2130` → `#131824`) framed inside a light/themed bezel so lit 3D wireframes, rendered PNGs, 2×2 QC contact sheets, and MP4 previews maintain accurate tonal contrast without making the entire page feel heavy.

## 2. Dual-Mode Studio Layout

- **Unified 48px Single-Row Header (`.dsh-header`)**: Brand icon (`cube`) + `OP-DSH · BLENDER` title + execution track pill (`CLI 离线渲染` / `Live Bridge 已连接`) + sliding-indicator tabs (`Library`, `Studio`, `Assets & Exports`, `Bridge & Env`) + `? Tour` 4-step interactive spotlight guide + compact `StyleSwitcher` / `FontSwitcher`.
- **1-Click Mode Switch (`3D Studio` ↔ `Form`)**:
  - **3D Studio (Default)**: Resizable split pane (`useResizableSplit` / `DshSplitResizer`) pairing the interactive Canvas 3D viewport + **1-Click Production Pipeline (`Draft` / `Studio` / `Beauty Cycles`)** bar on the left with a tactile parameter rail (Quality Presets), a live **`QC-3D` Grade Badge & Checklist** at the top of Scene Outliner, and a **`bpy` Script Inspector** featuring **`DSH_KIT` v2 Quick-Insert Chips** (`Car Paint`, `Carbon Fiber`, `Brushed Metal`, `Tinted Glass`, `Radial Array`, `Hero Studio`, `Compositor Glare`, plus v2 `Lofted Hull`, `Bolt Ring`, `Wheel Assembly`, `Heat-Blued Ti`, `Anodized Al`, `Clay Override`) and **Script Checkpoints (`Save` / `Restore`)** on the right.
  - **Form Mode**: Linear structured form for quick keyboard-first editing of all project fields (including Live Lookdev `lensMm`, `exposure`, and `clayMode`), optimistic revision tracking, and custom script editing (up to `256 KB`).
- **Zero-Dependency Interactive Canvas 3D Viewport (v0.5.1 Multi-Mode Monitor)**:
  - **Interactive 3D Stage**: Pure HTML5 2D Canvas perspective/orthographic projection rendering a metric ground grid, 3-axis gizmo, distinct geometric proxies for all 8 templates (`product-studio`, `logo-3d`, `isometric-room`, `motion-data`, `grease-pencil-2d`, `blank-stage`, `architectural-pavilion`, `procedural-abstract`), 3-point light position markers, live `lensMm` (18–135 mm) / `exposure` (-3..+3 EV) / `clayMode` response, `ResizeObserver` redraw, and camera frustum overlay. Supports pointer orbit drag, scroll zoom, quick angle buttons (`3/4`, `Front`, `Iso`, `Top`), keyboard shortcuts (`Space` turntable, `1–6` monitor tabs, `R` reset camera, `Ctrl/Cmd+S` save), and turntable animation preview (paused by default to respect WCAG 2.2.2).
  - **Zero-Dependency Interactive PBR GLB 3D Mesh Viewer v3 (`3D 网格`)**: Pure-JS binary `.glb` parser + **3-Light Studio PBR software rasterizer** inside Canvas 2D — supports glTF metallic/roughness specular lobes, emissive glow, translucent `alphaMode: "BLEND"` / `KHR_materials_transmission` / sapphire-crystal layered rendering, divergence-theorem closed-solid backface culling + oversized cap subdivision, cofactor (inverse-transpose) normals, `TRIANGLE_STRIP` & `TRIANGLE_FAN`, material-boundary-preserving decimation, 4 shading modes (**`Shaded` / `Shaded + Wire` / `Clay` / `Wireframe`**), **Shift+Drag / Right-Click Pan**, **Double-Click Reset**, **1-click Snapshot PNG**, auto-focus on GLB export, and previewing both exported `.glb` artifacts and uploaded `.glb` assets with zero Three.js/WebGL bundle bloat.
  - **Multi-Shot Batch Renderer & Interactive Shot Filmstrip (`多机位分镜`)**: Triggers single-launch multi-camera batch renders (`hero_3q`, `low_dramatic`, `macro_dof`, `top_plan`) and displays clickable shot thumbnails beneath the monitor with a 1-click **Compare** handoff straight into A/B Compare plus direct Shot/GLB inspect jumps from Assets & Exports.
  - **A/B Render Compare Split-Wipe (`A/B 对比`)**: Accepts `still`, `contact_sheet`, and `shot` image artifacts inside an aspect-matched viewport, overlaying Left (A) and Right (B) renders with a pointer-draggable (`setPointerCapture`) and keyboard-accessible (`role="slider"`, `ArrowLeft`/`ArrowRight`) vertical wipe bar plus A/B artifact selectors.
  - **Live Lookdev Inspector & Artifact Inspection**: Compact **Lens (`18–135 mm`)**, **Exposure (`-3..+3 EV`)**, **Clay Mode**, and live **`accentColor`** controls repaint templates and all 5 Pro Exemplars without editing code; Artifact view displays a **Stale Revision** banner whenever `artifact.revision < project.revision`, plus a live elapsed timer (`MM:SS`).
- **Library, 5 Pro Exemplars, Duplicate, Drag-Drop Assets & Bridge (`0.5.1`) Direct Controls**:
  - Project Library includes a compact **Pro Exemplars (`高阶工程范本`)** strip featuring all **5** built-in `QC-3D 100/A` engineering masterpieces (`AERO-X900 Turbofan`, `APEX-09 Racecar`, `VANGUARD H-145X Helicopter`, `KUKA 6-Axis Robot Arm`, `Mechanical Tourbillon Chronograph`) with 1-click **Use Exemplar** creation.
  - Active project cards expose `Open` / `Duplicate` / `Archive`; non-clickable archive cards and asset/artifact rows carry `data-always-visible="true"` on `.dsh-row-actions` so controls stay visible without hover.
  - Assets panel provides an interactive Drag-and-Drop Dropzone explaining automatic HDRI world lighting and automatic 3D model pedestal placement, plus a **Shots** filter pill and direct **Inspect** / **Inspect 3D** jumps into Studio.
  - Bridge & Env panel surfaces a 1-click **Install Add-on to Blender** confirmation modal, **Live Direct Controls** (zero-code real-time camera focal length `bridge_set_camera`, deep linked-node material repaint + Metallic slider `bridge_set_material`, and Quaternion-safe 3-axis Live Object Transform `X/Y/Z + Rot X/Y/Z` `bridge_transform_object` with blank-coordinate guard), live **Cycles GPU Backend & Device badge**, and a 3-button **`Cycles Compute Device` (`Auto` / `GPU` / `CPU`)** selector.

## 3. Responsive, Accessibility & Update Guardrails

- **Responsive Breakpoint**: Containers narrower than `760px` automatically stack the split pane vertically with full-width controls and wrapped header actions.
- **Motion & Contrast**: Honors `@media (prefers-reduced-motion: reduce)` and `forced-colors`; animations stay within `120–180ms` ease-out micro-transitions.
- **Lazy Host Primitives**: Never eagerly `require('@deepseek-ai/dsh-client-ui-primitives')` at module evaluation time; resolve lazily on render with semantic standalone fallbacks.
- **Update Footer Contract**: Integrate `@stardustlc/dsh-updates` (`__stardustUpdatesGuard` + `[data-plugin-update-footer="dsh-blender-studio"]`), blocking hot-updates while jobs are active or unsaved drafts exist.

## 4. What NOT to Do

- Do not bundle Three.js, WebGL shaders, or external CDN fonts into `lib/client.js` — keep the client self-contained, fast-loading, and jsdom-testable.
- Do not auto-play turntable animation or auto-download Poly Haven assets on mount.
- Do not silently overwrite concurrent project edits; always surface `409 CONFLICT` with explicit reload vs keep-draft choices.
- Do not mistake the interactive Canvas 3D wireframe stage for a physically rendered Cycles/EEVEE frame — always verify actual output via `contact_sheet` or `preview_still`.
