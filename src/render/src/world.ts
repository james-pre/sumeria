import { TargetCamera } from '@babylonjs/core';
import type { EntitySaveData, Welcome, WorldData, WorldDiff } from '@sumeria/core';
import { warn, warnOnce } from 'ioium';
import type { UUID } from 'utilium';
import { scene } from './engine.js';
import { EntityRender, entities } from './entity.js';
import { renderers, worldRenderers, zoneRenderers } from './renders.js';

export let world: WorldData | null = null;

/** The entity the camera follows, or null when spectating. */
export let player: UUID | null = null;

export let camera: TargetCamera;

/** Builds an entity's node, claiming the camera out of it when the entity is the player. */
function add(entity: EntitySaveData) {
	const renderer = renderers.get(entity.$);

	if (!renderer) {
		warnOnce(`No renderer for "${entity.$}"; it will be invisible`);
		return;
	}

	const node = renderer(scene);
	node.id = entity.id;
	entities.set(entity.id, new EntityRender(node, entity));

	if (entity.id === player) {
		const [found] = node.getDescendants(false, child => child instanceof TargetCamera);

		if (!found) throw new Error(`The renderer for "${entity.$}" is the player's but has no TargetCamera`);

		camera = found;
	}
}

export function load(from: Welcome) {
	for (const entity of entities.values()) entity.dispose();
	entities.clear();

	player = from.entity;
	world = from.world;

	for (const setup of worldRenderers) setup(scene);

	for (const zone of world.zones) {
		const renderer = zoneRenderers.get(zone.id);

		if (!renderer) warnOnce(`No renderer for zone "${zone.id}"`);
		else renderer(scene, zone);
	}

	for (const entity of world.entities) add(entity);
}

export function update(data: WorldDiff) {
	if (!world) {
		warn('renderer: can not update world data because no world is loaded');
		return;
	}

	for (const entity of data.added) {
		world.entities.push(entity);
		add(entity);
	}

	for (const entity of data.updated) {
		const existing = world.entities.find(e => e.id === entity.id);
		if (!existing) {
			warn('renderer: Can not update entity data for non-existent entity');
			continue;
		}
		Object.assign(existing, entity);
		entities.get(entity.id)?.update(entity);
	}

	for (const id of data.removed) {
		const index = world.entities.findIndex(e => e.id === id);
		if (index === -1) warn('renderer: Removed entity does not exist in the current world data');
		else world.entities.splice(index, 1);
		entities.get(id)?.dispose();
		entities.delete(id);
	}

	if (!player) return;

	const followed = entities.get(player);

	if (followed && camera) camera.target.copyFrom(followed.node.position);
}
