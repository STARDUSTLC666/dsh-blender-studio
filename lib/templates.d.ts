import { type BlenderComputeDevice, type BlenderExportFormat, type BlenderJobKind, type BlenderProject, type BlenderProjectFields, type BlenderTemplateId, type BlenderTemplateMeta } from './types.js';
export declare const BLENDER_TEMPLATES: readonly BlenderTemplateMeta[];
export declare function getTemplateMeta(id: BlenderTemplateId): BlenderTemplateMeta;
export interface GenerateSceneOptions {
    computeDevice?: BlenderComputeDevice;
}
export interface RunnerHarnessOptions {
    project: BlenderProject;
    assetsDir: string;
    outputPath?: string;
    format?: BlenderExportFormat;
    overrideCode?: string;
    frame?: number;
    contactSheetWidth?: number;
    contactSheetHeight?: number;
    computeDevice?: BlenderComputeDevice;
}
export declare function generateSceneScript(project: BlenderProject | BlenderProjectFields, assetsDir?: string, options?: GenerateSceneOptions): string;
export declare function generateRunnerHarness(mode: BlenderJobKind, options: RunnerHarnessOptions): string;
