import { triggerOf, type ActionBinding } from '@sumeria/core';
import { isMatch, isModifierOnly, type ControlsConfig } from './controls.js';
import * as socket from './socket.js';

/** Actions currently held, so the server only hears about changes. */
const held = new Set<string>();

let bindings: [string, ActionBinding][] = [];

function setActive(action: string, active: boolean): void {
	if (active === held.has(action)) return;

	if (active) held.add(action);
	else held.delete(action);

	socket.input(action, active);
}

function onKey(event: KeyboardEvent, down: boolean): void {
	// Auto-repeat would otherwise re-send an action that is already held.
	if (down && event.repeat) return;

	for (const [action, binding] of bindings) {
		const trigger = triggerOf(binding);

		if (isModifierOnly(trigger)) {
			// These track modifier state rather than a press, so both
			// directions are re-evaluated against the event.
			setActive(action, isMatch(trigger, event));
			continue;
		}

		if (down) {
			if (isMatch(trigger, event)) setActive(action, true);
			continue;
		}

		// On release, match the key alone: letting go of a modifier first
		// would otherwise leave the action stuck on.
		if (trigger.key !== undefined && trigger.key.toLowerCase() === event.key.toLowerCase())
			setActive(action, false);
	}
}

/** Release everything, so focus loss can not leave an action stuck on. */
function releaseAll(): void {
	for (const action of [...held]) {
		setActive(action, false);
	}
}

/** Start translating input events into actions for the server. */
export function bind(controls: ControlsConfig): void {
	bindings = Object.entries(controls);

	addEventListener('keydown', event => onKey(event, true));
	addEventListener('keyup', event => onKey(event, false));
	addEventListener('blur', releaseAll);
}

/** Whether an action is currently held. */
export function isHeld(action: string): boolean {
	return held.has(action);
}
