import type { UUID } from 'utilium';
import type { GameObject } from './object.js';
import { entityTypes, type Entity, type EntitySaveData } from './Entity.js';
import { game } from './game.js';
import { Zone, type ZoneData } from './Zone.js';
import { EventEmitter } from 'eventemitter3';
import { error } from 'ioium';

/**
 * State that belongs to the world rather than any entity — a score, a phase, a countdown.
 * It is sent to every client with each tick, so the UI can render it.
 * Games declare their own fields by augmenting this interface.
 */
export interface WorldState {}

export interface WorldData {
	id: UUID;
	entities: EntitySaveData[];
	zones: ZoneData[];
	name?: string;
	timestamp: Temporal.InstantLike;
	/** Absent in worlds saved before the game had any state. */
	state?: WorldState;
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

	/**
	 * Empty until the game fills it in, which is why the cast is safe here and nowhere else.
	 * It looks redundant from inside the engine, where nothing has augmented `WorldState` yet.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	state: WorldState = {} as WorldState;

	init() {
		game.init?.(this);
	}

	tick(): WorldDiff {
		const lastTicked = new Set(this.#lastTickedEntities);
		this.#lastTickedEntities.clear();

		for (const entity of this.entities.values()) {
			entity.tick();
			this.#lastTickedEntities.add(entity.id);
		}

		// Before the diff is built, so state the game changes this tick goes out with it.
		game.tick?.(this);

		const tickDiff: WorldDiff = {
			state: this.state,
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
		if (data.state) this.state = data.state;

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
			state: this.state,
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
	/** Sent every tick rather than diffed, since it is small and the UI reads all of it. */
	state: WorldState;
}
