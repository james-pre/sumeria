import { ArcRotateCamera, Engine, HemisphericLight, Scene, Vector3, type TargetCamera } from '@babylonjs/core';

export let engine: Engine, scene: Scene, camera: TargetCamera;

export const cameraDistance = 12;

export function initScene(canvas: OffscreenCanvas) {
	// A worker has no audio context.
	engine = new Engine(canvas, true, { audioEngine: false });
	scene = new Scene(engine);

	const arc = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, cameraDistance, Vector3.Zero(), scene);
	arc.lowerRadiusLimit = 2;
	arc.upperRadiusLimit = 100;
	camera = arc;

	new HemisphericLight('sun', new Vector3(0, 1, 0), scene);

	engine.runRenderLoop(() => {
		scene.render();
	});
}
