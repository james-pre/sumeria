import type { WorldData } from '@sumeria/core';
import { Server } from 'socket.io';

export interface ListenEvents {}

export interface EmitEvents {
	tick(data: WorldData): void;
}

export const io = new Server<ListenEvents, EmitEvents>();

io.on('connection', socket => {
	// @todo
});
