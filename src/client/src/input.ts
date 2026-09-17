import { triggerOf, type Binding, type Controls } from '@sumeria/core';
import { isMatch, isModifierOnly } from './controls.js';
import * as socket from './socket.js';

/** Actions currently held, so the server only hears about changes. */
const held = new Set<string>();

let bindings: [string, Binding][] = [];

function setActive(action: string, active: boolean): void {
	if (active === held.has(action)) return;

	if (active) held.add(action);
	else held.delete(action);

	socket.input(action, active);
}

function onKey(event: KeyboardEvent, down: boolean): void {
	if (down && event.repeat) return;

	for (const [action, binding] of bindings) {
		const trigger = triggerOf(binding);

		if (isModifierOnly(trigger)) {
			setActive(action, isMatch(trigger, event));
			continue;
		}

		if (down) {
			if (isMatch(trigger, event)) setActive(action, true);
			continue;
		}

		// Matched on the key alone since letting go of a modifier first would otherwise leave the action stuck on.
		if (trigger.key !== undefined && trigger.key.toLowerCase() === event.key.toLowerCase())
			setActive(action, false);
	}
}

function releaseAll(): void {
	for (const action of [...held]) {
		setActive(action, false);
	}
}

export function bind(controls: Controls): void {
	bindings = Object.entries(controls);

	addEventListener('keydown', event => onKey(event, true));
	addEventListener('keyup', event => onKey(event, false));
	addEventListener('blur', releaseAll);
}

export function isHeld(action: string): boolean {
	return held.has(action);
}
