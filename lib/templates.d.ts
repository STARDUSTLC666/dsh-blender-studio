import { type BlenderComputeDevice, type BlenderExportFormat, type BlenderJobKind, type BlenderProject, type BlenderProjectFields, type BlenderShotPresetId, type BlenderTemplateId, type BlenderTemplateMeta } from './types.js';
export declare const BLENDER_TEMPLATES: readonly BlenderTemplateMeta[];
export declare function getTemplateMeta(id: BlenderTemplateId): BlenderTemplateMeta;
export interface GenerateSceneOptions {
    computeDevice?: BlenderComputeDevice;
    applyLookdevOverrides?: boolean;
    enforceRenderProfile?: boolean;
}
export interface RunnerHarnessOptions {
    project: BlenderProject;
    assetsDir: string;
    outputPath?: string;
    outputDir?: string;
    format?: BlenderExportFormat;
    overrideCode?: string;
    frame?: number;
    contactSheetWidth?: number;
    contactSheetHeight?: number;
    shots?: BlenderShotPresetId[];
    computeDevice?: BlenderComputeDevice;
    enforceRenderProfile?: boolean;
}
export declare function generateSceneScript(project: BlenderProject | BlenderProjectFields, assetsDir?: string, options?: GenerateSceneOptions): string;
export declare function generateRunnerHarness(mode: BlenderJobKind, options: RunnerHarnessOptions): string;
