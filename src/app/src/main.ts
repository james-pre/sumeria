import { app, BrowserWindow } from 'electron';
import * as io from 'ioium/node';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import type { FromServer } from './server_thread.js';

// Electron forwards renderer console messages to stdout, which throws once the pipe reading them has closed.
process.stdout.on('error', error => {
	if (!process.stderr.destroyed && process.stderr.writable) io.error('[stdout]', error);
});

const portMessage = Promise.withResolvers<number>();

const serverThread = new Worker(join(app.getAppPath(), 'dist/generated/server.js'))
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
		// `productName` from the game's package.json, which Electron prefers over `name`.
		const window = new BrowserWindow({ title: app.getName() });

		// The page is the engine's and shared by every game, so it has no name to offer.
		window.on('page-title-updated', event => event.preventDefault());

		const serverPort = await portMessage.promise;

		await window.loadFile(join(app.getAppPath(), 'build/index.html'), { query: { port: serverPort.toString() } });
	})
	.catch(error => {
		io.error(error);
		app.exit(1);
	});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
