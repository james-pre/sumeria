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
}

export type Incoming = Init | Resize | Tick;
