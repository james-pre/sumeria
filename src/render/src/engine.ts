import { Engine, Scene, type TargetCamera } from '@babylonjs/core';

export let engine: Engine, scene: Scene, camera: TargetCamera;

export function initScene(canvas: OffscreenCanvas) {
	// A worker has no audio context.
	engine = new Engine(canvas, true, { audioEngine: false });
	scene = new Scene(engine);

	engine.runRenderLoop(() => {
		scene.render();
	});
}
