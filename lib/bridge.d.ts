import { type BlenderBridgeStatus, type BlenderSceneSummary, type ScriptSafetyResult } from './types.js';
export declare const MAX_BRIDGE_FRAME_BYTES: number;
export declare const DEFAULT_BRIDGE_TIMEOUT_MS = 15000;
export interface BlenderBridgeClientOptions {
    host?: string;
    port?: number;
    token?: string;
    timeoutMs?: number;
}
export interface BridgePingResult {
    blenderVersion: string;
    sceneName: string;
    engine: string;
    frameCurrent: number;
    objectCount: number;
    gpu?: {
        available: boolean;
        backend: string;
        devices: string[];
    };
}
export interface BridgeExecuteOptions {
    pushUndo?: boolean;
    timeoutMs?: number;
}
export interface BridgeExecuteResult {
    stdout: string;
    stderr: string;
    sceneSummary: BlenderSceneSummary;
}
export interface BridgeViewportOptions {
    width?: number;
    height?: number;
    timeoutMs?: number;
}
export interface BridgeViewportResult {
    mime: string;
    base64: string;
    width: number;
    height: number;
}
export interface BridgeLoadScriptOptions {
    clearScene?: boolean;
    projectTitle?: string;
    timeoutMs?: number;
}
export interface BridgeLoadScriptResult {
    stdout: string;
    stderr?: string;
    sceneSummary: BlenderSceneSummary;
}
/** Normalize and verify that a host strictly refers to local loopback. */
export declare function normalizeLoopbackHost(host: string): string;
export declare function isLoopbackHost(host: string): boolean;
/**
 * Loopback-only TCP client speaking the newline-delimited UTF-8 JSON-RPC
 * protocol implemented by `blender/dsh_blender_bridge.py`.
 */
export declare class BlenderBridgeClient {
    private _host;
    private _port;
    private _token;
    private _timeoutMs;
    constructor(options?: BlenderBridgeClientOptions);
    get host(): string;
    get port(): number;
    get hasToken(): boolean;
    get timeoutMs(): number;
    configure(options: BlenderBridgeClientOptions): void;
    request<T = unknown>(command: string, params?: Record<string, unknown>, timeoutMs?: number): Promise<T>;
    ping(timeoutMs?: number): Promise<BridgePingResult>;
    sceneInfo(timeoutMs?: number): Promise<BlenderSceneSummary>;
    execute(code: string, opts?: BridgeExecuteOptions): Promise<BridgeExecuteResult>;
    viewportCapture(opts?: BridgeViewportOptions): Promise<BridgeViewportResult>;
    loadScript(code: string, opts?: BridgeLoadScriptOptions): Promise<BridgeLoadScriptResult>;
    status(timeoutMs?: number): Promise<BlenderBridgeStatus>;
}
/**
 * Static pre-flight scanner for user-supplied bpy Python scripts.
 * Detects shell execution, destructive filesystem calls, network access,
 * dynamic eval/exec/import, and path escapes outside the project.
 */
export declare function checkScriptSafety(code: string): ScriptSafetyResult;
export interface LaunchBlenderGuiResult {
    pid?: number;
    executable: string;
    blendFile?: string;
}
/**
 * Launch desktop Blender GUI in a detached process without blocking the DSH host.
 */
export declare function launchBlenderGui(executablePath: string, blendFile?: string): Promise<LaunchBlenderGuiResult>;
export interface InstallBridgeAddonResult {
    installed: boolean;
    enabled: boolean;
    addonPath: string;
    executablePath: string;
    output: string;
}
export type BridgeAddonInstallExecutor = (executablePath: string, args: string[], timeoutMs: number) => Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
}>;
export interface InstallBridgeAddonOptions {
    executor?: BridgeAddonInstallExecutor;
    runner?: BridgeAddonInstallExecutor;
    timeoutMs?: number;
}
/**
 * Install and enable `dsh_blender_bridge.py` in local desktop Blender via headless CLI.
 * Preserves existing user preferences by reading userpref before enabling & saving.
 */
export declare function installBridgeAddon(executablePath: string, addonPath: string, options?: InstallBridgeAddonOptions): Promise<InstallBridgeAddonResult>;
