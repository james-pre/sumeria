import type { World } from './World.js';

export interface ZoneData {
	id: number;
}

/**
 * Part of the game world. This should be able to be rendered on its own.
 */
export class Zone {
	id: number;

	constructor(public readonly world: World) {
		this.id = world._takeZoneId();
	}

	init(): void {
		this.world.zones.set(this.id, this);
	}

	load(data: ZoneData) {
		// Re-key if this zone was already registered under its generated id.
		const registered = this.world.zones.get(this.id) === this;
		if (registered) this.world.zones.delete(this.id);

		this.id = data.id;
		this.world._reserveZoneId(this.id);

		if (registered) this.world.zones.set(this.id, this);
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
