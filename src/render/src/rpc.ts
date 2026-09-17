import type { Welcome, WorldDiff } from '@sumeria/core';

export interface Init {
	$: 'init';
	canvas: OffscreenCanvas;
	width: number;
	height: number;
}

export interface Resize {
	$: 'resize';
	width: number;
	height: number;
}

export interface Tick {
	$: 'tick';
	world: WorldDiff;
}

export interface Load extends Welcome {
	$: 'load';
}

export type Incoming = Init | Resize | Tick | Load;
