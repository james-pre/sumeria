import type { Scene, TransformNode } from '@babylonjs/core';
import type { EntitySaveData, ZoneData } from '@sumeria/core';

/**
 * Builds the node for one entity; position and rotation are applied by the engine afterwards.
 * The entity's data is passed so one type can look different per instance.
 */
export type EntityRenderer<Data extends EntitySaveData = EntitySaveData> = (scene: Scene, data: Data) => TransformNode;

// Renderers narrow the data to their own entity's type, which the map can not track per key.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderers = new Map<string, EntityRenderer<any>>();

/** Scene-wide setup, for anything that belongs to the world rather than one entity. */
export type WorldRenderer = (scene: Scene) => void;

/** Each runs once per world load, before any entity is built. */
export const worldRenderers = new Set<WorldRenderer>();

export type ZoneRenderer = (scene: Scene, zone: ZoneData) => void;

/** Runs once per zone in a loaded world, keyed by zone id. */
export const zoneRenderers = new Map<string, ZoneRenderer>();

export interface ShaderSource {
	vertex: string;
	fragment: string;
}

export const shaders = new Map<string, ShaderSource>();
