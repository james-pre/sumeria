import type { Component, ComponentsMixins, ComponentsSaveData, ComponentsConfig } from './Component.js';
import type { GameObject } from './object.js';

export interface EntitySaveData {}

export class Entity<SaveData extends object = {}> implements GameObject<EntitySaveData & SaveData> {
	protected components = new Set<Component>();

	constructor() {}

	async init() {}

	async tick() {}

	save(): EntitySaveData & SaveData {
		return Object.assign({}, ...Array.from(this.components).map(c => c.save()));
	}

	dispose() {
		for (const component of this.components) {
			component.dispose();
		}
	}

	static WithComponents<const T extends (typeof Component<any, any>)[]>(
		components: T,
		config: ComponentsConfig<T>
	): new () => Entity<ComponentsSaveData<T>> & ComponentsMixins<T> {
		class EntityWithComponents extends Entity<ComponentsSaveData<T>> {
			constructor() {
				super();
			}
		}
		return EntityWithComponents as any as new () => Entity<ComponentsSaveData<T>> & ComponentsMixins<T>;
	}
}
