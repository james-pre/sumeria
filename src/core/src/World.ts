import type { UUID } from 'utilium';
import type { GameObject } from './object.js';
import type { Entity, EntitySaveData } from './Entity.js';
import { Registry } from './registry.js';
import { Zone, type ZoneData } from './Zone.js';
import { EventEmitter } from 'eventemitter3';

export interface WorldData {
	id: UUID;
	entities: EntitySaveData[];
	zones: ZoneData[];
	name?: string;
	/** ISO 8601 instant, as produced by `Temporal.Instant#toJSON` */
	timestamp: string;
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

	/**
	 * Maps save data back onto the classes that implement it.
	 * Without the game's manifest, only plain entities can be loaded.
	 */
	constructor(public readonly registry: Registry = new Registry()) {
		super();
	}

	/** The next zone id, tracked per world so loaded zones can not collide with new ones. */
	#nextZoneId = 1;

	/** @internal Called by {@link Zone}. */
	_takeZoneId(): number {
		return this.#nextZoneId++;
	}

	/** @internal Called by {@link Zone} when loading, so new zones start above the loaded ones. */
	_reserveZoneId(id: number): void {
		if (Number.isSafeInteger(id) && id >= this.#nextZoneId) this.#nextZoneId = id + 1;
	}

	/** How many times a second {@link tick} runs. */
	tickRate = 20;

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

		const unknown = new Set<string>();
		for (const { $ } of data.entities) {
			if (!this.registry.has($)) unknown.add($);
		}

		if (unknown.size)
			throw new Error(
				`Can not load world: unregistered entity ${unknown.size === 1 ? 'type' : 'types'} `
					+ [...unknown].map(type => `"${type}"`).join(', ')
			);

		for (const zoneData of data.zones) {
			const zone = new Zone(this);
			zone.load(zoneData);
			zone.init();
		}

		for (const entityData of data.entities) {
			const Type = this.registry.get(entityData.$)!;
			const entity = new Type(this);
			entity.load(entityData);
			entity.init();
		}
	}

	toJSON(): WorldData {
		this.lastSave = Temporal.Now.instant();

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
		// Snapshot first: disposing removes the object from the map being iterated.
		for (const entity of [...this.entities.values()]) {
			entity.dispose();
		}

		for (const zone of [...this.zones.values()]) {
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
