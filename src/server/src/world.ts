import { playerType, World, type Entity } from '@sumeria/core';
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

	socket.emit('welcome', { entity: entity?.id ?? null, world: world.toJSON() });

	socket.on('input', (action, active) => {
		clients.get(socket.id)?.entity?.input(action, active);
	});

	socket.on('disconnect', () => {
		clients.get(socket.id)?.entity?.dispose();
		clients.delete(socket.id);
	});
});
