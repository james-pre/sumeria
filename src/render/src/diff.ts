import type { EntitySaveData } from '@sumeria/core';
import type { UUID } from 'utilium';

/** What changed between what is on screen and what the server just sent. */
export interface WorldDiff {
	added: EntitySaveData[];
	updated: EntitySaveData[];
	removed: UUID[];
}

/**
 * Compare the entities already on screen against the incoming state.
 *
 * Kept free of Babylon so the bookkeeping can be tested without a GPU.
 */
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
