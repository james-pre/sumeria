import { Engine, Scene, ShaderStore } from '@babylonjs/core';
import { shaders } from './renders.js';

export let engine: Engine, scene: Scene;

export function initScene(canvas: OffscreenCanvas) {
	// The suffixes are how Babylon looks a shader up from a `ShaderMaterial` name.
	for (const [name, { vertex, fragment }] of shaders) {
		ShaderStore.ShadersStore[name + 'VertexShader'] = vertex;
		ShaderStore.ShadersStore[name + 'FragmentShader'] = fragment;
	}

	// A worker has no audio context.
	engine = new Engine(canvas, true, { audioEngine: false });
	scene = new Scene(engine);

	engine.runRenderLoop(() => {
		scene.render();
	});
}
