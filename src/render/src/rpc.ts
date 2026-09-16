import type { WorldData } from '@sumeria/core';
import type { UUID } from 'utilium';

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
	world: WorldData;
}

/** Tells the renderer which entity to follow with the camera. */
export interface Player {
	$: 'player';
	id: UUID | null;
}

export type Incoming = Init | Resize | Tick | Player;
