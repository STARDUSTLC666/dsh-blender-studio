import { type AsyncZippable } from 'fflate';
import { movePathToTrash, movePathsToTrash } from './trash.js';
export type TrashPathFn = typeof movePathToTrash;
export type TrashPathsFn = typeof movePathsToTrash;
import { BlenderConflict, BlenderError, blenderId, type BlenderArtifact, type BlenderAsset, type BlenderAssetKind, type BlenderProject, type BlenderSceneSummary, type BlenderWorkflowEvent } from './types.js';
export { BlenderConflict, BlenderError, blenderId };
export declare function zipAsync(files: AsyncZippable): Promise<Uint8Array>;
export declare function validateAssetUpload(fileName: string, bytes: Buffer, preferredKind?: BlenderAssetKind): {
    kind: BlenderAssetKind;
    ext: string;
    normalizedName: string;
};
export interface AddAssetOptions {
    kind?: BlenderAssetKind;
    source?: 'upload' | 'polyhaven';
    sourceId?: string;
}
export interface PatchScriptOptions {
    replaceAll?: boolean;
    note?: string;
}
export interface ScriptPatchEdit {
    find: string;
    replace: string;
    replaceAll?: boolean;
}
export declare function applyScriptPatch(source: string, find: string, replace: string, replaceAll?: boolean): {
    patched: string;
    replacements: number;
};
export declare function applyScriptPatches(source: string, edits: readonly ScriptPatchEdit[]): {
    patched: string;
    replacements: number;
    appliedEdits: number;
};
export declare class BlenderStore {
    readonly root: string;
    private readonly customTrashPath?;
    private readonly customTrashPaths?;
    constructor(root?: string, options?: {
        trashPath?: TrashPathFn;
        trashPaths?: TrashPathsFn;
    });
    private trashDirs;
    init(): Promise<void>;
    checkPath(targetPath: string): Promise<void>;
    path(id: string, archived?: boolean): Promise<string>;
    private writeProjectFile;
    get(id: string, archived?: boolean): Promise<BlenderProject>;
    listWithWarnings(archived?: boolean): Promise<{
        projects: BlenderProject[];
        corrupted: Array<{
            id: string;
            detail: string;
        }>;
    }>;
    list(archived?: boolean): Promise<BlenderProject[]>;
    create(value: unknown): Promise<BlenderProject>;
    edit(id: string, revision: unknown, fn: (project: BlenderProject) => Promise<void> | void, bump?: boolean): Promise<BlenderProject>;
    private makeCheckpoint;
    private pushCheckpoint;
    update(id: string, revision: unknown, value: unknown): Promise<BlenderProject>;
    patchScript(id: string, revision: unknown, find: string, replace: string, noteOrOptions?: string | PatchScriptOptions): Promise<{
        project: BlenderProject;
        replacements: number;
    }>;
    patchScriptEdits(id: string, revision: unknown, edits: readonly ScriptPatchEdit[], note?: string): Promise<{
        project: BlenderProject;
        replacements: number;
        appliedEdits: number;
    }>;
    saveCheckpoint(id: string, revision: unknown, note?: string): Promise<BlenderProject>;
    restoreCheckpoint(id: string, revision: unknown, checkpointId: string): Promise<BlenderProject>;
    archive(id: string, revision: unknown, restore?: boolean): Promise<BlenderProject>;
    trash(id: string, revision: unknown, archived?: boolean): Promise<BlenderProject>;
    trashArchived(): Promise<{
        trashedCount: number;
        ids: string[];
    }>;
    trashCorrupted(items?: Array<{
        id: string;
        archived?: boolean;
    }>): Promise<{
        trashedCount: number;
        ids: string[];
    }>;
    duplicate(id: string, titleOverride?: string): Promise<BlenderProject>;
    addAsset(id: string, revision: unknown, name: string, bytes: Buffer, options?: AddAssetOptions): Promise<{
        project: BlenderProject;
        asset: BlenderAsset;
    }>;
    upload(id: string, revision: unknown, name: string, bytes: Buffer, options?: AddAssetOptions): Promise<BlenderProject>;
    assetPath(id: string, assetId: string): Promise<{
        file: string;
        asset: BlenderAsset;
    }>;
    assetBytes(id: string, asset: BlenderAsset): Promise<Buffer>;
    removeAsset(id: string, revision: unknown, assetId: string): Promise<BlenderProject>;
    runDir(id: string, runId: string): Promise<string>;
    safeRemoveRunDir(id: string, runId: string): Promise<void>;
    pruneRunWorkdir(runDirPath: string, keepFiles?: string[]): Promise<void>;
    pruneOldRuns(projectDir: string, keepIds?: Iterable<string>, maxRetained?: number): Promise<string[]>;
    registerArtifact(id: string, artifact: BlenderArtifact): Promise<BlenderProject>;
    appendWorkflowEvent(id: string, input: Omit<BlenderWorkflowEvent, 'id' | 'seq' | 'timestamp'> & {
        id?: string;
        timestamp?: string;
    }): Promise<BlenderWorkflowEvent>;
    clearWorkflowHistory(id: string, revision: unknown): Promise<BlenderProject>;
    artifactPath(id: string, artifactId: string): Promise<{
        file: string;
        artifact: BlenderArtifact;
        mime: string;
    }>;
    updateSceneSummary(id: string, summary: BlenderSceneSummary): Promise<BlenderProject>;
    snapshot(id: string, revision?: unknown): Promise<{
        project: BlenderProject;
        assets: Map<string, Buffer>;
    }>;
    buildSourceZip(id: string, generateSceneFn?: (project: BlenderProject) => string): Promise<Uint8Array>;
}
