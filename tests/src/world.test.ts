import { Component, Entity, register, World } from '@sumeria/core';
import assert from 'node:assert/strict';
import { test } from 'node:test';

interface MoverData {
	travelled: number;
}

class Mover extends Component<MoverData, { speed: number }> {
	travelled = 0;

	init() {}

	tick() {
		this.travelled += this.config.speed;
		this.entity.position.z = this.travelled;
	}

	load(data: MoverData) {
		this.travelled = data.travelled;
	}

	toJSON() {
		return { travelled: this.travelled };
	}

	dispose() {}
}

class Thing extends Entity.WithComponents([Mover], { speed: 2 }) {}

register(Thing);

test('a new entity is added, then updated on later ticks', () => {
	const world = new World();
	const thing = new Thing(world);
	thing.init();

	const first = world.tick();

	assert.deepEqual(
		first.added.map(e => e.id),
		[thing.id]
	);
	assert.equal(first.added[0].$, 'Thing');
	assert.deepEqual(first.updated, []);
	assert.deepEqual(first.removed, []);

	const second = world.tick();

	assert.deepEqual(second.added, []);
	assert.deepEqual(
		second.updated.map(e => e.id),
		[thing.id]
	);
	assert.deepEqual(second.updated[0].position, [0, 0, 4], 'the diff should carry the latest state');
});

test('a disposed entity is reported as removed exactly once', () => {
	const world = new World();
	const thing = new Thing(world);
	thing.init();
	world.tick();

	thing.dispose();

	assert.deepEqual(world.tick().removed, [thing.id]);
	assert.deepEqual(world.tick().removed, []);
});

test('component state survives a save and load round trip', () => {
	const world = new World();
	const thing = new Thing(world);
	thing.init();

	for (let i = 0; i < 3; i++) world.tick();

	const saved = JSON.parse(JSON.stringify(world.toJSON()));

	const loaded = new World();
	loaded.load(saved);

	assert.equal(loaded.entities.size, 1);

	const [restored] = [...loaded.entities.values()];
	assert.ok(restored instanceof Thing, 'it should come back as a Thing, not a bare Entity');
	assert.equal(restored.id, thing.id);
	assert.equal(restored.get(Mover)!.travelled, 6);
});

test('an unknown entity type is skipped rather than failing the load', () => {
	const world = new World();
	const thing = new Thing(world);
	thing.init();

	const saved = JSON.parse(JSON.stringify(world.toJSON()));
	saved.entities[0].$ = 'Nothing';

	const loaded = new World();
	loaded.load(saved);

	assert.equal(loaded.entities.size, 0);
});

test('registering a different class under a taken name throws', () => {
	assert.throws(() => {
		class Thing extends Entity {}
		register(Thing);
	}, /different class already has that name/);
});
