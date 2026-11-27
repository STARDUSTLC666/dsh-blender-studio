import type { SkillBundleHealthReport, SkillsPluginContext } from './skill-bundle.js';
import type { BlenderWorkbench } from './workbench.js';
export interface RegisterBlenderToolsOptions {
    checkSkillsHealth?: () => Promise<SkillBundleHealthReport>;
}
export declare function toLosslessJson(value: unknown, seen?: WeakSet<object>): unknown;
export declare function registerBlenderTools(ctx: SkillsPluginContext, workbench: BlenderWorkbench, options?: RegisterBlenderToolsOptions): Array<() => void>;
