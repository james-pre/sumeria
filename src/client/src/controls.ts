import { keyLocations, triggerOf, type Controls, type Trigger } from '@sumeria/core';

export function isModifierOnly(trigger: Trigger): boolean {
	return trigger.key === undefined && trigger.button === undefined;
}

function modifiersMatch(trigger: Trigger, event: KeyboardEvent | MouseEvent): boolean {
	return !(
		(trigger.ctrl !== undefined && trigger.ctrl !== event.ctrlKey)
		|| (trigger.shift !== undefined && trigger.shift !== event.shiftKey)
		|| (trigger.alt !== undefined && trigger.alt !== event.altKey)
		|| (trigger.meta !== undefined && trigger.meta !== event.metaKey)
	);
}

export function isMatch(trigger: Trigger, event: KeyboardEvent | MouseEvent): boolean {
	if (!modifiersMatch(trigger, event)) return false;

	if (trigger.button !== undefined) return 'button' in event && event.button === trigger.button;

	if (trigger.key !== undefined) {
		if (!('key' in event) || event.key.toLowerCase() !== trigger.key.toLowerCase()) return false;
		return trigger.location === undefined || keyLocations[event.location] === trigger.location;
	}

	return true;
}

/** The name of the first action whose trigger matches the event. */
export function find(controls: Controls, event: KeyboardEvent | MouseEvent): string | undefined {
	for (const [action, binding] of Object.entries(controls)) {
		if (isMatch(triggerOf(binding), event)) return action;
	}
}
