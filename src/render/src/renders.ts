import type { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import type { Scene } from '@babylonjs/core/scene.js';

/**
 * Builds the node for one entity type.
 *
 * Position and rotation are applied by the engine from the entity's state, so
 * a renderer only has to describe what the entity looks like.
 */
export type EntityRenderer = (scene: Scene) => TransformNode;

/**
 * A game's rendering content.
 *
 * Kept separate from the main manifest so that Babylon, and the game's render
 * code, stay out of the client and server bundles.
 */
export interface RenderManifest {
	/** Namespace for this game's content, matching its {@link GameManifest}. */
	id: string;
	/** Entity renderers, keyed by their unqualified name. */
	entities?: Record<string, EntityRenderer>;
	/** Shader sources, keyed by their unqualified name. */
	shaders?: Record<string, string>;
}

/** Identity function that pins a manifest to {@link RenderManifest} for type checking. */
export function defineRenders<const T extends RenderManifest>(manifest: T): T {
	return manifest;
}

/** Maps entity type ids to the renderers that draw them. */
export class RenderRegistry {
	readonly #byType = new Map<string, EntityRenderer>();

	add(type: string, renderer: EntityRenderer): void {
		this.#byType.set(type, renderer);
	}

	get(type: string): EntityRenderer | undefined {
		return this.#byType.get(type);
	}

	get types(): MapIterator<string> {
		return this.#byType.keys();
	}
}

/** Shader sources by qualified name, filled in by {@link rendersFor}. */
export const shaders = new Map<string, string>();

export function rendersFor(...manifests: RenderManifest[]): RenderRegistry {
	const registry = new RenderRegistry();

	for (const manifest of manifests) {
		for (const [name, renderer] of Object.entries(manifest.entities ?? {})) {
			registry.add(`${manifest.id}:${name}`, renderer);
		}

		for (const [name, source] of Object.entries(manifest.shaders ?? {})) {
			shaders.set(`${manifest.id}:${name}`, source);
		}
	}

	return registry;
}
