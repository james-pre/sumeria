import * as server from '@sumeria/server';
import { parentPort } from 'node:worker_threads';
import { exit } from 'ioium/node';
import type { AddressInfo } from 'node:net';

export interface Load {
	$: 'load';
	path: string;
}

export type ToServer = Load;

export interface Listen {
	$: 'listen';
	port: number;
}

export type FromServer = Listen;

if (!parentPort) exit('The server thread can not be run on its own!', 2);

server.io.listen(0);

parentPort.on('message', (message: ToServer) => {
	switch (message.$) {
		case 'load':
			server.loadFromPath(message.path);
			break;
	}
});

server.io.httpServer.on('listening', () =>
	parentPort!.postMessage({ $: 'listen', port: (server.io.httpServer.address() as AddressInfo)?.port })
);
