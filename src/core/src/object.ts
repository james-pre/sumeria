export interface GameObject<Data extends object> {
	init(): void;
	tick(): void;
	toJSON(): Data;
	load(data: Data): void;
	dispose(): void;
}
