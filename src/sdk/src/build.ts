import { Controls as ControlsSchema } from '@sumeria/core';
import type { Configuration } from 'electron-builder';
import { build, formatMessages } from 'esbuild';
import * as io from 'ioium/node';
import * as fs from 'node:fs';
import { findPackageJSON } from 'node:module';
import { dirname, extname, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GamePackage } from './config.js';
import { builderConfig, electronMain, type Platform, platforms, targetsFor } from './electron.js';
import { generate, generatedDir, scan, specifier } from './generate.js';

const shared = ['@babylonjs/core'];

/** Pins every shared package to the copy in the game's own tree. */
function aliases(root: string): Record<string, string> {
	const base = join(root, 'package.json');
	const alias: Record<string, string> = {};

	for (const name of shared) {
		const path = findPackageJSON(name, base);

		if (path) alias[name] = dirname(path);
	}

	return alias;
}

export async function bundle(entry: string, outDir: string, filename: string, root: string, dev?: boolean) {
	const result = await build({
		entryPoints: [entry],
		outfile: join(outDir, filename),
		alias: aliases(root),
		bundle: true,
		format: 'esm',
		platform: 'browser',
		target: 'chrome152',
		minifyWhitespace: !dev,
		minifySyntax: !dev,
		minifyIdentifiers: false,
		keepNames: true,
		sourcemap: dev ? 'linked' : false,
		logLevel: 'silent',
	});

	const warnings = await formatMessages(result.warnings, {
		kind: 'warning',
		color: !!process.stdout.isTTY,
		terminalWidth: process.stdout.columns,
	});

	for (const warning of warnings) io.warn(filename + ':', warning);
}

export interface AssembleOptions {
	project: string;
	dev?: boolean;
	skipCompile?: boolean;
}

export interface Assembled {
	game: GamePackage;
	root: string;
	out: string;
	/** Path to the copied icon, relative to the root and POSIX-separated. */
	icon: string | null;
}

export async function assemble({ project, dev, skipCompile }: AssembleOptions): Promise<Assembled> {
	const root = resolve(project);
	const packagePath = join(root, 'package.json');

	if (!fs.existsSync(packagePath)) throw new Error(`No package.json at ${packagePath}`);

	const game = io.readJSON(packagePath, GamePackage);

	io.info(`Building ${game.productName} (${game.name}) v${game.version}`);

	const source = resolve(root, game.source);

	if (!fs.existsSync(source)) throw new Error(`No source directory at ${source}`);

	const entities = io.track('Scanning entities', () => scan(join(source, 'entities'), '.ts'));
	const renders = io.track('Scanning renderers', () => scan(join(source, 'render'), '.ts'));
	const shaders = io.track('Scanning shaders', () => scan(join(source, 'shaders'), '.glslx'));
	const zones = io.track('Scanning zones', () => scan(join(source, 'zones'), '.ts'));

	const worldSetup = join(source, 'world.ts');
	const world = fs.existsSync(worldSetup) && specifier(join(source, generatedDir), worldSetup);

	io.debug('Found', entities.length, 'entities,', renders.length, 'renderers,', shaders.length, 'shaders');

	if (!entities.length) io.warn('No entities found in', join(source, 'entities'));

	for (const entity of entities) {
		if (!renders.some(render => render.name === entity.name))
			io.warnOnce(`No renderer in ${join(game.source, 'render')} for "${entity.name}"; it will be invisible`);
	}

	const controls =
		!!io.tryTrack('Validating controls', () => io.readJSON(resolve(root, game.controls), ControlsSchema))
		&& specifier(join(source, generatedDir), join(root, game.controls));

	const out = resolve(root, game.out);
	const compiled = resolve(root, game.compiled);

	io.track('Generating entry points', () =>
		generate({
			dir: join(source, generatedDir),
			entities,
			renders,
			shaders,
			zones,
			world,
			controls,
		})
	);

	io.setCommandTimeout(60_000);

	if (!skipCompile) io.trackCommand('Compiling', 'npx', 'tsc', '--project', root);

	if (!fs.existsSync(join(compiled, generatedDir)))
		throw new Error(`Nothing compiled at ${join(compiled, generatedDir)}. Check "compiled" in ${packagePath}.`);

	fs.rmSync(out, { recursive: true, force: true });
	fs.mkdirSync(out, { recursive: true });

	await io.track(
		'Bundling client thread',
		bundle(join(compiled, generatedDir, 'client.js'), out, 'main.js', root, dev)
	);
	await io.track(
		'Bundling render thread',
		bundle(join(compiled, generatedDir, 'render.js'), out, 'render.js', root, dev)
	);

	io.track('Copying the page', () =>
		fs.copyFileSync(fileURLToPath(import.meta.resolve('@sumeria/client/index.html')), join(out, 'index.html'))
	);

	let icon: string | null = null;

	if (game.icon) {
		const from = resolve(root, game.icon);

		if (!fs.existsSync(from)) throw new Error(`Icon not found: ${from}`);

		const to = join(out, 'icon' + extname(from));
		io.track('Copying the icon', () => fs.copyFileSync(from, to));
		icon = relative(root, to).split(sep).join(posix.sep);
	} else if (!dev) {
		io.warnOnce('No "sumeria.icon" in package.json; electron-builder will use its default.');
	}

	io.info('Assembled', relative(root, out) || '.');

	return { game, root, out, icon };
}

export interface BuilderConfig {
	path: string;
	config: Configuration;
	targets: Record<Platform, string[]>;
}

/** `build` writes this too, so `pack` can run on its own afterwards. */
export function writeBuilderConfig({ game, root, icon }: Assembled, named: string[]): BuilderConfig {
	const targets = targetsFor(named.length ? named : game.targets);

	io.debug('Targets:', platforms.map(p => `${p}=[${targets[p].join(', ')}]`).join(' '));

	const path = join(root, '.electron-builder.json');
	const config = builderConfig(game, electronMain, icon, targets);

	io.track('Writing the electron-builder config', () => io.writeJSON(path, config));

	return { path, config, targets };
}
