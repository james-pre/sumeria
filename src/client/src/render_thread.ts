import type * as rpc from '@sumeria/render/rpc';

export let thread: Worker;

export function init() {
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
