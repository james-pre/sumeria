import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import type { ToServer, FromServer } from './server_thread.js';
import * as io from 'ioium/node';

const serverThread = new Worker(join(import.meta.dirname, 'server_thread.js'))
	//
	.on('message', (message: FromServer) => {
		switch (message.$) {
			case 'listen':
				io.debug('[Server] Listening on port', message.port);
				break;
		}
	});

app.whenReady()
	.then(async () => {
		const window = new BrowserWindow();

		await window.loadFile(fileURLToPath(import.meta.resolve('@sumeria/client/index.html')));
	})
	.catch(error => {});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
