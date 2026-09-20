import { TargetCamera, type TransformNode } from '@babylonjs/core';
import type { EntitySaveData, Welcome, WorldData, WorldDiff } from '@sumeria/core';
import { debug, warn, warnOnce } from 'ioium';
import type { UUID } from 'utilium';
import { loadAssets } from './assets.js';
import { scene } from './engine.js';
import { EntityRender, entities } from './entity.js';
import { renderers, worldRenderers, zoneRenderers } from './renders.js';

export let world: WorldData | null = null;

/** The entity the camera follows, or null when spectating. */
export let player: UUID | null = null;

export let camera: TargetCamera;

/** The zone being drawn, which is whichever one the player is in. */
export let zone: string | null = null;

/** What the current zone's renderer built, disposed on the way out. */
let zoneNode: TransformNode | null = null;

/** An entity is drawn in its own zone, and one with no zone is drawn in all of them. */
function inZone(entity: EntitySaveData): boolean {
	return !zone || !entity.zone || entity.zone === zone;
}

function zoneOf(id: UUID | null): string | null {
	if (!id) return null;
	return world?.entities.find(entity => entity.id === id)?.zone || null;
}

/** Builds an entity's node, claiming the camera out of it when the entity is the player. */
function add(entity: EntitySaveData) {
	const renderer = renderers.get(entity.$);

	if (!renderer) {
		warnOnce(`No renderer for "${entity.$}"; it will be invisible`);
		return;
	}

	const node = renderer(scene, entity);
	node.id = entity.id;
	entities.set(entity.id, new EntityRender(node, entity));

	if (entity.id === player) {
		const [found] = node.getDescendants(false, child => child instanceof TargetCamera);

		if (!found) throw new Error(`The renderer for "${entity.$}" is the player's but has no TargetCamera`);

		camera = found;
		scene.activeCamera = camera;
	}
}

/** Swaps the set dressing over, leaving the entities to whoever called. */
function enter(next: string | null) {
	zone = next;

	zoneNode?.dispose(false, true);
	zoneNode = null;

	if (!zone) return;

	const renderer = zoneRenderers.get(zone);

	if (!renderer) {
		debug(`renderer: zone "${zone}" has no renderer`);
		return;
	}

	zoneNode = renderer(scene, world?.zones.find(data => data.id === zone) ?? { id: zone });
}

/** Tears down every entity node, so the scene can be built again from world data. */
function clear() {
	for (const entity of entities.values()) entity.dispose();
	entities.clear();
}

/** Async only because of the assets; nothing is built until every model is in memory. */
export async function load(from: Welcome) {
	clear();

	await loadAssets(scene);

	player = from.entity;
	world = from.world;

	for (const setup of worldRenderers) setup(scene);

	enter(zoneOf(player));

	for (const entity of world.entities) {
		if (inZone(entity)) add(entity);
	}
}

export function update(data: WorldDiff) {
	if (!world) {
		warn('renderer: can not update world data because no world is loaded');
		return;
	}

	for (const entity of data.added) {
		world.entities.push(entity);
		if (inZone(entity)) add(entity);
	}

	for (const entity of data.updated) {
		const existing = world.entities.find(e => e.id === entity.id);
		if (!existing) {
			warn('renderer: Can not update entity data for non-existent entity');
			continue;
		}
		Object.assign(existing, entity);
	}

	for (const id of data.removed) {
		const index = world.entities.findIndex(e => e.id === id);
		if (index === -1) warn('renderer: Removed entity does not exist in the current world data');
		else world.entities.splice(index, 1);
		entities.get(id)?.dispose();
		entities.delete(id);
	}

	world.state = data.state;

	// The player moving zones changes what the whole scene is, so it is rebuilt from scratch.
	const next = zoneOf(player);

	if (next !== zone) {
		clear();
		enter(next);

		for (const entity of world.entities) {
			if (inZone(entity)) add(entity);
		}

		return;
	}

	// Anything else that changed zones this tick only has to appear or disappear.
	for (const entity of data.updated) {
		const render = entities.get(entity.id);

		if (!inZone(entity)) {
			render?.dispose();
			entities.delete(entity.id);
			continue;
		}

		if (render) render.update(entity);
		else add(entity);
	}

	if (!player || !camera) return;

	// A camera parented into the player's tree already rides along, and Babylon reads its
	// target in the parent's space, so the renderer's own local target is the right one to keep.
	if (camera.parent) return;

	const followed = entities.get(player);

	if (followed) camera.target.copyFrom(followed.node.position);
}
