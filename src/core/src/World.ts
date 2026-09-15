import type { UUID } from 'utilium';
import type { GameObject } from './object.js';
import { Entity, type EntitySaveData } from './Entity.js';
import { Zone, type ZoneData } from './Zone.js';

export interface WorldData {
	id: UUID;
	entities: (EntitySaveData & { $: string })[];
	zones: ZoneData[];
}

export class World implements GameObject<WorldData> {
	id = crypto.randomUUID();

	entities = new Map<UUID, Entity>();

	zones = new Map<number, Zone>();

	constructor() {}

	init() {}

	tick() {
		for (const entity of this.entities.values()) {
			entity.tick();
		}
	}

	load(data: WorldData) {
		this.id = data.id;

		for (const zoneData of data.zones) {
			const zone = new Zone(this);
			zone.load(zoneData);
		}

		for (const entityData of data.entities) {
			const entity = new Entity(this);
			entity.load(entityData);
		}
	}

	save(): WorldData {
		return {
			id: this.id,
			entities: this.entities
				.values()
				.map(entity => Object.assign(entity.save(), { $: entity.constructor.name }))
				.toArray(),
			zones: this.zones
				.values()
				.map(zone => zone.save())
				.toArray(),
		};
	}

	dispose(): void {
		for (const entity of this.entities.values()) {
			entity.dispose();
		}

		for (const zone of this.zones.values()) {
			zone.dispose();
		}
	}
}
