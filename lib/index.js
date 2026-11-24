import { fileURLToPath } from 'node:url';
import { registerUpdates } from '@stardustlc/dsh-updates';
import { createSkillBundle } from './skill-bundle.js';
import { installBlenderWorkbench } from './workbench.js';
export { BlenderWorkbench, installBlenderWorkbench } from './workbench.js';
export { BlenderStore, validateAssetUpload, zipAsync } from './store.js';
export { BlenderEnvironment, buildExecutableInfo, defaultBlenderSettings, parseBlenderVersionOutput, } from './environment.js';
export { BlenderRunner, DEFAULT_CYCLES_TIMEOUT_MS, DEFAULT_EEVEE_TIMEOUT_MS, parseBlenderProgressLine, parseSceneSummaryFromOutput, } from './runner.js';
export { PolyHavenClient, validatePolyHavenUrl } from './polyhaven.js';
export { BlenderBridgeClient, checkScriptSafety, isLoopbackHost, launchBlenderGui, normalizeLoopbackHost, } from './bridge.js';
export { BLENDER_TEMPLATES, generateRunnerHarness, generateSceneScript, getTemplateMeta, } from './templates.js';
export { registerBlenderTools } from './tools.js';
export { createSkillBundle, parseSkillFile } from './skill-bundle.js';
export { ASPECT_RESOLUTIONS, ARTIFACT_MIME_MAP, BLENDER_QUALITY_TIERS, BlenderConflict, BlenderError, blenderId, defaultProjectFields, MAX_SCRIPT_CHECKPOINTS, resolveRenderResolution, sanitizeFileName, scrubLogText, validateExportFormat, validateProjectFields, } from './types.js';
export const name = 'blender-studio';
export const inject = ['skills', 'tools'];
export const SKILL_NAMES = [
    'blender-scene-architecture',
    'blender-bpy-scripting',
    'blender-materials-lighting',
    'blender-geometry-nodes',
    'blender-camera-animation',
    'blender-rendering-export',
    'blender-grease-pencil',
    'blender-visual-qc',
    'blender-production-pipeline',
];
/** Absolute bundled skills directory shipped inside this package. */
export function bundledSkillsDir() {
    return fileURLToPath(new URL('../skills/', import.meta.url));
}
/** Absolute path to the single-file zero-dependency Blender Live Bridge Add-on. */
export function bundledAddonPath() {
    return fileURLToPath(new URL('../blender/dsh_blender_bridge.py', import.meta.url));
}
const bundle = createSkillBundle({
    plugin: 'dsh-blender-studio',
    healthTool: 'blender_health',
    registerHealthTool: false,
    names: SKILL_NAMES,
    directory: bundledSkillsDir,
});
/** Re-read and validate disk skill resources; runtime state is checked by blender_health. */
export function checkBundledSkills() {
    return bundle.checkFiles();
}
/** Register dsh-blender-studio updates, bundled skills, HTTP workbench routes, and all 6 Agent tools. */
export function apply(ctx) {
    registerUpdates(ctx, { name: 'dsh-blender-studio' });
    const skillHandle = bundle.apply(ctx);
    installBlenderWorkbench(ctx, {
        addonPath: bundledAddonPath(),
        checkSkillsHealth: skillHandle.checkHealth,
        onDispose: skillHandle.dispose,
    });
}
