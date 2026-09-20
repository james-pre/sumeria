import * as ui from './ui.js';

export interface Line {
	/** Who is speaking. Leave it out for narration. */
	speaker?: string;
	text: string;
}

export interface Conversation {
	lines: Line[];
	/** Runs once the last line is dismissed, or the whole thing is skipped. */
	then?: () => void;
}

/** Characters revealed per second, fast enough to read along with rather than wait on. */
const speed = 55;

let playing: Conversation | null = null;
let index = 0;
let revealed = 0;
let timer: ReturnType<typeof setInterval> | undefined;

/** The screen's own element, so the reveal can redraw without running every other screen. */
let element: HTMLElement | null = null;

export function active(): boolean {
	return playing !== null;
}

export function line(): Line | null {
	return playing?.lines[index] ?? null;
}

function stop() {
	clearInterval(timer);
	timer = undefined;
}

function draw() {
	if (!element) return;

	const current = line();

	if (!current) return;

	const speaker = element.querySelector<HTMLElement>('.speaker')!;
	speaker.textContent = current.speaker ?? '';
	speaker.hidden = !current.speaker;

	element.querySelector('.text')!.textContent = current.text.slice(0, revealed);
	element.querySelector<HTMLElement>('.more')!.hidden = revealed < current.text.length;
}

function reveal() {
	stop();
	revealed = 0;

	timer = setInterval(() => {
		const current = line();

		if (!current) return stop();

		revealed = Math.min(current.text.length, revealed + Math.max(1, Math.round(speed / 30)));

		if (revealed >= current.text.length) stop();

		draw();
	}, 1000 / 30);

	draw();
}

function finish() {
	const conversation = playing;

	stop();
	playing = null;
	index = 0;
	revealed = 0;

	ui.update();
	conversation?.then?.();
}

/** Completes the line being revealed, moves to the next one, or ends the conversation. */
export function advance() {
	const current = line();

	if (!current) return;

	if (revealed < current.text.length) {
		stop();
		revealed = current.text.length;
		draw();
		return;
	}

	index++;

	if (!line()) return finish();

	reveal();
}

/** Drops the rest of the conversation, running its `then` as if it had been read. */
export function skip() {
	if (playing) finish();
}

const screen: ui.Screen = {
	name: 'dialog',
	order: 100,

	visible: active,

	styles: `
#dialog {
	align-items: flex-end;
	justify-content: center;
	padding: 2rem 1.5rem;
}

#dialog .box {
	width: min(46rem, 100%);
	background: #11151ae8;
	border: 1px solid #ffffff22;
	border-radius: 12px;
	padding: 1.25rem 1.5rem 1.5rem;
	box-shadow: 0 1.5rem 3rem #0008;
	cursor: pointer;
}

#dialog .speaker {
	font-size: 0.8rem;
	font-weight: 700;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: #f2b134;
	margin-bottom: 0.4rem;
}

#dialog .text {
	font-size: 1.15rem;
	line-height: 1.55;
	min-height: 3.5rem;
	white-space: pre-wrap;
}

#dialog .more {
	text-align: right;
	color: #b9c2cc;
	font-size: 0.85rem;
	animation: dialog-nudge 1.2s ease-in-out infinite;
}

@keyframes dialog-nudge {
	50% { opacity: 0.35; }
}
	`,

	build(root) {
		element = root;

		const box = document.createElement('div');
		box.className = 'box';
		box.innerHTML = '<div class="speaker"></div><div class="text"></div><div class="more">continue ▾</div>';
		box.addEventListener('click', advance);

		root.append(box);
	},

	update: draw,
};

addEventListener('keydown', event => {
	if (!playing || event.repeat) return;

	if (event.key === ' ' || event.key === 'Enter') advance();
	else if (event.key === 'Escape') skip();
});

/** Starts a conversation, putting the dialog box up until it has been read or skipped. */
export function play(conversation: Conversation) {
	if (!conversation.lines.length) return;

	// Added on first use, so a game that never talks never gets the screen.
	if (!ui.has(screen.name)) ui.add(screen);

	playing = conversation;
	index = 0;

	ui.update();
	reveal();
}
