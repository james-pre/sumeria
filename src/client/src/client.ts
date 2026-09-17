import type { Controls } from '@sumeria/core';
import * as input from './input.js';
import * as render from './render_thread.js';
import * as socket from './socket.js';

/** The port the integrated server is listening on, or null when the page was opened without one. */
export function serverPort(): number | null {
	const port = Number(new URLSearchParams(location.search).get('port'));
	return Number.isSafeInteger(port) && port > 0 ? port : null;
}

export function start(controls: Controls = {}): void {
	render.init();
	input.bind(controls);

	const port = serverPort();

	if (port === null) {
		console.warn('[client] no server port; running without a connection');
		return;
	}

	socket.init(port);
}
