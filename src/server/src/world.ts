import { World } from '@sumeria/core';
import { io } from './socket.js';

export const world = new World();

world.on('tick', () => {
	const data = world.toJSON();

	io.emit('tick', data);
});
