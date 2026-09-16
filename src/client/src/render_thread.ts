import type { WorldData } from '@sumeria/core';
import type * as rpc from '@sumeria/render/rpc';

export let thread: Worker;

export function init() {
	// Resolved against this module rather than the document, so the bundle
	// keeps working regardless of where the page itself lives.
	thread = new Worker(new URL('render.js', import.meta.url), { type: 'module' });

	const canvas = document.createElement('canvas');
	canvas.id = 'render';
	document.body.appendChild(canvas);
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	const offscreen = canvas.transferControlToOffscreen();

	thread.postMessage(
		{
			$: 'init',
			canvas: offscreen,
		} satisfies rpc.Init,
		[offscreen]
	);

	addEventListener('resize', () =>
		thread.postMessage({
			$: 'resize',
			width: canvas.clientWidth,
			height: canvas.clientHeight,
		} satisfies rpc.Resize)
	);
}

/** Hand the renderer a new world state to draw. */
export function tick(world: WorldData) {
	thread.postMessage({ $: 'tick', world } satisfies rpc.Tick);
}
