import { Component, defineGame, Entity } from '@sumeria/core';
import * as server from '@sumeria/server';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import { io as connect, type Socket } from 'socket.io-client';

interface RunnerData {
	distance: number;
}

/** Stands in for a game's own component: moves on input, saves its state. */
class Runner extends Component<RunnerData, { speed: number }> {
	distance = 0;
	running = false;

	init() {}

	input(action: string, active: boolean) {
		if (action === 'run') this.running = active;
	}

	tick() {
		if (this.running) this.distance += this.config.speed;
	}

	load(data: RunnerData) {
		this.distance = data.distance;
	}

	toJSON() {
		return { distance: this.distance };
	}

	dispose() {}
}

class Racer extends Entity.WithComponents([Runner], { speed: 1 }) {}

const game = defineGame({ id: 'test-game', entities: [Racer], player: 'Racer' });

/** Resolves with the next payload for an event, or rejects on timeout. */
function next<T>(socket: Socket, event: string, ms = 2000): Promise<T> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(`Timed out waiting for "${event}"`)), ms);

		socket.once(event, (payload: T) => {
			clearTimeout(timer);
			resolve(payload);
		});
	});
}

/** Polls until the server has caught up, rather than guessing at a delay. */
async function waitFor(what: string, condition: () => boolean, ms = 2000): Promise<void> {
	const deadline = Date.now() + ms;

	while (Date.now() < deadline) {
		if (condition()) return;
		await new Promise(resolve => setTimeout(resolve, 5));
	}

	throw new Error(`Timed out waiting for ${what}`);
}

// One session, run in order: these share a server and a connection.
test('client and server talk over the socket', async t => {
	server.init(game);
	server.io.listen(0);

	await new Promise<void>(resolve => server.io.httpServer.once('listening', () => resolve()));

	const port = (server.io.httpServer.address() as AddressInfo).port;
	const client = connect(`http://localhost:${port}`, { transports: ['websocket'] });

	// Subscribed before anything is awaited: the server sends `welcome` and the
	// first `tick` back to back, so a late listener misses them.
	const welcomed = next<{ entity: string | null; tickRate: number }>(client, 'welcome');
	const firstTick = next<{ entities: { $: string; id: string }[] }>(client, 'tick');

	t.after(async () => {
		client.disconnect();
		await server.io.close();
	});

	let entityId: string | null = null;

	await t.test('a connecting client is welcomed with a player entity', async () => {
		const welcome = await welcomed;

		assert.ok(welcome.entity, 'the server should spawn a player entity');
		assert.equal(welcome.tickRate, 20);
		entityId = welcome.entity;
	});

	await t.test('the joining client gets the world before the first tick', async () => {
		const world = await firstTick;

		assert.equal(world.entities.length, 1);
		assert.equal(world.entities[0].$, 'Racer');
		assert.equal(world.entities[0].id, entityId);
	});

	const runner = () => [...server.world.entities.values()][0].get(Runner)!;

	await t.test('input reaches the component that handles it', async () => {
		assert.equal(runner().distance, 0);

		client.emit('input', 'run', true);
		await waitFor('the server to see the action', () => runner().running);

		for (let i = 0; i < 5; i++) server.world.tick();

		assert.equal(runner().distance, 5, 'five ticks while running should cover five units');
	});

	await t.test('releasing the action stops it', async () => {
		client.emit('input', 'run', false);
		await waitFor('the server to see the release', () => !runner().running);

		for (let i = 0; i < 5; i++) server.world.tick();

		assert.equal(runner().distance, 5);
	});

	await t.test('ticks carry component state to the client', async () => {
		const received = next<{ entities: { distance: number }[] }>(client, 'tick');

		server.world.tick();

		const world = await received;
		assert.equal(world.entities[0].distance, 5);
	});

	await t.test('a disconnecting client takes its player entity with it', async () => {
		assert.equal(server.world.entities.size, 1);

		client.disconnect();
		await waitFor('the player entity to be disposed', () => server.world.entities.size === 0);
	});
});
