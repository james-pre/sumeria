import type { ClientEvents, ServerEvents, Welcome } from '@sumeria/core';
import { io as connect, type Socket } from 'socket.io-client';
import * as render from './render_thread.js';

/** Set by {@link init}. */
export let socket: Socket<ServerEvents, ClientEvents>;

/** What the server told us on connect, or null before it has. */
export let welcome: Welcome | null = null;

/** Connect to the integrated server and start feeding the renderer. */
export function init(port: number): Socket<ServerEvents, ClientEvents> {
	socket = connect(`http://localhost:${port}`, { transports: ['websocket'] });

	socket.on('welcome', info => {
		welcome = info;
		render.setPlayer(info.entity);
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

/** Tell the server an action started or ended. Ignored before connecting. */
export function input(action: string, active: boolean): void {
	socket?.emit('input', action, active);
}
