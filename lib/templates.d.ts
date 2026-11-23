import { type BlenderExportFormat, type BlenderJobKind, type BlenderProject, type BlenderProjectFields, type BlenderTemplateId, type BlenderTemplateMeta } from './types.js';
export declare const BLENDER_TEMPLATES: readonly BlenderTemplateMeta[];
export declare function getTemplateMeta(id: BlenderTemplateId): BlenderTemplateMeta;
export interface RunnerHarnessOptions {
    project: BlenderProject;
    assetsDir: string;
    outputPath?: string;
    format?: BlenderExportFormat;
    overrideCode?: string;
    frame?: number;
    contactSheetWidth?: number;
    contactSheetHeight?: number;
}
export declare function generateSceneScript(project: BlenderProject | BlenderProjectFields, assetsDir?: string): string;
export declare function generateRunnerHarness(mode: BlenderJobKind, options: RunnerHarnessOptions): string;
