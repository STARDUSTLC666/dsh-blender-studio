export type BlenderTemplateId = 'product-studio' | 'logo-3d' | 'isometric-room' | 'motion-data' | 'grease-pencil-2d' | 'blank-stage';
export type BlenderRenderEngine = 'EEVEE' | 'CYCLES' | 'WORKBENCH';
export type BlenderAspect = 'landscape' | 'portrait' | 'square';
export type BlenderCameraPreset = 'three_quarter' | 'front' | 'isometric' | 'top' | 'closeup' | 'turntable';
export type BlenderLightingPreset = 'studio_3point' | 'soft_daylight' | 'dramatic_rim' | 'neon_cyber' | 'clay_overcast';
export type BlenderMaterialPreset = 'clay_matte' | 'brushed_metal' | 'frosted_glass' | 'ceramic_gloss' | 'toon_cel';
export type BlenderScriptMode = 'template' | 'custom';
export type BlenderAssetKind = 'hdri' | 'texture' | 'model' | 'blend' | 'reference';
export type BlenderArtifactKind = 'still' | 'contact_sheet' | 'animation' | 'glb' | 'fbx' | 'obj' | 'stl' | 'blend';
export type BlenderExportFormat = 'glb' | 'fbx' | 'obj' | 'stl' | 'blend';
export type BlenderFps = 24 | 30 | 60;
export type BlenderResolutionScale = 50 | 100 | 150 | 200;
export type PolyHavenAssetType = 'hdris' | 'textures' | 'models';
export type BlenderJobKind = 'preview_still' | 'contact_sheet' | 'render_animation' | 'export_model' | 'inspect_scene' | 'run_script' | 'build_blend';
export interface BlenderProjectFields {
    template: BlenderTemplateId;
    title: string;
    description: string;
    headline: string;
    engine: BlenderRenderEngine;
    samples: number;
    aspect: BlenderAspect;
    resolutionScale: number;
    fps: BlenderFps;
    frameStart: number;
    frameEnd: number;
    cameraPreset: BlenderCameraPreset;
    lightingPreset: BlenderLightingPreset;
    materialPreset: BlenderMaterialPreset;
    accentColor: string;
    transparentBg: boolean;
    scriptMode: BlenderScriptMode;
    customScript: string;
}
export interface BlenderAsset {
    id: string;
    name: string;
    file: string;
    kind: BlenderAssetKind;
    ext: string;
    size: number;
    source?: 'upload' | 'polyhaven';
    sourceId?: string;
    created: string;
}
export interface BlenderSceneObjectSummary {
    name: string;
    type: string;
    location: [number, number, number];
    dimensions?: [number, number, number];
    materialCount?: number;
    vertices?: number;
    polygons?: number;
}
export interface BlenderSceneSummary {
    capturedAt: string;
    blenderVersion: string;
    engine: string;
    objectCount: number;
    meshCount: number;
    lightCount: number;
    cameraCount: number;
    totalPolygons: number;
    activeCamera?: string;
    materials: string[];
    collections: string[];
    objects: BlenderSceneObjectSummary[];
}
export interface BlenderArtifact {
    id: string;
    kind: BlenderArtifactKind;
    revision: number;
    file: string;
    mime: string;
    size: number;
    engine: BlenderRenderEngine;
    samples: number;
    width?: number;
    height?: number;
    durationMs: number;
    created: string;
}
export interface BlenderProject extends BlenderProjectFields {
    id: string;
    revision: number;
    created: string;
    updated: string;
    archived?: boolean;
    assets: BlenderAsset[];
    artifacts: BlenderArtifact[];
    sceneSummary?: BlenderSceneSummary;
}
export interface BlenderExecutableInfo {
    path: string;
    version: string;
    major: number;
    minor: number;
    source: 'env' | 'config' | 'path' | 'standard';
    eeveeEngine: 'BLENDER_EEVEE_NEXT' | 'BLENDER_EEVEE';
    greasePencilApi: 'gpv3' | 'gpv2';
}
export interface BlenderBridgeStatus {
    host: string;
    port: number;
    hasToken: boolean;
    connected: boolean;
    blenderVersion?: string;
    activeScene?: string;
    lastChecked?: string;
    error?: string;
}
export interface BlenderEnvironmentStatus {
    ready: boolean;
    active?: BlenderExecutableInfo;
    detected: BlenderExecutableInfo[];
    configuredPath: string;
    bridge: BlenderBridgeStatus;
    polyHavenEnabled: boolean;
    node: string;
    platform: string;
    hint: string;
}
export interface BlenderSettings {
    blenderPath: string;
    bridgeHost: string;
    bridgePort: number;
    bridgeToken: string;
    polyHavenEnabled: boolean;
}
export interface BlenderJob {
    id: string;
    kind: BlenderJobKind;
    projectId: string;
    revision: number;
    state: 'running' | 'done' | 'failed' | 'cancelled';
    stageCode: string;
    stage: string;
    progress: number;
    lines: string[];
    artifactId?: string;
    artifactKind?: BlenderArtifactKind;
    sceneSummary?: BlenderSceneSummary;
    scriptOutput?: string;
    startedAt: string;
    finishedAt?: string;
}
export interface BlenderTemplateMeta {
    id: BlenderTemplateId;
    zh: string;
    en: string;
    description: string;
    descriptionEn: string;
    recommendedEngine: BlenderRenderEngine;
    defaultCamera: BlenderCameraPreset;
    defaultLighting: BlenderLightingPreset;
    defaultMaterial: BlenderMaterialPreset;
    defaultFrames: number;
}
export interface ScriptSafetyFinding {
    rule: string;
    line: number;
    detail: string;
}
export interface ScriptSafetyResult {
    safe: boolean;
    findings: ScriptSafetyFinding[];
}
export interface PolyHavenAssetItem {
    id: string;
    name: string;
    type: PolyHavenAssetType;
    categories: string[];
    tags: string[];
    authors: string[];
    downloadCount: number;
    thumbnailUrl: string;
    maxResolution?: [number, number];
}
export type BlenderErrorCode = 'ID_INVALID' | 'BAD_REQUEST' | 'BAD_ACTION' | 'TITLE_INVALID' | 'DESCRIPTION_TOO_LONG' | 'HEADLINE_TOO_LONG' | 'SAMPLES_INVALID' | 'FRAMES_INVALID' | 'COLOR_INVALID' | 'SCRIPT_TOO_LARGE' | 'SCRIPT_UNSAFE' | 'TEMPLATE_INVALID' | 'EXPORT_FORMAT_INVALID' | 'CONFLICT' | 'JOB_CONFLICT' | 'PROJECT_LIMIT' | 'PROJECT_EXISTS' | 'PROJECT_NOT_FOUND' | 'ASSET_NOT_FOUND' | 'ASSET_CHANGED' | 'ARTIFACT_NOT_FOUND' | 'JOB_NOT_FOUND' | 'JOB_LIMIT' | 'JOB_CANCELLED' | 'ENV_NOT_READY' | 'BLENDER_PATH_INVALID' | 'BLENDER_PROBE_FAILED' | 'BRIDGE_UNREACHABLE' | 'BRIDGE_AUTH_FAILED' | 'BRIDGE_TIMEOUT' | 'BRIDGE_PROTOCOL_ERROR' | 'BRIDGE_HOST_FORBIDDEN' | 'ASSET_REQUIRED' | 'ASSET_SIZE' | 'ASSET_FORMAT' | 'ASSET_LIMIT' | 'POLYHAVEN_DISABLED' | 'POLYHAVEN_FAILED' | 'POLYHAVEN_NOT_FOUND' | 'STORAGE_UNSAFE' | 'PROJECT_CORRUPT' | 'CONFIRM_REQUIRED' | 'JOB_TIMEOUT' | 'LOCK_LOST' | 'CLI_FAILED' | 'OUTPUT_INVALID' | 'OUTPUT_TOO_LARGE' | 'ORIGIN_FORBIDDEN' | 'DOWNLOAD_INVALID' | 'PLUGIN_DISPOSED';
export declare const BLENDER_TEMPLATE_IDS: readonly BlenderTemplateId[];
export declare const BLENDER_ENGINES: readonly BlenderRenderEngine[];
export declare const BLENDER_ASPECTS: readonly BlenderAspect[];
export declare const BLENDER_RESOLUTION_SCALES: readonly BlenderResolutionScale[];
export declare const BLENDER_FPS_VALUES: readonly BlenderFps[];
export declare const BLENDER_CAMERA_PRESETS: readonly BlenderCameraPreset[];
export declare const BLENDER_LIGHTING_PRESETS: readonly BlenderLightingPreset[];
export declare const BLENDER_MATERIAL_PRESETS: readonly BlenderMaterialPreset[];
export declare const BLENDER_SCRIPT_MODES: readonly BlenderScriptMode[];
export declare const BLENDER_EXPORT_FORMATS: readonly BlenderExportFormat[];
export declare const BLENDER_ARTIFACT_KINDS: readonly BlenderArtifactKind[];
export declare const ASPECT_RESOLUTIONS: Record<BlenderAspect, [number, number]>;
export declare const ARTIFACT_MIME_MAP: Record<string, string>;
export declare const MAX_ACTIVE_PROJECTS = 30;
export declare const MAX_PROJECT_ASSETS = 24;
export declare const MAX_ASSET_BYTES: number;
export declare const MAX_PROJECT_ASSETS_BYTES: number;
export declare const MAX_PROJECT_ARTIFACTS = 20;
export declare const MAX_ARTIFACT_DOWNLOAD_BYTES: number;
export declare const MAX_CUSTOM_SCRIPT_BYTES: number;
export declare const MAX_PROJECT_JSON_BYTES: number;
export declare const MAX_JOB_LOG_LINES = 80;
export declare const SCENE_JSON_MARKER = "__DSH_SCENE_JSON__=";
export declare const DEFAULT_BRIDGE_HOST = "127.0.0.1";
export declare const DEFAULT_BRIDGE_PORT = 9876;
export declare class BlenderError extends Error {
    readonly code: BlenderErrorCode | string;
    readonly status: number;
    constructor(message: string, code: BlenderErrorCode | string, status?: number);
}
export declare class BlenderConflict extends BlenderError {
    constructor(message: string);
}
export declare function blenderId(value: unknown): string;
export declare function sanitizeFileName(name: string, maxLength?: number): string;
export declare function defaultProjectFields(overrides?: Partial<BlenderProjectFields>): BlenderProjectFields;
export interface ValidateProjectFieldsOptions {
    defaults?: Partial<BlenderProjectFields>;
    strict?: boolean;
}
export declare function validateProjectFields(value: unknown, options?: ValidateProjectFieldsOptions): BlenderProjectFields;
export declare function validateExportFormat(value: unknown): BlenderExportFormat;
export declare function resolveRenderResolution(aspect: BlenderAspect, resolutionScale: number): {
    width: number;
    height: number;
};
export declare function scrubLogText(text: string, maxLength?: number): string;
