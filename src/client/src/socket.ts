import type { ClientEvents, ServerEvents, Welcome } from '@sumeria/core';
import { io as connect, type Socket } from 'socket.io-client';
import * as render from './render_thread.js';

export let socket: Socket<ServerEvents, ClientEvents>;

/** What the server sent on connect, or null before it has. */
export let welcome: Welcome | null = null;

export function init(port: number): Socket<ServerEvents, ClientEvents> {
	socket = connect(`http://localhost:${port}`, { transports: ['websocket'] });

	socket.on('connect', () => {
		console.info('[socket] connected to the server on port', port);
	});

	socket.on('connect_error', error => {
		console.error('[socket] could not connect:', error.message);
	});

	socket.on('welcome', info => {
		welcome = info;
		render.load(info);
	});

	socket.on('tick', world => {
		render.tick(world);
	});

	socket.on('disconnect', reason => {
		welcome = null;
		console.warn('[socket] disconnected:', reason);
	});

	return socket;
}

export function input(action: string, active: boolean): void {
	socket?.emit('input', action, active);
}
