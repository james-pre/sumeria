import type { World } from './World.js';

export interface ZoneData {
	id: number;
}

/**
 * Part of the game world. This should be able to be rendered on its own.
 */
export class Zone {
	static #nextId = 1;
	id = Zone.#nextId++;

	constructor(public readonly world: World) {}

	init(): void {
		this.world.zones.set(this.id, this);
	}

	load(data: ZoneData) {
		this.id = data.id;
	}

	toJSON(): ZoneData {
		return {
			id: this.id,
		};
	}

	dispose(): void {
		this.world.zones.delete(this.id);
	}
}
