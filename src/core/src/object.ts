/**
 * Something with a save/tick lifecycle.
 *
 * Order of calls differs between a fresh object and a restored one:
 *
 * - fresh:    `new` -> `init` -> `tick`... -> `dispose`
 * - restored: `new` -> `load` -> `init` -> `tick`... -> `dispose`
 *
 * `load` runs *before* `init` so that `init` sees final state (its id in
 * particular). The practical consequence for implementors: `init` must wire
 * things up without overwriting anything `load` may have set.
 */
export interface GameObject<Data extends object> {
	/** Register with the world and wire up. Must not clobber loaded state. */
	init(): void;
	tick(): void;
	toJSON(): Data;
	load(data: Data): void;
	dispose(): void;
}
