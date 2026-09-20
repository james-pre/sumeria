import { game, playerType, World, type Entity } from '@sumeria/core';
import { clients } from './clients.js';
import { io } from './socket.js';

export const world = new World();

world.on('tick', diff => {
	io.emit('tick', diff);
});

io.on('connection', socket => {
	let entity: Entity | null = null;

	if (playerType) {
		entity = new playerType(world);
		entity.init();
	}

	clients.set(socket.id, { id: socket.id, socket, entity });

	// Before the welcome, so whatever the game does with the new entity is already in it.
	game.join?.(world, entity);

	socket.emit('welcome', { entity: entity?.id ?? null, world: world.toJSON() });

	socket.on('input', (action, active) => {
		clients.get(socket.id)?.entity?.input(action, active);
	});

	socket.on('command', name => {
		game.command?.(world, name, clients.get(socket.id)?.entity ?? null);
	});

	socket.on('disconnect', () => {
		const client = clients.get(socket.id);
		game.leave?.(world, client?.entity ?? null);
		client?.entity?.dispose();
		clients.delete(socket.id);
	});
});
