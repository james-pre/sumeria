import { app, BrowserWindow } from 'electron';
import * as io from 'ioium/node';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import type { FromServer } from './server_thread.js';

const portMessage = Promise.withResolvers<number>();

const serverThread = new Worker(join(import.meta.dirname, 'server_thread.js'))
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

app.whenReady()
	.then(async () => {
		const window = new BrowserWindow();
		const serverPort = await portMessage.promise;

		await window.loadFile(fileURLToPath(import.meta.resolve('@sumeria/client/index.html')), {
			query: { port: serverPort.toString() },
		});
	})
	.catch(error => {
		io.error(error);
		app.exit(1);
	});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
