import { type BlenderBridgeStatus, type BlenderEnvironmentStatus, type BlenderExecutableInfo, type BlenderGpuInfo, type BlenderSettings } from './types.js';
export type BlenderVersionProber = (execPath: string, timeoutMs: number) => Promise<{
    ok: boolean;
    stdout: string;
    stderr?: string;
    error?: string;
}>;
export type BlenderGpuProber = (execPath: string, timeoutMs: number) => Promise<BlenderGpuInfo>;
export interface BlenderCandidate {
    path: string;
    source: BlenderExecutableInfo['source'];
}
export interface BlenderEnvironmentOptions {
    root?: string;
    prober?: BlenderVersionProber;
    gpuProber?: BlenderGpuProber;
    probeGpu?: boolean;
    extraCandidates?: BlenderCandidate[];
    skipSystemScan?: boolean;
    probeTimeoutMs?: number;
}
export declare function isLoopbackHost(host: string): boolean;
export declare function defaultBlenderSettings(): BlenderSettings;
export declare function parseCyclesGpuProbeOutput(stdout: string): BlenderGpuInfo;
export declare function defaultProbeCyclesGpu(execPath: string, timeoutMs?: number): Promise<BlenderGpuInfo>;
export declare function parseBlenderVersionOutput(output: string): {
    version: string;
    major: number;
    minor: number;
    patch: number;
} | null;
export declare function buildExecutableInfo(execPath: string, versionOutput: string, source: BlenderExecutableInfo['source']): BlenderExecutableInfo | null;
export declare function defaultProbeBlender(execPath: string, timeoutMs?: number): Promise<{
    ok: boolean;
    stdout: string;
    stderr?: string;
    error?: string;
}>;
export declare class BlenderEnvironment {
    readonly root: string;
    readonly settingsFile: string;
    private readonly prober;
    private readonly gpuProber;
    private readonly shouldProbeGpu;
    private readonly extraCandidates;
    private readonly skipSystemScan;
    private readonly probeTimeoutMs;
    private cachedDetect?;
    private gpuCache;
    constructor(options?: BlenderEnvironmentOptions);
    getSettings(): Promise<BlenderSettings>;
    private saveSettings;
    probeExecutable(execPath: string, source?: BlenderExecutableInfo['source']): Promise<BlenderExecutableInfo>;
    configure(patch: Partial<BlenderSettings>): Promise<BlenderSettings>;
    probeCyclesGpu(execPath: string, options?: {
        force?: boolean;
    }): Promise<BlenderGpuInfo>;
    detect(options?: {
        force?: boolean;
        probeGpu?: boolean;
    }): Promise<{
        active?: BlenderExecutableInfo;
        detected: BlenderExecutableInfo[];
    }>;
    requireActiveExecutable(): Promise<BlenderExecutableInfo>;
    status(bridgePatch?: Partial<BlenderBridgeStatus>, options?: {
        forceDetect?: boolean;
        probeGpu?: boolean;
    }): Promise<BlenderEnvironmentStatus>;
}
