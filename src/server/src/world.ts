import { registryFor, World, type GameManifest } from '@sumeria/core';
import { io } from './socket.js';

/** Set by {@link init}. */
export let world: World;

/**
 * Create the server's world from the games' manifests.
 *
 * Called by the generated entry point rather than by game code, so consumers
 * never wire this up themselves.
 */
export function init(...games: GameManifest[]): World {
	world = new World(registryFor(...games));

	world.on('tick', () => {
		io.emit('tick', world.toJSON());
	});

	return world;
}
