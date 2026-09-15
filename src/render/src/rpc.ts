import type { WorldData } from '@sumeria/core';

export interface Init {
	$: 'init';
	canvas: OffscreenCanvas;
}

export interface Resize {
	$: 'resize';
	width: number;
	height: number;
}

export interface Tick {
	$: 'tick';
	world: WorldData;
}

export type Incoming = Init | Resize | Tick;
