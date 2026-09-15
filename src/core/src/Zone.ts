import type { GameObject } from './object.js';
import type { World } from './World.js';

export interface ZoneData {}

/**
 * Part of the game world. This should be able to be rendered on its own.
 */
export class Zone implements GameObject<ZoneData> {
	constructor(public readonly world: World) {}

	init(): void | Promise<void> {}

	tick(): void | Promise<void> {}

	save(): ZoneData {
		return {};
	}

	dispose(): void {}
}
