/**
 * A screen is one layer of the interface — a menu, a HUD, a results card.
 * Games default-export one of these from each module in their `ui` directory.
 */
export interface Screen {
	/** Identifies the screen, and becomes its element's id. */
	name: string;

	/** Stacking order; higher sits on top. */
	order?: number;

	/** Lets clicks fall through to the game, which is what a HUD wants. */
	passive?: boolean;

	/** CSS added to the page once, alongside the base styles. */
	styles?: string;

	/** Fills in the screen's element. Runs once, the first time the screen is shown. */
	build(root: HTMLElement): void;

	/** Runs on every update while the screen is visible. */
	update?(root: HTMLElement): void;

	/**
	 * Whether this screen belongs on top of the current state, checked on every update.
	 * Screens without one are controlled with {@link show} and {@link hide} instead.
	 */
	visible?(): boolean;
}

interface Mounted {
	screen: Screen;
	element: HTMLElement;
	built: boolean;
}

const mounted = new Map<string, Mounted>();

/** Screens whose visibility is not derived from state. */
const shown = new Set<string>();

let layer: HTMLElement | null = null;

/**
 * Enough of a kit that a game's screens are mostly markup:
 * a centred panel, buttons, and a labelled bar.
 *
 * Layout and theme rules are wrapped in `:where()` so they carry no specificity at all,
 * and a screen can override any of them with a plain `#its-name` rule.
 */
const baseStyles = `
:where(#ui) {
	position: fixed;
	inset: 0;
	pointer-events: none;
	font-family: system-ui, sans-serif;
	color: #f2f2f2;
	z-index: 1;
}

:where(#ui .screen) {
	position: absolute;
	inset: 0;
	pointer-events: auto;
	display: flex;
	align-items: center;
	justify-content: center;
}

:where(#ui .screen.passive) {
	pointer-events: none;
}

/* Not in :where(), because hiding a screen has to beat a screen's own display rule. */
#ui .screen[hidden] {
	display: none;
}

:where(#ui .panel) {
	background: #1b1f24d8;
	border: 1px solid #ffffff22;
	border-radius: 12px;
	padding: 2rem 2.5rem;
	text-align: center;
	min-width: 20rem;
	box-shadow: 0 1.5rem 3rem #0006;
}

:where(#ui .panel h1) {
	margin: 0 0 0.25rem;
	font-size: 2.5rem;
}

:where(#ui .panel p) {
	margin: 0.25rem 0 1.25rem;
	color: #b9c2cc;
}

:where(#ui button) {
	font: inherit;
	font-weight: 600;
	color: #11151a;
	background: #f2b134;
	border: none;
	border-radius: 8px;
	padding: 0.6rem 1.6rem;
	cursor: pointer;
}

:where(#ui button:hover) {
	background: #ffc75a;
}

:where(#ui button:disabled) {
	background: #6b7280;
	color: #d1d5db;
	cursor: default;
}

:where(#ui .bar) {
	height: 0.75rem;
	border-radius: 999px;
	background: #00000066;
	border: 1px solid #ffffff2e;
	overflow: hidden;
}

:where(#ui .bar > .fill) {
	height: 100%;
	width: 0;
	background: #7ddf64;
	transition: width 80ms linear;
}
`;

function style(css: string): void {
	const element = document.createElement('style');
	element.textContent = css;
	document.head.appendChild(element);
}

/** Creates the overlay. The generated client entry point calls this before any screen is added. */
export function init(): void {
	if (layer) return;

	style(baseStyles);

	layer = document.createElement('div');
	layer.id = 'ui';
	document.body.appendChild(layer);
}

export function add(...screens: Screen[]): void {
	if (!layer) throw new Error('The UI has to be initialized before screens are added');

	for (const screen of screens) {
		if (mounted.has(screen.name)) throw new Error(`A screen named "${screen.name}" has already been added`);

		if (screen.styles) style(screen.styles);

		const element = document.createElement('div');
		element.id = screen.name;
		element.className = screen.passive ? 'screen passive' : 'screen';
		element.hidden = true;
		element.style.zIndex = String(screen.order ?? 0);

		layer.appendChild(element);
		mounted.set(screen.name, { screen, element, built: false });
	}
}

export function has(name: string): boolean {
	return mounted.has(name);
}

function find(name: string): Mounted {
	const found = mounted.get(name);
	if (!found) throw new Error(`There is no screen named "${name}"`);
	return found;
}

export function show(name: string): void {
	find(name);
	shown.add(name);
	update();
}

export function hide(name: string): void {
	find(name);
	shown.delete(name);
	update();
}

export function toggle(name: string): void {
	if (shown.has(name)) hide(name);
	else show(name);
}

export function isVisible(name: string): boolean {
	return !find(name).element.hidden;
}

/** Applies current state to every screen. Called on each tick, and whenever a screen is toggled. */
export function update(): void {
	for (const [name, entry] of mounted) {
		const visible = entry.screen.visible ? entry.screen.visible() : shown.has(name);

		if (visible && !entry.built) {
			entry.screen.build(entry.element);
			entry.built = true;
		}

		entry.element.hidden = !visible;

		if (visible) entry.screen.update?.(entry.element);
	}
}
