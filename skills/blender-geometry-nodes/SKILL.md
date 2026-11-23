---
name: "blender-geometry-nodes"
description: "Author procedural Geometry Nodes setups via bpy (GeometryNodeTree, interface.new_socket, instancing, scattering, curves, and data-driven layouts) across Blender 3.6–5.x."
---

# Blender Geometry Nodes via `bpy` (3.6 – 5.x)

Use this skill when building procedural arrays, surface scattering, parametric cables/ribbons, data-driven 3D charts, or non-destructive instancing in `dsh-blender-studio`.

## 1. When to Choose Geometry Nodes vs `bmesh`

- **Use Geometry Nodes** for repeatable parametric patterns (grids, radial arrays, foliage/pebble scattering, curve-to-mesh pipes, responsive KPI bar charts, animated per-instance stagger).
- **Use `bmesh`** for one-off bespoke hero silhouettes, exact CAD/chamfered mechanical parts, or custom topology.

## 2. Cross-Version `GeometryNodeTree` Interface Setup (3.6 vs 4.0+)

Blender 4.0 replaced `node_tree.inputs` / `node_tree.outputs` with `node_tree.interface.new_socket(...)`. Always use a version-safe wrapper:

```python
import bpy

def create_geo_nodes_modifier(obj, name: str = "GN_Procedural"):
    mod = obj.modifiers.new(name=name, type='NODES')
    ng = bpy.data.node_groups.new(name=f"{name}_Tree", type='GeometryNodeTree')
    mod.node_group = ng

    if hasattr(ng, 'interface'):  # Blender 4.0 – 5.x
        ng.interface.new_socket(name='Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
        ng.interface.new_socket(name='Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    else:  # Blender 3.6
        ng.inputs.new('NodeSocketGeometry', 'Geometry')
        ng.outputs.new('NodeSocketGeometry', 'Geometry')

    n_in = ng.nodes.new('NodeGroupInput')
    n_out = ng.nodes.new('NodeGroupOutput')
    n_in.location = (-400, 0)
    n_out.location = (600, 0)
    return mod, ng, n_in, n_out

def add_gn_input(ng, name: str, socket_type: str, default=None, min_value=None, max_value=None):
    if hasattr(ng, 'interface'):
        sock = ng.interface.new_socket(name=name, in_out='INPUT', socket_type=socket_type)
    else:
        sock = ng.inputs.new(socket_type, name)
    if default is not None and hasattr(sock, 'default_value'):
        sock.default_value = default
    if min_value is not None and hasattr(sock, 'min_value'):
        sock.min_value = min_value
    if max_value is not None and hasattr(sock, 'max_value'):
        sock.max_value = max_value
    return sock
```

To drive an exposed Geometry Nodes input from Python (or animate it), reference the socket identifier on the modifier:

```python
count_sock = add_gn_input(ng, "Count", "NodeSocketInt", default=12, min_value=1, max_value=200)
mod[count_sock.identifier] = 16
obj.update_tag()
```

## 3. Core Procedural Patterns

### 3.1 Radial / Grid Instancing with Material Assignment
Always assign materials inside the node tree via `GeometryNodeSetMaterial` — primitives generated inside Geometry Nodes do **not** automatically inherit the host object's material slot.

```python
def build_radial_pillars(obj, mat, count: int = 12, radius: float = 1.6):
    mod, ng, n_in, n_out = create_geo_nodes_modifier(obj, "GN_RadialPillars")
    nodes, links = ng.nodes, ng.links

    circle = nodes.new('GeometryNodeCurvePrimitiveCircle')
    circle.inputs['Resolution'].default_value = count
    circle.inputs['Radius'].default_value = radius

    cyl = nodes.new('GeometryNodeMeshCylinder')
    cyl.inputs['Vertices'].default_value = 24
    cyl.inputs['Radius'].default_value = 0.08
    cyl.inputs['Depth'].default_value = 0.9

    inst = nodes.new('GeometryNodeInstanceOnPoints')
    realize = nodes.new('GeometryNodeRealizeInstances')
    smooth = nodes.new('GeometryNodeSetShadeSmooth')
    smooth.inputs['Shade Smooth'].default_value = True

    set_mat = nodes.new('GeometryNodeSetMaterial')
    set_mat.inputs['Material'].default_value = mat

    links.new(circle.outputs['Curve'], inst.inputs['Points'])
    links.new(cyl.outputs['Mesh'], inst.inputs['Instance'])
    links.new(inst.outputs['Instances'], realize.inputs['Geometry'])
    links.new(realize.outputs['Geometry'], smooth.inputs['Geometry'])
    links.new(smooth.outputs['Geometry'], set_mat.inputs['Geometry'])
    links.new(set_mat.outputs['Geometry'], n_out.inputs['Geometry'])
    return mod
```

### 3.2 Surface Scattering (Poisson Disk + Normal Alignment)
Use `GeometryNodeDistributePointsOnFaces` with `distribute_method = 'POISSON'` so scattered pebbles, trees, or props never overlap:
- Connect `Points` -> `GeometryNodeInstanceOnPoints.inputs['Points']`.
- Align instances to face normals with a version guard:
  - Blender 4.2+: `FunctionNodeAlignRotationToVector` (`axis='Z'`, connect `Normal` -> `Vector`, output `Rotation` -> `InstanceOnPoints.inputs['Rotation']`).
  - Blender 3.6–4.1: `FunctionNodeAlignEulerToVector` (`axis='Z'`, connect `Normal` -> `Vector`, output `Rotation` -> `InstanceOnPoints.inputs['Rotation']`).
- Drive organic scale variation with `FunctionNodeRandomValue` (`data_type='FLOAT'`, `Min=0.75`, `Max=1.35`, fixed `Seed`) -> `CombineXYZ` -> `Scale`.

### 3.3 Parametric Curves to Beveled Tubes / Motion Ribbons
1. Create a spline (`GeometryNodeCurvePrimitiveBezierSegment`, `QuadraticBezier`, or host `CURVE` object from `Group Input`).
2. Insert `GeometryNodeResampleCurve` (`mode='LENGTH'` or `'COUNT'`) for even segment spacing.
3. Optional: Modulate radius along curve with `GeometryNodeSplineParameter` (`Factor`) -> `ShaderNodeFloatCurve` -> `GeometryNodeSetCurveRadius`.
4. Sweep with `GeometryNodeCurveToMesh` (`fill_caps=True`) using `GeometryNodeCurvePrimitiveCircle` (tubes) or `GeometryNodeCurvePrimitiveQuadrilateral` (ribbons) as `Profile Curve`.
5. Finish with `GeometryNodeSetShadeSmooth` + `GeometryNodeSetMaterial`.

### 3.4 Data-Driven 3D Visualization (`motion-data` Pattern)
Drive bars/columns from structured JSON values without creating hundreds of individual scene objects:
1. Build a point-only mesh (`mesh.from_pydata([(i * spacing, 0.0, 0.0) for i in range(n)], [], [])`).
2. Store a per-point float attribute (`attr = mesh.attributes.new("bar_height", 'FLOAT', 'POINT')`; `attr.data.foreach_set('value', heights)`).
3. Inside Geometry Nodes:
   - Read `"bar_height"` via `GeometryNodeInputNamedAttribute` (`data_type='FLOAT'`).
   - Combine `(bar_width, bar_depth, bar_height)` into `InstanceOnPoints.inputs['Scale']` on a unit cube whose origin sits at its bottom face (`Z in [0, 1]`, created via `GeometryNodeTransform` `Translation=(0, 0, 0.5)` before instancing).
   - Store normalized height (`bar_height / max_height`) with `GeometryNodeStoreNamedAttribute` (`domain='INSTANCE'` or `'POINT'` after `RealizeInstances`) so a `ShaderNodeAttribute` in the material smoothly tints taller bars with the project `accentColor`.

## 4. Blender 3.6–5.x Geometry Nodes Compatibility Checklist

- **Realize before export**: `GLB`/`FBX`/`OBJ`/`STL` exporters can drop un-realized Geometry Nodes instances or ignore procedural attributes. Add `GeometryNodeRealizeInstances` at the end of exportable trees (keep instances unrealized only when rendering massive foliage in Cycles).
- **Avoid deprecated `ShaderNodeMixRGB`**: Use `ShaderNodeMix` with `node.data_type = 'FLOAT' | 'VECTOR' | 'RGBA'` (supported in 3.6–5.x).
- **Inspect socket names dynamically when unsure**: On nodes like `ShaderNodeMix` (which has duplicate `A`/`B`/`Result` sockets for each type), select by socket type or index (`next(s for s in node.inputs if s.name == 'A' and s.type == 'RGBA')`).
- **Keep vertex budgets bounded**: Never connect un-clamped `Subdivision Surface` levels or tiny `Poisson Distance Min` values (`< 0.01` on large meshes) — an accidental 500,000-instance scatter will exhaust headless render memory.
