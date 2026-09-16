/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Entity } from './Entity.js';
import type { GameObject } from './object.js';

export type ComponentsSaveData<T extends (typeof Component<any, any>)[]> = T extends []
	? {}
	: T extends [typeof Component<infer S extends object>, ...infer Rest extends (typeof Component<any, any>)[]]
		? S & ComponentsSaveData<Rest>
		: never;

export type ComponentsConfig<T extends (typeof Component<any, any>)[]> = T extends []
	? {}
	: T extends [typeof Component<object, infer C extends object>, ...infer Rest extends (typeof Component<any, any>)[]]
		? C & ComponentsConfig<Rest>
		: never;

export type ComponentConstructor<T extends Component<any, any> = Component<any, any>> = abstract new (
	...args: any[]
) => T;

export abstract class Component<
	SaveData extends object = object,
	Config extends object = object,
> implements GameObject<SaveData> {
	constructor(
		public readonly entity: Entity,
		protected readonly config: Config
	) {}

	abstract init(): void;
	abstract tick(): void;

	/** Called for every player action; implement it to handle the relevant ones. */
	input?(action: string, active: boolean): void;

	abstract load(data: SaveData): void;
	abstract toJSON(): SaveData;
	abstract dispose(): void;
}
