import type { EntitySaveData } from '@sumeria/core';
import { diff } from '@sumeria/render/diff';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { UUID } from 'utilium';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}` as UUID;

function entity(n: number, x = 0): EntitySaveData {
	return { $: 'Thing', id: id(n), position: [x, 0, 0], rotation: [0, 0, 0] };
}

test('everything is added when the scene is empty', () => {
	const { added, updated, removed } = diff([], [entity(1), entity(2)]);

	assert.deepEqual(
		added.map(e => e.id),
		[id(1), id(2)]
	);
	assert.deepEqual(updated, []);
	assert.deepEqual(removed, []);
});

test('entities already on screen are updated, not re-added', () => {
	const { added, updated, removed } = diff([id(1), id(2)], [entity(1, 5), entity(2)]);

	assert.deepEqual(added, []);
	assert.deepEqual(
		updated.map(e => e.id),
		[id(1), id(2)]
	);
	assert.deepEqual(updated[0].position, [5, 0, 0], 'the new state should come through');
	assert.deepEqual(removed, []);
});

test('entities the server no longer sends are removed', () => {
	const { added, updated, removed } = diff([id(1), id(2), id(3)], [entity(2)]);

	assert.deepEqual(added, []);
	assert.deepEqual(
		updated.map(e => e.id),
		[id(2)]
	);
	assert.deepEqual(removed, [id(1), id(3)]);
});

test('a single tick can add, update and remove at once', () => {
	const { added, updated, removed } = diff([id(1), id(2)], [entity(2), entity(3)]);

	assert.deepEqual(
		added.map(e => e.id),
		[id(3)]
	);
	assert.deepEqual(
		updated.map(e => e.id),
		[id(2)]
	);
	assert.deepEqual(removed, [id(1)]);
});

test('an empty world removes everything', () => {
	const { removed } = diff([id(1), id(2)], []);
	assert.deepEqual(removed, [id(1), id(2)]);
});
