import { LoadAssetContainerAsync, TransformNode, type AssetContainer, type Scene } from '@babylonjs/core';
// Registers the glTF 2.0 loader and its extensions, without the legacy 1.0 one.
import '@babylonjs/loaders/glTF/2.0/index.js';
import { error } from 'ioium';

/**
 * Where the SDK puts the game's models, relative to the bundle that imports this.
 * Kept in step with the copy step in the SDK's `assemble`.
 */
const assetDir = 'assets';

/** Asset file names, filled in by the generated entry point from the game's `assets` directory. */
export const assetFiles = new Set<string>();

const containers = new Map<string, AssetContainer>();

/** The asset's name is its file name without the extension, matching the convention scans. */
function nameOf(file: string): string {
	return file.replace(/\.[^.]+$/, '');
}

/**
 * Loads every registered asset into memory once, so entity renderers stay synchronous.
 * A model that fails to load is reported and skipped; {@link instantiate} is what complains
 * about it, since that is where a game notices it is missing.
 */
export async function loadAssets(scene: Scene): Promise<void> {
	await Promise.all(
		assetFiles
			.values()
			.filter(file => !containers.has(nameOf(file)))
			.map(async file => {
				const url = new URL(`${assetDir}/${file}`, import.meta.url).href;

				try {
					containers.set(nameOf(file), await LoadAssetContainerAsync(url, scene));
				} catch (cause) {
					error(`renderer: could not load the "${nameOf(file)}" asset:`, cause);
				}
			})
			.toArray()
	);
}

/**
 * Builds a copy of a loaded model, under a node the caller owns.
 * The glTF root carries the coordinate conversion, so it is kept rather than flattened away.
 */
export function instantiate(name: string, scene: Scene, cloneMaterials = false): TransformNode {
	const node = new TransformNode(name, scene);
	const container = containers.get(name);

	if (!container) {
		error(`renderer: no "${name}" asset; it will be invisible`);
		return node;
	}

	const { rootNodes } = container.instantiateModelsToScene(source => source, cloneMaterials, {
		doNotInstantiate: true,
	});

	for (const root of rootNodes) root.parent = node;

	return node;
}
