import type { UUID } from 'utilium';
import type { WorldData } from './World.js';

/** Sent once on connect, before the first tick. */
export interface Welcome {
	/** The entity this client controls, or null when the game has no player type. */
	entity: UUID | null;
	/** How many times a second the world ticks, so the client can interpolate. */
	tickRate: number;
}

/** Events the client sends to the server. */
export interface ClientEvents {
	/**
	 * A player action started or ended.
	 *
	 * Action names come from the game's controls, so the server does not know
	 * them ahead of time; components ignore the ones they do not handle.
	 */
	input(action: string, active: boolean): void;
}

/** Events the server sends to the client. */
export interface ServerEvents {
	welcome(info: Welcome): void;
	/** Full world state, sent on connect and on every tick. */
	tick(data: WorldData): void;
}
