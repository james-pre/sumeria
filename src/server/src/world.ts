import { registryFor, World, type Entity, type GameManifest } from '@sumeria/core';
import { clients } from './clients.js';
import { io } from './socket.js';

/** Set by {@link init}. */
export let world: World;

/**
 * The registered entity type spawned for each client, or null when no game
 * declares a player. Games set this with `"player"` in their config.
 */
function playerTypeOf(games: GameManifest[]): string | null {
	for (const game of games) {
		if (game.player) return `${game.id}:${game.player}`;
	}

	return null;
}

function spawn(type: string): Entity {
	const Type = world.registry.get(type);

	if (!Type) throw new Error(`Can not spawn a player: "${type}" is not a registered entity type`);

	const entity = new Type(world);
	entity.init();
	return entity;
}

/**
 * Create the server's world from the games' manifests and start serving it.
 *
 * Called by the generated entry point rather than by game code, so consumers
 * never wire this up themselves.
 */
export function init(...games: GameManifest[]): World {
	world = new World(registryFor(...games));

	const playerType = playerTypeOf(games);

	world.on('tick', () => {
		io.emit('tick', world.toJSON());
	});

	io.on('connection', socket => {
		const entity = playerType ? spawn(playerType) : null;

		clients.set(socket.id, { id: socket.id, socket, entity });

		socket.emit('welcome', { entity: entity?.id ?? null, tickRate: world.tickRate });
		// So a joining client has something to render before the next tick.
		socket.emit('tick', world.toJSON());

		socket.on('input', (action, active) => {
			clients.get(socket.id)?.entity?.input(action, active);
		});

		socket.on('disconnect', () => {
			clients.get(socket.id)?.entity?.dispose();
			clients.delete(socket.id);
		});
	});

	return world;
}
