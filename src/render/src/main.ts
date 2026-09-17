import { engine, initScene } from './engine.js';
import type { Incoming } from './rpc.js';
import { load, update } from './world.js';

addEventListener('message', event => {
	if (!event.data) return;

	const data = event.data as Incoming;

	switch (data.$) {
		case 'init':
			initScene(data.canvas);
			engine.setSize(data.width, data.height);
			break;
		case 'resize':
			engine.setSize(data.width, data.height);
			break;
		case 'load':
			load(data);
			break;
		case 'tick':
			update(data.world);
			break;
	}
});
