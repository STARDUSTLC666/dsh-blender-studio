import { type BlenderWorkflowEvent, type BlenderWorkflowRecipe, type BlenderWorkflowRecipeSummary, type BlenderWorkflowReplayableKind, type BlenderWorkflowReplayOverrides, type BlenderWorkflowStep } from './types.js';
export declare const BUILTIN_WORKFLOW_RECIPES: readonly BlenderWorkflowRecipe[];
export declare function isReplayableWorkflowKind(kind: string): kind is BlenderWorkflowReplayableKind;
export declare function defaultStepLabel(kind: BlenderWorkflowReplayableKind, params?: Record<string, unknown>): string;
export declare function validateWorkflowReplayOverrides(raw: unknown): BlenderWorkflowReplayOverrides;
export declare function isWorkflowEventReplayable(ev: BlenderWorkflowEvent | null | undefined): boolean;
export declare function validateWorkflowStep(raw: unknown, index: number): BlenderWorkflowStep;
export declare function validateWorkflowRecipeInput(raw: unknown): {
    name: string;
    description: string;
    tags: string[];
    steps: BlenderWorkflowStep[];
    sourceProjectId?: string;
    sourceProjectTitle?: string;
};
export interface BuildRecipeFromHistoryOptions {
    name: string;
    description?: string;
    tags?: string[];
    eventIds?: string[];
    includeScriptPatches?: boolean;
    coalesceLookdev?: boolean;
    sourceProjectId?: string;
    sourceProjectTitle?: string;
}
export declare function buildRecipeFromHistory(events: readonly BlenderWorkflowEvent[], options: BuildRecipeFromHistoryOptions): ReturnType<typeof validateWorkflowRecipeInput>;
export declare function summarizeWorkflowRecipe(recipe: BlenderWorkflowRecipe): BlenderWorkflowRecipeSummary;
export declare function extractLookdevDiff(before: Record<string, unknown>, after: Record<string, unknown>): Record<string, unknown>;
export declare class BlenderWorkflowStore {
    readonly root: string;
    readonly dir: string;
    constructor(root?: string);
    private ensureDir;
    private recipeFile;
    private assertSafeFile;
    private getBuiltin;
    list(): Promise<BlenderWorkflowRecipeSummary[]>;
    listFull(): Promise<BlenderWorkflowRecipe[]>;
    private listUserRecipes;
    get(id: string): Promise<BlenderWorkflowRecipe>;
    save(input: unknown): Promise<BlenderWorkflowRecipe>;
    delete(id: string): Promise<{
        deleted: true;
        id: string;
    }>;
    exportRecipe(id: string): Promise<BlenderWorkflowRecipe>;
    importRecipe(payload: unknown): Promise<BlenderWorkflowRecipe>;
}
