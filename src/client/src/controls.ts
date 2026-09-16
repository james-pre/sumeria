import { keyLocations, triggerOf, type ActionBinding, type TriggerData } from '@sumeria/core';
import * as z from 'zod';

/**
 * Validates a trigger on the way in from a game's `controls.json`.
 * The `satisfies` keeps the schema and {@link TriggerData} from drifting apart.
 */
export const Trigger = z.object({
	ctrl: z.boolean().optional(),
	shift: z.boolean().optional(),
	alt: z.boolean().optional(),
	meta: z.boolean().optional(),
	key: z.string().optional(),
	location: z.literal(keyLocations).optional(),
	button: z.int().nonnegative().optional(),
}) satisfies z.ZodType<TriggerData>;

export const Binding = z.object({
	default: Trigger,
	current: Trigger.optional(),
}) satisfies z.ZodType<ActionBinding>;

export const ControlsConfig = z.record(z.string(), Binding);

export type ControlsConfig = Record<string, ActionBinding>;

/** A trigger naming neither a key nor a button fires on modifier state alone. */
export function isModifierOnly(trigger: TriggerData): boolean {
	return trigger.key === undefined && trigger.button === undefined;
}

function modifiersMatch(trigger: TriggerData, event: KeyboardEvent | MouseEvent): boolean {
	return !(
		(trigger.ctrl !== undefined && trigger.ctrl !== event.ctrlKey)
		|| (trigger.shift !== undefined && trigger.shift !== event.shiftKey)
		|| (trigger.alt !== undefined && trigger.alt !== event.altKey)
		|| (trigger.meta !== undefined && trigger.meta !== event.metaKey)
	);
}

export function isMatch(trigger: TriggerData, event: KeyboardEvent | MouseEvent): boolean {
	if (!modifiersMatch(trigger, event)) return false;

	if (trigger.button !== undefined) return 'button' in event && event.button === trigger.button;

	if (trigger.key !== undefined) {
		if (!('key' in event) || event.key.toLowerCase() !== trigger.key.toLowerCase()) return false;
		return trigger.location === undefined || keyLocations[event.location] === trigger.location;
	}

	// Modifiers only, and they matched.
	return true;
}

/** The name of the first action whose trigger matches the event. */
export function find(controls: ControlsConfig, event: KeyboardEvent | MouseEvent): string | undefined {
	for (const [action, binding] of Object.entries(controls)) {
		if (isMatch(triggerOf(binding), event)) return action;
	}
}
