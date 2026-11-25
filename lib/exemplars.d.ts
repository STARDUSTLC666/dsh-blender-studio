import { type BlenderExemplarDefinition, type BlenderExemplarSummary } from './types.js';
/**
 * Built-in Pro Engineering Exemplars for dsh-blender-studio (v0.3.0).
 * Every exemplar script is visually verified on Blender 5.3.0 (Cycles + AgX + OIDN),
 * scores QC-3D 100/A, passes checkScriptSafety(), and serves both as 1-click starter
 * engineering scenes and high-craft few-shot bpy references for AI agents.
 */
export declare const BLENDER_EXEMPLARS: readonly BlenderExemplarDefinition[];
/**
 * Return lightweight exemplar metadata without full bpy script payloads
 * so project library & list API responses stay lean.
 */
export declare function listExemplarSummaries(): BlenderExemplarSummary[];
/**
 * Resolve a built-in Pro Engineering Exemplar definition by ID.
 * Throws BlenderError('EXEMPLAR_NOT_FOUND', 404) when the ID is unknown.
 */
export declare function getExemplar(id: string): BlenderExemplarDefinition;
