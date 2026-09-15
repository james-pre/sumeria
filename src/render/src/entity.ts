import type { EntitySaveData } from '@sumeria/core';
import type { UUID } from 'utilium';

export class EntityRender<Data extends EntitySaveData = EntitySaveData> {
	constructor(public data: Data) {}
}

export const entities = new Map<UUID, EntityRender>();
