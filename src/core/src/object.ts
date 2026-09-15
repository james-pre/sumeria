export interface GameObject<SaveData = unknown> {
	init(): void | Promise<void>;
	tick(): void | Promise<void>;
	save(): SaveData;
	dispose(): void;
}
