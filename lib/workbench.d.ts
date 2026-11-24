import { BlenderBridgeClient, type BridgeExecuteOptions, type BridgeExecuteResult, type BridgeLoadScriptOptions, type BridgeLoadScriptResult, type BridgeViewportOptions, type BridgeViewportResult, type LaunchBlenderGuiResult } from './bridge.js';
import { BlenderEnvironment, type BlenderCandidate, type BlenderVersionProber } from './environment.js';
import { PolyHavenClient } from './polyhaven.js';
import { BlenderRunner, type BlenderRunExecutor } from './runner.js';
import type { SkillBundleHealthReport, SkillsPluginContext } from './skill-bundle.js';
import { BlenderStore } from './store.js';
import { type BlenderBridgeStatus, type BlenderEnvironmentStatus, type BlenderExportFormat, type BlenderJob, type BlenderJobKind, type BlenderPipelineOptions, type BlenderSceneSummary, type BlenderSettings } from './types.js';
export interface StartJobOptions {
    format?: BlenderExportFormat;
    frame?: number;
    code?: string;
    allowUnsafe?: boolean;
    timeoutMs?: number;
    pipeline?: BlenderPipelineOptions;
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
    executor?: BlenderRunExecutor;
    fetchImpl?: typeof fetch;
    skipSystemScan?: boolean;
    extraCandidates?: BlenderCandidate[];
    launchGui?: (executablePath: string, blendFile?: string) => Promise<LaunchBlenderGuiResult>;
    checkSkillsHealth?: () => Promise<SkillBundleHealthReport>;
}
export declare class BlenderWorkbench {
    readonly store: BlenderStore;
    readonly environment: BlenderEnvironment;
    readonly runner: BlenderRunner;
    readonly bridge: BlenderBridgeClient;
    readonly polyHaven: PolyHavenClient;
    readonly route = "/api/dsh-blender-studio/workbench";
    readonly addonPath: string;
    private readonly hasCustomBridge;
    private readonly launchGuiFn;
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
    bridgeSyncProject(id: string, opts?: BridgeLoadScriptOptions & {
        allowUnsafe?: boolean;
    }): Promise<BridgeLoadScriptResult & {
        projectId: string;
        revision: number;
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
