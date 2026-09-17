import { ArcRotateCamera, Engine, HemisphericLight, Scene, Vector3 } from '@babylonjs/core';

export let engine: Engine, scene: Scene, camera: ArcRotateCamera;

export const cameraDistance = 12;

export function init(canvas: OffscreenCanvas) {
	// A worker has no audio context.
	engine = new Engine(canvas, true, { audioEngine: false });
	scene = new Scene(engine);

	camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, cameraDistance, Vector3.Zero(), scene);
	camera.lowerRadiusLimit = 2;
	camera.upperRadiusLimit = 100;

	new HemisphericLight('sun', new Vector3(0, 1, 0), scene);

	engine.runRenderLoop(() => {
		scene.render();
	});
}

export function resize(width: number, height: number) {
	if (!engine) return;
	engine.setSize(width, height);
}
