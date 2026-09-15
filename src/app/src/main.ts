import { app, BrowserWindow } from 'electron';
import * as server from '@sumeria/server';
import { fileURLToPath } from 'node:url';

app.whenReady()
	.then(async () => {
		const window = new BrowserWindow();

		await window.loadFile(fileURLToPath(import.meta.resolve('@sumeria/client/index.html')));
	})
	.catch(error => {});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
