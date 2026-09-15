import * as z from 'zod';

export const TriggerModifiers = z.object({
	ctrl: z.boolean().optional(),
	shift: z.boolean().optional(),
	alt: z.boolean().optional(),
	meta: z.boolean().optional(),
});
export interface TriggerModifiers extends z.infer<typeof TriggerModifiers> {}

export const MouseTrigger = z.object({
	...TriggerModifiers.shape,
	button: z.int(),
});

export interface MouseTrigger extends z.infer<typeof MouseTrigger> {}

/** @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location */
export const enum KeyLocation {
	Standard,
	Left,
	Right,
	Numpad,
}

const keyLocations = ['standard', 'left', 'right', 'numpad'] as const satisfies Record<KeyLocation, string>;

export const KeyboardTrigger = z.object({
	...TriggerModifiers.shape,
	key: z.string(),
	location: z
		.literal(keyLocations)
		.transform<KeyLocation>(v => keyLocations.indexOf(v))
		.optional(),
});

export interface KeyboardTrigger extends z.infer<typeof KeyboardTrigger> {}

export const Trigger = z.union([KeyboardTrigger, MouseTrigger]);
export type Trigger = KeyboardTrigger | MouseTrigger;

export interface WithAction<TData extends unknown[]> {
	action(...args: TData): unknown;
}

export interface KeyboardHandler<TData extends unknown[]> extends KeyboardTrigger, WithAction<TData> {}

export interface MouseHandler<TData extends unknown[]> extends MouseTrigger, WithAction<TData> {}

export type Handler<TData extends unknown[]> = KeyboardHandler<TData> | MouseHandler<TData>;

export function isMatch(trigger: Trigger, event: KeyboardEvent | MouseEvent): boolean {
	if (
		('ctrl' in trigger && trigger.ctrl !== event.ctrlKey)
		|| ('shift' in trigger && trigger.shift !== event.shiftKey)
		|| ('alt' in trigger && trigger.alt !== event.altKey)
		|| ('meta' in trigger && trigger.meta !== event.metaKey)
	)
		return false;

	return 'key' in trigger
		? 'key' in event
				&& event.key === trigger.key
				&& (!('location' in trigger) || trigger.location === event.location)
		: 'button' in event && event.button === trigger.button;
}

export function find<T extends Trigger>(triggers: T[], event: KeyboardEvent | MouseEvent): T | undefined {
	for (const trigger of triggers) {
		if (isMatch(trigger, event)) return trigger;
	}
}
