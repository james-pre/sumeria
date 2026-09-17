import { app, BrowserWindow } from 'electron';
import * as io from 'ioium/node';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import type { FromServer } from './server_thread.js';

export interface AppOptions {
	/** The compiled server thread entry point. */
	server: URL | string;
	/** The page to load, which must sit next to the client bundles. */
	page: URL | string;
}

function pathOf(target: URL | string): string {
	return typeof target === 'string' ? target : fileURLToPath(target);
}

export function start({ server, page }: AppOptions): void {
	const portMessage = Promise.withResolvers<number>();

	new Worker(server)
		.on('message', (message: FromServer) => {
			switch (message.$) {
				case 'listen':
					portMessage.resolve(message.port);
					io.debug('[Server] Listening on port', message.port);
					break;
			}
		})
		.on('error', error => {
			io.error('[Server] Error:', error);
			portMessage.reject(error);
		})
		.on('exit', code => portMessage.reject(new Error(`The server thread exited with code ${code}`)));

	app.whenReady()
		.then(async () => {
			const window = new BrowserWindow();
			const serverPort = await portMessage.promise;

			await window.loadFile(pathOf(page), { query: { port: serverPort.toString() } });
		})
		.catch((error: unknown) => {
			io.error(error);
			app.exit(1);
		});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit();
	});
}
