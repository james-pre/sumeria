import { Engine } from '@babylonjs/core';

export let engine: Engine;

export async function init(canvas: OffscreenCanvas) {
	engine = new Engine(canvas, true, { audioEngine: true });
}
