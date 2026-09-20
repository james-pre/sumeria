import type { Scene, TransformNode } from '@babylonjs/core';
import type { ZoneData } from '@sumeria/core';

/** Builds the node for one entity type; position and rotation are applied by the engine. */
export type EntityRenderer = (scene: Scene) => TransformNode;

export const renderers = new Map<string, EntityRenderer>();

/** Scene-wide setup, for anything that belongs to the world rather than one entity. */
export type WorldRenderer = (scene: Scene) => void;

/** Each runs once per world load, before any entity is built. */
export const worldRenderers = new Set<WorldRenderer>();

export type ZoneRenderer = (scene: Scene, zone: ZoneData) => void;

/** Runs once per zone in a loaded world, keyed by zone id. */
export const zoneRenderers = new Map<string, ZoneRenderer>();

export const shaders = new Map<string, string>();
