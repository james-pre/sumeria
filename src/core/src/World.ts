import type { UUID } from 'utilium';
import type { GameObject } from './object.js';
import { Entity, type EntitySaveData } from './Entity.js';
import { Zone, type ZoneData } from './Zone.js';
import { EventEmitter } from 'eventemitter3';

export interface WorldData {
	id: UUID;
	entities: (EntitySaveData & { $: string })[];
	zones: ZoneData[];
	name?: string;
	timestamp: Temporal.InstantLike;
}

export class World
	extends EventEmitter<{
		tick: [];
	}>
	implements GameObject<WorldData>
{
	id = crypto.randomUUID();
	name?: string;
	lastSave = Temporal.Now.instant();

	protected tickRate = 20;

	get #tickInterval(): number {
		if (!Number.isSafeInteger(this.tickRate) || this.tickRate <= 0) this.tickRate = 20;
		return 1000 / this.tickRate;
	}

	entities = new Map<UUID, Entity>();

	zones = new Map<number, Zone>();

	init() {}

	tick() {
		for (const entity of this.entities.values()) {
			entity.tick();
		}
		this.emit('tick');
	}

	load(data: WorldData) {
		this.dispose();

		this.id = data.id;
		this.name = data.name;
		this.lastSave = Temporal.Instant.from(data.timestamp);

		for (const zoneData of data.zones) {
			const zone = new Zone(this);
			zone.load(zoneData);
		}

		for (const entityData of data.entities) {
			const entity = new Entity(this);
			entity.load(entityData);
		}
	}

	toJSON() {
		return {
			id: this.id,
			name: this.name,
			timestamp: this.lastSave,
			entities: this.entities
				.values()
				.map(entity => entity.toJSON())
				.toArray(),
			zones: this.zones
				.values()
				.map(zone => zone.toJSON())
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

	#timeout?: number;

	#step = () => {
		this.tick();
		this.#timeout = setTimeout(this.#step, this.#tickInterval);
	};

	start() {
		if (this.#timeout) throw new Error('Can not start the world because it has already been started');
		this.#step();
	}

	stop() {
		if (!this.#timeout) throw new Error('Can not stop the world because it has not been started');
		clearTimeout(this.#timeout);
		this.#timeout = undefined;
	}
}
