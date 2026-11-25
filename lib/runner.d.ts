import { type BlenderSceneSummary, type BlenderShotPresetId } from './types.js';
export interface ParsedShotDone {
    shotId: BlenderShotPresetId;
    file: string;
    path?: string;
    labelZh?: string;
    labelEn?: string;
    lensMm: number;
    width: number;
    height: number;
    index?: number;
    total?: number;
}
export interface BlenderRunRequest {
    executablePath: string;
    scriptPath: string;
    scriptContent?: string;
    cwd: string;
    args?: string[];
    frameStart?: number;
    frameEnd?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
    onLine?: (line: string) => void;
    onProgress?: (progress: number, stage?: string) => void;
    onShotDone?: (shot: ParsedShotDone) => void;
}
export interface BlenderRunResult {
    exitCode: number;
    lines: string[];
    stdout: string;
    stderr: string;
    sceneSummary?: BlenderSceneSummary;
    shots?: ParsedShotDone[];
    savedFiles: string[];
    durationMs: number;
}
export type BlenderRunExecutor = (request: BlenderRunRequest) => Promise<BlenderRunResult>;
export interface BlenderRunnerOptions {
    root?: string;
    executor?: BlenderRunExecutor;
    defaultTimeoutMs?: number;
}
export interface ParsedBlenderProgress {
    progress?: number;
    stage?: string;
    savedFile?: string;
}
export declare const DEFAULT_EEVEE_TIMEOUT_MS = 180000;
export declare const DEFAULT_CYCLES_TIMEOUT_MS = 300000;
export declare function buildBlenderChildEnv(root: string): NodeJS.ProcessEnv;
export declare function parseBlenderProgressLine(line: string, frameStart?: number, frameEnd?: number): ParsedBlenderProgress;
export declare function parseSceneSummaryFromLine(line: string): BlenderSceneSummary | undefined;
export declare function parseSceneSummaryFromOutput(text: string): BlenderSceneSummary | undefined;
export declare function parseShotDoneFromLine(line: string): ParsedShotDone | undefined;
export declare class BlenderRunner {
    readonly root: string;
    private readonly executor?;
    private readonly defaultTimeoutMs;
    constructor(options?: BlenderRunnerOptions);
    run(request: BlenderRunRequest): Promise<BlenderRunResult>;
}
