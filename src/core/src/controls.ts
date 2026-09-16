/**
 * Which physical key produced an event, when it matters.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location
 */
export type KeyLocation = 'standard' | 'left' | 'right' | 'numpad';

export const keyLocations = ['standard', 'left', 'right', 'numpad'] as const satisfies KeyLocation[];

/**
 * What has to happen for an action to fire.
 *
 * One flat shape rather than a keyboard/mouse union, because this is what a
 * game's `controls.json` holds and what the client validates on the way in.
 * Every field is optional, so a trigger of only modifiers is legal and means
 * "while these are held".
 */
export interface TriggerData {
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	meta?: boolean;
	/** Keyboard: the key to match, as `KeyboardEvent#key`. */
	key?: string;
	/** Keyboard: which physical key, when it matters. */
	location?: KeyLocation;
	/** Mouse: the button to match, as `MouseEvent#button`. */
	button?: number;
}

/** How an action is triggered, and what the player may rebind it to. */
export interface ActionBinding {
	/** The trigger shipped with the game. */
	default: TriggerData;
	/** Overrides the default once the player rebinds the action. */
	current?: TriggerData;
}

/** The trigger currently in effect for a binding. */
export function triggerOf(binding: ActionBinding): TriggerData {
	return binding.current ?? binding.default;
}
