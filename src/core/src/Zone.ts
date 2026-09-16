import type { World } from './World.js';

export interface ZoneData {
	id: string;
}

/**
 * Part of the game world. This should be able to be rendered on its own.
 */
export class Zone {
	constructor(
		public readonly world: World,
		public readonly id: string
	) {
		world.zones.set(id, this);
	}

	init(): void {}

	load(data: ZoneData) {}

	toJSON(): ZoneData {
		return {
			id: this.id,
		};
	}

	dispose(): void {
		this.world.zones.delete(this.id);
	}
}
