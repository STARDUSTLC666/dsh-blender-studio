import { type BlenderAssetKind, type PolyHavenAssetItem, type PolyHavenAssetType } from './types.js';
export interface PolyHavenClientOptions {
    root: string;
    isEnabled: () => boolean | Promise<boolean>;
    fetchImpl?: typeof fetch;
    maxDownloadBytes?: number;
    maxCacheBytes?: number;
    timeoutMs?: number;
}
export interface PolyHavenDownloadResult {
    assetId: string;
    type: PolyHavenAssetType;
    resolution: '1k' | '2k';
    fileName: string;
    ext: string;
    kind: BlenderAssetKind;
    bytes: Buffer;
    cached: boolean;
}
export declare function validatePolyHavenUrl(rawUrl: string): URL;
export declare class PolyHavenClient {
    readonly cacheDir: string;
    private readonly isEnabled;
    private readonly fetchImpl;
    private readonly maxDownloadBytes;
    private readonly maxCacheBytes;
    private readonly timeoutMs;
    private readonly catalogCache;
    constructor(options: PolyHavenClientOptions);
    private ensureEnabled;
    private checkCacheContainment;
    private safeFetch;
    private readBodyWithLimit;
    search(query: string, type?: PolyHavenAssetType, limit?: number): Promise<PolyHavenAssetItem[]>;
    private pickDownloadDescriptor;
    private enforceCacheLimit;
    downloadAsset(assetId: string, type: PolyHavenAssetType, resolution?: '1k' | '2k'): Promise<PolyHavenDownloadResult>;
}
