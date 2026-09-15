/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GameObject } from './object.js';

export type Mixin<C extends Component> = Omit<C, keyof Component>;

export type ComponentsMixins<T extends (typeof Component<any, any>)[]> = T extends []
	? {}
	: T extends [infer C extends typeof Component<any, any>, ...infer Rest extends (typeof Component<any, any>)[]]
		? Mixin<InstanceType<C>> & ComponentsMixins<Rest>
		: never;

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

export abstract class Component<
	SaveData extends object = object,
	Config extends object = object,
> implements GameObject<SaveData> {
	constructor(protected readonly config: Config) {}

	abstract init(): void;
	abstract tick(): void;
	abstract load(data: SaveData): void;
	abstract save(): SaveData;
	abstract dispose(): void;
}
