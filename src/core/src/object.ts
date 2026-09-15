export interface GameObject<Data extends object> {
	init(): void;
	tick(): void;
	save(): Data;
	load(data: Data): void;
	dispose(): void;
}
