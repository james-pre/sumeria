import type { GameManifest } from '@sumeria/core';
import * as server from '@sumeria/server';
import { exit } from 'ioium/node';
import type { AddressInfo } from 'node:net';
import { parentPort } from 'node:worker_threads';

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

export function start(...games: GameManifest[]): void {
	if (!parentPort) exit('The server thread can not be run on its own!', 2);

	const world = server.init(...games);
	server.io.listen(0);
	world.start();

	parentPort.on('message', (message: ToServer) => {
		switch (message.$) {
			case 'load':
				server.loadFromPath(message.path);
				break;
		}
	});

	server.io.httpServer.on('listening', () =>
		parentPort!.postMessage({
			$: 'listen',
			port: (server.io.httpServer.address() as AddressInfo)?.port,
		} satisfies Listen)
	);
}
