import { Engine, Scene } from '@babylonjs/core';

export let engine: Engine, scene: Scene;

export function init(canvas: OffscreenCanvas) {
	engine = new Engine(canvas, true, { audioEngine: true });
	scene = new Scene(engine);

	engine.runRenderLoop(() => {
		scene.render();
	});
}
