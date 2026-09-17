export interface GameObject<Data extends object> {
	init(): void;
	tick(): unknown;
	toJSON(): Data;
	load(data: Data): void;
	dispose(): void;
}
