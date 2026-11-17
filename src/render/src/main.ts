import { engine, initScene } from './engine.js';
import type { Incoming } from './rpc.js';
import { load, update } from './world.js';

/** Ticks queue behind the load they belong to, since loading a world waits on its assets. */
let ready: Promise<unknown> = Promise.resolve();

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
			ready = load(data);
			break;
		case 'tick':
			ready = ready.then(() => update(data.world));
			break;
	}
});
