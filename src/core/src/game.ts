import type { Entity } from './Entity.js';
import type { World } from './World.js';

/**
 * The server-side logic for one game: spawning, rules, and whatever drives {@link WorldState}.
 * A game supplies these by default-exporting an object from its `game.ts`; every hook is optional.
 */
export interface Game {
	/** Runs once when the world is initialized, before the first tick. */
	init?(world: World): void;

	/** Runs every tick, after every entity has ticked and before the diff is built. */
	tick?(world: World): void;

	/** A client connected. `entity` is the one it controls, or null when it is only spectating. */
	join?(world: World, entity: Entity | null): void;

	/** A client disconnected, before its entity is disposed. */
	leave?(world: World, entity: Entity | null): void;

	/** A client sent a command, which is how UI acts on the world. */
	command?(world: World, name: string, entity: Entity | null): void;
}

/** The registered game, which does nothing until {@link setGame} replaces it. */
export let game: Game = {};

/** Registers the game logic; the generated server entry point calls this. */
export function setGame(next: Game): void {
	game = next;
}
