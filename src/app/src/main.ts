import { app, BrowserWindow } from 'electron';
import * as io from 'ioium/node';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { config } from './config.js';
import type { FromServer } from './server_thread.js';

function pathOf(target: URL | string): string {
	return typeof target === 'string' ? target : fileURLToPath(target);
}

function startServer(): Promise<number> {
	const portMessage = Promise.withResolvers<number>();

	new Worker(config.server)
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
		.on('exit', code => portMessage.reject(new Error(`[Server] thread exited with code ${code}`)));

	return portMessage.promise;
}

app.whenReady()
	.then(async () => {
		const serverPort = await startServer();
		const window = new BrowserWindow();

		await window.loadFile(pathOf(config.page), { query: { port: serverPort.toString() } });
	})
	.catch(error => {
		io.error(error);
		app.exit(1);
	});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
