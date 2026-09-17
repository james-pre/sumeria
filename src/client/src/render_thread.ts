import type { Welcome, WorldDiff } from '@sumeria/core';
import type * as rpc from '@sumeria/render/rpc';

export let thread: Worker;

/** Backing-store size, so the scene is not soft on a high-DPI display. */
function size(canvas: HTMLCanvasElement): { width: number; height: number } {
	const scale = devicePixelRatio || 1;
	return {
		width: Math.round(canvas.clientWidth * scale),
		height: Math.round(canvas.clientHeight * scale),
	};
}

export function init() {
	thread = new Worker(new URL('render.js', import.meta.url), { type: 'module' });

	const canvas = document.createElement('canvas');
	canvas.id = 'render';
	document.body.appendChild(canvas);

	const offscreen = canvas.transferControlToOffscreen();

	thread.postMessage({ $: 'init', canvas: offscreen, ...size(canvas) } satisfies rpc.Init, [offscreen]);

	addEventListener('resize', () => {
		thread.postMessage({ $: 'resize', ...size(canvas) } satisfies rpc.Resize);
	});
}

export function tick(world: WorldDiff) {
	thread?.postMessage({ $: 'tick', world } satisfies rpc.Tick);
}

export function load(from: Welcome) {
	thread?.postMessage({ $: 'load', ...from } satisfies rpc.Load);
}
