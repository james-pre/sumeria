import type { UUID } from 'utilium';
import type { WorldData, WorldDiff } from './World.js';

/** Sent once on connect, before the first tick. */
export interface Welcome {
	/** The entity this client controls, or null when it is only spectating. */
	entity: UUID | null;
	world: WorldData;
}

export interface ClientEvents {
	input(action: string, active: boolean): void;
}

export interface ServerEvents {
	welcome(info: Welcome): void;
	/** Full world state, sent on de-sync */
	world(data: WorldData): void;
	tick(data: WorldDiff): void;
}
