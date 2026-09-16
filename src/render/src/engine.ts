import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Scene } from '@babylonjs/core/scene.js';

export let engine: Engine, scene: Scene, camera: ArcRotateCamera;

/** How far behind and above its target the camera sits. */
export const cameraDistance = 12;

export function init(canvas: OffscreenCanvas) {
	// No audio engine: this runs in a worker, which has no audio context.
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
