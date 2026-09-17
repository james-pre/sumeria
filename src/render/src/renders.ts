import type { Scene, TransformNode } from '@babylonjs/core';

/** Builds the node for one entity type; position and rotation are applied by the engine. */
export type EntityRenderer = (scene: Scene) => TransformNode;

export const renderers = new Map<string, EntityRenderer>();

export const shaders = new Map<string, string>();
