import { engine, init } from './engine.js';
import type { Incoming } from './rpc.js';

let canvas: OffscreenCanvas;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
addEventListener('message', async event => {
	if (!event.data) return;

	const data = event.data as Incoming;

	switch (data.$) {
		case 'init':
			canvas = data.canvas;
			await init(data.canvas);
			break;
		case 'resize':
			canvas.width = data.width;
			canvas.height = data.height;
			break;
		case 'tick':
			break;
	}
});
