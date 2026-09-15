import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

const serverThread = new Worker(join(import.meta.dirname, 'server_thread.js'));

app.whenReady()
	.then(async () => {
		const window = new BrowserWindow();

		await window.loadFile(fileURLToPath(import.meta.resolve('@sumeria/client/index.html')));
	})
	.catch(error => {});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
