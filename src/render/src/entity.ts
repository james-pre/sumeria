import type { TransformNode } from '@babylonjs/core';
import type { EntitySaveData } from '@sumeria/core';
import type { UUID } from 'utilium';

export class EntityRender<Data extends EntitySaveData = EntitySaveData> {
	constructor(
		public readonly node: TransformNode,
		public data: Data
	) {
		this.update(data);
	}

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

export const entities = new Map<UUID, EntityRender>();
