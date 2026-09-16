import type { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import type { EntitySaveData } from '@sumeria/core';
import type { UUID } from 'utilium';

/** One entity's presence in the scene. */
export class EntityRender<Data extends EntitySaveData = EntitySaveData> {
	constructor(
		public readonly node: TransformNode,
		public data: Data
	) {
		this.update(data);
	}

	/** Apply the entity's latest state to its node. */
	update(data: Data) {
		this.data = data;

		const [x, y, z] = data.position;
		this.node.position.set(x, y, z);

		const [rx, ry, rz] = data.rotation;
		this.node.rotation.set(rx, ry, rz);
	}

	dispose() {
		this.node.dispose();
	}
}

/** Everything currently in the scene, keyed by entity id. */
export const entities = new Map<UUID, EntityRender>();
