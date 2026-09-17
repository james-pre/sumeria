import * as z from 'zod';

/** @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location */
export type KeyLocation = 'standard' | 'left' | 'right' | 'numpad';

export const keyLocations = ['standard', 'left', 'right', 'numpad'] as const satisfies KeyLocation[];

export const Trigger = z
	.object({
		ctrl: z.boolean().optional(),
		shift: z.boolean().optional(),
		alt: z.boolean().optional(),
		meta: z.boolean().optional(),
		/** Matched against `KeyboardEvent#key`, case-insensitively. */
		key: z.string().optional(),
		location: z.literal(keyLocations).optional(),
		/** Matched against `MouseEvent#button`. */
		button: z.int().nonnegative().optional(),
	})
	.partial();

export interface Trigger extends z.infer<typeof Trigger> {}

export const Binding = z.object({
	default: Trigger,
	/** Set when the player rebinds the action, and takes precedence. */
	current: Trigger.optional(),
});

export interface Binding extends z.infer<typeof Binding> {}

export const Controls = z.record(z.string(), Binding);
export interface Controls extends z.infer<typeof Controls> {}

export function triggerOf(binding: Binding): Trigger {
	return binding.current ?? binding.default;
}
