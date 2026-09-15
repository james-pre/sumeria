import type { GameObject } from './object.js';
import type { World } from './World.js';

export interface ZoneData {
	id: number;
}

/**
 * Part of the game world. This should be able to be rendered on its own.
 */
export class Zone implements GameObject<ZoneData> {
	id = 0;

	constructor(public readonly world: World) {}

	init(): void {
		this.world.zones.set(this.id, this);
	}

	tick(): void {}

	load(data: ZoneData) {
		this.id = data.id;
	}

	save(): ZoneData {
		return {
			id: this.id,
		};
	}

	dispose(): void {
		this.world.zones.delete(this.id);
	}
}
