import type { EntitySaveData } from '@sumeria/core';
import type { UUID } from 'utilium';

export interface WorldDiff {
	added: EntitySaveData[];
	updated: EntitySaveData[];
	removed: UUID[];
}

/** Compares the entities already in the scene against incoming world state. */
export function diff(known: Iterable<UUID>, next: readonly EntitySaveData[]): WorldDiff {
	const remaining = new Set(known);
	const added: EntitySaveData[] = [];
	const updated: EntitySaveData[] = [];

	for (const data of next) {
		if (remaining.delete(data.id)) updated.push(data);
		else added.push(data);
	}

	return { added, updated, removed: [...remaining] };
}
