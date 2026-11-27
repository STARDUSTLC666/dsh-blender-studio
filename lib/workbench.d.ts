import { BlenderBridgeClient, checkScriptSafety, type BridgeAddonInstallExecutor, type BridgeExecuteOptions, type BridgeExecuteResult, type BridgeLoadScriptOptions, type BridgeLoadScriptResult, type BridgeSetCameraOptions, type BridgeSetCameraResult, type BridgeSetMaterialColorOptions, type BridgeSetMaterialColorResult, type BridgeTransformObjectOptions, type BridgeTransformObjectResult, type BridgeViewportOptions, type BridgeViewportResult, type InstallBridgeAddonResult, type LaunchBlenderGuiResult } from './bridge.js';
import { BlenderEnvironment, type BlenderCandidate, type BlenderGpuProber, type BlenderVersionProber } from './environment.js';
import { PolyHavenClient } from './polyhaven.js';
import { BlenderRunner, type BlenderRunExecutor } from './runner.js';
import type { SkillBundleHealthReport, SkillsPluginContext } from './skill-bundle.js';
import { BlenderStore, type ScriptPatchEdit, type TrashPathFn, type TrashPathsFn } from './store.js';
import { BlenderWorkflowStore } from './workflow.js';
import { type BlenderBridgeStatus, type BlenderEnvironmentStatus, type BlenderExportFormat, type BlenderJob, type BlenderJobKind, type BlenderPipelineOptions, type BlenderProject, type BlenderQualityTier, type BlenderSceneSummary, type BlenderSettings, type BlenderShotPresetId, type BlenderWorkflowEvent, type BlenderWorkflowReplayOverrides, type BlenderWorkflowReplaySummary, type BlenderWorkflowSource } from './types.js';
export interface StartJobOptions {
    format?: BlenderExportFormat;
    frame?: number;
    code?: string;
    allowUnsafe?: boolean;
    timeoutMs?: number;
    pipeline?: BlenderPipelineOptions;
    shots?: BlenderShotPresetId[];
    qualityTier?: BlenderQualityTier;
    source?: BlenderWorkflowSource;
    skipWorkflowRecord?: boolean;
}
export interface ReplayWorkflowOptions {
    revision?: unknown;
    dryRun?: boolean;
    stopOnError?: boolean;
    skipIfBridgeOffline?: boolean;
    overrides?: BlenderWorkflowReplayOverrides;
    allowUnsafe?: boolean;
    source?: BlenderWorkflowSource;
    timeoutMs?: number;
}
export interface BlenderWorkbenchOptions {
    root?: string;
    store?: BlenderStore;
    environment?: BlenderEnvironment;
    runner?: BlenderRunner;
    bridge?: BlenderBridgeClient;
    polyHaven?: PolyHavenClient;
    addonPath?: string;
    prober?: BlenderVersionProber;
    gpuProber?: BlenderGpuProber;
    probeGpu?: boolean;
    executor?: BlenderRunExecutor;
    addonInstallExecutor?: BridgeAddonInstallExecutor;
    fetchImpl?: typeof fetch;
    skipSystemScan?: boolean;
    extraCandidates?: BlenderCandidate[];
    launchGui?: (executablePath: string, blendFile?: string) => Promise<LaunchBlenderGuiResult>;
    checkSkillsHealth?: () => Promise<SkillBundleHealthReport>;
    trashPath?: TrashPathFn;
    trashPaths?: TrashPathsFn;
}
export declare class BlenderWorkbench {
    readonly store: BlenderStore;
    readonly environment: BlenderEnvironment;
    readonly runner: BlenderRunner;
    readonly bridge: BlenderBridgeClient;
    readonly polyHaven: PolyHavenClient;
    readonly workflows: BlenderWorkflowStore;
    readonly route = "/api/dsh-blender-studio/workbench";
    readonly addonPath: string;
    private readonly hasCustomBridge;
    private readonly launchGuiFn;
    private readonly addonInstallExecutor?;
    private readonly jobs;
    private starting;
    private disposed;
    private lastBridgeStatus?;
    constructor(options?: BlenderWorkbenchOptions);
    private syncBridgeFromSettings;
    bridgeStatus(timeoutMs?: number): Promise<BlenderBridgeStatus>;
    bridgeSceneInfo(): Promise<BlenderSceneSummary>;
    bridgeExecute(code: string, opts?: BridgeExecuteOptions & {
        allowUnsafe?: boolean;
    }): Promise<BridgeExecuteResult>;
    bridgeViewport(opts?: BridgeViewportOptions): Promise<BridgeViewportResult>;
    bridgeSetCamera(opts: BridgeSetCameraOptions): Promise<BridgeSetCameraResult>;
    bridgeTransformObject(opts: BridgeTransformObjectOptions): Promise<BridgeTransformObjectResult>;
    bridgeSetMaterialColor(opts: BridgeSetMaterialColorOptions): Promise<BridgeSetMaterialColorResult>;
    bridgeSyncProject(id: string, opts?: BridgeLoadScriptOptions & {
        allowUnsafe?: boolean;
        lookdevOverrides?: BlenderWorkflowReplayOverrides;
    }): Promise<BridgeLoadScriptResult & {
        projectId: string;
        revision: number;
    }>;
    installAddon(): Promise<InstallBridgeAddonResult>;
    isWorkflowRecordingEnabled(): Promise<boolean>;
    recordWorkflowEvent(projectId: string, event: Omit<BlenderWorkflowEvent, 'id' | 'seq' | 'timestamp'>, options?: {
        force?: boolean;
    }): Promise<BlenderWorkflowEvent | null>;
    readProjectScript(id: string, opts?: {
        startLine?: number;
        endLine?: number;
        pattern?: string;
        maxMatches?: number;
    }): Promise<{
        id: string;
        title: string;
        revision: number;
        scriptMode: BlenderProject['scriptMode'];
        totalLines: number;
        byteLength: number;
        startLine: number;
        endLine: number;
        content: string;
        matches?: Array<{
            line: number;
            text: string;
        }>;
    }>;
    createFromExemplar(exemplarId: string, titleOverride?: string, source?: BlenderWorkflowSource): Promise<BlenderProject>;
    patchProjectScript(id: string, revision: unknown, opts: {
        find?: string;
        replace?: string;
        replaceAll?: boolean;
        edits?: ScriptPatchEdit[];
        note?: string;
        allowUnsafe?: boolean;
        source?: BlenderWorkflowSource;
        skipWorkflowRecord?: boolean;
    }): Promise<BlenderProject & {
        project: BlenderProject;
        replacements: number;
        appliedEdits: number;
        safety: ReturnType<typeof checkScriptSafety>;
    }>;
    environmentStatus(options?: {
        probeBridge?: boolean;
        bridgeTimeoutMs?: number;
        forceDetect?: boolean;
    }): Promise<BlenderEnvironmentStatus>;
    configureSettings(patch: Partial<BlenderSettings>): Promise<BlenderEnvironmentStatus>;
    listJobs(): BlenderJob[];
    getJob(id: string): BlenderJob;
    cancelJob(id: string): BlenderJob;
    waitForJob(id: string): Promise<BlenderJob>;
    dispose(): void;
    private pushJobLine;
    private setStage;
    startJob(kind: BlenderJobKind, id: string, revision?: unknown, options?: StartJobOptions): Promise<BlenderJob>;
    private runHarnessStage;
    private executeJob;
    replayWorkflow(workflowId: string, projectId: string, options?: ReplayWorkflowOptions): Promise<BlenderJob | {
        dryRun: true;
        workflowReplay: BlenderWorkflowReplaySummary;
        projectId: string;
        revision: number;
    }>;
    private executeWorkflowReplay;
    openGui(id: string, revision?: unknown): Promise<{
        launched: boolean;
        executable: string;
        blendFile: string;
        pid?: number;
        built: boolean;
        job?: BlenderJob;
    }>;
    private guard;
    private streamFileWithRange;
    fetch(request: Request): Promise<Response>;
}
export interface InstallBlenderWorkbenchOptions extends BlenderWorkbenchOptions {
    workbench?: BlenderWorkbench;
    checkSkillsHealth?: () => Promise<SkillBundleHealthReport>;
    onDispose?: () => void;
}
export declare function installBlenderWorkbench(ctx: SkillsPluginContext & Record<string, any>, options?: InstallBlenderWorkbenchOptions): BlenderWorkbench;
