import type { WorldData } from '@sumeria/core';
import type { UUID } from 'utilium';
import { diff } from './diff.js';
import { camera, scene } from './engine.js';
import { EntityRender, entities } from './entity.js';
import type { RenderRegistry } from './renders.js';

export let world: WorldData | null = null;

/** The entity the camera follows, or null when spectating. */
export let player: UUID | null = null;

export function setPlayer(id: UUID | null) {
	player = id;
}

/** Entity types already reported as unrenderable, so the warning fires once. */
const warnedFor = new Set<string>();

/** Bring the scene in line with the world state the server sent. */
export function update(data: WorldData, renders: RenderRegistry) {
	world = data;

	const { added, updated, removed } = diff(entities.keys(), data.entities);

	for (const entity of added) {
		const renderer = renders.get(entity.$);

		if (!renderer) {
			// Skip rather than failing the frame, but say so once: an entity
			// silently missing from the scene is otherwise hard to explain.
			if (!warnedFor.has(entity.$)) {
				warnedFor.add(entity.$);
				console.warn(`[render] no renderer for "${entity.$}"; it will be invisible`);
			}

			continue;
		}

		const node = renderer(scene);
		node.id = entity.id;
		entities.set(entity.id, new EntityRender(node, entity));
	}

	for (const entity of updated) {
		entities.get(entity.id)?.update(entity);
	}

	for (const id of removed) {
		entities.get(id)?.dispose();
		entities.delete(id);
	}

	if (!player) return;

	const followed = entities.get(player);

	// Move the focus point in place rather than calling setTarget, which
	// recomputes the camera's angles and makes it swing as the player moves.
	if (followed && camera) camera.target.copyFrom(followed.node.position);
}
