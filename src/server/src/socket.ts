import type { ClientEvents, ServerEvents } from '@sumeria/core';
import { Server } from 'socket.io';

export const io = new Server<ClientEvents, ServerEvents>({ serveClient: false });
