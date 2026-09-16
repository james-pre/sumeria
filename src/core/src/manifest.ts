import type { Controls } from './controls.js';
import { entityTypes, type EntityConstructor } from './Entity.js';

export interface GameManifest {
	/** Lowercase letters, digits and dashes. */
	id: string;
	entities?: EntityConstructor[];
	/** Name of the entity type to spawn for each client, if any. */
	player?: string;
	controls?: Controls;
}

/** Adds entity types to {@link entityTypes} under their class names. */
export function register(...types: EntityConstructor[]): void {
	for (const type of types) {
		const existing = entityTypes.get(type.name);

		if (existing === type) continue;

		if (existing)
			throw new Error(`Can not register "${type.name}" because a different class already has that name`);

		entityTypes.set(type.name, type);
	}
}

/** Registers the manifest's entity types and returns it unchanged. */
export function defineGame<const T extends GameManifest>(manifest: T): T {
	if (!/^[a-z0-9][a-z0-9-]*$/.test(manifest.id))
		throw new Error(`Invalid game id "${manifest.id}": expected lowercase letters, digits and dashes`);

	register(...(manifest.entities ?? []));

	if (manifest.player && !entityTypes.has(manifest.player))
		throw new Error(`The player type "${manifest.player}" is not a registered entity type`);

	return manifest;
}
