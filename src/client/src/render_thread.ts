import type { WorldData } from '@sumeria/core';
import type * as rpc from '@sumeria/render/rpc';
import type { UUID } from 'utilium';

export let thread: Worker;

/** Backing-store size, so the scene is not soft on a high-DPI display. */
function size(canvas: HTMLCanvasElement): [width: number, height: number] {
	const scale = devicePixelRatio || 1;
	return [Math.round(canvas.clientWidth * scale), Math.round(canvas.clientHeight * scale)];
}

export function init() {
	thread = new Worker(new URL('render.js', import.meta.url), { type: 'module' });

	const canvas = document.createElement('canvas');
	canvas.id = 'render';
	document.body.appendChild(canvas);

	// Read once the canvas is in the document; before that it has no layout.
	const [width, height] = size(canvas);
	const offscreen = canvas.transferControlToOffscreen();

	thread.postMessage({ $: 'init', canvas: offscreen, width, height } satisfies rpc.Init, [offscreen]);

	addEventListener('resize', () => {
		const [width, height] = size(canvas);
		thread.postMessage({ $: 'resize', width, height } satisfies rpc.Resize);
	});
}

export function tick(world: WorldData) {
	thread?.postMessage({ $: 'tick', world } satisfies rpc.Tick);
}

export function setPlayer(id: UUID | null) {
	thread?.postMessage({ $: 'player', id } satisfies rpc.Player);
}
