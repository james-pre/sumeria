import type { Component, ComponentsMixins, ComponentsSaveData, ComponentsConfig } from './Component.js';

export interface EntitySaveData {}

export class Entity<SaveData extends object = {}> {
	protected components = new Set<Component>();

	constructor() {}

	async init() {}

	async tick() {}

	save(): Promise<EntitySaveData & SaveData> {
		return Object.assign({}, ...Array.from(this.components).map(c => c.save()));
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
