import { type AsyncZippable } from 'fflate';
import { movePathToTrash } from './trash.js';
export type TrashPathFn = typeof movePathToTrash;
import { BlenderConflict, BlenderError, blenderId, type BlenderArtifact, type BlenderAsset, type BlenderAssetKind, type BlenderProject, type BlenderSceneSummary } from './types.js';
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
export declare class BlenderStore {
    readonly root: string;
    private readonly trashPath;
    constructor(root?: string, options?: {
        trashPath?: TrashPathFn;
    });
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
    saveCheckpoint(id: string, revision: unknown, note?: string): Promise<BlenderProject>;
    restoreCheckpoint(id: string, revision: unknown, checkpointId: string): Promise<BlenderProject>;
    archive(id: string, revision: unknown, restore?: boolean): Promise<BlenderProject>;
    trash(id: string, revision: unknown, archived?: boolean): Promise<BlenderProject>;
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
