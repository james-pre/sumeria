import { init } from './engine.js';
import type { Incoming } from './rpc.js';
import { update } from './world.js';

let canvas: OffscreenCanvas;

addEventListener('message', event => {
	if (!event.data) return;

	const data = event.data as Incoming;

	switch (data.$) {
		case 'init':
			canvas = data.canvas;
			init(data.canvas);
			break;
		case 'resize':
			canvas.width = data.width;
			canvas.height = data.height;
			break;
		case 'tick':
			update(data.world);
			break;
	}
});
