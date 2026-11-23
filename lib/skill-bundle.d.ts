export interface SkillRegistration {
    name: string;
    description: string;
    content: string;
    resourceBase: {
        kind: 'directory';
        path: string;
    };
    source?: string;
}
export interface SkillsPluginContext {
    skills: {
        register(definition: SkillRegistration): () => void;
        get?(name: string): Promise<SkillRegistration | undefined> | SkillRegistration | undefined;
    };
    tools?: {
        register(definition: Record<string, unknown>): () => void;
    };
    connection?: {
        fetch?: {
            register(route: string, handler: (request: Request) => Promise<Response> | Response, options?: Record<string, unknown>): () => void;
        };
    };
    effect?(fn: () => () => void): unknown;
    on?(event: string, listener: () => void): (() => void) | void;
    logger?: {
        warn(message: string): void;
        info?(message: string): void;
        error?(message: string): void;
    };
}
export interface ParsedSkillFile {
    name: string;
    description: string;
    content: string;
}
export interface SkillFileCheck {
    name: string;
    ok: boolean;
    detail: string;
    file: string;
    code: 'valid' | 'unreadable' | 'invalid';
}
export interface SkillHealthCheck extends Omit<SkillFileCheck, 'code'> {
    code: SkillFileCheck['code'] | 'ready' | 'not_registered' | 'registration_failed' | 'changed' | 'inactive' | 'registry_unavailable' | 'disposed';
    fileOk: boolean;
    registered: boolean;
    registryChecked: boolean;
    reloadRequired: boolean;
}
export interface SkillBundleHealthReport {
    ok: boolean;
    plugin: string;
    skills: SkillHealthCheck[];
}
export interface SkillBundleHandle {
    checkHealth(): Promise<SkillBundleHealthReport>;
    dispose(): void;
}
export interface SkillBundleOptions {
    plugin: string;
    healthTool?: string;
    registerHealthTool?: boolean;
    names: readonly string[];
    directory: () => string;
}
/** Non-throwing public parsing helper preserving exact dsh-remotion return shape. */
export declare function parseSkillFile(text: string): ParsedSkillFile;
/** Shared skill validation and Cordis registration bundle. */
export declare function createSkillBundle(options: SkillBundleOptions): {
    /** Disk-only check; does not imply that any plugin instance registered the skills. */
    checkFiles(): SkillFileCheck[];
    apply(ctx: SkillsPluginContext): SkillBundleHandle;
};
