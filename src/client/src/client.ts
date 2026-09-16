import { registryFor, type GameManifest, type Registry } from '@sumeria/core';
import type { ControlsConfig } from './controls.js';
import * as input from './input.js';
import * as render from './render_thread.js';
import * as socket from './socket.js';

/** Set by {@link start}. */
export let registry: Registry;

/**
 * The port the integrated server is listening on, handed to us by the app
 * shell. Null when the page was opened without one.
 */
export function serverPort(): number | null {
	const port = new URLSearchParams(location.search).get('port');
	return port ? Number(port) : null;
}

/**
 * Start the client for the given games.
 *
 * Called by the generated entry point rather than by game code, so consumers
 * never wire this up themselves.
 */
export function start(...games: GameManifest[]): void {
	registry = registryFor(...games);

	render.init();

	const controls: ControlsConfig = Object.assign({}, ...games.map(game => game.controls ?? {}));
	input.bind(controls);

	const port = serverPort();

	if (port === null) {
		console.warn('[client] no server port; running without a connection');
		return;
	}

	socket.init(port);
}
