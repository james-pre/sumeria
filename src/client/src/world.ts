import type { EntitySaveData, Welcome, WorldData, WorldDiff, WorldState } from '@sumeria/core';
import type { UUID } from 'utilium';

/**
 * The client's copy of the world. The render thread keeps its own for drawing;
 * this one exists so the UI can read game state without reaching across a worker boundary.
 */
export let world: WorldData | null = null;

/** The entity this client controls, or null while spectating or disconnected. */
export let player: UUID | null = null;

export const entities = new Map<UUID, EntitySaveData>();

export type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Runs whenever the world changes, which is how client-side game logic reacts to the
 * server without polling. Returns a function that removes the listener again.
 */
export function listen(listener: Listener): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

/** Called by the socket once the mirror is up to date, before the interface redraws. */
export function changed(): void {
	for (const listener of listeners) listener();
}

/** The controlled entity's latest data, which is what a HUD is almost always after. */
export function self(): EntitySaveData | null {
	return player ? (entities.get(player) ?? null) : null;
}

/** Game-defined world state, empty until the first message arrives. */
export function state(): WorldState {
	return world?.state ?? ({} as WorldState);
}

export function load(from: Welcome): void {
	world = from.world;
	player = from.entity;

	entities.clear();
	for (const entity of from.world.entities) entities.set(entity.id, entity);
}

export function update(diff: WorldDiff): void {
	if (!world) return;

	world.state = diff.state;

	for (const entity of diff.added) entities.set(entity.id, entity);
	for (const entity of diff.updated) entities.set(entity.id, entity);
	for (const id of diff.removed) entities.delete(id);

	world.entities = [...entities.values()];
}

export function reset(): void {
	world = null;
	player = null;
	entities.clear();
}
