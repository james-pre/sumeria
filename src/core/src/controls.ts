/** @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location */
export type KeyLocation = 'standard' | 'left' | 'right' | 'numpad';

export const keyLocations = ['standard', 'left', 'right', 'numpad'] as const satisfies KeyLocation[];

/** A trigger with neither a key nor a button fires on modifier state alone. */
export interface TriggerData {
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	meta?: boolean;
	/** Matched against `KeyboardEvent#key`, case-insensitively. */
	key?: string;
	location?: KeyLocation;
	/** Matched against `MouseEvent#button`. */
	button?: number;
}

export interface ActionBinding {
	default: TriggerData;
	/** Set when the player rebinds the action, and takes precedence. */
	current?: TriggerData;
}

export type Controls = Record<string, ActionBinding>;

export function triggerOf(binding: ActionBinding): TriggerData {
	return binding.current ?? binding.default;
}
