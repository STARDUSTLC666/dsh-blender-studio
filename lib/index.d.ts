import { type SkillsPluginContext } from './skill-bundle.js';
export { BlenderWorkbench, installBlenderWorkbench } from './workbench.js';
export type { BlenderWorkbenchOptions, InstallBlenderWorkbenchOptions, StartJobOptions } from './workbench.js';
export { BlenderStore, validateAssetUpload, zipAsync } from './store.js';
export { BlenderEnvironment, buildExecutableInfo, defaultBlenderSettings, parseBlenderVersionOutput, } from './environment.js';
export type { BlenderCandidate, BlenderEnvironmentOptions, BlenderVersionProber } from './environment.js';
export { BlenderRunner, parseBlenderProgressLine, parseSceneSummaryFromOutput } from './runner.js';
export type { BlenderRunExecutor, BlenderRunRequest, BlenderRunResult, BlenderRunnerOptions } from './runner.js';
export { PolyHavenClient, validatePolyHavenUrl } from './polyhaven.js';
export type { PolyHavenClientOptions, PolyHavenDownloadResult } from './polyhaven.js';
export { BlenderBridgeClient, checkScriptSafety, isLoopbackHost, launchBlenderGui, normalizeLoopbackHost, } from './bridge.js';
export type { BlenderBridgeClientOptions, BridgeExecuteOptions, BridgeExecuteResult, BridgeLoadScriptOptions, BridgeLoadScriptResult, BridgePingResult, BridgeViewportOptions, BridgeViewportResult, LaunchBlenderGuiResult, } from './bridge.js';
export { BLENDER_TEMPLATES, generateRunnerHarness, generateSceneScript, getTemplateMeta, } from './templates.js';
export type { RunnerHarnessOptions } from './templates.js';
export { registerBlenderTools } from './tools.js';
export type { RegisterBlenderToolsOptions } from './tools.js';
export { createSkillBundle, parseSkillFile } from './skill-bundle.js';
export type { ParsedSkillFile, SkillBundleHandle, SkillBundleHealthReport, SkillBundleOptions, SkillFileCheck, SkillHealthCheck, SkillRegistration, SkillsPluginContext, } from './skill-bundle.js';
export { ASPECT_RESOLUTIONS, ARTIFACT_MIME_MAP, BlenderConflict, BlenderError, blenderId, defaultProjectFields, resolveRenderResolution, sanitizeFileName, scrubLogText, validateExportFormat, validateProjectFields, } from './types.js';
export type { BlenderArtifact, BlenderArtifactKind, BlenderAspect, BlenderAsset, BlenderAssetKind, BlenderBridgeStatus, BlenderCameraPreset, BlenderEnvironmentStatus, BlenderErrorCode, BlenderExecutableInfo, BlenderExportFormat, BlenderJob, BlenderJobKind, BlenderLightingPreset, BlenderMaterialPreset, BlenderProject, BlenderProjectFields, BlenderRenderEngine, BlenderSceneObjectSummary, BlenderSceneSummary, BlenderScriptMode, BlenderSettings, BlenderTemplateId, BlenderTemplateMeta, PolyHavenAssetItem, PolyHavenAssetType, ScriptSafetyFinding, ScriptSafetyResult, } from './types.js';
export declare const name = "blender-studio";
export declare const inject: string[];
export declare const SKILL_NAMES: readonly ["blender-scene-architecture", "blender-bpy-scripting", "blender-materials-lighting", "blender-geometry-nodes", "blender-camera-animation", "blender-rendering-export", "blender-grease-pencil", "blender-visual-qc"];
/** Absolute bundled skills directory shipped inside this package. */
export declare function bundledSkillsDir(): string;
/** Absolute path to the single-file zero-dependency Blender Live Bridge Add-on. */
export declare function bundledAddonPath(): string;
/** Re-read and validate disk skill resources; runtime state is checked by blender_health. */
export declare function checkBundledSkills(): import("./skill-bundle.js").SkillFileCheck[];
/** Register dsh-blender-studio updates, bundled skills, HTTP workbench routes, and all 6 Agent tools. */
export declare function apply(ctx: SkillsPluginContext): void;
