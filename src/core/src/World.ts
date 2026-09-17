import type { UUID } from 'utilium';
import type { GameObject } from './object.js';
import { entityTypes, type Entity, type EntitySaveData } from './Entity.js';
import { Zone, type ZoneData } from './Zone.js';
import { EventEmitter } from 'eventemitter3';
import { error } from 'ioium';

export interface WorldData {
	id: UUID;
	entities: EntitySaveData[];
	zones: ZoneData[];
	name?: string;
	timestamp: Temporal.InstantLike;
}

export class World
	extends EventEmitter<{
		tick: [diff: WorldDiff];
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
	#lastTickedEntities = new Set<UUID>();

	zones = new Map<string, Zone>();

	init() {}

	tick(): WorldDiff {
		const lastTicked = new Set(this.#lastTickedEntities);
		this.#lastTickedEntities.clear();

		for (const entity of this.entities.values()) {
			entity.tick();
			this.#lastTickedEntities.add(entity.id);
		}

		const tickDiff: WorldDiff = {
			added: Array.from(this.#lastTickedEntities.difference(lastTicked))
				.map(id => this.entities.get(id)?.toJSON())
				.filter((v): v is EntitySaveData => !!v),
			removed: Array.from(lastTicked.difference(this.#lastTickedEntities)),
			updated: Array.from(this.#lastTickedEntities.intersection(lastTicked))
				.map(id => this.entities.get(id)?.toJSON())
				.filter((v): v is EntitySaveData => !!v),
		};

		this.emit('tick', tickDiff);
		return tickDiff;
	}

	load(data: WorldData) {
		this.dispose();

		this.id = data.id;
		this.name = data.name;
		this.lastSave = Temporal.Instant.from(data.timestamp);

		for (const zoneData of data.zones) {
			const zone = new Zone(this, zoneData.id);
			zone.load(zoneData);
			zone.init();
		}

		for (const entityData of data.entities) {
			const Type = entityTypes.get(entityData.$);
			if (!Type) {
				error(`Can not load entity #${entityData.id} of unknown type "${entityData.$}"`);
				continue;
			}
			const entity = new Type(this);
			entity.load(entityData);
			entity.init();
		}
	}

	toJSON(): WorldData {
		return {
			id: this.id,
			name: this.name,
			timestamp: this.lastSave.toJSON(),
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
		for (const entity of this.entities.values().toArray()) {
			entity.dispose();
		}

		for (const zone of this.zones.values().toArray()) {
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

export interface WorldDiff {
	added: EntitySaveData[];
	updated: EntitySaveData[];
	removed: UUID[];
}
