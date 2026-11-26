import { type SkillsPluginContext } from './skill-bundle.js';
export { BlenderWorkbench, installBlenderWorkbench } from './workbench.js';
export type { BlenderWorkbenchOptions, InstallBlenderWorkbenchOptions, StartJobOptions } from './workbench.js';
export { applyScriptPatch, applyScriptPatches, BlenderStore, validateAssetUpload, zipAsync } from './store.js';
export type { PatchScriptOptions, ScriptPatchEdit } from './store.js';
export { BlenderEnvironment, buildExecutableInfo, defaultBlenderSettings, defaultProbeCyclesGpu, parseBlenderVersionOutput, parseCyclesGpuProbeOutput, } from './environment.js';
export type { BlenderCandidate, BlenderEnvironmentOptions, BlenderGpuProber, BlenderVersionProber, } from './environment.js';
export { BlenderRunner, DEFAULT_CYCLES_TIMEOUT_MS, DEFAULT_EEVEE_TIMEOUT_MS, parseBlenderProgressLine, parseSceneSummaryFromOutput, parseShotDoneFromLine, } from './runner.js';
export type { BlenderRunExecutor, BlenderRunRequest, BlenderRunResult, BlenderRunnerOptions, ParsedShotDone, } from './runner.js';
export { PolyHavenClient, validatePolyHavenUrl } from './polyhaven.js';
export type { PolyHavenClientOptions, PolyHavenDownloadResult } from './polyhaven.js';
export { BlenderBridgeClient, checkScriptSafety, installBridgeAddon, isLoopbackHost, launchBlenderGui, normalizeLoopbackHost, } from './bridge.js';
export type { BlenderBridgeClientOptions, BridgeAddonInstallExecutor, BridgeExecuteOptions, BridgeExecuteResult, BridgeLoadScriptOptions, BridgeLoadScriptResult, BridgePingResult, BridgeSetCameraOptions, BridgeSetCameraResult, BridgeSetMaterialColorOptions, BridgeSetMaterialColorResult, BridgeTransformObjectOptions, BridgeTransformObjectResult, BridgeVec3, BridgeViewportOptions, BridgeViewportResult, InstallBridgeAddonOptions, InstallBridgeAddonResult, LaunchBlenderGuiResult, } from './bridge.js';
export { BLENDER_TEMPLATES, generateRunnerHarness, generateSceneScript, getTemplateMeta, } from './templates.js';
export type { GenerateSceneOptions, RunnerHarnessOptions } from './templates.js';
export { BLENDER_EXEMPLARS, getExemplar, listExemplarSummaries } from './exemplars.js';
export { registerBlenderTools } from './tools.js';
export type { RegisterBlenderToolsOptions } from './tools.js';
export { createSkillBundle, parseSkillFile } from './skill-bundle.js';
export type { ParsedSkillFile, SkillBundleHandle, SkillBundleHealthReport, SkillBundleOptions, SkillFileCheck, SkillHealthCheck, SkillRegistration, SkillsPluginContext, } from './skill-bundle.js';
export { ASPECT_RESOLUTIONS, ARTIFACT_MIME_MAP, BLENDER_COMPUTE_DEVICES, BLENDER_QUALITY_TIERS, BLENDER_SHOT_PRESETS, BlenderConflict, BlenderError, blenderId, DEFAULT_MULTI_SHOT_IDS, defaultProjectFields, MAX_SCRIPT_CHECKPOINTS, resolveRenderResolution, sanitizeFileName, scrubLogText, SHOT_DONE_MARKER, validateExportFormat, validateProjectFields, validateShotPresetIds, } from './types.js';
export type { BlenderArtifact, BlenderArtifactKind, BlenderAspect, BlenderAsset, BlenderAssetKind, BlenderBridgeStatus, BlenderCameraPreset, BlenderComputeDevice, BlenderEnvironmentStatus, BlenderErrorCode, BlenderExecutableInfo, BlenderExemplarCategory, BlenderExemplarDefinition, BlenderExemplarSummary, BlenderExportFormat, BlenderGpuBackend, BlenderGpuInfo, BlenderJob, BlenderJobKind, BlenderLightingPreset, BlenderMaterialPreset, BlenderPipelineOptions, BlenderPipelineSummary, BlenderProject, BlenderProjectFields, BlenderQualityTier, BlenderRenderEngine, BlenderSceneObjectSummary, BlenderSceneQcGrade, BlenderSceneQcIssue, BlenderSceneQcReport, BlenderSceneQcSeverity, BlenderSceneSummary, BlenderScriptCheckpoint, BlenderScriptMode, BlenderSettings, BlenderShotPresetId, BlenderShotPresetMeta, BlenderShotResult, BlenderTemplateId, BlenderTemplateMeta, PolyHavenAssetItem, PolyHavenAssetType, ScriptSafetyFinding, ScriptSafetyResult, } from './types.js';
export declare const name = "blender-studio";
export declare const inject: string[];
export declare const SKILL_NAMES: readonly ["blender-scene-architecture", "blender-bpy-scripting", "blender-materials-lighting", "blender-geometry-nodes", "blender-camera-animation", "blender-rendering-export", "blender-grease-pencil", "blender-visual-qc", "blender-production-pipeline"];
/** Absolute bundled skills directory shipped inside this package. */
export declare function bundledSkillsDir(): string;
/** Absolute path to the single-file zero-dependency Blender Live Bridge Add-on. */
export declare function bundledAddonPath(): string;
/** Re-read and validate disk skill resources; runtime state is checked by blender_health. */
export declare function checkBundledSkills(): import("./skill-bundle.js").SkillFileCheck[];
/** Register dsh-blender-studio updates, bundled skills, HTTP workbench routes, and all 6 Agent tools. */
export declare function apply(ctx: SkillsPluginContext): void;
