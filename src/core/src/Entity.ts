import type { Tuple, UUID } from 'utilium';
import type { Component, ComponentConstructor, ComponentsConfig, ComponentsSaveData } from './Component.js';
import type { GameObject } from './object.js';
import type { EntityConstructor } from './registry.js';
import { Vec3 } from './vectors.js';
import type { World } from './World.js';

export interface EntitySaveData {
	/** Registered entity type id, for example `duck-race:duck` */
	$: string;
	id: UUID;
	position: Tuple<number, 3>;
	rotation: Tuple<number, 3>;
}

export class Entity<SaveData extends object = {}> implements GameObject<EntitySaveData & SaveData> {
	public id = crypto.randomUUID();
	public readonly position = new Vec3();
	public readonly rotation = new Vec3();

	protected components = new Set<Component>();

	constructor(public readonly world: World) {}

	/**
	 * Get one of this entity's components by class.
	 * @throws If this entity was not built with that component.
	 */
	get<T extends Component>(type: ComponentConstructor<T>): T {
		for (const component of this.components) {
			if (component instanceof type) return component;
		}

		throw new Error(`${this.constructor.name} has no ${type.name} component`);
	}

	/** Whether this entity was built with the given component. */
	has(type: ComponentConstructor): boolean {
		for (const component of this.components) {
			if (component instanceof type) return true;
		}

		return false;
	}

	/** Dispatch an action from the controlling client to whichever components handle it. */
	input(action: string, active: boolean) {
		for (const component of this.components) {
			component.input?.(action, active);
		}
	}

	init() {
		this.world.entities.set(this.id, this);
		for (const component of this.components) {
			component.init();
		}
	}

	tick() {
		this.rotation.x %= Math.PI * 2;
		this.rotation.y %= Math.PI * 2;
		this.rotation.z %= Math.PI * 2;

		for (const component of this.components) {
			component.tick();
		}
	}

	load(data: EntitySaveData & SaveData) {
		// Re-key if this entity was already registered under its generated id.
		const registered = this.world.entities.get(this.id) === this;
		if (registered) this.world.entities.delete(this.id);

		this.id = data.id;
		this.position.data = data.position;
		this.rotation.data = data.rotation;

		if (registered) this.world.entities.set(this.id, this);

		for (const component of this.components) {
			component.load(data);
		}
	}

	toJSON(): EntitySaveData & SaveData {
		const type = this.world.registry.typeOf(this.constructor as EntityConstructor);

		if (!type)
			throw new Error(
				`Can not save a ${this.constructor.name} because its type is not registered.`
					+ ' Add it to the `entities` of your game manifest.'
			);

		const data = Object.create(null);

		Object.assign(data, {
			$: type,
			id: this.id,
			position: this.position.data,
			rotation: this.rotation.data,
		});

		for (const component of this.components) {
			Object.assign(data, component.toJSON());
		}

		return data;
	}

	dispose() {
		for (const component of this.components) {
			component.dispose();
		}
		this.world.entities.delete(this.id);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static WithComponents<const T extends (new (...args: any[]) => Component<any, any>)[]>(
		components: T,
		config: ComponentsConfig<T>
	): new (world: World) => Entity<ComponentsSaveData<T>> {
		class EntityWithComponents extends Entity<ComponentsSaveData<T>> {
			constructor(world: World) {
				super(world);
				for (const component of components) {
					this.components.add(new component(this, config));
				}
			}
		}
		return EntityWithComponents;
	}

	static ref<E extends Entity>(
		this: void,
		target: ClassAccessorDecoratorTarget<E, UUID | null>,
		context: ClassAccessorDecoratorContext<E, UUID>
	): ClassAccessorDecoratorResult<E, Entity | null> {
		if (context.kind !== 'accessor') throw new TypeError('Entity references must be auto-accessors');

		return {
			get() {
				const id = target.get.call(this);
				if (!id) return null;
				return this.world.entities.get(id) ?? null;
			},

			set(value: { id: UUID } | null) {
				target.set.call(this, value?.id ?? null);
			},
		};
	}
}
