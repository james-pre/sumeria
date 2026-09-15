export type Mixin<C extends Component> = Omit<C, keyof Component>;

export type ComponentsMixins<T extends (typeof Component<any, any>)[]> = T extends []
	? {}
	: T extends [infer C extends typeof Component<any, any>, ...infer Rest extends (typeof Component<any, any>)[]]
		? Mixin<InstanceType<C>> & ComponentsMixins<Rest>
		: never;

export type ComponentsSaveData<T extends (typeof Component<any, any>)[]> = T extends []
	? {}
	: T extends [typeof Component<infer S extends object, any>, ...infer Rest extends (typeof Component<any, any>)[]]
		? S & ComponentsSaveData<Rest>
		: never;

export type ComponentsConfig<T extends (typeof Component<any, any>)[]> = T extends []
	? {}
	: T extends [typeof Component<any, infer C extends object>, ...infer Rest extends (typeof Component<any, any>)[]]
		? C & ComponentsConfig<Rest>
		: never;

export abstract class Component<SaveData extends object = {}, Config extends object = {}> {
	constructor(protected readonly config: Config) {}

	abstract init(): void | Promise<void>;

	abstract tick(): void | Promise<void>;

	abstract save(): SaveData;

	dispose() {}
}
