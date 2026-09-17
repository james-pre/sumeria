import * as engine from './engine.js';
import { load, type RenderManifest } from './renders.js';
import type { Incoming } from './rpc.js';
import { loadWorld, update } from './world.js';

export function start(...games: RenderManifest[]): void {
	load(...games);

	addEventListener('message', event => {
		if (!event.data) return;

		const data = event.data as Incoming;

		switch (data.$) {
			case 'init':
				engine.init(data.canvas);
				engine.resize(data.width, data.height);
				break;
			case 'resize':
				engine.resize(data.width, data.height);
				break;
			case 'load':
				loadWorld(data);
				break;
			case 'tick':
				update(data.world);
				break;
		}
	});
}
