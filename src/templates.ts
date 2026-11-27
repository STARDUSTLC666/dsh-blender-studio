import { dirname } from 'node:path'
import {
  BLENDER_SHOT_PRESETS,
  DEFAULT_MULTI_SHOT_IDS,
  resolveRenderResolution,
  SCENE_JSON_MARKER,
  SHOT_DONE_MARKER,
  validateShotPresetIds,
  type BlenderAsset,
  type BlenderComputeDevice,
  type BlenderExportFormat,
  type BlenderJobKind,
  type BlenderProject,
  type BlenderProjectFields,
  type BlenderShotPresetId,
  type BlenderTemplateId,
  type BlenderTemplateMeta,
} from './types.js'

export const BLENDER_TEMPLATES: readonly BlenderTemplateMeta[] = [
  {
    id: 'product-studio',
    zh: '产品影棚',
    en: 'Product Studio',
    description: '弧形无影背景墙、阶梯展台与倒角主产品模型，内置三点棚拍布光与反射地板。',
    descriptionEn: 'Curved studio cyclorama, stepped pedestal, beveled hero product form, and 3-point studio lighting.',
    recommendedEngine: 'EEVEE',
    defaultCamera: 'three_quarter',
    defaultLighting: 'studio_3point',
    defaultMaterial: 'ceramic_gloss',
    defaultFrames: 48,
  },
  {
    id: 'logo-3d',
    zh: '3D 立体徽标',
    en: '3D Logo & Title',
    description: '高倒角挤出立体文字、金属底座与发光主题饰条，适合品牌片头与产品主视觉。',
    descriptionEn: 'Beveled extruded 3D typography mounted on a sleek plinth with glowing accent bar.',
    recommendedEngine: 'EEVEE',
    defaultCamera: 'front',
    defaultLighting: 'dramatic_rim',
    defaultMaterial: 'brushed_metal',
    defaultFrames: 48,
  },
  {
    id: 'isometric-room',
    zh: '等距微缩房间',
    en: 'Isometric Room',
    description: '正交等距视角双面切角建筑微缩场景，含工作台、发光屏幕、台灯与几何绿植。',
    descriptionEn: 'Orthographic cutaway architectural diorama with desk, glowing display, lamp, and geometric plant.',
    recommendedEngine: 'CYCLES',
    defaultCamera: 'isometric',
    defaultLighting: 'soft_daylight',
    defaultMaterial: 'clay_matte',
    defaultFrames: 48,
  },
  {
    id: 'motion-data',
    zh: '动态 3D 数据柱',
    en: 'Motion 3D Data',
    description: '程序化 3D 数据柱阵列与发光指示环，带时间轴波浪生长关键帧动画。',
    descriptionEn: 'Procedural 3D bar matrix with glowing accent collars and keyframed wave growth animation.',
    recommendedEngine: 'EEVEE',
    defaultCamera: 'three_quarter',
    defaultLighting: 'neon_cyber',
    defaultMaterial: 'frosted_glass',
    defaultFrames: 72,
  },
  {
    id: 'grease-pencil-2d',
    zh: '蜡笔 2D / 三渲二',
    en: 'Grease Pencil 2D',
    description: '自动兼容 GPv2（3.6–4.2）与 GPv3（4.3+）的多图层 2.5D 视差蜡笔手绘舞台。',
    descriptionEn: 'Cross-version GPv2/GPv3 multi-layer parallax 2D/2.5D Grease Pencil illustration stage.',
    recommendedEngine: 'EEVEE',
    defaultCamera: 'front',
    defaultLighting: 'clay_overcast',
    defaultMaterial: 'toon_cel',
    defaultFrames: 48,
  },
  {
    id: 'blank-stage',
    zh: '空白校准舞台',
    en: 'Blank Calibrated Stage',
    description: '公制 1m 基准舞台与自动外部模型导入挂点，适合纯 bpy 自定义脚本或资产检视。',
    descriptionEn: 'Clean metric reference stage with automatic uploaded 3D model import and custom bpy hook.',
    recommendedEngine: 'EEVEE',
    defaultCamera: 'three_quarter',
    defaultLighting: 'studio_3point',
    defaultMaterial: 'clay_matte',
    defaultFrames: 48,
  },
  {
    id: 'architectural-pavilion',
    zh: '参数化建筑展馆',
    en: 'Architectural Pavilion',
    description: '极简曲面木构天窗肋条、倒影浅水池、清水混凝土展墙与暖光展台，建筑可视化开箱即用。',
    descriptionEn: 'Minimalist curved timber skylight pavilion with reflecting pool, chamfered concrete walls, and warm gallery monolith.',
    recommendedEngine: 'EEVEE',
    defaultCamera: 'three_quarter',
    defaultLighting: 'soft_daylight',
    defaultMaterial: 'clay_matte',
    defaultFrames: 48,
  },
  {
    id: 'procedural-abstract',
    zh: '程序化几何雕塑',
    en: 'Procedural GeoNodes Art',
    description: '基于真实 Blender GeometryNodeTree 构建的扭转参数化三叶结雕塑与虹彩金属材质。',
    descriptionEn: 'Real Blender GeometryNodeTree twisted parametric ribbon & orbital sculpture with iridescent metallic shader.',
    recommendedEngine: 'EEVEE',
    defaultCamera: 'three_quarter',
    defaultLighting: 'dramatic_rim',
    defaultMaterial: 'brushed_metal',
    defaultFrames: 72,
  },
] as const

export function getTemplateMeta(id: BlenderTemplateId): BlenderTemplateMeta {
  return BLENDER_TEMPLATES.find(item => item.id === id) ?? BLENDER_TEMPLATES[0]
}

export interface GenerateSceneOptions {
  computeDevice?: BlenderComputeDevice
  applyLookdevOverrides?: boolean
  enforceRenderProfile?: boolean
}

export interface RunnerHarnessOptions {
  project: BlenderProject
  assetsDir: string
  outputPath?: string
  outputDir?: string
  format?: BlenderExportFormat
  overrideCode?: string
  frame?: number
  contactSheetWidth?: number
  contactSheetHeight?: number
  shots?: BlenderShotPresetId[]
  computeDevice?: BlenderComputeDevice
  enforceRenderProfile?: boolean
}

function pyJsonExpr(value: unknown): string {
  return `json.loads(${JSON.stringify(JSON.stringify(value))})`
}

function pyStr(value: string): string {
  return JSON.stringify(value)
}

function buildPreamble(
  project: BlenderProject | BlenderProjectFields,
  assetsDir: string,
  assets: BlenderAsset[],
  computeDevice: BlenderComputeDevice = 'auto',
  enforceRenderProfile = false,
): string {
  const { width, height } = resolveRenderResolution(project.aspect, project.resolutionScale)
  const config = {
    template: project.template,
    title: project.title,
    description: project.description,
    headline: project.headline || project.title,
    engine: project.engine,
    samples: project.samples,
    computeDevice,
    enforceRenderProfile: Boolean(enforceRenderProfile),
    aspect: project.aspect,
    resolutionScale: project.resolutionScale,
    width,
    height,
    fps: project.fps,
    frameStart: project.frameStart,
    frameEnd: project.frameEnd,
    cameraPreset: project.cameraPreset,
    lightingPreset: project.lightingPreset,
    materialPreset: project.materialPreset,
    accentColor: project.accentColor,
    transparentBg: project.transparentBg,
    lensMm: project.lensMm ?? 50,
    exposure: project.exposure ?? 0,
    clayMode: Boolean(project.clayMode),
    scriptMode: project.scriptMode,
  }
  const assetRecords = assets.map(a => ({
    id: a.id,
    name: a.name,
    file: a.file,
    kind: a.kind,
    ext: a.ext,
  }))

  return `# -*- coding: utf-8 -*-
# Generated by dsh-blender-studio (DeepSeek Harness 3D Studio Plugin)
# Compatible with Blender 3.6, 4.x (EEVEE Next / Principled BSDF 4.0+ / GPv3), and 5.x

import bpy
import bmesh
import json
import math
import os
import sys
from datetime import datetime, timezone
from mathutils import Euler, Matrix, Vector

DSH_PROJECT = ${pyJsonExpr(config)}
DSH_OVERRIDES = {
    "accentColor": DSH_PROJECT["accentColor"],
    "lensMm": float(DSH_PROJECT.get("lensMm", 50.0)),
    "exposure": float(DSH_PROJECT.get("exposure", 0.0)),
    "clayMode": bool(DSH_PROJECT.get("clayMode", False)),
    "transparentBg": bool(DSH_PROJECT.get("transparentBg", False)),
    "lightingPreset": DSH_PROJECT.get("lightingPreset", "studio_3point"),
    "materialPreset": DSH_PROJECT.get("materialPreset", "ceramic_gloss"),
}
DSH_ASSETS_DIR = ${pyStr(assetsDir)}
DSH_ASSETS = ${pyJsonExpr(assetRecords)}
DSH_ASSET_PATHS = {
    a["name"]: os.path.join(DSH_ASSETS_DIR, a["file"])
    for a in DSH_ASSETS
    if DSH_ASSETS_DIR and a.get("file")
}
DSH_ASSET_BY_KIND = {}
for _dsh_a in DSH_ASSETS:
    DSH_ASSET_BY_KIND.setdefault(_dsh_a.get("kind", "reference"), []).append(_dsh_a)
DSH_SCENE_JSON_MARKER = ${pyStr(SCENE_JSON_MARKER)}
DSH_SHOT_DONE_MARKER = ${pyStr(SHOT_DONE_MARKER)}

DSH_BACKDROP_EXACT = {
    "Studio_Floor",
    "Studio_Backdrop",
    "Logo_Floor",
    "Stage_Floor",
    "GP_Paper_Card",
    "Abstract_Floor",
}
DSH_BACKDROP_PREFIXES = (
    "Studio_",
    "Backdrop_",
    "Stage_Floor",
    "Softbox_",
    "Cyclorama",
    "Ground_Plane",
    "Abstract_Floor",
)


def dsh_is_backdrop_object(obj):
    name = getattr(obj, "name", "") or ""
    if name in DSH_BACKDROP_EXACT:
        return True
    for prefix in DSH_BACKDROP_PREFIXES:
        if name.startswith(prefix):
            return True
    return False


def dsh_hex_to_rgba(hex_color, alpha=1.0):
    text = str(hex_color or "#3B82F6").strip().lstrip("#")
    if len(text) != 6:
        text = "3B82F6"
    r = int(text[0:2], 16) / 255.0
    g = int(text[2:4], 16) / 255.0
    b = int(text[4:6], 16) / 255.0
    # sRGB to linear approximation for physically plausible Cycles/EEVEE shaders
    def to_lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_lin(r), to_lin(g), to_lin(b), float(alpha))


def dsh_clear_scene():
    scene = bpy.context.scene
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    for cam in list(bpy.data.cameras):
        if cam.users == 0:
            bpy.data.cameras.remove(cam)
    for light in list(bpy.data.lights):
        if light.users == 0:
            bpy.data.lights.remove(light)
    for curve in list(bpy.data.curves):
        if curve.users == 0:
            bpy.data.curves.remove(curve)
    for mat in list(bpy.data.materials):
        if mat.users == 0:
            bpy.data.materials.remove(mat)
    if hasattr(bpy.data, "grease_pencils_v3"):
        for gp in list(bpy.data.grease_pencils_v3):
            if gp.users == 0:
                bpy.data.grease_pencils_v3.remove(gp)
    if hasattr(bpy.data, "grease_pencils"):
        for gp in list(bpy.data.grease_pencils):
            if gp.users == 0:
                bpy.data.grease_pencils.remove(gp)
    for col in list(bpy.data.collections):
        if col != scene.collection:
            bpy.data.collections.remove(col)


def dsh_ensure_collection(name):
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    return col


def dsh_link_object(obj, collection_name="DSH_Scene"):
    col = dsh_ensure_collection(collection_name)
    if obj.name not in col.objects:
        col.objects.link(obj)
    return obj


def dsh_set_smooth(mesh, smooth=True):
    for poly in mesh.polygons:
        poly.use_smooth = smooth


def dsh_set_bsdf(bsdf, socket_names, value):
    for name in socket_names:
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = value
            return True
    return False


def dsh_configure_cycles_device(scene, mode="auto"):
    if not hasattr(scene, "cycles"):
        return "CPU"
    req = str(mode or "auto").strip().lower()
    if req == "cpu" or str(DSH_PROJECT.get("computeDevice", "auto")).strip().lower() == "cpu":
        if hasattr(scene.cycles, "device"):
            scene.cycles.device = "CPU"
        return "CPU"
    try:
        addon = bpy.context.preferences.addons.get("cycles")
        prefs = addon.preferences if addon else None
        if prefs is not None:
            for backend in ("OPTIX", "CUDA", "METAL", "HIP", "ONEAPI"):
                try:
                    prefs.compute_device_type = backend
                    prefs.get_devices()
                    gpu_devs = [d for d in prefs.devices if getattr(d, "type", "") == backend]
                    if gpu_devs:
                        for dev in prefs.devices:
                            dev.use = getattr(dev, "type", "") == backend
                        if hasattr(scene.cycles, "device"):
                            scene.cycles.device = "GPU"
                        names = ", ".join(getattr(d, "name", backend) for d in gpu_devs[:4])
                        print(f"[dsh-blender-studio] Cycles GPU enabled: {backend} ({names})", flush=True)
                        return backend
                except Exception:
                    continue
    except Exception:
        pass
    if hasattr(scene.cycles, "device"):
        scene.cycles.device = "CPU"
    return "CPU"


def dsh_set_render_engine(scene, engine_name, samples, transparent_bg, compute_device=None):
    valid_engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
    if engine_name == "EEVEE":
        if "BLENDER_EEVEE_NEXT" in valid_engines:
            scene.render.engine = "BLENDER_EEVEE_NEXT"
        else:
            scene.render.engine = "BLENDER_EEVEE"
        if hasattr(scene, "eevee"):
            if hasattr(scene.eevee, "taa_render_samples"):
                scene.eevee.taa_render_samples = int(samples)
            if hasattr(scene.eevee, "use_raytracing"):
                scene.eevee.use_raytracing = True
                rto = getattr(scene.eevee, "ray_tracing_options", None)
                if rto is not None:
                    if hasattr(rto, "screen_trace_quality"):
                        rto.screen_trace_quality = 0.5
                    if hasattr(rto, "use_denoise"):
                        rto.use_denoise = True
            if hasattr(scene.eevee, "use_shadows"):
                scene.eevee.use_shadows = True
            if hasattr(scene.eevee, "use_gtao"):
                scene.eevee.use_gtao = True
            if hasattr(scene.eevee, "use_ssr"):
                scene.eevee.use_ssr = True
            if hasattr(scene.eevee, "use_ssr_refraction"):
                scene.eevee.use_ssr_refraction = True
    elif engine_name == "CYCLES":
        scene.render.engine = "CYCLES"
        if hasattr(scene, "cycles"):
            scene.cycles.samples = int(samples)
            if hasattr(scene.cycles, "use_adaptive_sampling"):
                scene.cycles.use_adaptive_sampling = True
            if hasattr(scene.cycles, "adaptive_threshold"):
                scene.cycles.adaptive_threshold = 0.02
            if hasattr(scene.cycles, "use_denoising"):
                scene.cycles.use_denoising = True
            if hasattr(scene.cycles, "denoiser"):
                try:
                    scene.cycles.denoiser = "OPENIMAGEDENOISE"
                except Exception:
                    pass
            if hasattr(scene.cycles, "denoising_input_passes"):
                try:
                    scene.cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
                except Exception:
                    pass
            dsh_configure_cycles_device(scene, compute_device or DSH_PROJECT.get("computeDevice", "auto"))
    else:
        scene.render.engine = "BLENDER_WORKBENCH"

    scene.render.resolution_x = int(DSH_PROJECT["width"])
    scene.render.resolution_y = int(DSH_PROJECT["height"])
    scene.render.resolution_percentage = 100
    scene.render.fps = int(DSH_PROJECT["fps"])
    scene.frame_start = int(DSH_PROJECT["frameStart"])
    scene.frame_end = int(DSH_PROJECT["frameEnd"])
    scene.frame_set(int(DSH_PROJECT["frameStart"]))
    scene.render.film_transparent = bool(transparent_bg)
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA" if transparent_bg else "RGB"

    chosen_vt = "Standard"
    for vt in ("AgX", "Filmic", "Standard"):
        try:
            scene.view_settings.view_transform = vt
            chosen_vt = vt
            break
        except Exception:
            continue
    look_candidates = ("AgX - Medium High Contrast", "None") if chosen_vt == "AgX" else ("None",)
    for look_name in look_candidates:
        try:
            scene.view_settings.look = look_name
            break
        except Exception:
            continue
    try:
        scene.view_settings.exposure = 0.0
    except Exception:
        pass


def dsh_create_material(name, preset, color_rgba, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    if bpy.app.version < (5, 0, 0) or mat.node_tree is None:
        mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (420, 0)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    dsh_set_bsdf(bsdf, ["Base Color"], color_rgba)

    if preset == "clay_matte":
        dsh_set_bsdf(bsdf, ["Metallic"], 0.0)
        dsh_set_bsdf(bsdf, ["Roughness"], 0.82)
        dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.25)
        dsh_set_bsdf(bsdf, ["Subsurface Weight", "Subsurface"], 0.06)
    elif preset == "brushed_metal":
        dsh_set_bsdf(bsdf, ["Metallic"], 0.92)
        dsh_set_bsdf(bsdf, ["Roughness"], 0.24)
        dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.7)
        dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.25)
    elif preset == "frosted_glass":
        dsh_set_bsdf(bsdf, ["Metallic"], 0.0)
        dsh_set_bsdf(bsdf, ["IOR"], 1.45)
        if bpy.context.scene.render.engine == "CYCLES":
            dsh_set_bsdf(bsdf, ["Roughness"], 0.16)
            dsh_set_bsdf(bsdf, ["Transmission Weight", "Transmission"], 0.88)
            dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.6)
            if hasattr(mat, "use_raytrace_refraction"):
                mat.use_raytrace_refraction = True
            elif hasattr(mat, "use_screen_refraction"):
                mat.use_screen_refraction = True
        else:
            # Noise-free blended translucent glass for EEVEE 4.2+/5.x (avoids stochastic transmission grain)
            dsh_set_bsdf(bsdf, ["Roughness"], 0.12)
            dsh_set_bsdf(bsdf, ["Transmission Weight", "Transmission"], 0.0)
            dsh_set_bsdf(bsdf, ["Alpha"], 0.36)
            dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.72)
            dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 1.0)
            dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.02)
            if hasattr(mat, "surface_render_method"):
                mat.surface_render_method = "BLENDED"
            elif hasattr(mat, "blend_method"):
                try:
                    mat.blend_method = "BLEND"
                except Exception:
                    pass
            if hasattr(mat, "use_raytrace_refraction"):
                mat.use_raytrace_refraction = False
    elif preset == "ceramic_gloss":
        dsh_set_bsdf(bsdf, ["Metallic"], 0.04)
        dsh_set_bsdf(bsdf, ["Roughness"], 0.14)
        dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.6)
        dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.85)
        dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.05)
    elif preset == "toon_cel":
        dsh_set_bsdf(bsdf, ["Metallic"], 0.0)
        dsh_set_bsdf(bsdf, ["Roughness"], 0.55)
        dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.15)
        if bpy.context.scene.render.engine != "CYCLES":
            s2rgb = nt.nodes.new("ShaderNodeShaderToRGB")
            s2rgb.location = (180, 0)
            ramp = nt.nodes.new("ShaderNodeValToRGB")
            ramp.location = (300, 0)
            ramp.color_ramp.interpolation = "CONSTANT"
            ramp.color_ramp.elements[0].position = 0.0
            ramp.color_ramp.elements[0].color = (
                color_rgba[0] * 0.42,
                color_rgba[1] * 0.42,
                color_rgba[2] * 0.42,
                1.0,
            )
            ramp.color_ramp.elements[1].position = 0.45
            ramp.color_ramp.elements[1].color = color_rgba
            nt.links.new(bsdf.outputs["BSDF"], s2rgb.inputs["Shader"])
            nt.links.new(s2rgb.outputs["Color"], ramp.inputs["Fac"])
            nt.links.new(ramp.outputs["Color"], out.inputs["Surface"])
            return mat

    if emission_strength > 0.0:
        dsh_set_bsdf(bsdf, ["Emission Color", "Emission"], color_rgba)
        dsh_set_bsdf(bsdf, ["Emission Strength"], float(emission_strength))

    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def dsh_assign_material(obj, mat):
    if obj.data is None:
        return
    if len(obj.data.materials) == 0:
        obj.data.materials.append(mat)
    else:
        obj.data.materials[0] = mat


def dsh_make_mesh_box(name, size=(1.0, 1.0, 1.0), location=(0.0, 0.0, 0.0), bevel_width=0.0, collection="DSH_Scene"):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    if bevel_width > 0.0:
        bmesh.ops.bevel(
            bm,
            geom=list(bm.edges),
            offset=float(bevel_width),
            segments=3,
            affect="EDGES",
            clamp_overlap=True,
        )
    bm.to_mesh(mesh)
    bm.free()
    dsh_set_smooth(mesh, bevel_width > 0.0)
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(location)
    return dsh_link_object(obj, collection)


def dsh_make_mesh_cylinder(name, radius1=0.5, radius2=0.5, depth=1.0, segments=48, location=(0.0, 0.0, 0.0), bevel_width=0.0, collection="DSH_Scene"):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=int(segments),
        radius1=float(radius1),
        radius2=float(radius2),
        depth=float(depth),
    )
    if bevel_width > 0.0:
        cap_edges = [e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) < 1e-4]
        if cap_edges:
            bmesh.ops.bevel(
                bm,
                geom=cap_edges,
                offset=float(bevel_width),
                segments=3,
                affect="EDGES",
                clamp_overlap=True,
            )
    bm.to_mesh(mesh)
    bm.free()
    dsh_set_smooth(mesh, True)
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(location)
    return dsh_link_object(obj, collection)


def dsh_make_mesh_sphere(name, radius=0.5, location=(0.0, 0.0, 0.0), u_segments=40, v_segments=24, collection="DSH_Scene"):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=int(u_segments), v_segments=int(v_segments), radius=float(radius))
    bm.to_mesh(mesh)
    bm.free()
    dsh_set_smooth(mesh, True)
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(location)
    return dsh_link_object(obj, collection)


def dsh_make_mesh_torus(name, major_radius=1.0, minor_radius=0.08, major_seg=48, minor_seg=18, location=(0.0, 0.0, 0.0), collection="DSH_Scene"):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    verts = []
    faces = []
    for i in range(major_seg):
        theta = 2.0 * math.pi * i / major_seg
        ct, st = math.cos(theta), math.sin(theta)
        for j in range(minor_seg):
            phi = 2.0 * math.pi * j / minor_seg
            cp, sp = math.cos(phi), math.sin(phi)
            r = major_radius + minor_radius * cp
            verts.append((r * ct, r * st, minor_radius * sp))
    for i in range(major_seg):
        ni = (i + 1) % major_seg
        for j in range(minor_seg):
            nj = (j + 1) % minor_seg
            a = i * minor_seg + j
            b = ni * minor_seg + j
            c = ni * minor_seg + nj
            d = i * minor_seg + nj
            faces.append((a, b, c, d))
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    dsh_set_smooth(mesh, True)
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(location)
    return dsh_link_object(obj, collection)


def dsh_add_light(name, light_type, location, energy, color=(1.0, 1.0, 1.0), size=2.0, target=(0.0, 0.0, 0.8), collection="DSH_Lights"):
    light_data = bpy.data.lights.new(name=name + "_Data", type=light_type)
    light_data.energy = float(energy)
    light_data.color = color
    if light_type == "AREA":
        light_data.size = float(size)
    elif light_type == "SPOT":
        light_data.spot_size = math.radians(42.0)
        light_data.spot_blend = 0.35
    elif light_type == "SUN":
        light_data.angle = math.radians(4.5)
    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    light_obj.location = Vector(location)
    direction = Vector(target) - Vector(location)
    if direction.length > 1e-4:
        light_obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return dsh_link_object(light_obj, collection)


def _dsh_wire_world_hdri(nt, bg, strength=1.15):
    hdri_asset = next((a for a in DSH_ASSETS if a.get("kind") == "hdri"), None)
    if not (hdri_asset and DSH_ASSETS_DIR):
        return False
    hdri_path = os.path.join(DSH_ASSETS_DIR, hdri_asset["file"])
    if not os.path.isfile(hdri_path):
        return False
    try:
        tex_coord = nt.nodes.new("ShaderNodeTexCoord")
        mapping = nt.nodes.new("ShaderNodeMapping")
        env_tex = nt.nodes.new("ShaderNodeTexEnvironment")
        env_tex.image = bpy.data.images.load(hdri_path, check_existing=True)
        nt.links.new(tex_coord.outputs["Generated"], mapping.inputs["Vector"])
        nt.links.new(mapping.outputs["Vector"], env_tex.inputs["Vector"])
        nt.links.new(env_tex.outputs["Color"], bg.inputs["Color"])
        bg.inputs["Strength"].default_value = float(strength)
        return True
    except Exception as exc:
        print("[dsh-blender-studio] HDRI load warning:", hdri_asset.get("name"), exc)
        return False


def dsh_setup_lighting(preset, accent_hex):
    scene = bpy.context.scene
    world = scene.world
    if world is None:
        world = bpy.data.worlds.new("DSH_World")
        scene.world = world
    if bpy.app.version < (5, 0, 0) or world.node_tree is None:
        world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

    accent_rgb = dsh_hex_to_rgba(accent_hex)[:3]

    # Auto-wire uploaded HDRI if present (TexCoord -> Mapping -> TexEnvironment -> Background)
    has_hdri = _dsh_wire_world_hdri(nt, bg, strength=1.15)

    if preset == "studio_3point":
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.045, 0.052, 0.068, 1.0)
            bg.inputs["Strength"].default_value = 0.65
        dsh_add_light("Key_Light", "AREA", (4.2, -3.6, 4.6), 340.0, (1.0, 0.96, 0.92), size=2.8)
        dsh_add_light("Fill_Light", "AREA", (-4.4, -2.8, 2.8), 145.0, (0.86, 0.92, 1.0), size=3.6)
        dsh_add_light("Rim_Light", "AREA", (-1.5, 4.4, 3.8), 260.0, accent_rgb, size=2.2)
    elif preset == "soft_daylight":
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.52, 0.68, 0.92, 1.0)
            bg.inputs["Strength"].default_value = 0.95
        dsh_add_light("Sun_Key", "SUN", (5.0, -5.0, 8.0), 3.6, (1.0, 0.97, 0.90))
        dsh_add_light("Sky_Fill", "AREA", (-4.0, -2.0, 4.5), 180.0, (0.85, 0.94, 1.0), size=4.5)
    elif preset == "dramatic_rim":
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.012, 0.014, 0.020, 1.0)
            bg.inputs["Strength"].default_value = 0.28
        dsh_add_light("Spot_Hero", "SPOT", (3.6, -4.0, 5.2), 520.0, (1.0, 0.95, 0.88))
        dsh_add_light("Rim_Accent", "AREA", (-3.2, 3.8, 3.2), 420.0, accent_rgb, size=1.8)
        dsh_add_light("Low_Bounce", "AREA", (0.0, -3.5, 0.8), 55.0, (0.75, 0.82, 0.95), size=3.0)
    elif preset == "neon_cyber":
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.015, 0.012, 0.032, 1.0)
            bg.inputs["Strength"].default_value = 0.35
        dsh_add_light("Neon_Left", "AREA", (-4.2, -2.4, 3.0), 360.0, (0.12, 0.85, 1.0), size=2.6)
        dsh_add_light("Neon_Right", "AREA", (4.2, -2.0, 3.4), 380.0, accent_rgb, size=2.4)
        dsh_add_light("Neon_Back", "AREA", (0.0, 4.6, 2.8), 280.0, (0.95, 0.22, 0.72), size=3.2)
    else:  # clay_overcast
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.62, 0.64, 0.68, 1.0)
            bg.inputs["Strength"].default_value = 1.05
        dsh_add_light("Overhead_Softbox", "AREA", (0.0, -1.2, 6.2), 260.0, (1.0, 0.99, 0.97), size=5.5)


def dsh_setup_camera(preset, frame_start, frame_end, target=(0.0, 0.0, 0.85), distance_scale=1.0):
    scene = bpy.context.scene
    scale = max(0.5, float(distance_scale))
    target_empty = bpy.data.objects.new("DSH_Camera_Target", None)
    target_empty.empty_display_type = "PLAIN_AXES"
    target_empty.location = Vector(target)
    dsh_link_object(target_empty, "DSH_Cameras")

    cam_data = bpy.data.cameras.new("DSH_Camera_Data")
    cam_data.clip_start = 0.05
    cam_data.clip_end = 500.0
    cam_obj = bpy.data.objects.new("DSH_Camera", cam_data)
    dsh_link_object(cam_obj, "DSH_Cameras")

    if preset == "front":
        cam_obj.location = Vector((0.0, -5.8 * scale, target[2] + 0.25 * scale))
        cam_data.lens = 48.0
    elif preset == "isometric":
        cam_obj.location = Vector((6.4 * scale, -6.4 * scale, target[2] + 5.2 * scale))
        cam_data.type = "ORTHO"
        cam_data.ortho_scale = 8.6 * scale
    elif preset == "top":
        cam_obj.location = Vector((0.0, -0.02, target[2] + 7.4 * scale))
        cam_data.lens = 45.0
    elif preset == "closeup":
        cam_obj.location = Vector((2.15 * scale, -2.55 * scale, target[2] + 0.65 * scale))
        cam_data.lens = 78.0
        cam_data.dof.use_dof = True
        cam_data.dof.focus_object = target_empty
        cam_data.dof.aperture_fstop = 4.0
    elif preset == "turntable":
        pivot = bpy.data.objects.new("DSH_Turntable_Pivot", None)
        pivot.location = Vector((target[0], target[1], 0.0))
        dsh_link_object(pivot, "DSH_Cameras")
        cam_obj.parent = pivot
        cam_obj.location = Vector((4.2 * scale, -4.6 * scale, target[2] + 1.85 * scale))
        cam_data.lens = 46.0
        pivot.rotation_euler = Euler((0.0, 0.0, 0.0), "XYZ")
        pivot.keyframe_insert(data_path="rotation_euler", frame=int(frame_start))
        pivot.rotation_euler = Euler((0.0, 0.0, math.radians(360.0)), "XYZ")
        pivot.keyframe_insert(data_path="rotation_euler", frame=int(frame_end) + 1)
        if pivot.animation_data and pivot.animation_data.action:
            action = pivot.animation_data.action
            try:
                fcurves = []
                if hasattr(action, "fcurves"):
                    fcurves = list(action.fcurves)
                else:
                    for lyr in getattr(action, "layers", ()):
                        for strip in getattr(lyr, "strips", ()):
                            for bag in getattr(strip, "channelbags", ()):
                                fcurves.extend(bag.fcurves)
                for fcurve in fcurves:
                    for kp in fcurve.keyframe_points:
                        kp.interpolation = "LINEAR"
            except Exception:
                pass
    else:  # three_quarter
        cam_obj.location = Vector((4.2 * scale, -4.7 * scale, target[2] + 1.85 * scale))
        cam_data.lens = 46.0

    track = cam_obj.constraints.new(type="TRACK_TO")
    track.target = target_empty
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"

    scene.camera = cam_obj
    return cam_obj, target_empty


# ==============================================================================
# DSH_KIT: Built-in Cinema-Grade 3D Engineering & Lookdev Helper Library
# Compatible with Blender 3.6, 4.x, and 5.x (EEVEE / Cycles OIDN / Compositor)
# ==============================================================================


def dsh_coerce_rgba(color, alpha=1.0):
    if isinstance(color, str):
        return dsh_hex_to_rgba(color, alpha=alpha)
    if isinstance(color, (list, tuple)):
        if len(color) >= 4:
            return (float(color[0]), float(color[1]), float(color[2]), float(color[3]))
        if len(color) == 3:
            return (float(color[0]), float(color[1]), float(color[2]), float(alpha))
    return (0.75, 0.78, 0.82, float(alpha))


def dsh_bevel(obj, width=0.015, segments=3):
    if obj is None or obj.type != "MESH":
        return None
    mod = obj.modifiers.new(name="DSH_Bevel", type="BEVEL")
    mod.width = float(width)
    mod.segments = max(1, int(segments))
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(30.0)
    if hasattr(mod, "use_clamp_overlap"):
        mod.use_clamp_overlap = True
    return mod


def dsh_smooth(obj):
    if obj is None or obj.type != "MESH" or obj.data is None:
        return obj
    dsh_set_smooth(obj.data, True)
    return obj


def dsh_array_radial(obj, count, axis="Z", center=(0.0, 0.0, 0.0)):
    n = max(1, int(count))
    result = [obj]
    if obj is None or n <= 1:
        return result
    axis_upper = str(axis or "Z").upper()
    if axis_upper not in ("X", "Y", "Z"):
        axis_upper = "Z"
    pivot = Vector(center)
    cols = list(obj.users_collection)
    target_col = cols[0] if cols else dsh_ensure_collection("DSH_Hero")
    bpy.context.view_layer.update()
    base_mat = obj.matrix_world.copy()
    for i in range(1, n):
        angle = 2.0 * math.pi * (i / float(n))
        rot = Matrix.Rotation(angle, 4, axis_upper)
        xf = Matrix.Translation(pivot) @ rot @ Matrix.Translation(-pivot)
        copy_obj = obj.copy()
        copy_obj.name = f"{obj.name}_Rad_{i:02d}"
        if copy_obj.name not in target_col.objects:
            target_col.objects.link(copy_obj)
        copy_obj.matrix_world = xf @ base_mat
        result.append(copy_obj)
    return result


def dsh_tube_along_points(name, points, radius=0.02, mat=None, bevel_res=6, collection="DSH_Hero"):
    pts = list(points or [])
    if len(pts) < 2:
        pts = [(0.0, 0.0, 0.0), (0.0, 0.0, 0.5)]
    curve_data = bpy.data.curves.new(name=name + "_Curve", type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.bevel_depth = float(radius)
    curve_data.bevel_resolution = max(1, int(bevel_res))
    if hasattr(curve_data, "use_fill_caps"):
        curve_data.use_fill_caps = True
    spline = curve_data.splines.new("POLY")
    spline.points.add(len(pts) - 1)
    for idx, pt in enumerate(pts):
        spline.points[idx].co = (float(pt[0]), float(pt[1]), float(pt[2]), 1.0)
    obj = bpy.data.objects.new(name, curve_data)
    dsh_link_object(obj, collection)
    if mat is not None:
        dsh_assign_material(obj, mat)
    return obj


def dsh_ground_assembly(objs, z=0.0):
    items = [o for o in (objs or []) if o is not None]
    if not items:
        return 0.0
    bpy.context.view_layer.update()
    min_z = None
    for o in items:
        if o.type in ("MESH", "CURVE", "FONT", "SURFACE"):
            for corner in o.bound_box:
                wc = o.matrix_world @ Vector(corner)
                if min_z is None or wc.z < min_z:
                    min_z = wc.z
    if min_z is None:
        return 0.0
    delta = float(z) - min_z
    item_set = set(items)
    for o in items:
        if o.parent is None or o.parent not in item_set:
            o.location.z += delta
    bpy.context.view_layer.update()
    return delta


def dsh_frame_camera_to_assembly(cam, objs, azimuth_deg=35.0, elevation_deg=20.0, lens_mm=58.0, margin=1.18):
    scene = bpy.context.scene
    items = [o for o in (objs or []) if o is not None and o.type in ("MESH", "CURVE", "FONT", "SURFACE", "GPENCIL", "GREASEPENCIL")]
    bpy.context.view_layer.update()
    if items:
        xs, ys, zs = [], [], []
        for o in items:
            for corner in o.bound_box:
                wc = o.matrix_world @ Vector(corner)
                xs.append(wc.x)
                ys.append(wc.y)
                zs.append(wc.z)
        center = Vector(((min(xs) + max(xs)) * 0.5, (min(ys) + max(ys)) * 0.5, (min(zs) + max(zs)) * 0.5))
        sx = max(xs) - min(xs)
        sy = max(ys) - min(ys)
        sz = max(zs) - min(zs)
        radius = max(0.01, 0.5 * math.sqrt(sx * sx + sy * sy + sz * sz))
    else:
        center = Vector((0.0, 0.0, 0.8))
        radius = 1.6

    if cam is None:
        cam_data = bpy.data.cameras.new("DSH_Hero_Cam_Data")
        cam = bpy.data.objects.new("DSH_Hero_Cam", cam_data)
        dsh_link_object(cam, "DSH_Cameras")

    cam.data.lens = float(lens_mm)
    if hasattr(cam.data, "sensor_fit"):
        cam.data.sensor_fit = "AUTO"
    res_x = max(1, int(scene.render.resolution_x))
    res_y = max(1, int(scene.render.resolution_y))
    aspect = float(max(res_x, res_y)) / float(min(res_x, res_y))
    sensor_min = float(getattr(cam.data, "sensor_width", 36.0)) / aspect
    half_fov = math.atan((sensor_min * 0.5) / max(1.0, float(lens_mm)))
    dist = max(0.05, (radius / max(0.08, math.sin(half_fov))) * float(margin))
    cam.data.clip_start = max(0.001, min(0.05, radius * 0.02))
    cam.data.clip_end = max(100.0, dist * 20.0)

    az = math.radians(float(azimuth_deg))
    el = math.radians(float(elevation_deg))
    offset = Vector((
        dist * math.cos(el) * math.sin(az),
        -dist * math.cos(el) * math.cos(az),
        dist * math.sin(el),
    ))
    cam.location = center + offset
    direction = center - cam.location
    if direction.length > 1e-4:
        cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    bpy.context.view_layer.update()
    return cam, center


def _dsh_new_pbr_mat(name):
    mat = bpy.data.materials.new(name=name)
    if bpy.app.version < (5, 0, 0) or mat.node_tree is None:
        mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (480, 0)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (180, 0)
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat, nt, bsdf


def dsh_mat_car_paint(name, color, metallic=0.82, clearcoat=1.0):
    rgba = dsh_coerce_rgba(color)
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.location = (-360, 140)
    lw.inputs["Blend"].default_value = 0.28
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (-120, 140)
    ramp.color_ramp.elements[0].position = 0.1
    ramp.color_ramp.elements[0].color = rgba
    ramp.color_ramp.elements[1].position = 0.92
    ramp.color_ramp.elements[1].color = (rgba[0] * 0.32, rgba[1] * 0.32, rgba[2] * 0.38, 1.0)
    nt.links.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])

    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-560, -140)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-340, -140)
    noise.inputs["Scale"].default_value = 320.0
    noise.inputs["Detail"].default_value = 4.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-80, -140)
    bump.inputs["Strength"].default_value = 0.025
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    if "Normal" in bsdf.inputs:
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    dsh_set_bsdf(bsdf, ["Metallic"], float(metallic))
    dsh_set_bsdf(bsdf, ["Roughness"], 0.19)
    dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.72)
    dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], float(clearcoat))
    dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.03)
    dsh_set_bsdf(bsdf, ["Coat IOR"], 1.55)
    return mat


def dsh_mat_carbon_fiber(name="Mat_Carbon_Fiber"):
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-740, 0)
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.location = (-540, 0)
    mp.inputs["Rotation"].default_value = (0.0, 0.0, math.radians(45.0))
    mp.inputs["Scale"].default_value = (42.0, 42.0, 42.0)
    chk = nt.nodes.new("ShaderNodeTexChecker")
    chk.location = (-320, 120)
    chk.inputs["Color1"].default_value = (0.028, 0.030, 0.034, 1.0)
    chk.inputs["Color2"].default_value = (0.068, 0.072, 0.080, 1.0)
    chk.inputs["Scale"].default_value = 2.0
    ramp_r = nt.nodes.new("ShaderNodeValToRGB")
    ramp_r.location = (-100, -40)
    ramp_r.color_ramp.elements[0].color = (0.24, 0.24, 0.24, 1.0)
    ramp_r.color_ramp.elements[1].color = (0.38, 0.38, 0.38, 1.0)
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-80, -200)
    bump.inputs["Strength"].default_value = 0.08

    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], chk.inputs["Vector"])
    nt.links.new(chk.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(chk.outputs["Fac"], ramp_r.inputs["Fac"])
    nt.links.new(ramp_r.outputs["Color"], bsdf.inputs["Roughness"])
    nt.links.new(chk.outputs["Fac"], bump.inputs["Height"])
    if "Normal" in bsdf.inputs:
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    dsh_set_bsdf(bsdf, ["Metallic"], 0.18)
    dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.85)
    dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.07)
    return mat


def dsh_mat_brushed_metal(name, color=(0.74, 0.77, 0.82), roughness=0.25):
    rgba = dsh_coerce_rgba(color)
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-680, -100)
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.location = (-480, -100)
    mp.inputs["Scale"].default_value = (18.0, 2.0, 18.0)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-280, -100)
    noise.inputs["Scale"].default_value = 35.0
    noise.inputs["Detail"].default_value = 6.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-60, -120)
    bump.inputs["Strength"].default_value = 0.045
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    if "Normal" in bsdf.inputs:
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    dsh_set_bsdf(bsdf, ["Base Color"], rgba)
    dsh_set_bsdf(bsdf, ["Metallic"], 0.95)
    dsh_set_bsdf(bsdf, ["Roughness"], float(roughness))
    dsh_set_bsdf(bsdf, ["Anisotropic"], 0.65)
    dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.75)
    return mat


def dsh_mat_tinted_glass(name, color=(0.12, 0.18, 0.24), roughness=0.04):
    rgba = dsh_coerce_rgba(color)
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    dsh_set_bsdf(bsdf, ["Base Color"], rgba)
    dsh_set_bsdf(bsdf, ["Metallic"], 0.05)
    dsh_set_bsdf(bsdf, ["Roughness"], float(roughness))
    dsh_set_bsdf(bsdf, ["IOR"], 1.50)
    dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.92)
    dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.02)
    if bpy.context.scene.render.engine == "CYCLES":
        dsh_set_bsdf(bsdf, ["Transmission Weight", "Transmission"], 0.86)
        if hasattr(mat, "use_raytrace_refraction"):
            mat.use_raytrace_refraction = True
        elif hasattr(mat, "use_screen_refraction"):
            mat.use_screen_refraction = True
    else:
        dsh_set_bsdf(bsdf, ["Transmission Weight", "Transmission"], 0.0)
        dsh_set_bsdf(bsdf, ["Alpha"], 0.38)
        dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.78)
        if hasattr(mat, "surface_render_method"):
            mat.surface_render_method = "BLENDED"
        elif hasattr(mat, "blend_method"):
            try:
                mat.blend_method = "BLEND"
            except Exception:
                pass
        if hasattr(mat, "use_raytrace_refraction"):
            mat.use_raytrace_refraction = False
    return mat


def dsh_mat_rubber_tire(name="Mat_Rubber_Tire"):
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-520, -100)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-300, -100)
    noise.inputs["Scale"].default_value = 95.0
    noise.inputs["Detail"].default_value = 6.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-80, -100)
    bump.inputs["Strength"].default_value = 0.06
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    if "Normal" in bsdf.inputs:
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    dsh_set_bsdf(bsdf, ["Base Color"], (0.024, 0.025, 0.028, 1.0))
    dsh_set_bsdf(bsdf, ["Metallic"], 0.0)
    dsh_set_bsdf(bsdf, ["Roughness"], 0.76)
    dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.28)
    return mat


def dsh_mat_emissive_led(name, color, strength=8.0):
    rgba = dsh_coerce_rgba(color)
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    dsh_set_bsdf(bsdf, ["Base Color"], rgba)
    dsh_set_bsdf(bsdf, ["Roughness"], 0.12)
    dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.65)
    dsh_set_bsdf(bsdf, ["Emission Color", "Emission"], rgba)
    dsh_set_bsdf(bsdf, ["Emission Strength"], float(strength))
    return mat


def dsh_mat_matte_armor(name, color=(0.24, 0.28, 0.26)):
    rgba = dsh_coerce_rgba(color)
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-540, -100)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-320, -100)
    noise.inputs["Scale"].default_value = 140.0
    noise.inputs["Detail"].default_value = 5.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-80, -100)
    bump.inputs["Strength"].default_value = 0.04
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    if "Normal" in bsdf.inputs:
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    dsh_set_bsdf(bsdf, ["Base Color"], rgba)
    dsh_set_bsdf(bsdf, ["Metallic"], 0.16)
    dsh_set_bsdf(bsdf, ["Roughness"], 0.58)
    dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.35)
    return mat


def dsh_setup_hero_studio(style="dark_cyclorama", accent_color="#4176e6", scale=1.0):
    scene = bpy.context.scene
    s = max(0.05, float(scale))
    e_scale = s * s
    tgt = (0.0, 0.0, 0.8 * s)
    world = scene.world
    if world is None:
        world = bpy.data.worlds.new("DSH_Hero_World")
        scene.world = world
    if bpy.app.version < (5, 0, 0) or world.node_tree is None:
        world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

    accent_rgba = dsh_coerce_rgba(accent_color)
    accent_rgb = accent_rgba[:3]
    has_hdri = _dsh_wire_world_hdri(nt, bg, strength=0.95)
    created = []

    if style == "wet_asphalt":
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.014, 0.018, 0.028, 1.0)
            bg.inputs["Strength"].default_value = 0.35
        mat_floor, fnt, fbsdf = _dsh_new_pbr_mat("Mat_Studio_WetAsphalt")
        tc = fnt.nodes.new("ShaderNodeTexCoord")
        noise = fnt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 3.2 / s
        noise.inputs["Detail"].default_value = 7.0
        ramp = fnt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.38
        ramp.color_ramp.elements[0].color = (0.05, 0.05, 0.05, 1.0)
        ramp.color_ramp.elements[1].position = 0.62
        ramp.color_ramp.elements[1].color = (0.48, 0.48, 0.48, 1.0)
        fnt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
        fnt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
        fnt.links.new(ramp.outputs["Color"], fbsdf.inputs["Roughness"])
        dsh_set_bsdf(fbsdf, ["Base Color"], (0.025, 0.027, 0.032, 1.0))
        dsh_set_bsdf(fbsdf, ["Coat Weight", "Clearcoat"], 0.65)
        floor = dsh_make_mesh_box("Studio_Wet_Asphalt", size=(24.0 * s, 24.0 * s, 0.1 * s), location=(0.0, 0.0, -0.05 * s), collection="DSH_Stage")
        dsh_assign_material(floor, mat_floor)
        created.append(floor)
        dsh_add_light("Key_Strip", "AREA", (0.0, -2.5 * s, 5.2 * s), 680.0 * e_scale, (0.96, 0.98, 1.0), size=5.0 * s, target=tgt)
        dsh_add_light("Rim_Accent", "AREA", (-4.8 * s, 4.2 * s, 3.0 * s), 460.0 * e_scale, accent_rgb, size=3.2 * s, target=tgt)
        dsh_add_light("Warm_Side", "AREA", (5.2 * s, -1.5 * s, 2.6 * s), 310.0 * e_scale, (1.0, 0.85, 0.72), size=2.8 * s, target=tgt)
    elif style == "engineering_bay":
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.028, 0.032, 0.042, 1.0)
            bg.inputs["Strength"].default_value = 0.48
        mat_floor = dsh_create_material("Mat_Studio_BayFloor", "clay_matte", (0.14, 0.15, 0.17, 1.0))
        floor = dsh_make_mesh_box("Studio_Bay_Floor", size=(22.0 * s, 22.0 * s, 0.1 * s), location=(0.0, 0.0, -0.05 * s), collection="DSH_Stage")
        dsh_assign_material(floor, mat_floor)
        created.append(floor)
        dsh_add_light("Bay_Overhead_Key", "AREA", (3.6 * s, -4.2 * s, 5.4 * s), 620.0 * e_scale, (1.0, 0.96, 0.92), size=4.2 * s, target=tgt)
        dsh_add_light("Bay_Cool_Fill", "AREA", (-5.0 * s, -2.2 * s, 3.2 * s), 280.0 * e_scale, (0.78, 0.88, 1.0), size=4.0 * s, target=tgt)
        dsh_add_light("Bay_Accent_Rim", "AREA", (-2.2 * s, 5.0 * s, 3.8 * s), 440.0 * e_scale, accent_rgb, size=3.0 * s, target=tgt)
    elif style == "helipad":
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.032, 0.046, 0.075, 1.0)
            bg.inputs["Strength"].default_value = 0.60
        mat_deck = dsh_create_material("Mat_Studio_Helipad", "clay_matte", (0.10, 0.11, 0.13, 1.0))
        mat_ring = dsh_mat_emissive_led("Mat_Studio_HelipadRing", accent_rgba, strength=2.6)
        deck = dsh_make_mesh_cylinder("Studio_Helipad_Deck", radius1=7.2 * s, radius2=7.0 * s, depth=0.16 * s, segments=64, location=(0.0, 0.0, -0.08 * s), bevel_width=0.03 * s, collection="DSH_Stage")
        dsh_assign_material(deck, mat_deck)
        ring = dsh_make_mesh_torus("Studio_Helipad_Ring", major_radius=4.6 * s, minor_radius=0.045 * s, major_seg=64, minor_seg=12, location=(0.0, 0.0, 0.015 * s), collection="DSH_Stage")
        dsh_assign_material(ring, mat_ring)
        created.extend([deck, ring])
        dsh_add_light("Helipad_Sun", "SUN", (6.0 * s, -6.0 * s, 9.0 * s), 2.8, (1.0, 0.92, 0.82), target=tgt)
        dsh_add_light("Helipad_Flood_L", "AREA", (-5.5 * s, -4.5 * s, 4.4 * s), 480.0 * e_scale, (0.85, 0.92, 1.0), size=3.4 * s, target=tgt)
        dsh_add_light("Helipad_Rim", "AREA", (3.5 * s, 5.5 * s, 4.0 * s), 420.0 * e_scale, accent_rgb, size=3.0 * s, target=tgt)
    else:  # dark_cyclorama
        if not has_hdri:
            bg.inputs["Color"].default_value = (0.016, 0.018, 0.024, 1.0)
            bg.inputs["Strength"].default_value = 0.32
        mat_cyc = dsh_create_material("Mat_Studio_Cyclorama", "ceramic_gloss", (0.04, 0.045, 0.055, 1.0))
        if mat_cyc.node_tree:
            cbsdf = next((n for n in mat_cyc.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
            if cbsdf:
                dsh_set_bsdf(cbsdf, ["Roughness"], 0.34)
                dsh_set_bsdf(cbsdf, ["Specular IOR Level", "Specular"], 0.36)
                dsh_set_bsdf(cbsdf, ["Coat Weight", "Clearcoat"], 0.0)
        floor = dsh_make_mesh_box("Studio_Cyclorama_Floor", size=(24.0 * s, 24.0 * s, 0.1 * s), location=(0.0, 0.0, -0.05 * s), collection="DSH_Stage")
        dsh_assign_material(floor, mat_cyc)
        created.append(floor)
        top_light = dsh_add_light("Studio_Strip_Top", "AREA", (0.0, -1.6 * s, 5.6 * s), 580.0 * e_scale, (1.0, 0.98, 0.95), size=4.6 * s, target=tgt)
        if getattr(top_light, "data", None) is not None and hasattr(top_light.data, "shape"):
            try:
                top_light.data.shape = "DISK"
            except Exception:
                pass
        dsh_add_light("Studio_Key_L", "AREA", (4.8 * s, -4.4 * s, 3.4 * s), 420.0 * e_scale, (0.94, 0.97, 1.0), size=3.2 * s, target=tgt)
        dsh_add_light("Studio_Rim_Back", "AREA", (-3.8 * s, 4.6 * s, 3.2 * s), 460.0 * e_scale, accent_rgb, size=2.8 * s, target=tgt)
    return created


def dsh_setup_compositor(glare=True, glare_threshold=1.15):
    scene = bpy.context.scene
    if not glare:
        return None
    try:
        scene.render.use_compositing = True
    except Exception:
        pass

    def _configure_glare_node(gnode):
        if "Type" in gnode.inputs:
            for val in ("Fog Glow", "FOG_GLOW", "Bloom"):
                try:
                    gnode.inputs["Type"].default_value = val
                    break
                except Exception:
                    continue
        elif hasattr(gnode, "glare_type"):
            gnode.glare_type = "FOG_GLOW"
        if "Quality" in gnode.inputs:
            for val in ("High", "HIGH", "Medium"):
                try:
                    gnode.inputs["Quality"].default_value = val
                    break
                except Exception:
                    continue
        elif hasattr(gnode, "quality"):
            gnode.quality = "HIGH"
        if "Threshold" in gnode.inputs:
            gnode.inputs["Threshold"].default_value = float(glare_threshold)
        elif hasattr(gnode, "threshold"):
            gnode.threshold = float(glare_threshold)
        if "Strength" in gnode.inputs:
            gnode.inputs["Strength"].default_value = 0.35
        if "Size" in gnode.inputs:
            try:
                gnode.inputs["Size"].default_value = 0.65
            except Exception:
                pass
        elif hasattr(gnode, "size"):
            gnode.size = 7

    try:
        # Blender 5.3+: non-deprecated Scene.compositor_effects
        if hasattr(scene, "compositor_effects"):
            ng = bpy.data.node_groups.new("DSH_Compositor_Glare", "CompositorNodeTree")
            ng.interface.new_socket(name="Image", in_out="INPUT", socket_type="NodeSocketColor")
            ng.interface.new_socket(name="Image", in_out="OUTPUT", socket_type="NodeSocketColor")
            n_in = ng.nodes.new("NodeGroupInput")
            n_in.location = (-300, 0)
            n_glare = ng.nodes.new("CompositorNodeGlare")
            n_glare.location = (0, 0)
            _configure_glare_node(n_glare)
            n_out = ng.nodes.new("NodeGroupOutput")
            n_out.location = (300, 0)
            ng.links.new(n_in.outputs["Image"], n_glare.inputs["Image"])
            ng.links.new(n_glare.outputs["Image"], n_out.inputs["Image"])
            fx = scene.compositor_effects.new("DSH_Glare")
            fx.node_group = ng
            if hasattr(fx, "enable_for_render"):
                fx.enable_for_render = True
            return ng

        # Blender 5.0-5.2: Scene.compositing_node_group
        if bpy.app.version >= (5, 0, 0) and hasattr(scene, "compositing_node_group"):
            ng = bpy.data.node_groups.new("DSH_Compositor_Glare", "CompositorNodeTree")
            if hasattr(ng, "interface"):
                ng.interface.new_socket(name="Image", in_out="OUTPUT", socket_type="NodeSocketColor")
            n_rl = ng.nodes.new("CompositorNodeRLayers")
            n_rl.location = (-300, 0)
            n_glare = ng.nodes.new("CompositorNodeGlare")
            n_glare.location = (0, 0)
            _configure_glare_node(n_glare)
            n_out = ng.nodes.new("NodeGroupOutput")
            n_out.location = (300, 0)
            ng.links.new(n_rl.outputs["Image"], n_glare.inputs["Image"])
            ng.links.new(n_glare.outputs["Image"], n_out.inputs["Image"])
            scene.compositing_node_group = ng
            return ng

        # Blender 3.6-4.x: Scene.use_nodes + Scene.node_tree
        scene.use_nodes = True
        nt = scene.node_tree
        nt.nodes.clear()
        n_rl = nt.nodes.new("CompositorNodeRLayers")
        n_rl.location = (-300, 0)
        n_glare = nt.nodes.new("CompositorNodeGlare")
        n_glare.location = (0, 0)
        _configure_glare_node(n_glare)
        n_comp = nt.nodes.new("CompositorNodeComposite")
        n_comp.location = (300, 0)
        nt.links.new(n_rl.outputs["Image"], n_glare.inputs["Image"])
        nt.links.new(n_glare.outputs["Image"], n_comp.inputs["Image"])
        return nt
    except Exception as exc:
        print("[dsh-blender-studio] Compositor setup skipped:", exc)
        return None


def dsh_add_dof(cam, target_obj, fstop=4.0):
    if cam is None or getattr(cam, "data", None) is None:
        return None
    dof = cam.data.dof
    dof.use_dof = True
    dof.aperture_fstop = float(fstop)
    if isinstance(target_obj, bpy.types.Object):
        dof.focus_object = target_obj
    elif isinstance(target_obj, (list, tuple, Vector)):
        dof.focus_object = None
        dof.focus_distance = max(0.1, (Vector(target_obj) - cam.location).length)
    return dof


# --- DSH_KIT v2: 8 Advanced Hard-Surface, Metallurgy & Clay-QC Helpers ---


def dsh_loft_profile(name, sections, mat=None, closed=False, cap_ends=True, collection="DSH_Hero"):
    rings = [list(sec) for sec in (sections or []) if len(sec) >= 3]
    if len(rings) < 2:
        obj = dsh_make_mesh_box(name, size=(0.5, 0.5, 0.5), bevel_width=0.02, collection=collection)
        if mat is not None:
            dsh_assign_material(obj, mat)
        return obj
    ring_len = min(len(r) for r in rings)
    bm = bmesh.new()
    bm_rings = []
    for sec in rings:
        row = []
        for idx in range(ring_len):
            pt = sec[idx]
            row.append(bm.verts.new((float(pt[0]), float(pt[1]), float(pt[2]))))
        bm_rings.append(row)
    bm.verts.ensure_lookup_table()
    num_rings = len(bm_rings)
    span = num_rings if closed else num_rings - 1
    for ri in range(span):
        r0 = bm_rings[ri]
        r1 = bm_rings[(ri + 1) % num_rings]
        for vi in range(ring_len):
            vn = (vi + 1) % ring_len
            try:
                bm.faces.new((r0[vi], r0[vn], r1[vn], r1[vi]))
            except ValueError:
                pass
    if cap_ends and not closed:
        try:
            bm.faces.new(list(reversed(bm_rings[0])))
        except ValueError:
            pass
        try:
            bm.faces.new(list(bm_rings[-1]))
        except ValueError:
            pass
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    dsh_set_smooth(mesh, True)
    obj = bpy.data.objects.new(name, mesh)
    dsh_link_object(obj, collection)
    if mat is not None:
        dsh_assign_material(obj, mat)
    return obj


def dsh_bolt_ring(
    name,
    radius,
    count=12,
    bolt_radius=0.02,
    bolt_height=0.025,
    axis="Z",
    center=(0.0, 0.0, 0.0),
    mat=None,
    collection="DSH_Hero",
):
    n = max(3, int(count))
    r = max(0.01, float(radius))
    br = max(0.002, float(bolt_radius))
    bh = max(0.002, float(bolt_height))
    ax = str(axis or "Z").upper()
    if ax not in ("X", "Y", "Z"):
        ax = "Z"
    c = Vector(center)
    if ax == "X":
        align_rot = Matrix.Rotation(math.radians(90.0), 4, "Y")
    elif ax == "Y":
        align_rot = Matrix.Rotation(math.radians(-90.0), 4, "X")
    else:
        align_rot = Matrix.Identity(4)

    bm = bmesh.new()
    for i in range(n):
        ang = 2.0 * math.pi * (i / float(n))
        if ax == "X":
            pos = Vector((c.x, c.y + r * math.cos(ang), c.z + r * math.sin(ang)))
        elif ax == "Y":
            pos = Vector((c.x + r * math.cos(ang), c.y, c.z + r * math.sin(ang)))
        else:
            pos = Vector((c.x + r * math.cos(ang), c.y + r * math.sin(ang), c.z))
        xf_base = Matrix.Translation(pos) @ align_rot
        # Flange washer collar
        bmesh.ops.create_cone(
            bm,
            cap_ends=True,
            cap_tris=False,
            segments=12,
            radius1=br * 1.28,
            radius2=br * 1.22,
            depth=bh * 0.28,
            matrix=xf_base @ Matrix.Translation((0.0, 0.0, bh * 0.14)),
        )
        # 6-sided precision hex head with slight top taper
        bmesh.ops.create_cone(
            bm,
            cap_ends=True,
            cap_tris=False,
            segments=6,
            radius1=br,
            radius2=br * 0.90,
            depth=bh * 0.72,
            matrix=xf_base @ Matrix.Translation((0.0, 0.0, bh * 0.64)) @ Matrix.Rotation(ang, 4, "Z"),
        )
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    dsh_set_smooth(mesh, False)
    obj = bpy.data.objects.new(name, mesh)
    dsh_link_object(obj, collection)
    if mat is None:
        mat = dsh_mat_brushed_metal(f"{name}_Steel", (0.76, 0.79, 0.84), roughness=0.22)
    dsh_assign_material(obj, mat)
    return obj


def dsh_wheel_assembly(
    name,
    radius=0.35,
    width=0.28,
    spokes=10,
    tire_mat=None,
    rim_mat=None,
    caliper_color="#f59e0b",
    location=(0.0, 0.0, 0.0),
    collection="DSH_Hero",
):
    r = max(0.08, float(radius))
    w = max(0.05, float(width))
    n_spokes = max(3, int(spokes))
    mat_tire = tire_mat or dsh_mat_rubber_tire(f"{name}_TireMat")
    mat_rim = rim_mat or dsh_mat_brushed_metal(f"{name}_RimMat", (0.78, 0.80, 0.84), roughness=0.20)
    mat_disc = dsh_mat_brushed_metal(f"{name}_DiscMat", (0.58, 0.60, 0.64), roughness=0.32)
    mat_caliper = dsh_mat_car_paint(f"{name}_CaliperMat", caliper_color, metallic=0.65, clearcoat=0.9)

    root = bpy.data.objects.new(name, None)
    root.empty_display_type = "PLAIN_AXES"
    root.location = Vector(location)
    dsh_link_object(root, collection)

    def _attach(child):
        child.parent = root
        return child

    # 1. Revolved rounded-shoulder motorsport tire (axle along X)
    bm_t = bmesh.new()
    rin = r * 0.63
    hw = w * 0.5
    profile = [
        (-hw * 0.90, rin),
        (-hw, rin + (r - rin) * 0.30),
        (-hw, rin + (r - rin) * 0.78),
        (-hw * 0.84, r),
        (hw * 0.84, r),
        (hw, rin + (r - rin) * 0.78),
        (hw, rin + (r - rin) * 0.30),
        (hw * 0.90, rin),
    ]
    segs = 48
    rings = []
    for si in range(segs):
        ang = 2.0 * math.pi * (si / float(segs))
        ca, sa = math.cos(ang), math.sin(ang)
        rings.append([bm_t.verts.new((px, pr * ca, pr * sa)) for px, pr in profile])
    plen = len(profile)
    for si in range(segs):
        r0 = rings[si]
        r1 = rings[(si + 1) % segs]
        for pi in range(plen):
            pn = (pi + 1) % plen
            bm_t.faces.new((r0[pi], r0[pn], r1[pn], r1[pi]))
    bmesh.ops.recalc_face_normals(bm_t, faces=list(bm_t.faces))
    m_tire = bpy.data.meshes.new(name + "_Tire_Mesh")
    bm_t.to_mesh(m_tire)
    bm_t.free()
    dsh_set_smooth(m_tire, True)
    o_tire = bpy.data.objects.new(name + "_Tire", m_tire)
    dsh_link_object(o_tire, collection)
    dsh_assign_material(o_tire, mat_tire)
    _attach(o_tire)

    # 2. Forged multi-spoke rim + barrel + center-lock hub (single merged mesh)
    bm_r = bmesh.new()
    rot_x = Matrix.Rotation(math.radians(90.0), 4, "Y")
    bmesh.ops.create_cone(
        bm_r, cap_ends=True, cap_tris=False, segments=36,
        radius1=rin * 1.01, radius2=rin * 1.01, depth=w * 0.76, matrix=rot_x,
    )
    bmesh.ops.create_cone(
        bm_r, cap_ends=True, cap_tris=False, segments=24,
        radius1=r * 0.17, radius2=r * 0.14, depth=w * 0.86, matrix=rot_x,
    )
    spoke_len = rin * 0.86
    for si in range(n_spokes):
        ang = 2.0 * math.pi * (si / float(n_spokes))
        spoke_xf = (
            Matrix.Translation((hw * 0.44, math.cos(ang) * (spoke_len * 0.5), math.sin(ang) * (spoke_len * 0.5)))
            @ Matrix.Rotation(ang, 4, "X")
        )
        bmesh.ops.create_cube(bm_r, size=1.0, matrix=spoke_xf @ Matrix.Diagonal((w * 0.16, spoke_len, r * 0.062, 1.0)))
    bmesh.ops.recalc_face_normals(bm_r, faces=list(bm_r.faces))
    m_rim = bpy.data.meshes.new(name + "_Rim_Mesh")
    bm_r.to_mesh(m_rim)
    bm_r.free()
    dsh_set_smooth(m_rim, True)
    o_rim = bpy.data.objects.new(name + "_Rim", m_rim)
    dsh_link_object(o_rim, collection)
    dsh_assign_material(o_rim, mat_rim)
    _attach(o_rim)

    # 3. Ventilated brake rotor disc
    bm_d = bmesh.new()
    bmesh.ops.create_cone(
        bm_d, cap_ends=True, cap_tris=False, segments=36,
        radius1=r * 0.50, radius2=r * 0.50, depth=w * 0.12,
        matrix=Matrix.Translation((hw * 0.14, 0.0, 0.0)) @ rot_x,
    )
    m_disc = bpy.data.meshes.new(name + "_BrakeDisc_Mesh")
    bm_d.to_mesh(m_disc)
    bm_d.free()
    dsh_set_smooth(m_disc, True)
    o_disc = bpy.data.objects.new(name + "_BrakeDisc", m_disc)
    dsh_link_object(o_disc, collection)
    dsh_assign_material(o_disc, mat_disc)
    _attach(o_disc)

    # 4. Painted performance brake caliper
    o_cal = dsh_make_mesh_box(
        name + "_Caliper",
        size=(w * 0.24, r * 0.24, r * 0.36),
        location=(hw * 0.20, -r * 0.38, r * 0.16),
        bevel_width=r * 0.022,
        collection=collection,
    )
    dsh_assign_material(o_cal, mat_caliper)
    _attach(o_cal)
    return root


def dsh_louver_panel(
    name,
    width=0.6,
    height=0.25,
    slots=6,
    depth=0.04,
    mat=None,
    location=(0.0, 0.0, 0.0),
    collection="DSH_Hero",
):
    w = max(0.06, float(width))
    h = max(0.04, float(height))
    d = max(0.01, float(depth))
    n = max(2, int(slots))
    frame_t = min(w, h) * 0.08
    bm = bmesh.new()

    # Recessed outer perimeter frame (top, bottom, left, right rails)
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0.0, 0.0, h * 0.5 - frame_t * 0.5)) @ Matrix.Diagonal((w, d, frame_t, 1.0)))
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0.0, 0.0, -h * 0.5 + frame_t * 0.5)) @ Matrix.Diagonal((w, d, frame_t, 1.0)))
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((-w * 0.5 + frame_t * 0.5, 0.0, 0.0)) @ Matrix.Diagonal((frame_t, d, h, 1.0)))
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((w * 0.5 - frame_t * 0.5, 0.0, 0.0)) @ Matrix.Diagonal((frame_t, d, h, 1.0)))
    # Dark backing plate
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((0.0, d * 0.42, 0.0)) @ Matrix.Diagonal((w - frame_t, d * 0.16, h - frame_t, 1.0)))

    # Angled cooling louver slats
    inner_w = max(0.02, w - frame_t * 2.1)
    inner_h = max(0.02, h - frame_t * 2.2)
    slat_t = max(0.004, min(d * 0.25, inner_h / (n * 3.2)))
    for i in range(n):
        frac = (i + 0.5) / float(n) - 0.5
        sz = frac * inner_h
        slat_xf = (
            Matrix.Translation((0.0, -d * 0.05, sz))
            @ Matrix.Rotation(math.radians(32.0), 4, "X")
            @ Matrix.Diagonal((inner_w, d * 0.85, slat_t, 1.0))
        )
        bmesh.ops.create_cube(bm, size=1.0, matrix=slat_xf)

    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    dsh_set_smooth(mesh, False)
    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(location)
    dsh_link_object(obj, collection)
    if mat is None:
        mat = dsh_mat_carbon_fiber(f"{name}_Mat")
    dsh_assign_material(obj, mat)
    return obj


def dsh_mat_anodized_metal(name, color="#1d4ed8", roughness=0.22):
    rgba = dsh_coerce_rgba(color)
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.location = (-360, 140)
    lw.inputs["Blend"].default_value = 0.22
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (-120, 140)
    ramp.color_ramp.elements[0].position = 0.05
    ramp.color_ramp.elements[0].color = rgba
    ramp.color_ramp.elements[1].position = 0.90
    ramp.color_ramp.elements[1].color = (
        min(1.0, rgba[0] * 1.25 + 0.04),
        min(1.0, rgba[1] * 1.25 + 0.04),
        min(1.0, rgba[2] * 1.25 + 0.04),
        1.0,
    )
    nt.links.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])

    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-560, -120)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-340, -120)
    noise.inputs["Scale"].default_value = 220.0
    noise.inputs["Detail"].default_value = 5.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-80, -120)
    bump.inputs["Strength"].default_value = 0.03
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    if "Normal" in bsdf.inputs:
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    dsh_set_bsdf(bsdf, ["Metallic"], 0.92)
    dsh_set_bsdf(bsdf, ["Roughness"], float(roughness))
    dsh_set_bsdf(bsdf, ["Anisotropic"], 0.45)
    dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.25)
    dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.08)
    return mat


def dsh_mat_heat_blued_titanium(name="Mat_Heat_Blued_Titanium"):
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-740, 80)
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.location = (-340, 140)
    wave.inputs["Scale"].default_value = 1.6
    wave.inputs["Distortion"].default_value = 2.4
    wave.inputs["Detail"].default_value = 3.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (-100, 140)
    cr = ramp.color_ramp
    cr.elements[0].position = 0.05
    cr.elements[0].color = (0.58, 0.56, 0.54, 1.0)  # raw brushed titanium
    cr.elements[1].position = 0.34
    cr.elements[1].color = (0.76, 0.54, 0.22, 1.0)  # straw gold heat tint
    e_violet = cr.elements.new(0.62)
    e_violet.color = (0.34, 0.16, 0.58, 1.0)        # purple oxidation band
    e_blue = cr.elements.new(0.86)
    e_blue.color = (0.09, 0.30, 0.82, 1.0)          # cobalt heat-blue band

    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-340, -140)
    noise.inputs["Scale"].default_value = 85.0
    noise.inputs["Detail"].default_value = 5.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-80, -140)
    bump.inputs["Strength"].default_value = 0.04

    nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    if "Normal" in bsdf.inputs:
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    dsh_set_bsdf(bsdf, ["Metallic"], 0.96)
    dsh_set_bsdf(bsdf, ["Roughness"], 0.20)
    dsh_set_bsdf(bsdf, ["Anisotropic"], 0.55)
    dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.45)
    dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.06)
    return mat


def dsh_mat_copper_gold(name, variant="copper", roughness=0.22):
    v = str(variant or "copper").strip().lower()
    if v == "gold":
        rgba = (0.94, 0.72, 0.24, 1.0)
    elif v == "brass":
        rgba = (0.82, 0.66, 0.30, 1.0)
    else:
        rgba = (0.85, 0.42, 0.22, 1.0)
    mat, nt, bsdf = _dsh_new_pbr_mat(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.location = (-560, -120)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-340, -120)
    noise.inputs["Scale"].default_value = 110.0
    noise.inputs["Detail"].default_value = 5.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (-80, -120)
    bump.inputs["Strength"].default_value = 0.035
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    if "Normal" in bsdf.inputs:
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    dsh_set_bsdf(bsdf, ["Base Color"], rgba)
    dsh_set_bsdf(bsdf, ["Metallic"], 0.97)
    dsh_set_bsdf(bsdf, ["Roughness"], float(roughness))
    dsh_set_bsdf(bsdf, ["Anisotropic"], 0.35)
    dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.80)
    return mat


def dsh_render_clay_override(enable=True, color=(0.76, 0.77, 0.79, 1.0)):
    vl = bpy.context.view_layer
    if not enable:
        if hasattr(vl, "material_override"):
            vl.material_override = None
        return None
    rgba = dsh_coerce_rgba(color)
    mat = bpy.data.materials.get("DSH_Clay_Override")
    if mat is None:
        mat, nt, bsdf = _dsh_new_pbr_mat("DSH_Clay_Override")
        # Cycles OPTIX/CUDA/CPU & EEVEE-safe studio sculpt clay (avoids ShaderNodeAmbientOcclusion GPU hangs)
        try:
            lw = nt.nodes.new("ShaderNodeLayerWeight")
            lw.location = (-360, 120)
            lw.inputs["Blend"].default_value = 0.30
            ramp = nt.nodes.new("ShaderNodeValToRGB")
            ramp.location = (-120, 120)
            ramp.color_ramp.elements[0].position = 0.08
            ramp.color_ramp.elements[0].color = (
                max(0.0, rgba[0] * 0.84),
                max(0.0, rgba[1] * 0.85),
                max(0.0, rgba[2] * 0.88),
                1.0,
            )
            ramp.color_ramp.elements[1].position = 0.92
            ramp.color_ramp.elements[1].color = (
                min(1.0, rgba[0] * 1.06),
                min(1.0, rgba[1] * 1.07),
                min(1.0, rgba[2] * 1.08),
                1.0,
            )
            nt.links.new(lw.outputs["Facing"], ramp.inputs["Fac"])
            nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
        except Exception:
            dsh_set_bsdf(bsdf, ["Base Color"], rgba)
        dsh_set_bsdf(bsdf, ["Metallic"], 0.0)
        dsh_set_bsdf(bsdf, ["Roughness"], 0.72)
        dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.30)
        dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.08)
        dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.35)
    if hasattr(vl, "material_override"):
        vl.material_override = mat
    return mat


def dsh_enforce_render_profile(scene):
    engine_name = str(DSH_PROJECT.get("engine", "EEVEE")).upper()
    samples = int(DSH_PROJECT.get("samples", 32))
    valid_engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
    if engine_name == "EEVEE":
        scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in valid_engines else "BLENDER_EEVEE"
        if hasattr(scene, "eevee"):
            if hasattr(scene.eevee, "taa_render_samples"):
                scene.eevee.taa_render_samples = samples
            if hasattr(scene.eevee, "use_raytracing"):
                scene.eevee.use_raytracing = True
    elif engine_name == "CYCLES":
        scene.render.engine = "CYCLES"
        if hasattr(scene, "cycles"):
            scene.cycles.samples = samples
            if hasattr(scene.cycles, "use_adaptive_sampling"):
                scene.cycles.use_adaptive_sampling = True
            if hasattr(scene.cycles, "use_denoising"):
                scene.cycles.use_denoising = True
            dsh_configure_cycles_device(scene, DSH_PROJECT.get("computeDevice", "auto"))
    else:
        scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = int(DSH_PROJECT["width"])
    scene.render.resolution_y = int(DSH_PROJECT["height"])
    scene.render.resolution_percentage = 100


def dsh_apply_lookdev_overrides():
    scene = bpy.context.scene
    if bool(DSH_PROJECT.get("enforceRenderProfile", False)):
        dsh_enforce_render_profile(scene)
    if str(DSH_PROJECT.get("computeDevice", "auto")).strip().lower() == "cpu" and scene.render.engine == "CYCLES":
        dsh_configure_cycles_device(scene, "cpu")
    exp = float(DSH_OVERRIDES.get("exposure", 0.0))
    if abs(exp) > 1e-4:
        try:
            scene.view_settings.exposure = exp
        except Exception:
            pass
    if bool(DSH_OVERRIDES.get("transparentBg", False)):
        scene.render.film_transparent = True
        scene.render.image_settings.color_mode = "RGBA"
        _all_r = [o for o in bpy.data.objects if o.type in ("MESH", "FONT", "CURVE", "GPENCIL", "GREASEPENCIL")]
        _has_hero = any(not dsh_is_backdrop_object(o) for o in _all_r)
        if _has_hero:
            for _obj in _all_r:
                if dsh_is_backdrop_object(_obj):
                    _obj.hide_render = True
    lens = float(DSH_OVERRIDES.get("lensMm", 50.0))
    if abs(lens - 50.0) > 1e-3 and scene.camera is not None and getattr(scene.camera, "data", None) is not None:
        if getattr(scene.camera.data, "type", "PERSP") == "PERSP":
            scene.camera.data.lens = lens
    if bool(DSH_OVERRIDES.get("clayMode", False)):
        dsh_render_clay_override(True)


def dsh_install_render_progress_hook():
    handlers = getattr(getattr(bpy.app, "handlers", None), "render_stats", None)
    if handlers is None:
        return
    for fn in list(handlers):
        if getattr(fn, "_dsh_progress_hook", False):
            handlers.remove(fn)
    if bpy.app.version < (5, 0, 0):
        return
    import re as _re
    _sample_re = _re.compile(
        r"(?:\\bSample\\s+(\\d+)\\s*/\\s*(\\d+)|\\bRendering\\s+(\\d+)\\s*/\\s*(\\d+)\\s+samples)",
        _re.IGNORECASE,
    )
    _state = {"last_key": None, "last_bucket": -1, "last_done": -1, "last_frame": None}

    def _on_render_stats(*args):
        stat = next((a for a in args if isinstance(a, str) and a.strip()), "")
        if not stat:
            return
        if "Finished" in stat or stat.startswith("Time:"):
            _state["last_key"] = None
            _state["last_bucket"] = -1
            _state["last_done"] = -1
            return
        scene = getattr(bpy.context, "scene", None)
        frame = int(getattr(scene, "frame_current", 1)) if scene is not None else 1
        m = _sample_re.search(stat)
        if m:
            done = int(m.group(1) or m.group(3))
            total = max(1, int(m.group(2) or m.group(4)))
            if _state["last_frame"] != frame or done < _state["last_done"]:
                _state["last_frame"] = frame
                _state["last_bucket"] = -1
            bucket = int((done * 16) // total)
            if done < total and done > 1 and bucket <= _state["last_bucket"]:
                _state["last_done"] = done
                return
            _state["last_bucket"] = bucket
            _state["last_done"] = done
            key = ("sample", frame, done, total)
        elif "Denoising" in stat:
            key = ("denoise", frame)
        elif "Compositing" in stat:
            key = ("comp", frame)
        else:
            return
        if key == _state["last_key"]:
            return
        _state["last_key"] = key
        print(f"Fra:{frame} | {stat}", flush=True)

    _on_render_stats._dsh_progress_hook = True
    handlers.append(_on_render_stats)


def dsh_load_texture_image(asset_or_name=None):
    if not DSH_ASSETS_DIR:
        return None
    target = None
    if isinstance(asset_or_name, dict):
        target = asset_or_name
    elif isinstance(asset_or_name, str) and asset_or_name:
        target = next((a for a in DSH_ASSETS if a.get("name") == asset_or_name or a.get("file") == asset_or_name), None)
    else:
        target = next((a for a in DSH_ASSETS if a.get("kind") == "texture"), None)
    if not target:
        return None
    full_path = os.path.join(DSH_ASSETS_DIR, target["file"])
    if not os.path.isfile(full_path):
        return None
    try:
        return bpy.data.images.load(full_path, check_existing=True)
    except Exception as exc:
        print("[dsh-blender-studio] Texture load warning:", target.get("name"), exc)
        return None


def dsh_apply_uploaded_texture(mat, asset_or_name=None, mix_factor=0.72):
    img = dsh_load_texture_image(asset_or_name)
    if img is None or mat is None or mat.node_tree is None:
        return False
    nt = mat.node_tree
    bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None or "Base Color" not in bsdf.inputs:
        return False
    try:
        tex_coord = nt.nodes.new("ShaderNodeTexCoord")
        tex_coord.location = (-560, 120)
        tex_node = nt.nodes.new("ShaderNodeTexImage")
        tex_node.location = (-340, 120)
        tex_node.image = img
        if hasattr(tex_node, "projection"):
            tex_node.projection = "BOX"
        if hasattr(tex_node, "projection_blend"):
            tex_node.projection_blend = 0.25
        nt.links.new(tex_coord.outputs["Generated"], tex_node.inputs["Vector"])
        nt.links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
        return True
    except Exception as exc:
        print("[dsh-blender-studio] Texture wire warning:", exc)
        return False


def dsh_import_model_asset(asset_entry):
    if not DSH_ASSETS_DIR:
        return False
    full_path = os.path.join(DSH_ASSETS_DIR, asset_entry["file"])
    if not os.path.isfile(full_path):
        return False
    ext = str(asset_entry.get("ext", "")).lower().lstrip(".")
    try:
        if ext in ("glb", "gltf"):
            bpy.ops.import_scene.gltf(filepath=full_path)
            return True
        if ext == "obj":
            if hasattr(bpy.ops.wm, "obj_import"):
                bpy.ops.wm.obj_import(filepath=full_path)
            else:
                bpy.ops.import_scene.obj(filepath=full_path)
            return True
        if ext == "fbx":
            bpy.ops.import_scene.fbx(filepath=full_path)
            return True
        if ext == "stl":
            if hasattr(bpy.ops.wm, "stl_import"):
                bpy.ops.wm.stl_import(filepath=full_path)
            else:
                bpy.ops.import_mesh.stl(filepath=full_path)
            return True
    except Exception as exc:
        print("[dsh-blender-studio] Asset import warning:", asset_entry.get("name"), exc)
    return False


def dsh_auto_place_uploaded_models(pedestal_top_z=0.0, target_size=1.6, replace_names=None, default_mat=None):
    model_assets = [a for a in DSH_ASSETS if a.get("kind") == "model"]
    if not model_assets or not DSH_ASSETS_DIR:
        return []
    before = set(bpy.data.objects)
    imported_count = 0
    for asset in model_assets:
        if dsh_import_model_asset(asset):
            imported_count += 1
    if imported_count == 0:
        return []
    bpy.context.view_layer.update()
    added = [o for o in bpy.data.objects if o not in before]
    mesh_added = [o for o in added if o.type == "MESH" and o.data is not None]
    if not added:
        return []

    # Remove template placeholder meshes only once a real uploaded 3D model is present
    if replace_names:
        for name in replace_names:
            old = bpy.data.objects.get(name)
            if old is not None and old not in added:
                bpy.data.objects.remove(old, do_unlink=True)

    # Ensure untextured imported meshes (e.g. STL/OBJ) receive a clean PBR material
    if default_mat is not None:
        for mobj in mesh_added:
            if len(mobj.data.materials) == 0:
                dsh_assign_material(mobj, default_mat)

    # Normalize scale and ground cleanly onto pedestal_top_z
    bounds_objs = mesh_added if mesh_added else added
    xs, ys, zs = [], [], []
    for o in bounds_objs:
        for corner in o.bound_box:
            wc = o.matrix_world @ Vector(corner)
            xs.append(wc.x)
            ys.append(wc.y)
            zs.append(wc.z)
    if xs:
        span_x = max(xs) - min(xs)
        span_y = max(ys) - min(ys)
        span_z = max(zs) - min(zs)
        max_dim = max(span_x, span_y, span_z)
        scale_factor = (float(target_size) / max_dim) if max_dim > 1e-4 else 1.0
        cx = (min(xs) + max(xs)) * 0.5
        cy = (min(ys) + max(ys)) * 0.5
        min_z = min(zs)

        root = bpy.data.objects.new("DSH_Imported_Model_Root", None)
        dsh_link_object(root, "DSH_Hero")
        top_level = [o for o in added if o.parent is None or o.parent not in added]
        for o in top_level:
            world_mat = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = world_mat
        root.scale = Vector((scale_factor, scale_factor, scale_factor))
        root.location = Vector((-cx * scale_factor, -cy * scale_factor, float(pedestal_top_z) - min_z * scale_factor))
        bpy.context.view_layer.update()
    return added


def dsh_evaluate_scene_qc(objs, mesh_count, light_count, camera_count, total_polys):
    scene = bpy.context.scene
    bpy.context.view_layer.update()
    issues = []
    deduction = 0

    def add_issue(code, severity, message, penalty, obj_name=None):
        nonlocal deduction
        item = {"code": code, "severity": severity, "message": message}
        if obj_name:
            item["object"] = obj_name
        issues.append(item)
        deduction += penalty

    renderables = [o for o in objs if o.type in ("MESH", "FONT", "CURVE", "GPENCIL", "GREASEPENCIL", "SURFACE", "META")]
    if not renderables:
        add_issue("EMPTY_SCENE", "error", "场景缺少可见几何对象。", 50)

    if scene.camera is None or camera_count == 0:
        add_issue("NO_CAMERA", "error", "场景未配置主渲染相机。", 30)

    has_hdri = False
    if scene.world and scene.world.node_tree:
        has_hdri = any(n.type == "TEX_ENVIRONMENT" and getattr(n, "image", None) is not None for n in scene.world.node_tree.nodes)
    has_emissive = False
    for mat in bpy.data.materials:
        if mat.node_tree:
            for n in mat.node_tree.nodes:
                if n.type == "EMISSION":
                    has_emissive = True
                    break
                if n.type == "BSDF_PRINCIPLED" and "Emission Strength" in n.inputs:
                    try:
                        if float(n.inputs["Emission Strength"].default_value) > 0.1:
                            has_emissive = True
                            break
                    except Exception:
                        pass
        if has_emissive:
            break
    if light_count == 0 and not has_hdri and not has_emissive:
        add_issue("NO_LIGHTS", "warn", "场景未配置光源或 HDRI 环境光，渲染可能全黑。", 15)

    hero_meshes = [o for o in objs if o.type == "MESH" and o.data is not None and not dsh_is_backdrop_object(o)]
    unassigned_pen = 0
    flat_pen = 0
    for obj in hero_meshes:
        has_gn = any(m.type == "NODES" for m in obj.modifiers)
        has_mat = any(m is not None for m in obj.data.materials)
        if not has_mat and not has_gn:
            pen = 8 if unassigned_pen < 24 else 0
            unassigned_pen += pen
            add_issue("UNASSIGNED_MATERIAL", "warn", f"对象 {obj.name} 未绑定材质。", pen, obj.name)

        polys = obj.data.polygons
        has_polish_mod = any(m.type in ("BEVEL", "SUBSURF", "NODES", "SOLIDIFY") for m in obj.modifiers)
        if 0 < len(polys) <= 12 and not has_polish_mod and not any(p.use_smooth for p in polys):
            pen = 6 if flat_pen < 18 else 0
            flat_pen += pen
            add_issue("FLAT_UNBEVELED_PRIMITIVE", "warn", f"对象 {obj.name} 为未倒角低面平直几何体。", pen, obj.name)

    # Assembly-aware transitive 3D AABB grounding check (avoids false positives on vehicles/engines/stacked assemblies)
    all_meshes = [o for o in objs if o.type == "MESH" and o.data is not None]
    mesh_aabbs = {}
    for obj in all_meshes:
        try:
            corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
            xs = [c.x for c in corners]
            ys = [c.y for c in corners]
            zs = [c.z for c in corners]
            mesh_aabbs[obj] = (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))
        except Exception:
            pass

    grounded = set()
    for obj, box in mesh_aabbs.items():
        if dsh_is_backdrop_object(obj) or box[4] <= 0.35:
            grounded.add(obj)

    pad = 0.38
    changed = True
    while changed:
        changed = False
        for obj, b1 in mesh_aabbs.items():
            if obj in grounded:
                continue
            for gobj in list(grounded):
                b2 = mesh_aabbs.get(gobj)
                if not b2:
                    continue
                if (
                    b1[0] - pad <= b2[1] and b1[1] + pad >= b2[0]
                    and b1[2] - pad <= b2[3] and b1[3] + pad >= b2[2]
                    and b1[4] - pad <= b2[5] and b1[5] + pad >= b2[4]
                ):
                    grounded.add(obj)
                    changed = True
                    break

    aerial_tokens = (
        "halo", "ring", "sun", "light", "glow", "shelf", "wall", "roof", "rib",
        "canopy", "wing", "spoiler", "rotor", "blade", "mast", "tail", "fin",
        "manifold", "pipe", "nozzle", "nacelle", "wave", "ridge", "stream",
        "border", "paper", "water", "pool", "sculpture", "ribbon", "geonodes",
    )
    floating_pen = 0
    for obj in hero_meshes:
        if obj in grounded:
            continue
        lname = obj.name.lower()
        if any(tok in lname for tok in aerial_tokens):
            continue
        box = mesh_aabbs.get(obj)
        if box and box[4] > 0.35:
            pen = 10 if floating_pen < 20 else 0
            floating_pen += pen
            add_issue(
                "FLOATING_HERO",
                "warn",
                f"对象 {obj.name} 悬空离地约 {box[4]:.2f}m 且未接触主装配体。",
                pen,
                obj.name,
            )

    # Camera framing check via bpy_extras.object_utils.world_to_camera_view
    if scene.camera is not None and renderables:
        try:
            from bpy_extras.object_utils import world_to_camera_view
            cam = scene.camera
            hero_renderables = [o for o in renderables if not dsh_is_backdrop_object(o)] or renderables
            in_frame_count = 0
            off_frame_names = []
            for obj in hero_renderables:
                try:
                    pts = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
                    pts.append(sum(pts, Vector((0.0, 0.0, 0.0))) / max(1, len(pts)))
                    ndcs = [world_to_camera_view(scene, cam, pt) for pt in pts]
                    front_pts = [p for p in ndcs if p.z > 0.0]
                    if not front_pts:
                        off_frame_names.append(obj.name)
                        continue
                    min_x = min(p.x for p in front_pts)
                    max_x = max(p.x for p in front_pts)
                    min_y = min(p.y for p in front_pts)
                    max_y = max(p.y for p in front_pts)
                    if max_x >= 0.0 and min_x <= 1.0 and max_y >= 0.0 and min_y <= 1.0:
                        in_frame_count += 1
                    else:
                        off_frame_names.append(obj.name)
                except Exception:
                    in_frame_count += 1
            if in_frame_count == 0 and hero_renderables:
                add_issue("OFF_FRAME_HERO", "error", "所有主体对象均位于当前主相机取景范围之外。", 20)
            elif off_frame_names and len(hero_renderables) <= 12:
                for name in off_frame_names[:2]:
                    add_issue("OFF_FRAME_HERO", "warn", f"对象 {name} 完全位于主相机画面之外。", 10, name)
        except Exception:
            pass

    if scene.render.engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT") and total_polys > 500000:
        add_issue("HIGH_POLYCOUNT", "warn", f"EEVEE 场景总面数达 {total_polys}（>50 万），渲染可能较慢。", 10)
    elif scene.render.engine == "CYCLES" and total_polys > 1000000:
        add_issue("HIGH_POLYCOUNT", "info", f"Cycles 场景总面数达 {total_polys}（>100 万），建议关注内存占用。", 5)

    score = max(0, min(100, 100 - deduction))
    grade = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 55 else "D"
    return {"score": score, "grade": grade, "issues": issues}


def dsh_collect_scene_summary():
    scene = bpy.context.scene
    objs = list(bpy.data.objects)
    mesh_count = 0
    light_count = 0
    camera_count = 0
    total_polys = 0
    obj_summaries = []
    depsgraph = None
    if any(o.type == "MESH" and len(o.modifiers) > 0 for o in objs):
        try:
            depsgraph = bpy.context.evaluated_depsgraph_get()
        except Exception:
            depsgraph = None
    for idx, obj in enumerate(objs):
        otype = obj.type
        if otype == "MESH":
            mesh_count += 1
        elif otype == "LIGHT":
            light_count += 1
        elif otype == "CAMERA":
            camera_count += 1
        verts = 0
        polys = 0
        if otype == "MESH" and obj.data is not None:
            verts = len(obj.data.vertices)
            polys = len(obj.data.polygons)
            if depsgraph is not None and len(obj.modifiers) > 0:
                eval_obj = None
                try:
                    eval_obj = obj.evaluated_get(depsgraph)
                    eval_mesh = eval_obj.to_mesh()
                    if eval_mesh is not None:
                        verts = len(eval_mesh.vertices)
                        polys = len(eval_mesh.polygons)
                except Exception:
                    pass
                finally:
                    if eval_obj is not None:
                        try:
                            eval_obj.to_mesh_clear()
                        except Exception:
                            pass
            total_polys += polys
        if idx < 200:
            _rmode = getattr(obj, "rotation_mode", "XYZ")
            _reuler = None
            if _rmode == "QUATERNION":
                try:
                    _reuler = obj.rotation_quaternion.to_euler("XYZ")
                except Exception:
                    _reuler = None
            elif _rmode == "AXIS_ANGLE":
                try:
                    _reuler = obj.matrix_basis.to_euler("XYZ")
                except Exception:
                    _reuler = None
            if _reuler is None:
                _reuler = obj.rotation_euler
            entry = {
                "name": obj.name,
                "type": otype,
                "location": [round(float(obj.location.x), 4), round(float(obj.location.y), 4), round(float(obj.location.z), 4)],
                "rotationDeg": [round(math.degrees(float(a)), 2) for a in _reuler],
                "scale": [round(float(obj.scale.x), 4), round(float(obj.scale.y), 4), round(float(obj.scale.z), 4)],
                "dimensions": [round(float(obj.dimensions.x), 4), round(float(obj.dimensions.y), 4), round(float(obj.dimensions.z), 4)],
            }
            if otype == "MESH" and obj.data is not None:
                entry["vertices"] = verts
                entry["polygons"] = polys
                entry["materialCount"] = len(obj.data.materials)
            obj_summaries.append(entry)
    qc = dsh_evaluate_scene_qc(objs, mesh_count, light_count, camera_count, total_polys)
    return {
        "capturedAt": datetime.now(timezone.utc).isoformat(),
        "blenderVersion": bpy.app.version_string.split(" ")[0],
        "engine": scene.render.engine,
        "objectCount": len(objs),
        "meshCount": mesh_count,
        "lightCount": light_count,
        "cameraCount": camera_count,
        "totalPolygons": total_polys,
        "activeCamera": scene.camera.name if scene.camera else None,
        "materials": [m.name for m in bpy.data.materials][:120],
        "collections": [c.name for c in bpy.data.collections][:80],
        "objects": obj_summaries,
        "qc": qc,
    }


def dsh_emit_scene_summary():
    payload = dsh_collect_scene_summary()
    print(DSH_SCENE_JSON_MARKER + json.dumps(payload, ensure_ascii=False), flush=True)
    return payload
`
}

function buildTemplateBody(template: BlenderTemplateId): string {
  switch (template) {
    case 'product-studio':
      return `
def dsh_build_template():
    accent = dsh_hex_to_rgba(DSH_PROJECT["accentColor"])
    preset = DSH_PROJECT["materialPreset"]
    mat_stage = dsh_create_material("Mat_Studio_Stage", "clay_matte", (0.76, 0.78, 0.82, 1.0))
    mat_pedestal = dsh_create_material("Mat_Pedestal", "clay_matte", (0.18, 0.20, 0.24, 1.0))
    mat_hero = dsh_create_material("Mat_Hero_Body", preset, accent)
    mat_collar = dsh_create_material("Mat_Metal_Collar", "brushed_metal", (0.86, 0.88, 0.92, 1.0))
    mat_cap = dsh_create_material("Mat_Glass_Dome", "frosted_glass", (0.94, 0.96, 1.0, 1.0))
    mat_halo = dsh_create_material("Mat_Accent_Halo", "ceramic_gloss", accent, emission_strength=2.2)

    # Seamless 360-degree circular studio infinity cyclorama:
    # Generous 28m outer radius & 24m wall height keep all render_shots (35–135mm) comfortably inside,
    # while explicit inward normals + backfacing transparency prevent any camera occlusion even beyond 28m.
    if mat_stage.node_tree is not None:
        _snt = mat_stage.node_tree
        _sbsdf = next((n for n in _snt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        _sout = next((n for n in _snt.nodes if n.type == "OUTPUT_MATERIAL"), None)
        if _sbsdf is not None and _sout is not None:
            _sgeom = _snt.nodes.new("ShaderNodeNewGeometry")
            _sgeom.location = (80, 220)
            _strans = _snt.nodes.new("ShaderNodeBsdfTransparent")
            _strans.location = (80, -220)
            _smix = _snt.nodes.new("ShaderNodeMixShader")
            _smix.location = (280, 0)
            _snt.links.new(_sgeom.outputs["Backfacing"], _smix.inputs["Fac"])
            _snt.links.new(_sbsdf.outputs["BSDF"], _smix.inputs[1])
            _snt.links.new(_strans.outputs["BSDF"], _smix.inputs[2])
            _snt.links.new(_smix.outputs["Shader"], _sout.inputs["Surface"])
    if hasattr(mat_stage, "use_backface_culling"):
        mat_stage.use_backface_culling = True

    cyc_mesh = bpy.data.meshes.new("Studio_Backdrop_Mesh")
    cyc_bm = bmesh.new()
    cyc_rings = [(0.0, 0.0), (4.0, 0.0), (10.0, 0.0), (18.0, 0.0)]
    cove_r = 10.0
    cove_segs = 16
    for i in range(1, cove_segs + 1):
        ang = (math.pi * 0.5) * (i / float(cove_segs))
        cyc_rings.append((18.0 + cove_r * math.sin(ang), cove_r * (1.0 - math.cos(ang))))
    cyc_rings.append((18.0 + cove_r, 24.0))
    radial_segs = 64
    center_v = cyc_bm.verts.new((0.0, 0.0, 0.0))
    ring_verts = []
    for rad, rz in cyc_rings[1:]:
        ring = []
        for s in range(radial_segs):
            th = (2.0 * math.pi * s) / float(radial_segs)
            ring.append(cyc_bm.verts.new((rad * math.cos(th), rad * math.sin(th), rz)))
        ring_verts.append(ring)
    first_ring = ring_verts[0]
    for s in range(radial_segs):
        ns = (s + 1) % radial_segs
        cyc_bm.faces.new((center_v, first_ring[s], first_ring[ns]))
    for r_idx in range(len(ring_verts) - 1):
        r0 = ring_verts[r_idx]
        r1 = ring_verts[r_idx + 1]
        for s in range(radial_segs):
            ns = (s + 1) % radial_segs
            cyc_bm.faces.new((r0[s], r1[s], r1[ns], r0[ns]))
    cyc_bm.normal_update()
    cyc_bm.to_mesh(cyc_mesh)
    cyc_bm.free()
    dsh_set_smooth(cyc_mesh, True)
    backdrop = bpy.data.objects.new("Studio_Backdrop", cyc_mesh)
    dsh_link_object(backdrop, "DSH_Stage")
    dsh_assign_material(backdrop, mat_stage)

    # Stepped pedestal
    ped_base = dsh_make_mesh_cylinder("Pedestal_Base", radius1=1.65, radius2=1.55, depth=0.22, location=(0.0, 0.0, 0.11), bevel_width=0.03, collection="DSH_Stage")
    dsh_assign_material(ped_base, mat_pedestal)
    ped_top = dsh_make_mesh_cylinder("Pedestal_Top", radius1=1.22, radius2=1.18, depth=0.14, location=(0.0, 0.0, 0.29), bevel_width=0.025, collection="DSH_Stage")
    dsh_assign_material(ped_top, mat_collar)

    # Hero product silhouette
    body = dsh_make_mesh_cylinder("Product_Body", radius1=0.62, radius2=0.54, depth=1.35, location=(0.0, 0.0, 1.04), bevel_width=0.06, collection="DSH_Hero")
    dsh_assign_material(body, mat_hero)
    collar = dsh_make_mesh_cylinder("Product_Collar", radius1=0.44, radius2=0.44, depth=0.20, location=(0.0, 0.0, 1.81), bevel_width=0.02, collection="DSH_Hero")
    dsh_assign_material(collar, mat_collar)
    dome = dsh_make_mesh_sphere("Product_Dome", radius=0.42, location=(0.0, 0.0, 2.02), collection="DSH_Hero")
    dome.scale = Vector((1.0, 1.0, 0.72))
    dsh_assign_material(dome, mat_cap)
    halo = dsh_make_mesh_torus("Accent_Halo", major_radius=0.92, minor_radius=0.032, location=(0.0, 0.0, 1.18), collection="DSH_Hero")
    halo.rotation_euler = Euler((math.radians(18.0), math.radians(-14.0), 0.0), "XYZ")
    dsh_assign_material(halo, mat_halo)

    # Subtle accent rotation keyframes
    fs = int(DSH_PROJECT["frameStart"])
    fe = int(DSH_PROJECT["frameEnd"])
    halo.keyframe_insert(data_path="rotation_euler", frame=fs)
    halo.rotation_euler = Euler((math.radians(18.0), math.radians(-14.0), math.radians(180.0)), "XYZ")
    halo.keyframe_insert(data_path="rotation_euler", frame=fe)

    # Auto-wire uploaded image texture & 3D models cleanly onto the pedestal
    dsh_apply_uploaded_texture(mat_hero)
    dsh_auto_place_uploaded_models(
        pedestal_top_z=0.36,
        target_size=1.6,
        replace_names=["Product_Body", "Product_Collar", "Product_Dome"],
        default_mat=mat_hero,
    )

    dsh_setup_lighting(DSH_PROJECT["lightingPreset"], DSH_PROJECT["accentColor"])
    dsh_setup_camera(DSH_PROJECT["cameraPreset"], fs, fe, target=(0.0, 0.0, 1.15))
`

    case 'logo-3d':
      return `
def dsh_build_template():
    accent = dsh_hex_to_rgba(DSH_PROJECT["accentColor"])
    preset = DSH_PROJECT["materialPreset"]
    mat_plinth = dsh_create_material("Mat_Logo_Plinth", "clay_matte", (0.14, 0.16, 0.20, 1.0))
    mat_text = dsh_create_material("Mat_Logo_Text", preset, accent)
    mat_glow = dsh_create_material("Mat_Logo_Bar", "ceramic_gloss", accent, emission_strength=3.2)
    mat_floor = dsh_create_material("Mat_Logo_Floor", "ceramic_gloss", (0.10, 0.11, 0.14, 1.0))

    floor = dsh_make_mesh_box("Logo_Floor", size=(16.0, 16.0, 0.1), location=(0.0, 0.0, -0.05), collection="DSH_Stage")
    dsh_assign_material(floor, mat_floor)
    plinth = dsh_make_mesh_box("Logo_Plinth", size=(4.4, 1.35, 0.34), location=(0.0, 0.0, 0.17), bevel_width=0.05, collection="DSH_Stage")
    dsh_assign_material(plinth, mat_plinth)
    glow_bar = dsh_make_mesh_box("Logo_Glow_Bar", size=(4.0, 0.13, 0.08), location=(0.0, -0.63, 0.32), bevel_width=0.015, collection="DSH_Hero")
    dsh_assign_material(glow_bar, mat_glow)

    headline = str(DSH_PROJECT.get("headline") or DSH_PROJECT.get("title") or "DSH 3D").strip()
    font_curve = bpy.data.curves.new(name="DSH_Logo_Font", type="FONT")
    font_curve.body = headline[:32]
    font_curve.align_x = "CENTER"
    font_curve.align_y = "BOTTOM"
    font_curve.extrude = 0.16
    font_curve.bevel_depth = 0.025
    font_curve.bevel_resolution = 4
    font_curve.size = 1.08 if len(headline) <= 10 else 0.74
    text_obj = bpy.data.objects.new("Logo_Text_3D", font_curve)
    text_obj.location = Vector((0.0, 0.0, 0.42))
    text_obj.rotation_euler = Euler((math.radians(90.0), 0.0, 0.0), "XYZ")
    dsh_link_object(text_obj, "DSH_Hero")
    dsh_assign_material(text_obj, mat_text)

    # Framing ring behind logo sized to fit cleanly inside the viewport
    ring = dsh_make_mesh_torus("Logo_Halo_Ring", major_radius=1.24, minor_radius=0.04, location=(0.0, 0.55, 1.06), collection="DSH_Hero")
    ring.rotation_euler = Euler((math.radians(90.0), 0.0, 0.0), "XYZ")
    dsh_assign_material(ring, mat_glow)

    fs = int(DSH_PROJECT["frameStart"])
    fe = int(DSH_PROJECT["frameEnd"])
    text_obj.keyframe_insert(data_path="location", frame=fs)
    text_obj.location = Vector((0.0, 0.0, 0.56))
    text_obj.keyframe_insert(data_path="location", frame=fs + max(1, (fe - fs) // 2))
    text_obj.location = Vector((0.0, 0.0, 0.42))
    text_obj.keyframe_insert(data_path="location", frame=fe)

    dsh_setup_lighting(DSH_PROJECT["lightingPreset"], DSH_PROJECT["accentColor"])
    dsh_setup_camera(DSH_PROJECT["cameraPreset"], fs, fe, target=(0.0, 0.0, 1.04), distance_scale=1.22)
`

    case 'isometric-room':
      return `
def dsh_build_template():
    accent = dsh_hex_to_rgba(DSH_PROJECT["accentColor"])
    preset = DSH_PROJECT["materialPreset"]
    mat_wall = dsh_create_material("Mat_Room_Wall", "clay_matte", (0.86, 0.84, 0.80, 1.0))
    mat_floor = dsh_create_material("Mat_Room_Floor", "clay_matte", (0.58, 0.44, 0.30, 1.0))
    mat_desk = dsh_create_material("Mat_Desk_Wood", preset, (0.72, 0.56, 0.40, 1.0))
    mat_metal = dsh_create_material("Mat_Frame_Metal", "brushed_metal", (0.24, 0.26, 0.30, 1.0))
    mat_screen = dsh_create_material("Mat_Monitor_Glow", "ceramic_gloss", accent, emission_strength=2.6)
    mat_plant = dsh_create_material("Mat_Plant_Leaf", "clay_matte", (0.16, 0.52, 0.26, 1.0))
    mat_pot = dsh_create_material("Mat_Plant_Pot", "ceramic_gloss", accent)

    # Cutaway floor & two walls
    floor = dsh_make_mesh_box("Room_Floor", size=(4.4, 4.4, 0.22), location=(0.0, 0.0, 0.11), bevel_width=0.02, collection="DSH_Room")
    dsh_assign_material(floor, mat_floor)
    wall_back = dsh_make_mesh_box("Room_Wall_Back", size=(4.4, 0.20, 2.8), location=(0.0, 2.1, 1.5), bevel_width=0.02, collection="DSH_Room")
    dsh_assign_material(wall_back, mat_wall)
    wall_left = dsh_make_mesh_box("Room_Wall_Left", size=(0.20, 4.4, 2.8), location=(-2.1, 0.0, 1.5), bevel_width=0.02, collection="DSH_Room")
    dsh_assign_material(wall_left, mat_wall)

    # Studio desk
    desk_top = dsh_make_mesh_box("Desk_Top", size=(2.2, 0.95, 0.09), location=(0.15, 1.35, 0.95), bevel_width=0.015, collection="DSH_Furniture")
    dsh_assign_material(desk_top, mat_desk)
    for idx, (lx, ly) in enumerate([(-0.82, 0.96), (1.12, 0.96), (-0.82, 1.72), (1.12, 1.72)]):
        leg = dsh_make_mesh_box(f"Desk_Leg_{idx}", size=(0.08, 0.08, 0.72), location=(lx, ly, 0.58), bevel_width=0.008, collection="DSH_Furniture")
        dsh_assign_material(leg, mat_metal)

    # Glowing monitor + stand
    stand = dsh_make_mesh_box("Monitor_Stand", size=(0.18, 0.14, 0.26), location=(0.15, 1.56, 1.12), bevel_width=0.008, collection="DSH_Furniture")
    dsh_assign_material(stand, mat_metal)
    bezel = dsh_make_mesh_box("Monitor_Bezel", size=(1.18, 0.07, 0.68), location=(0.15, 1.52, 1.52), bevel_width=0.015, collection="DSH_Furniture")
    dsh_assign_material(bezel, mat_metal)
    screen = dsh_make_mesh_box("Monitor_Screen", size=(1.08, 0.02, 0.58), location=(0.15, 1.48, 1.52), bevel_width=0.004, collection="DSH_Furniture")
    dsh_assign_material(screen, mat_screen)

    # Chair
    seat = dsh_make_mesh_box("Chair_Seat", size=(0.62, 0.60, 0.10), location=(0.15, 0.25, 0.64), bevel_width=0.025, collection="DSH_Furniture")
    dsh_assign_material(seat, mat_pot)
    chair_base = dsh_make_mesh_cylinder("Chair_Base", radius1=0.28, radius2=0.08, depth=0.40, location=(0.15, 0.25, 0.42), collection="DSH_Furniture")
    dsh_assign_material(chair_base, mat_metal)

    # Geometric plant in corner
    pot = dsh_make_mesh_cylinder("Plant_Pot", radius1=0.22, radius2=0.28, depth=0.38, location=(-1.45, 1.45, 0.41), bevel_width=0.02, collection="DSH_Decor")
    dsh_assign_material(pot, mat_pot)
    foliage1 = dsh_make_mesh_sphere("Plant_Foliage_A", radius=0.32, location=(-1.45, 1.45, 0.86), collection="DSH_Decor")
    dsh_assign_material(foliage1, mat_plant)
    foliage2 = dsh_make_mesh_sphere("Plant_Foliage_B", radius=0.24, location=(-1.25, 1.35, 1.10), collection="DSH_Decor")
    dsh_assign_material(foliage2, mat_plant)

    # Wall shelf
    shelf = dsh_make_mesh_box("Wall_Shelf", size=(1.45, 0.30, 0.07), location=(-0.15, 1.85, 2.22), bevel_width=0.01, collection="DSH_Decor")
    dsh_assign_material(shelf, mat_desk)

    fs = int(DSH_PROJECT["frameStart"])
    fe = int(DSH_PROJECT["frameEnd"])
    dsh_setup_lighting(DSH_PROJECT["lightingPreset"], DSH_PROJECT["accentColor"])
    dsh_setup_camera(DSH_PROJECT["cameraPreset"], fs, fe, target=(0.0, 0.25, 1.12))
`

    case 'motion-data':
      return `
def dsh_build_template():
    accent = dsh_hex_to_rgba(DSH_PROJECT["accentColor"])
    preset = DSH_PROJECT["materialPreset"]
    mat_base = dsh_create_material("Mat_Data_Base", "clay_matte", (0.10, 0.12, 0.16, 1.0))
    mat_bar = dsh_create_material("Mat_Data_Bar", preset, accent)
    mat_ring = dsh_create_material("Mat_Data_Glow", "ceramic_gloss", accent, emission_strength=3.0)

    base = dsh_make_mesh_box("Data_Base_Plate", size=(5.2, 3.3, 0.18), location=(0.0, 0.0, 0.09), bevel_width=0.03, collection="DSH_Stage")
    dsh_assign_material(base, mat_base)

    heights = [
        [0.75, 1.25, 1.70, 1.15, 1.95, 1.40],
        [1.05, 1.85, 2.25, 1.55, 2.45, 1.75],
        [0.65, 1.15, 1.50, 2.10, 1.35, 0.95],
    ]
    fs = int(DSH_PROJECT["frameStart"])
    fe = int(DSH_PROJECT["frameEnd"])
    span = max(1, fe - fs)
    cap_thickness = 0.06

    for r_idx, row in enumerate(heights):
        for c_idx, target_h in enumerate(row):
            x = (c_idx - 2.5) * 0.78
            y = (r_idx - 1.0) * 0.86
            h0 = round(target_h, 4)
            h_peak = round(target_h * 1.22, 4)

            bar = dsh_make_mesh_box(
                f"Data_Bar_{r_idx}_{c_idx}",
                size=(0.46, 0.46, 1.0),
                location=(x, y, 0.18 + h0 * 0.5),
                bevel_width=0.025,
                collection="DSH_DataBars",
            )
            bar.scale = Vector((1.0, 1.0, h0))
            dsh_assign_material(bar, mat_bar)

            cap = dsh_make_mesh_box(
                f"Data_Cap_{r_idx}_{c_idx}",
                size=(0.48, 0.48, cap_thickness),
                location=(x, y, 0.18 + h0 + cap_thickness * 0.5),
                bevel_width=0.01,
                collection="DSH_DataBars",
            )
            dsh_assign_material(cap, mat_ring)

            # Expressive 3D heights at frameStart + smooth wave pulse with cap locked flush on top
            mid_k = fs + max(1, int(((c_idx * 0.07 + r_idx * 0.08 + 0.35) % 0.85) * span))
            bar.keyframe_insert(data_path="scale", frame=fs)
            bar.keyframe_insert(data_path="location", frame=fs)
            cap.keyframe_insert(data_path="location", frame=fs)

            bar.scale = Vector((1.0, 1.0, h_peak))
            bar.location = Vector((x, y, 0.18 + h_peak * 0.5))
            cap.location = Vector((x, y, 0.18 + h_peak + cap_thickness * 0.5))
            bar.keyframe_insert(data_path="scale", frame=mid_k)
            bar.keyframe_insert(data_path="location", frame=mid_k)
            cap.keyframe_insert(data_path="location", frame=mid_k)

            bar.scale = Vector((1.0, 1.0, h0))
            bar.location = Vector((x, y, 0.18 + h0 * 0.5))
            cap.location = Vector((x, y, 0.18 + h0 + cap_thickness * 0.5))
            bar.keyframe_insert(data_path="scale", frame=fe)
            bar.keyframe_insert(data_path="location", frame=fe)
            cap.keyframe_insert(data_path="location", frame=fe)

    dsh_setup_lighting(DSH_PROJECT["lightingPreset"], DSH_PROJECT["accentColor"])
    dsh_setup_camera(DSH_PROJECT["cameraPreset"], fs, fe, target=(0.0, 0.0, 1.08), distance_scale=1.35)
`

    case 'grease-pencil-2d':
      return `
def dsh_add_gp_stroke_2d(gp_data, layer_name, points, color_rgba, line_width=18, is_gpv3=False):
    mat = bpy.data.materials.new(name=f"GP_Mat_{layer_name}")
    if hasattr(bpy.data.materials, "create_gpencil_data"):
        bpy.data.materials.create_gpencil_data(mat)
    if getattr(mat, "grease_pencil", None) is not None:
        mat.grease_pencil.color = color_rgba
    gp_data.materials.append(mat)
    mat_index = len(gp_data.materials) - 1

    if is_gpv3:
        layer = gp_data.layers.new(layer_name)
        frame = layer.frames.new(int(DSH_PROJECT["frameStart"]))
        drawing = frame.drawing
        drawing.add_strokes([len(points)])
        stroke = drawing.strokes[-1]
        stroke.material_index = mat_index
        for idx, pt in enumerate(points):
            stroke.points[idx].position = Vector(pt)
            stroke.points[idx].radius = float(line_width) * 0.0018
    else:
        layer = gp_data.layers.new(layer_name, set_active=True)
        frame = layer.frames.new(int(DSH_PROJECT["frameStart"]))
        stroke = frame.strokes.new()
        stroke.display_mode = "3DSPACE"
        stroke.line_width = int(line_width)
        stroke.material_index = mat_index
        stroke.points.add(len(points))
        for idx, pt in enumerate(points):
            stroke.points[idx].co = Vector(pt)
            stroke.points[idx].strength = 1.0
            stroke.points[idx].pressure = 1.0


def dsh_build_template():
    accent = dsh_hex_to_rgba(DSH_PROJECT["accentColor"])
    mat_paper = dsh_create_material("Mat_Paper_Backdrop", "clay_matte", (0.97, 0.94, 0.87, 1.0), emission_strength=0.28)
    backdrop = dsh_make_mesh_box("GP_Paper_Card", size=(10.5, 0.08, 6.4), location=(0.0, 1.15, 1.45), collection="DSH_Stage")
    dsh_assign_material(backdrop, mat_paper)

    # Smooth 64–72 point curves framed cleanly inside X in [-2.15, 2.15], Z in [0.55, 2.30]
    frame_box = [
        (-2.15, 0.72, 0.56),
        (2.15, 0.72, 0.56),
        (2.15, 0.72, 2.34),
        (-2.15, 0.72, 2.34),
        (-2.15, 0.72, 0.56),
    ]
    sun_outer = [
        (1.18 + 0.36 * math.cos(2.0 * math.pi * i / 72), 0.48, 1.88 + 0.36 * math.sin(2.0 * math.pi * i / 72))
        for i in range(73)
    ]
    sun_inner = [
        (1.18 + 0.20 * math.cos(2.0 * math.pi * i / 64), 0.44, 1.88 + 0.20 * math.sin(2.0 * math.pi * i / 64))
        for i in range(65)
    ]
    wave_mid = [
        (
            -2.10 + 4.20 * (i / 64.0),
            0.14,
            1.28 + 0.26 * math.sin((-2.10 + 4.20 * (i / 64.0) + 0.7) * 1.45) + 0.08 * math.cos((-2.10 + 4.20 * (i / 64.0)) * 2.7),
        )
        for i in range(65)
    ]
    wave_front = [
        (
            -2.10 + 4.20 * (i / 64.0),
            -0.24,
            0.88 + 0.17 * math.cos((-2.10 + 4.20 * (i / 64.0) - 0.45) * 1.85),
        )
        for i in range(65)
    ]
    horizon_accent = [
        (
            -1.95 + 3.90 * (i / 64.0),
            -0.06,
            1.08 + 0.14 * math.sin((-1.95 + 3.90 * (i / 64.0) + 1.2) * 2.1),
        )
        for i in range(65)
    ]

    gp_created = False
    gp_obj = None
    gp_data = None
    try:
        has_v3_collection = hasattr(bpy.data, "grease_pencils_v3")
        is_gpv3 = has_v3_collection or (bpy.app.version >= (4, 3, 0))
        if has_v3_collection:
            gp_data = bpy.data.grease_pencils_v3.new("DSH_GP_Canvas")
        else:
            gp_data = bpy.data.grease_pencils.new("DSH_GP_Canvas")
        gp_obj = bpy.data.objects.new("DSH_GreasePencil_Stage", gp_data)
        dsh_link_object(gp_obj, "DSH_GreasePencil")
        dsh_add_gp_stroke_2d(gp_data, "Frame_Border", frame_box, (0.58, 0.55, 0.50, 1.0), line_width=10, is_gpv3=is_gpv3)
        dsh_add_gp_stroke_2d(gp_data, "Sun_Outer", sun_outer, accent, line_width=22, is_gpv3=is_gpv3)
        dsh_add_gp_stroke_2d(gp_data, "Sun_Inner", sun_inner, accent, line_width=14, is_gpv3=is_gpv3)
        dsh_add_gp_stroke_2d(gp_data, "Mid_Ridge", wave_mid, (0.20, 0.28, 0.42, 1.0), line_width=18, is_gpv3=is_gpv3)
        dsh_add_gp_stroke_2d(gp_data, "Accent_Stream", horizon_accent, accent, line_width=12, is_gpv3=is_gpv3)
        dsh_add_gp_stroke_2d(gp_data, "Front_Wave", wave_front, (0.07, 0.09, 0.14, 1.0), line_width=24, is_gpv3=is_gpv3)
        gp_created = True
    except Exception as exc:
        print("[dsh-blender-studio] Grease Pencil fallback to 2.5D ink curves:", exc)
        if gp_obj is not None:
            try:
                bpy.data.objects.remove(gp_obj, do_unlink=True)
            except Exception:
                pass
        if gp_data is not None:
            try:
                if hasattr(bpy.data, "grease_pencils_v3") and gp_data.name in bpy.data.grease_pencils_v3:
                    bpy.data.grease_pencils_v3.remove(gp_data)
                elif hasattr(bpy.data, "grease_pencils") and gp_data.name in bpy.data.grease_pencils:
                    bpy.data.grease_pencils.remove(gp_data)
            except Exception:
                pass

    if not gp_created:
        mat_ink = dsh_create_material("Mat_Ink_Fallback", "toon_cel", (0.08, 0.10, 0.15, 1.0))
        mat_sun = dsh_create_material("Mat_Sun_Fallback", "toon_cel", accent, emission_strength=1.4)
        for name, pts, mat in [("Wave_Front", wave_front, mat_ink), ("Wave_Mid", wave_mid, mat_ink), ("Sun_Ring", sun_outer, mat_sun)]:
            curve_data = bpy.data.curves.new(name=name + "_Curve", type="CURVE")
            curve_data.dimensions = "3D"
            curve_data.bevel_depth = 0.035
            spline = curve_data.splines.new("POLY")
            spline.points.add(len(pts) - 1)
            for i, p in enumerate(pts):
                spline.points[i].co = (p[0], p[1], p[2], 1.0)
            cobj = bpy.data.objects.new(name, curve_data)
            dsh_link_object(cobj, "DSH_GreasePencil")
            dsh_assign_material(cobj, mat)

    fs = int(DSH_PROJECT["frameStart"])
    fe = int(DSH_PROJECT["frameEnd"])
    dsh_setup_lighting(DSH_PROJECT["lightingPreset"], DSH_PROJECT["accentColor"])
    dsh_setup_camera(DSH_PROJECT["cameraPreset"], fs, fe, target=(0.0, 0.0, 1.45), distance_scale=1.12)
`

    case 'architectural-pavilion':
      return `
def dsh_make_arched_rib(name, x_pos, y_start=-1.95, y_end=2.25, base_z=2.15, arch_rise=0.95, thickness_x=0.11, thickness_z=0.14, segs=22, collection="DSH_Pavilion"):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    verts = []
    faces = []
    hx = thickness_x * 0.5
    hz = thickness_z * 0.5
    for i in range(segs + 1):
        t = i / float(segs)
        y = y_start + (y_end - y_start) * t
        z = base_z + arch_rise * math.sin(math.pi * t)
        # 4 corners of rib cross section at station i
        verts.append((x_pos - hx, y, z - hz))
        verts.append((x_pos + hx, y, z - hz))
        verts.append((x_pos + hx, y, z + hz))
        verts.append((x_pos - hx, y, z + hz))
    for i in range(segs):
        b0 = i * 4
        b1 = (i + 1) * 4
        faces.append((b0 + 0, b0 + 1, b1 + 1, b1 + 0))
        faces.append((b0 + 1, b0 + 2, b1 + 2, b1 + 1))
        faces.append((b0 + 2, b0 + 3, b1 + 3, b1 + 2))
        faces.append((b0 + 3, b0 + 0, b1 + 0, b1 + 3))
    faces.append((0, 3, 2, 1))
    last = segs * 4
    faces.append((last + 0, last + 1, last + 2, last + 3))
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    dsh_set_smooth(mesh, True)
    obj = bpy.data.objects.new(name, mesh)
    return dsh_link_object(obj, collection)


def dsh_build_template():
    accent = dsh_hex_to_rgba(DSH_PROJECT["accentColor"])
    preset = DSH_PROJECT["materialPreset"]
    mat_concrete = dsh_create_material("Mat_Pavilion_Concrete", preset, (0.84, 0.82, 0.78, 1.0))
    mat_travertine = dsh_create_material("Mat_Pavilion_Plinth", "clay_matte", (0.76, 0.73, 0.68, 1.0))
    mat_timber = dsh_create_material("Mat_Pavilion_Timber", "clay_matte", (0.56, 0.36, 0.20, 1.0))
    mat_bronze = dsh_create_material("Mat_Pavilion_Bronze", "brushed_metal", (0.16, 0.14, 0.13, 1.0))
    mat_water = dsh_create_material("Mat_Pavilion_Water", "ceramic_gloss", (0.04, 0.13, 0.18, 1.0))
    mat_totem = dsh_create_material("Mat_Pavilion_Totem", "ceramic_gloss", accent)
    mat_glow = dsh_create_material("Mat_Pavilion_WarmGlow", "ceramic_gloss", (1.0, 0.76, 0.42, 1.0), emission_strength=3.2)

    # Fine-tune water mirror reflectivity
    if mat_water.node_tree:
        wbsdf = next((n for n in mat_water.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if wbsdf:
            dsh_set_bsdf(wbsdf, ["Roughness"], 0.03)
            dsh_set_bsdf(wbsdf, ["Coat Weight", "Clearcoat"], 0.95)

    # Architectural courtyard plinth and ground deck
    ground = dsh_make_mesh_box("Studio_Ground", size=(20.0, 20.0, 0.12), location=(0.0, 0.0, -0.06), collection="DSH_Stage")
    dsh_assign_material(ground, mat_travertine)
    plinth_back = dsh_make_mesh_box("Pavilion_Terrace", size=(6.8, 3.6, 0.24), location=(0.0, 0.85, 0.12), bevel_width=0.025, collection="DSH_Pavilion")
    dsh_assign_material(plinth_back, mat_concrete)

    # Reflecting water pool basin in foreground + stepping stones
    pool_rim_front = dsh_make_mesh_box("Pavilion_Pool_Rim_Front", size=(6.8, 0.26, 0.22), location=(0.0, -2.55, 0.11), bevel_width=0.02, collection="DSH_Pavilion")
    pool_rim_left = dsh_make_mesh_box("Pavilion_Pool_Rim_Left", size=(0.26, 2.0, 0.22), location=(-3.27, -1.68, 0.11), bevel_width=0.02, collection="DSH_Pavilion")
    pool_rim_right = dsh_make_mesh_box("Pavilion_Pool_Rim_Right", size=(0.26, 2.0, 0.22), location=(3.27, -1.68, 0.11), bevel_width=0.02, collection="DSH_Pavilion")
    for rim in (pool_rim_front, pool_rim_left, pool_rim_right):
        dsh_assign_material(rim, mat_concrete)
    water = dsh_make_mesh_box("Pavilion_Water_Surface", size=(6.28, 1.54, 0.14), location=(0.0, -1.68, 0.09), bevel_width=0.01, collection="DSH_Pavilion")
    dsh_assign_material(water, mat_water)
    for idx, sy in enumerate((-2.15, -1.58, -1.02)):
        step = dsh_make_mesh_box(f"Pavilion_Step_{idx}", size=(1.15, 0.42, 0.22), location=(-1.45, sy, 0.12), bevel_width=0.02, collection="DSH_Pavilion")
        dsh_assign_material(step, mat_travertine)

    # Minimalist concrete L-walls + architectural interior warm cove glow
    wall_back = dsh_make_mesh_box("Pavilion_Wall_Back", size=(6.6, 0.26, 2.58), location=(0.0, 2.45, 1.52), bevel_width=0.025, collection="DSH_Pavilion")
    wall_left = dsh_make_mesh_box("Pavilion_Wall_Left", size=(0.26, 3.2, 2.58), location=(-3.17, 0.98, 1.52), bevel_width=0.025, collection="DSH_Pavilion")
    dsh_assign_material(wall_back, mat_concrete)
    dsh_assign_material(wall_left, mat_concrete)
    glow_cove = dsh_make_mesh_box("Pavilion_Glow_Strip", size=(5.6, 0.08, 0.12), location=(0.15, 2.28, 2.52), bevel_width=0.015, collection="DSH_Pavilion")
    dsh_assign_material(glow_cove, mat_glow)

    # Dark bronze structural columns & edge fascia beams (generous 2.5m architectural headroom)
    for idx, (cx, cy) in enumerate([(-2.85, -0.78), (2.85, -0.78), (2.85, 2.18), (-0.15, -0.78)]):
        col_obj = dsh_make_mesh_cylinder(f"Pavilion_Column_{idx}", radius1=0.075, radius2=0.075, depth=2.32, segments=24, location=(cx, cy, 1.36), bevel_width=0.01, collection="DSH_Pavilion")
        dsh_assign_material(col_obj, mat_bronze)
    beam_front = dsh_make_mesh_box("Pavilion_Beam_Front", size=(6.3, 0.18, 0.16), location=(0.0, -0.78, 2.52), bevel_width=0.015, collection="DSH_Pavilion")
    beam_back = dsh_make_mesh_box("Pavilion_Beam_Back", size=(6.3, 0.18, 0.16), location=(0.0, 2.18, 2.52), bevel_width=0.015, collection="DSH_Pavilion")
    dsh_assign_material(beam_front, mat_bronze)
    dsh_assign_material(beam_back, mat_bronze)

    # 11 parametric curved timber skylight ribs sweeping over the terrace & reflecting pool
    for i in range(11):
        t = i / 10.0
        rx = -2.90 + 5.80 * t
        rise = 0.65 + 0.42 * math.sin(math.pi * t)
        rib = dsh_make_arched_rib(f"Pavilion_Rib_{i:02d}", rx, y_start=-1.45, y_end=2.45, base_z=2.46, arch_rise=rise)
        dsh_assign_material(rib, mat_timber)

    # Interior gallery hero pedestal & sculptural monolith
    hero_ped = dsh_make_mesh_box("Pavilion_Hero_Pedestal", size=(1.18, 1.18, 0.52), location=(0.85, 0.72, 0.50), bevel_width=0.025, collection="DSH_Hero")
    dsh_assign_material(hero_ped, mat_travertine)
    totem = dsh_make_mesh_cylinder("Pavilion_Totem", radius1=0.33, radius2=0.21, depth=1.02, segments=48, location=(0.85, 0.72, 1.27), bevel_width=0.035, collection="DSH_Hero")
    dsh_assign_material(totem, mat_totem)
    totem_ring = dsh_make_mesh_torus("Pavilion_Totem_Halo", major_radius=0.50, minor_radius=0.026, location=(0.85, 0.72, 1.38), collection="DSH_Hero")
    totem_ring.rotation_euler = Euler((math.radians(24.0), math.radians(-18.0), 0.0), "XYZ")
    dsh_assign_material(totem_ring, mat_glow)

    dsh_apply_uploaded_texture(mat_totem)
    dsh_auto_place_uploaded_models(
        pedestal_top_z=0.76,
        target_size=1.35,
        replace_names=["Pavilion_Totem", "Pavilion_Totem_Halo"],
        default_mat=mat_totem,
    )

    fs = int(DSH_PROJECT["frameStart"])
    fe = int(DSH_PROJECT["frameEnd"])
    dsh_setup_lighting(DSH_PROJECT["lightingPreset"], DSH_PROJECT["accentColor"])
    # Subtle warm interior accent fill inside the pavilion
    dsh_add_light("Pavilion_Interior_Warm", "AREA", (0.85, 1.15, 2.65), 185.0, (1.0, 0.86, 0.66), size=2.4, target=(0.85, 0.5, 0.8))
    cam_obj, _ = dsh_setup_camera(DSH_PROJECT["cameraPreset"], fs, fe, target=(0.0, 0.0, 1.20), distance_scale=2.04)
    if DSH_PROJECT["cameraPreset"] == "three_quarter":
        # Architectural eye-level perspective peeking cleanly under the front ribs at the hero sculpture
        cam_obj.location = Vector((7.6, -9.4, 2.75))
`

    case 'procedural-abstract':
      return `
def dsh_create_iridescent_material(name, accent_rgba):
    mat = bpy.data.materials.new(name=name)
    if bpy.app.version < (5, 0, 0) or mat.node_tree is None:
        mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (520, 0)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (220, 0)
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.location = (-260, 80)
    lw.inputs["Blend"].default_value = 0.35
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (-40, 80)
    cr = ramp.color_ramp
    cr.elements[0].position = 0.08
    cr.elements[0].color = accent_rgba
    cr.elements[1].position = 0.55
    cr.elements[1].color = (
        min(1.0, accent_rgba[2] * 0.85 + 0.18),
        min(1.0, accent_rgba[0] * 0.65 + 0.25),
        min(1.0, accent_rgba[1] * 0.90 + 0.35),
        1.0,
    )
    e2 = cr.elements.new(0.88)
    e2.color = (0.94, 0.88, 1.0, 1.0)
    nt.links.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    dsh_set_bsdf(bsdf, ["Metallic"], 0.88)
    dsh_set_bsdf(bsdf, ["Roughness"], 0.16)
    dsh_set_bsdf(bsdf, ["Specular IOR Level", "Specular"], 0.85)
    dsh_set_bsdf(bsdf, ["Coat Weight", "Clearcoat"], 0.92)
    dsh_set_bsdf(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.04)
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def dsh_build_geonodes_sculpture(obj, mat_sculpture, mat_orb):
    ng = bpy.data.node_groups.new("DSH_Parametric_Ribbon_GN", "GeometryNodeTree")
    if hasattr(ng, "interface"):
        ng.interface.new_socket(name="Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
        ng.interface.new_socket(name="Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    else:
        ng.inputs.new("NodeSocketGeometry", "Geometry")
        ng.outputs.new("NodeSocketGeometry", "Geometry")

    nodes = ng.nodes
    links = ng.links
    n_in = nodes.new("NodeGroupInput")
    n_in.location = (-780, 0)
    n_out = nodes.new("NodeGroupOutput")
    n_out.location = (760, 0)

    # High-resolution closed circle displaced into a 3-lobe trefoil wave knot
    circle = nodes.new("GeometryNodeCurvePrimitiveCircle")
    circle.location = (-560, 160)
    circle.inputs["Resolution"].default_value = 160
    circle.inputs["Radius"].default_value = 0.92

    spline_param = nodes.new("GeometryNodeSplineParameter")
    spline_param.location = (-740, -120)

    mul_3 = nodes.new("ShaderNodeMath")
    mul_3.operation = "MULTIPLY"
    mul_3.location = (-520, -120)
    mul_3.inputs[1].default_value = 6.0 * math.pi  # 3 full lobes around circle
    links.new(spline_param.outputs["Factor"], mul_3.inputs[0])

    mul_2 = nodes.new("ShaderNodeMath")
    mul_2.operation = "MULTIPLY"
    mul_2.location = (-520, -300)
    mul_2.inputs[1].default_value = 4.0 * math.pi  # 2 harmonic ripples
    links.new(spline_param.outputs["Factor"], mul_2.inputs[0])

    sin_z = nodes.new("ShaderNodeMath")
    sin_z.operation = "SINE"
    sin_z.location = (-340, -120)
    links.new(mul_3.outputs["Value"], sin_z.inputs[0])

    amp_z = nodes.new("ShaderNodeMath")
    amp_z.operation = "MULTIPLY"
    amp_z.location = (-160, -120)
    amp_z.inputs[1].default_value = 0.42
    links.new(sin_z.outputs["Value"], amp_z.inputs[0])

    cos_xy = nodes.new("ShaderNodeMath")
    cos_xy.operation = "COSINE"
    cos_xy.location = (-340, -300)
    links.new(mul_2.outputs["Value"], cos_xy.inputs[0])

    amp_xy = nodes.new("ShaderNodeMath")
    amp_xy.operation = "MULTIPLY"
    amp_xy.location = (-160, -300)
    amp_xy.inputs[1].default_value = 0.22
    links.new(cos_xy.outputs["Value"], amp_xy.inputs[0])

    comb_off = nodes.new("ShaderNodeCombineXYZ")
    comb_off.location = (10, -180)
    links.new(amp_xy.outputs["Value"], comb_off.inputs["X"])
    links.new(amp_xy.outputs["Value"], comb_off.inputs["Y"])
    links.new(amp_z.outputs["Value"], comb_off.inputs["Z"])

    set_pos = nodes.new("GeometryNodeSetPosition")
    set_pos.location = (180, 140)
    links.new(circle.outputs["Curve"], set_pos.inputs["Geometry"])
    links.new(comb_off.outputs["Vector"], set_pos.inputs["Offset"])

    set_tilt = nodes.new("GeometryNodeSetCurveTilt")
    set_tilt.location = (330, 140)
    links.new(set_pos.outputs["Geometry"], set_tilt.inputs["Curve"])
    links.new(mul_3.outputs["Value"], set_tilt.inputs["Tilt"])

    profile = nodes.new("GeometryNodeCurvePrimitiveCircle")
    profile.location = (180, -20)
    profile.inputs["Resolution"].default_value = 24
    profile.inputs["Radius"].default_value = 0.13

    curve_to_mesh = nodes.new("GeometryNodeCurveToMesh")
    curve_to_mesh.location = (470, 140)
    links.new(set_tilt.outputs["Curve"], curve_to_mesh.inputs["Curve"])
    links.new(profile.outputs["Curve"], curve_to_mesh.inputs["Profile Curve"])
    if "Fill Caps" in curve_to_mesh.inputs:
        curve_to_mesh.inputs["Fill Caps"].default_value = True

    set_mat_main = nodes.new("GeometryNodeSetMaterial")
    set_mat_main.location = (600, 140)
    set_mat_main.inputs["Material"].default_value = mat_sculpture
    links.new(curve_to_mesh.outputs["Mesh"], set_mat_main.inputs["Geometry"])

    # Secondary procedural instanced orbital spheres along resampled knot
    resample = nodes.new("GeometryNodeResampleCurve")
    resample.location = (220, -220)
    resample.inputs["Count"].default_value = 18
    links.new(set_pos.outputs["Geometry"], resample.inputs["Curve"])

    orb_mesh = nodes.new("GeometryNodeMeshUVSphere")
    orb_mesh.location = (220, -380)
    orb_mesh.inputs["Segments"].default_value = 20
    orb_mesh.inputs["Rings"].default_value = 12
    orb_mesh.inputs["Radius"].default_value = 0.068

    inst = nodes.new("GeometryNodeInstanceOnPoints")
    inst.location = (410, -240)
    links.new(resample.outputs["Curve"], inst.inputs["Points"])
    links.new(orb_mesh.outputs["Mesh"], inst.inputs["Instance"])

    realize = nodes.new("GeometryNodeRealizeInstances")
    realize.location = (540, -240)
    links.new(inst.outputs["Instances"], realize.inputs["Geometry"])

    set_mat_orb = nodes.new("GeometryNodeSetMaterial")
    set_mat_orb.location = (640, -240)
    set_mat_orb.inputs["Material"].default_value = mat_orb
    links.new(realize.outputs["Geometry"], set_mat_orb.inputs["Geometry"])

    join_geo = nodes.new("GeometryNodeJoinGeometry")
    join_geo.location = (660, 0)
    links.new(set_mat_main.outputs["Geometry"], join_geo.inputs["Geometry"])
    links.new(set_mat_orb.outputs["Geometry"], join_geo.inputs["Geometry"])

    smooth = nodes.new("GeometryNodeSetShadeSmooth")
    smooth.location = (710, 0)
    links.new(join_geo.outputs["Geometry"], smooth.inputs["Geometry"])
    links.new(smooth.outputs["Geometry"], n_out.inputs["Geometry"])

    mod = obj.modifiers.new(name="DSH_Parametric_GeoNodes", type="NODES")
    mod.node_group = ng
    return mod


def dsh_build_template():
    accent = dsh_hex_to_rgba(DSH_PROJECT["accentColor"])
    mat_floor = dsh_create_material("Mat_Abstract_Floor", "ceramic_gloss", (0.05, 0.06, 0.08, 1.0))
    mat_plinth = dsh_create_material("Mat_Abstract_Plinth", "clay_matte", (0.12, 0.13, 0.16, 1.0))
    mat_trim = dsh_create_material("Mat_Abstract_Trim", "brushed_metal", (0.78, 0.80, 0.86, 1.0))
    mat_sculpture = dsh_create_iridescent_material("Mat_Iridescent_Ribbon", accent)
    mat_glow = dsh_create_material("Mat_Abstract_CoreGlow", "ceramic_gloss", accent, emission_strength=3.6)

    floor = dsh_make_mesh_box("Abstract_Floor", size=(18.0, 18.0, 0.1), location=(0.0, 0.0, -0.05), collection="DSH_Stage")
    dsh_assign_material(floor, mat_floor)

    plinth_base = dsh_make_mesh_cylinder("Abstract_Plinth_Base", radius1=1.45, radius2=1.35, depth=0.20, segments=64, location=(0.0, 0.0, 0.10), bevel_width=0.03, collection="DSH_Stage")
    dsh_assign_material(plinth_base, mat_plinth)
    plinth_cap = dsh_make_mesh_cylinder("Abstract_Plinth_Cap", radius1=1.18, radius2=1.15, depth=0.10, segments=64, location=(0.0, 0.0, 0.25), bevel_width=0.02, collection="DSH_Stage")
    dsh_assign_material(plinth_cap, mat_trim)
    stem = dsh_make_mesh_cylinder("Abstract_Mount_Stem", radius1=0.08, radius2=0.05, depth=0.68, segments=32, location=(0.0, 0.0, 0.64), bevel_width=0.015, collection="DSH_Hero")
    dsh_assign_material(stem, mat_trim)

    core_orb = dsh_make_mesh_sphere("Abstract_Core_Orb", radius=0.28, location=(0.0, 0.0, 1.38), collection="DSH_Hero")
    dsh_assign_material(core_orb, mat_glow)
    core_ring = dsh_make_mesh_torus("Abstract_Core_Halo", major_radius=0.56, minor_radius=0.028, location=(0.0, 0.0, 1.38), collection="DSH_Hero")
    core_ring.rotation_euler = Euler((math.radians(64.0), math.radians(22.0), 0.0), "XYZ")
    dsh_assign_material(core_ring, mat_trim)

    # Build real Blender GeometryNodeTree sculpture (fallback to procedural bmesh knot only if needed)
    gn_mesh = bpy.data.meshes.new("GeoNodes_Sculpture_Mesh")
    gn_obj = bpy.data.objects.new("GeoNodes_Sculpture", gn_mesh)
    gn_obj.location = Vector((0.0, 0.0, 1.38))
    gn_obj.rotation_euler = Euler((math.radians(28.0), math.radians(-16.0), 0.0), "XYZ")
    dsh_link_object(gn_obj, "DSH_Hero")
    dsh_assign_material(gn_obj, mat_sculpture)
    try:
        dsh_build_geonodes_sculpture(gn_obj, mat_sculpture, mat_glow)
    except Exception as exc:
        print("[dsh-blender-studio] GeoNodes fallback to bmesh parametric knot:", exc)
        bpy.data.objects.remove(gn_obj, do_unlink=True)
        gn_obj = dsh_make_mesh_torus("GeoNodes_Sculpture", major_radius=0.95, minor_radius=0.14, major_seg=96, minor_seg=24, location=(0.0, 0.0, 1.38), collection="DSH_Hero")
        gn_obj.rotation_euler = Euler((math.radians(28.0), math.radians(-16.0), 0.0), "XYZ")
        dsh_assign_material(gn_obj, mat_sculpture)

    fs = int(DSH_PROJECT["frameStart"])
    fe = int(DSH_PROJECT["frameEnd"])
    gn_obj.keyframe_insert(data_path="rotation_euler", frame=fs)
    gn_obj.rotation_euler = Euler((math.radians(28.0), math.radians(-16.0), math.radians(360.0)), "XYZ")
    gn_obj.keyframe_insert(data_path="rotation_euler", frame=fe)

    dsh_apply_uploaded_texture(mat_sculpture)
    dsh_auto_place_uploaded_models(
        pedestal_top_z=0.30,
        target_size=1.65,
        replace_names=["GeoNodes_Sculpture", "Abstract_Core_Orb", "Abstract_Core_Halo", "Abstract_Mount_Stem"],
        default_mat=mat_sculpture,
    )

    dsh_setup_lighting(DSH_PROJECT["lightingPreset"], DSH_PROJECT["accentColor"])
    dsh_setup_camera(DSH_PROJECT["cameraPreset"], fs, fe, target=(0.0, 0.0, 1.28), distance_scale=1.18)
`

    case 'blank-stage':
    default:
      return `
def dsh_build_template():
    accent = dsh_hex_to_rgba(DSH_PROJECT["accentColor"])
    preset = DSH_PROJECT["materialPreset"]
    mat_floor = dsh_create_material("Mat_Stage_Grid", "clay_matte", (0.78, 0.80, 0.84, 1.0))
    mat_marker = dsh_create_material("Mat_Scale_Marker", preset, accent)

    floor = dsh_make_mesh_box("Stage_Floor", size=(12.0, 12.0, 0.08), location=(0.0, 0.0, -0.04), collection="DSH_Stage")
    dsh_assign_material(floor, mat_floor)

    marker = dsh_make_mesh_box("Reference_Cube_1m", size=(1.0, 1.0, 1.0), location=(0.0, 0.0, 0.5), bevel_width=0.04, collection="DSH_Hero")
    dsh_assign_material(marker, mat_marker)

    dsh_apply_uploaded_texture(mat_marker)
    dsh_auto_place_uploaded_models(
        pedestal_top_z=0.0,
        target_size=1.6,
        replace_names=["Reference_Cube_1m"],
        default_mat=mat_marker,
    )

    fs = int(DSH_PROJECT["frameStart"])
    fe = int(DSH_PROJECT["frameEnd"])
    dsh_setup_lighting(DSH_PROJECT["lightingPreset"], DSH_PROJECT["accentColor"])
    dsh_setup_camera(DSH_PROJECT["cameraPreset"], fs, fe, target=(0.0, 0.0, 0.6))
`
  }
}

export function generateSceneScript(
  project: BlenderProject | BlenderProjectFields,
  assetsDir = './assets',
  options: GenerateSceneOptions = {},
): string {
  const assets = 'assets' in project && Array.isArray(project.assets) ? project.assets : []
  const preamble = buildPreamble(
    project,
    assetsDir,
    assets,
    options.computeDevice ?? 'auto',
    Boolean(options.enforceRenderProfile),
  )
  const custom = (project.customScript || '').trim()

  const lookdevCall = options.applyLookdevOverrides ? '\ndsh_apply_lookdev_overrides()\n' : ''

  if (project.scriptMode === 'custom' && custom) {
    return `${preamble}
dsh_clear_scene()
dsh_set_render_engine(
    bpy.context.scene,
    DSH_PROJECT["engine"],
    DSH_PROJECT["samples"],
    DSH_PROJECT["transparentBg"],
    DSH_PROJECT.get("computeDevice", "auto"),
)

# --- Custom bpy Script ---
${custom}
${lookdevCall}`
  }

  const templateBody = buildTemplateBody(project.template)
  const hookBlock = custom
    ? `
# --- Optional Custom Hook ---
${custom}
`
    : ''

  return `${preamble}${templateBody}
dsh_clear_scene()
dsh_set_render_engine(
    bpy.context.scene,
    DSH_PROJECT["engine"],
    DSH_PROJECT["samples"],
    DSH_PROJECT["transparentBg"],
    DSH_PROJECT.get("computeDevice", "auto"),
)
dsh_build_template()
${hookBlock}${lookdevCall}`
}

export function generateRunnerHarness(
  mode: BlenderJobKind,
  options: RunnerHarnessOptions,
): string {
  const {
    project,
    assetsDir,
    outputPath = '',
    format = 'glb',
    overrideCode,
    computeDevice,
    enforceRenderProfile,
  } = options
  const genOpts: GenerateSceneOptions = {
    computeDevice: computeDevice ?? 'auto',
    enforceRenderProfile: Boolean(enforceRenderProfile),
  }
  const baseScene = overrideCode?.trim()
    ? generateSceneScript({ ...project, scriptMode: 'custom', customScript: overrideCode }, assetsDir, genOpts)
    : generateSceneScript(project, assetsDir, genOpts)

  switch (mode) {
    case 'pipeline':
    case 'workflow_replay':
    case 'inspect_scene':
      return `${baseScene}
dsh_apply_lookdev_overrides()
print("__DSH_STAGE__=采集场景结构信息", flush=True)
dsh_emit_scene_summary()
`

    case 'run_script':
      return `${baseScene}
dsh_apply_lookdev_overrides()
print("__DSH_STAGE__=脚本执行完成，采集场景大纲", flush=True)
dsh_emit_scene_summary()
`

    case 'build_blend':
      return `${baseScene}
dsh_apply_lookdev_overrides()
print("__DSH_STAGE__=保存工程 .blend 文件", flush=True)
_dsh_out = ${pyStr(outputPath)}
os.makedirs(os.path.dirname(_dsh_out) or ".", exist_ok=True)
try:
    bpy.ops.file.pack_all()
except Exception:
    pass
bpy.ops.wm.save_as_mainfile(filepath=_dsh_out, compress=True)
dsh_emit_scene_summary()
`

    case 'preview_still': {
      const targetFrame = options.frame ?? project.frameStart
      return `${baseScene}
dsh_apply_lookdev_overrides()
dsh_install_render_progress_hook()
print("__DSH_STAGE__=渲染静帧预览", flush=True)
_dsh_scene = bpy.context.scene
_dsh_out = ${pyStr(outputPath)}
os.makedirs(os.path.dirname(_dsh_out) or ".", exist_ok=True)
_dsh_scene.frame_set(${Math.max(1, Math.floor(targetFrame))})
_dsh_scene.render.image_settings.file_format = "PNG"
_dsh_scene.render.filepath = _dsh_out
bpy.ops.render.render(write_still=True)
dsh_emit_scene_summary()
`
    }

    case 'render_shots': {
      const targetFrame = options.frame ?? project.frameStart
      const shotIds = options.shots?.length ? validateShotPresetIds(options.shots) : [...DEFAULT_MULTI_SHOT_IDS]
      const shotSpecs = shotIds.map(id => BLENDER_SHOT_PRESETS.find(p => p.id === id)!)
      const outDir = options.outputDir || (outputPath ? dirname(outputPath) : '.')
      return `${baseScene}
dsh_apply_lookdev_overrides()
dsh_install_render_progress_hook()
print("__DSH_STAGE__=批量渲染多机位分镜 Lookdev 组图", flush=True)


def _dsh_render_multi_shots(out_dir, shot_specs, frame_num):
    scene = bpy.context.scene
    scene.frame_set(int(frame_num))
    orig_cam = scene.camera
    orig_fmt = scene.render.image_settings.file_format
    orig_fp = scene.render.filepath

    all_renderables = [o for o in bpy.data.objects if o.type in ("MESH", "FONT", "CURVE", "GPENCIL", "GREASEPENCIL")]
    hero_objs = [o for o in all_renderables if not dsh_is_backdrop_object(o)]
    focus_objs = hero_objs if hero_objs else all_renderables

    shot_cam_data = bpy.data.cameras.new("DSH_Shot_Cam_Data")
    shot_cam = bpy.data.objects.new("DSH_Shot_Cam", shot_cam_data)
    scene.collection.objects.link(shot_cam)

    os.makedirs(out_dir or ".", exist_ok=True)
    scene.render.image_settings.file_format = "PNG"
    total = len(shot_specs)
    res_x = int(scene.render.resolution_x)
    res_y = int(scene.render.resolution_y)

    try:
        for idx, spec in enumerate(shot_specs):
            shot_id = spec["id"]
            label_zh = spec["zh"]
            label_en = spec["en"]
            lens_mm = float(spec["lensMm"])
            print(f"__DSH_STAGE__=渲染分镜 ({idx + 1}/{total}): {label_zh}", flush=True)
            _, center = dsh_frame_camera_to_assembly(
                shot_cam,
                focus_objs,
                azimuth_deg=float(spec["azimuthDeg"]),
                elevation_deg=float(spec["elevationDeg"]),
                lens_mm=lens_mm,
                margin=float(spec["margin"]),
            )
            dof_fstop = spec.get("dofFstop")
            if dof_fstop is not None:
                dsh_add_dof(shot_cam, center, fstop=float(dof_fstop))
            else:
                shot_cam.data.dof.use_dof = False
            file_name = f"shot_{shot_id}.png"
            out_file = os.path.join(out_dir or ".", file_name)
            scene.render.filepath = out_file
            bpy.ops.render.render(write_still=True)
            print(
                DSH_SHOT_DONE_MARKER + json.dumps({
                    "shotId": shot_id,
                    "file": file_name,
                    "path": out_file,
                    "labelZh": label_zh,
                    "labelEn": label_en,
                    "lensMm": lens_mm,
                    "width": res_x,
                    "height": res_y,
                    "index": idx + 1,
                    "total": total,
                }, ensure_ascii=False),
                flush=True,
            )
    finally:
        scene.camera = orig_cam
        scene.render.image_settings.file_format = orig_fmt
        scene.render.filepath = orig_fp
        bpy.data.objects.remove(shot_cam, do_unlink=True)
        bpy.data.cameras.remove(shot_cam_data)


_dsh_render_multi_shots(${pyStr(outDir)}, ${pyJsonExpr(shotSpecs)}, ${Math.max(1, Math.floor(targetFrame))})
dsh_emit_scene_summary()
`
    }

    case 'contact_sheet': {
      const targetFrame = options.frame ?? project.frameStart
      const { width, height } = resolveRenderResolution(project.aspect, project.resolutionScale)
      const sheetW = Math.max(512, Math.min(2048, options.contactSheetWidth ?? width))
      const sheetH = Math.max(512, Math.min(2048, options.contactSheetHeight ?? height))
      const cellW = Math.max(256, Math.floor(sheetW / 2))
      const cellH = Math.max(256, Math.floor(sheetH / 2))
      return `${baseScene}
dsh_apply_lookdev_overrides()
dsh_install_render_progress_hook()
print("__DSH_STAGE__=渲染 2x2 四视角视觉自检拼图", flush=True)


def _dsh_render_contact_sheet(out_path, cell_w, cell_h, frame_num):
    scene = bpy.context.scene
    scene.frame_set(int(frame_num))
    orig_cam = scene.camera
    orig_w = scene.render.resolution_x
    orig_h = scene.render.resolution_y
    orig_pct = scene.render.resolution_percentage
    orig_fmt = scene.render.image_settings.file_format
    orig_fp = scene.render.filepath

    # Compute hero assembly bounds (keep pedestals/plinths; exclude large studio floors/walls/softboxes)
    all_renderables = [o for o in bpy.data.objects if o.type in ("MESH", "FONT", "CURVE", "GPENCIL", "GREASEPENCIL")]
    hero_objs = [o for o in all_renderables if not dsh_is_backdrop_object(o)]
    focus_objs = hero_objs if hero_objs else all_renderables
    if focus_objs:
        xs, ys, zs = [], [], []
        for o in focus_objs:
            for corner in o.bound_box:
                wc = o.matrix_world @ Vector(corner)
                xs.append(wc.x)
                ys.append(wc.y)
                zs.append(wc.z)
        span_x = max(xs) - min(xs)
        span_y = max(ys) - min(ys)
        span_z = max(zs) - min(zs)
        if max(span_x, span_y, span_z) < 1e-4 and focus_objs is not all_renderables and all_renderables:
            xs, ys, zs = [], [], []
            for o in all_renderables:
                for corner in o.bound_box:
                    wc = o.matrix_world @ Vector(corner)
                    xs.append(wc.x)
                    ys.append(wc.y)
                    zs.append(wc.z)
            span_x = max(xs) - min(xs)
            span_y = max(ys) - min(ys)
            span_z = max(zs) - min(zs)
        center = Vector(((min(xs) + max(xs)) * 0.5, (min(ys) + max(ys)) * 0.5, (min(zs) + max(zs)) * 0.5))
        bounding_radius = max(0.01, 0.5 * math.sqrt(span_x * span_x + span_y * span_y + span_z * span_z))
    else:
        center = Vector((0.0, 0.0, 0.9))
        bounding_radius = 2.2

    qc_target = bpy.data.objects.new("DSH_QC_Target", None)
    qc_target.location = center
    scene.collection.objects.link(qc_target)

    qc_cam_data = bpy.data.cameras.new("DSH_QC_Cam_Data")
    qc_cam_data.lens = 45.0
    if hasattr(qc_cam_data, "sensor_fit"):
        qc_cam_data.sensor_fit = "AUTO"
    qc_cam = bpy.data.objects.new("DSH_QC_Cam", qc_cam_data)
    scene.collection.objects.link(qc_cam)
    con = qc_cam.constraints.new(type="TRACK_TO")
    con.target = qc_target
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"

    aspect_ratio = float(max(cell_w, cell_h)) / max(1.0, float(min(cell_w, cell_h)))
    sensor_min = float(getattr(qc_cam_data, "sensor_width", 36.0)) / aspect_ratio
    half_fov = math.atan((sensor_min * 0.5) / max(1.0, float(qc_cam_data.lens)))
    dist = max((bounding_radius / max(0.08, math.sin(half_fov))) * 1.24, bounding_radius * 2.5, 0.08)
    qc_cam_data.clip_start = max(0.001, min(0.05, bounding_radius * 0.02))
    qc_cam_data.clip_end = max(100.0, dist * 20.0)
    top_eps = max(0.001, bounding_radius * 0.01)
    views = [
        ("front", Vector((center.x, center.y - dist, center.z + bounding_radius * 0.14)), False),
        ("three_quarter", Vector((center.x + dist * 0.70, center.y - dist * 0.74, center.z + dist * 0.44)), False),
        ("top", Vector((center.x, center.y - top_eps, center.z + dist * 1.24)), False),
        ("active", None, True),
    ]

    out_dir = os.path.dirname(out_path) or "."
    os.makedirs(out_dir, exist_ok=True)
    scene.render.resolution_x = int(cell_w)
    scene.render.resolution_y = int(cell_h)
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"

    tile_paths = []
    try:
        for idx, (label, pos, use_active) in enumerate(views):
            print(f"__DSH_STAGE__=渲染四视角 ({idx + 1}/4): {label}", flush=True)
            if use_active and orig_cam is not None:
                scene.camera = orig_cam
            else:
                qc_cam.location = pos if pos is not None else Vector((center.x + dist, center.y - dist, center.z + dist * 0.6))
                scene.camera = qc_cam
            tile_file = os.path.join(out_dir, f"_dsh_qc_tile_{idx}_{label}.png")
            scene.render.filepath = tile_file
            bpy.ops.render.render(write_still=True)
            tile_paths.append(tile_file)

        # Stitch 2x2 PNG contact sheet (fast built-in numpy path with pure-Python fallback, zero Pillow)
        gap = 4
        sheet_w = cell_w * 2 + gap
        sheet_h = cell_h * 2 + gap
        # Quadrant placements in Blender bottom-up coordinates:
        # Top-Left (0: front), Top-Right (1: three_quarter), Bottom-Left (2: top), Bottom-Right (3: active)
        offsets = [
            (0, cell_h + gap),
            (cell_w + gap, cell_h + gap),
            (0, 0),
            (cell_w + gap, 0),
        ]
        try:
            import numpy as _np
            canvas = _np.empty((sheet_h, sheet_w, 4), dtype=_np.float32)
            canvas[:] = (0.09, 0.10, 0.13, 1.0)
            for tile_file, (ox, oy) in zip(tile_paths, offsets):
                img = bpy.data.images.load(tile_file, check_existing=False)
                tw, th = img.size[0], img.size[1]
                copy_w = min(cell_w, tw)
                copy_h = min(cell_h, th)
                arr = _np.empty(tw * th * 4, dtype=_np.float32)
                img.pixels.foreach_get(arr)
                tile = arr.reshape((th, tw, 4))
                canvas[oy:oy + copy_h, ox:ox + copy_w, :] = tile[:copy_h, :copy_w, :]
                bpy.data.images.remove(img)
            buf = canvas.ravel()
        except Exception:
            buf = [0.09, 0.10, 0.13, 1.0] * (sheet_w * sheet_h)
            for tile_file, (ox, oy) in zip(tile_paths, offsets):
                img = bpy.data.images.load(tile_file, check_existing=False)
                tw, th = img.size[0], img.size[1]
                copy_w = min(cell_w, tw)
                copy_h = min(cell_h, th)
                px = list(img.pixels[:])
                row_floats = copy_w * 4
                for y in range(copy_h):
                    src_start = y * tw * 4
                    dst_start = ((oy + y) * sheet_w + ox) * 4
                    buf[dst_start:dst_start + row_floats] = px[src_start:src_start + row_floats]
                bpy.data.images.remove(img)

        sheet = bpy.data.images.new("DSH_Contact_Sheet", width=sheet_w, height=sheet_h, alpha=True)
        if hasattr(sheet.pixels, "foreach_set"):
            sheet.pixels.foreach_set(buf)
        else:
            sheet.pixels[:] = buf
        sheet.filepath_raw = out_path
        sheet.file_format = "PNG"
        sheet.save()
        bpy.data.images.remove(sheet)
    finally:
        for tp in tile_paths:
            try:
                if os.path.exists(tp):
                    os.remove(tp)
            except Exception:
                pass
        scene.camera = orig_cam
        scene.render.resolution_x = orig_w
        scene.render.resolution_y = orig_h
        scene.render.resolution_percentage = orig_pct
        scene.render.image_settings.file_format = orig_fmt
        scene.render.filepath = orig_fp
        bpy.data.objects.remove(qc_cam, do_unlink=True)
        bpy.data.cameras.remove(qc_cam_data)
        bpy.data.objects.remove(qc_target, do_unlink=True)


_dsh_render_contact_sheet(${pyStr(outputPath)}, ${cellW}, ${cellH}, ${Math.max(1, Math.floor(targetFrame))})
dsh_emit_scene_summary()
`
    }

    case 'render_animation':
      return `${baseScene}
dsh_apply_lookdev_overrides()
dsh_install_render_progress_hook()
print("__DSH_STAGE__=渲染动画序列", flush=True)
_dsh_scene = bpy.context.scene
_dsh_out = ${pyStr(outputPath)}
os.makedirs(os.path.dirname(_dsh_out) or ".", exist_ok=True)
_dsh_ffmpeg_ok = False
try:
    _dsh_img = _dsh_scene.render.image_settings
    if hasattr(_dsh_img, "media_type"):
        _dsh_img.media_type = "VIDEO"
    else:
        _dsh_img.file_format = "FFMPEG"
    _dsh_scene.render.ffmpeg.format = "MPEG4"
    _dsh_scene.render.ffmpeg.codec = "H264"
    _dsh_scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
    _dsh_scene.render.ffmpeg.ffmpeg_preset = "GOOD"
    _dsh_scene.render.ffmpeg.audio_codec = "NONE"
    _dsh_scene.render.filepath = _dsh_out
    bpy.ops.render.render(animation=True)
    _dsh_ffmpeg_ok = True
except Exception as _exc:
    print("[dsh-blender-studio] FFmpeg MP4 unavailable, falling back to PNG frame sequence:", _exc, flush=True)
    _frames_dir = os.path.join(os.path.dirname(_dsh_out) or ".", "frames")
    os.makedirs(_frames_dir, exist_ok=True)
    _dsh_img = _dsh_scene.render.image_settings
    if hasattr(_dsh_img, "media_type"):
        _dsh_img.media_type = "IMAGE"
    _dsh_img.file_format = "PNG"
    _dsh_scene.render.filepath = os.path.join(_frames_dir, "frame_")
    bpy.ops.render.render(animation=True)
dsh_emit_scene_summary()
`

    case 'export_model': {
      const exportSnippet = (() => {
        switch (format) {
          case 'glb':
            return `_dsh_safe_export(
    bpy.ops.export_scene.gltf,
    filepath=_dsh_out,
    export_format="GLB",
    export_apply=True,
    export_yup=True,
    export_materials="EXPORT",
    export_cameras=False,
    export_lights=False,
)`
          case 'fbx':
            return `_dsh_safe_export(
    bpy.ops.export_scene.fbx,
    filepath=_dsh_out,
    use_mesh_modifiers=True,
    path_mode="COPY",
    embed_textures=True,
)`
          case 'obj':
            return `if hasattr(bpy.ops.wm, "obj_export"):
    _dsh_safe_export(bpy.ops.wm.obj_export, filepath=_dsh_out, apply_modifiers=True)
else:
    _dsh_safe_export(bpy.ops.export_scene.obj, filepath=_dsh_out, use_mesh_modifiers=True)`
          case 'stl':
            return `if hasattr(bpy.ops.wm, "stl_export"):
    _dsh_safe_export(bpy.ops.wm.stl_export, filepath=_dsh_out, apply_modifiers=True)
else:
    _dsh_safe_export(bpy.ops.export_mesh.stl, filepath=_dsh_out, use_mesh_modifiers=True)`
          case 'blend':
            return `try:
    bpy.ops.file.pack_all()
except Exception:
    pass
_dsh_safe_export(bpy.ops.wm.save_as_mainfile, filepath=_dsh_out, compress=True)`
        }
      })()
      const stripBackdropsBlock =
        format === 'blend'
          ? ''
          : `
# Strip enclosing studio backdrops/infinity cycloramas from interchange 3D exports (keep full stage in .blend)
_dsh_export_heroes = [
    o for o in bpy.data.objects
    if o.type in ("MESH", "FONT", "CURVE", "SURFACE", "META") and not dsh_is_backdrop_object(o)
]
if _dsh_export_heroes:
    for _dsh_bg in list(bpy.data.objects):
        if _dsh_bg.type == "MESH" and dsh_is_backdrop_object(_dsh_bg):
            bpy.data.objects.remove(_dsh_bg, do_unlink=True)
`
      const lookdevExportBlock = format === 'blend' ? 'dsh_apply_lookdev_overrides()\n' : ''
      return `${baseScene}
${lookdevExportBlock}print("__DSH_STAGE__=导出 3D 模型 (${format.toUpperCase()})", flush=True)
_dsh_out = ${pyStr(outputPath)}
os.makedirs(os.path.dirname(_dsh_out) or ".", exist_ok=True)


def _dsh_safe_export(op_fn, **kwargs):
    try:
        props = set(op_fn.get_rna_type().properties.keys())
        filtered = {k: v for k, v in kwargs.items() if k in props}
    except Exception:
        filtered = kwargs
    return op_fn(**filtered)


dsh_emit_scene_summary()
${stripBackdropsBlock}
${exportSnippet}
`
    }
  }
}
