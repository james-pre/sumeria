import type { Scene, TransformNode } from '@babylonjs/core';

/** Builds the node for one entity type; position and rotation are applied by the engine. */
export type EntityRenderer = (scene: Scene) => TransformNode;

/** Kept separate from the game manifest so Babylon stays out of the client and server. */
export interface RenderManifest {
	id: string;
	/** Renderers keyed by entity type name. */
	entities?: Record<string, EntityRenderer>;
	shaders?: Record<string, string>;
}

export const renderers = new Map<string, EntityRenderer>();

export const shaders = new Map<string, string>();

export function load(...manifests: RenderManifest[]): void {
	for (const manifest of manifests) {
		for (const [type, renderer] of Object.entries(manifest.entities ?? {})) {
			renderers.set(type, renderer);
		}

		for (const [name, source] of Object.entries(manifest.shaders ?? {})) {
			shaders.set(name, source);
		}
	}
}
