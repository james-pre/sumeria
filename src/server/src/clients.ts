import type { ClientEvents, Entity, ServerEvents } from '@sumeria/core';
import type { Socket } from 'socket.io';

export interface Client {
	id: string;
	socket: Socket<ClientEvents, ServerEvents>;
	/** The entity this client drives, or null when it is only spectating. */
	entity: Entity | null;
}

export const clients = new Map<string, Client>();
