import type { ClientEvents, ServerEvents, Welcome } from '@sumeria/core';
import { io as connect, type Socket } from 'socket.io-client';
import * as render from './render_thread.js';
import * as ui from './ui.js';
import * as world from './world.js';

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
		world.load(info);
		render.load(info);
		ui.update();
	});

	socket.on('tick', diff => {
		world.update(diff);
		render.tick(diff);
		ui.update();
	});

	socket.on('disconnect', reason => {
		welcome = null;
		world.reset();
		ui.update();
		console.warn('[socket] disconnected:', reason);
	});

	return socket;
}

export function input(action: string, active: boolean): void {
	socket?.emit('input', action, active);
}

/** Sends a one-off request to the game, which is how UI acts on the world. */
export function command(name: string): void {
	socket?.emit('command', name);
}
