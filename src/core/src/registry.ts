/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity } from './Entity.js';
import type { World } from './World.js';

/**
 * A constructor for an entity type that can be restored from save data.
 */
export interface EntityConstructor<E extends Entity<any> = Entity<any>> {
	new (world: World): E;
}

/** The type id used for a plain, component-less {@link Entity}. */
export const baseEntityType = 'sumeria:entity';

/**
 * Maps stable type ids to the classes that implement them.
 */
export class Registry {
	readonly #byType = new Map<string, EntityConstructor>();
	readonly #byConstructor = new Map<EntityConstructor, string>();

	constructor() {
		// Always available, so a component-less entity works without a manifest.
		this.add(baseEntityType, Entity);
	}

	/**
	 * Register an entity class under a type id.
	 * @throws If `type` is already taken by a different class.
	 */
	add(type: string, entity: EntityConstructor): void {
		const existing = this.#byType.get(type);
		if (existing === entity) return;
		if (existing) throw new Error(`Entity type "${type}" is already registered to a different class`);

		this.#byType.set(type, entity);
		this.#byConstructor.set(entity, type);
	}

	/** Look up the class for a type id, for example when loading save data. */
	get(type: string): EntityConstructor | undefined {
		return this.#byType.get(type);
	}

	/** Look up the type id for a class, for example when writing save data. */
	typeOf(entity: EntityConstructor): string | undefined {
		return this.#byConstructor.get(entity);
	}

	has(type: string): boolean {
		return this.#byType.has(type);
	}

	get types(): MapIterator<string> {
		return this.#byType.keys();
	}
}

/**
 * Everything a game contributes to the engine.
 */
export interface GameManifest {
	/**
	 * Namespace for this game's content, for example `duck-race`.
	 * Type ids are formed as `<id>:<name>`.
	 */
	id: string;
	/** Entity classes, keyed by their unqualified name. */
	entities?: Record<string, EntityConstructor>;
	/** Shader sources, keyed by their unqualified name. */
	shaders?: Record<string, string>;
}

/** Identity function that pins a manifest to {@link GameManifest} for type checking. */
export function defineGame<const T extends GameManifest>(manifest: T): T {
	if (!/^[a-z0-9][a-z0-9-]*$/.test(manifest.id))
		throw new Error(`Invalid game id "${manifest.id}": expected lowercase letters, digits and dashes`);

	return manifest;
}

/** Build the registry a {@link World} needs from one or more manifests. */
export function registryFor(...manifests: GameManifest[]): Registry {
	const registry = new Registry();

	for (const manifest of manifests) {
		for (const [name, entity] of Object.entries(manifest.entities ?? {})) {
			registry.add(`${manifest.id}:${name}`, entity);
		}
	}

	return registry;
}
