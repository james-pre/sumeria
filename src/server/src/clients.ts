import type { ClientEvents, Entity, ServerEvents } from '@sumeria/core';
import type { Socket } from 'socket.io';

/** A connected client and whatever it controls. */
export interface Client {
	id: string;
	socket: Socket<ClientEvents, ServerEvents>;
	/** The entity this client drives, or null when it is only spectating. */
	entity: Entity | null;
}

/** Connected clients, keyed by socket id. */
export const clients = new Map<string, Client>();
