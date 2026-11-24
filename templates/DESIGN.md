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
  - **3D Studio (Default)**: Resizable split pane (`useResizableSplit` / `DshSplitResizer`) pairing the interactive Canvas 3D viewport + **1-Click Production Pipeline (`Draft` / `Studio` / `Beauty Cycles`)** bar on the left with a tactile parameter rail (Quality Presets), a live **`QC-3D` Grade Badge & Checklist** at the top of Scene Outliner, and a **`bpy` Script Inspector** featuring **`DSH_KIT` Quick-Insert Chips** (`Car Paint`, `Carbon Fiber`, `Brushed Metal`, `Tinted Glass`, `Radial Array`, `Hero Studio`, `Compositor Glare`) and **Script Checkpoints (`Save` / `Restore`)** on the right.
  - **Form Mode**: Linear structured form for quick keyboard-first editing of all 18 project fields, optimistic revision tracking, and custom script editing (up to `256 KB`).
- **Zero-Dependency Interactive Canvas 3D Viewport**:
  - **Interactive 3D Stage**: Pure HTML5 2D Canvas perspective/orthographic projection rendering a metric ground grid, 3-axis gizmo, distinct geometric proxies for all 8 templates (`product-studio`, `logo-3d`, `isometric-room`, `motion-data`, `grease-pencil-2d`, `blank-stage`, `architectural-pavilion`, `procedural-abstract`), 3-point light position markers, and camera frustum overlay. Supports pointer orbit drag, scroll zoom, quick angle buttons (`3/4`, `Front`, `Iso`, `Top`), keyboard shortcuts (`Space` turntable, `1–4` monitor tabs, `R` reset camera, `Ctrl/Cmd+S` save), and turntable animation preview (paused by default to respect WCAG 2.2.2).
  - **Artifact Inspection Mode**: Seamlessly toggles in-place to display the latest rendered Still PNG, 2×2 4-View QC Contact Sheet, or MP4 Animation player, clearly displaying a **Stale Revision** banner whenever `artifact.revision < project.revision`, plus a live elapsed timer (`MM:SS`) during active jobs.
- **Library, Duplicate & Drag-and-Drop Assets**:
  - Active project cards expose `Open` / `Duplicate` / `Archive`; non-clickable archive cards and asset/artifact rows carry `data-always-visible="true"` on `.dsh-row-actions` so controls stay visible without hover.
  - Assets panel provides an interactive Drag-and-Drop Dropzone explaining automatic HDRI world lighting and automatic 3D model pedestal placement.

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
