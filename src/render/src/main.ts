import * as engine from './engine.js';
import { rendersFor, type RenderManifest } from './renders.js';
import type { Incoming } from './rpc.js';
import { setPlayer, update } from './world.js';

/**
 * Start the render worker for the given games.
 *
 * Called by the generated entry point rather than by game code, so consumers
 * never wire this up themselves.
 */
export function start(...games: RenderManifest[]): void {
	const renders = rendersFor(...games);

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
			case 'player':
				setPlayer(data.id);
				break;
			case 'tick':
				update(data.world, renders);
				break;
		}
	});
}
