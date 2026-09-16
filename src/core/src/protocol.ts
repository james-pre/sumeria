import type { UUID } from 'utilium';
import type { WorldData } from './World.js';

/** Sent once on connect, before the first tick. */
export interface Welcome {
	/** The entity this client controls, or null when it is only spectating. */
	entity: UUID | null;
	tickRate: number;
}

export interface ClientEvents {
	input(action: string, active: boolean): void;
}

export interface ServerEvents {
	welcome(info: Welcome): void;
	/** Full world state, sent on connect and on every tick. */
	tick(data: WorldData): void;
}
