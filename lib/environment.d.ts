import { type BlenderBridgeStatus, type BlenderEnvironmentStatus, type BlenderExecutableInfo, type BlenderSettings } from './types.js';
export type BlenderVersionProber = (execPath: string, timeoutMs: number) => Promise<{
    ok: boolean;
    stdout: string;
    stderr?: string;
    error?: string;
}>;
export interface BlenderCandidate {
    path: string;
    source: BlenderExecutableInfo['source'];
}
export interface BlenderEnvironmentOptions {
    root?: string;
    prober?: BlenderVersionProber;
    extraCandidates?: BlenderCandidate[];
    skipSystemScan?: boolean;
    probeTimeoutMs?: number;
}
export declare function isLoopbackHost(host: string): boolean;
export declare function defaultBlenderSettings(): BlenderSettings;
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
    private readonly extraCandidates;
    private readonly skipSystemScan;
    private readonly probeTimeoutMs;
    private cachedDetect?;
    constructor(options?: BlenderEnvironmentOptions);
    getSettings(): Promise<BlenderSettings>;
    private saveSettings;
    probeExecutable(execPath: string, source?: BlenderExecutableInfo['source']): Promise<BlenderExecutableInfo>;
    configure(patch: Partial<BlenderSettings>): Promise<BlenderSettings>;
    detect(options?: {
        force?: boolean;
    }): Promise<{
        active?: BlenderExecutableInfo;
        detected: BlenderExecutableInfo[];
    }>;
    requireActiveExecutable(): Promise<BlenderExecutableInfo>;
    status(bridgePatch?: Partial<BlenderBridgeStatus>, options?: {
        forceDetect?: boolean;
    }): Promise<BlenderEnvironmentStatus>;
}
