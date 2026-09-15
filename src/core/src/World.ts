import type { UUID } from 'utilium';
import type { GameObject } from './object.js';

export interface WorldData {
	uuid: UUID;
}

export class World implements GameObject<WorldData> {
	// @todo
	declare uuid: UUID;

	constructor() {}

	init() {}

	tick() {}

	save(): WorldData {
		return {
			uuid: this.uuid,
		};
	}

	dispose(): void {}
}
