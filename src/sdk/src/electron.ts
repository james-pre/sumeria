/// <reference lib="dom" />
// for electron
import type { CliOptions, Configuration, MacOsTargetName } from 'electron-builder';
import * as io from 'ioium/node';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import { findPackageJSON } from 'node:module';
import type { GamePackage } from './config.js';

/** The Electron entry point, at the same path in the project and in the packaged app. */
export const electronMain = 'node_modules/@sumeria/app/dist/main.js';

export type Platform = 'linux' | 'win' | 'mac';

export const platforms = ['linux', 'win', 'mac'] as const satisfies Platform[];

export const hostPlatform: Platform =
	process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux';

/** electron-builder target names that belong to exactly one platform. */
const platformOf: Record<string, Platform> = {
	appimage: 'linux',
	deb: 'linux',
	rpm: 'linux',
	snap: 'linux',
	pacman: 'linux',
	apk: 'linux',
	freebsd: 'linux',
	p5p: 'linux',
	nsis: 'win',
	'nsis-web': 'win',
	portable: 'win',
	appx: 'win',
	msi: 'win',
	'msi-wrapped': 'win',
	squirrel: 'win',
	dmg: 'mac',
	pkg: 'mac',
	mas: 'mac',
	'mas-dev': 'mac',
};

const spelling: Record<string, any> = { appimage: 'AppImage' };

const platformDefault: any = { linux: 'AppImage', win: 'nsis', mac: 'dmg' };

function isPlatform(value: string): value is Platform {
	return platforms.includes(value as Platform);
}

export interface BuilderTargets {
	linux: string[];
	win: string[];
	mac: MacOsTargetName[];
}

/**
 * Group target names by the platform that builds them.
 * A bare platform name means that platform's default, and `<platform>:<target>` names
 * anything the table does not cover.
 */
export function targetsFor(names: string[]): BuilderTargets {
	const grouped: BuilderTargets = { linux: [], win: [], mac: [] };

	if (!names.length) grouped[hostPlatform].push(platformDefault[hostPlatform]);

	for (const name of names) {
		const [head, tail] = name.split(':', 2);
		const key = head.toLowerCase();

		if (tail !== undefined) {
			if (!isPlatform(key)) throw new Error(`Unknown platform "${head}" in target "${name}"`);
			grouped[key].push(tail as any);
			continue;
		}

		if (isPlatform(key)) {
			grouped[key].push(platformDefault[key]);
			continue;
		}

		const platform = platformOf[key];

		if (!platform)
			throw new Error(
				`Unknown target "${name}". Use one of ${Object.keys(platformOf).join(', ')},`
					+ ' a platform name, or <platform>:<target>.'
			);

		grouped[platform].push(spelling[key] ?? key);
	}

	return grouped;
}

/**
 * Kept out of the packaged `node_modules`: supplied by the Electron runtime, only used
 * while building, or already inlined into the browser bundles.
 */
const notPackaged = [
	'electron',
	'electron-builder',
	'esbuild',
	'zod',
	'@babylonjs/core',
	'@sumeria/client',
	'@sumeria/render',
];

/**
 * The packaged app is the project itself: Electron's main process and the integrated
 * server are plain Node modules, so electron-builder packs them and their dependencies
 * rather than us bundling them.
 */
export function builderConfig(
	game: GamePackage,
	main: string,
	icon: string | null,
	targets: BuilderTargets
): Configuration {
	const path = findPackageJSON('electron', import.meta.url);
	if (!path) throw new Error('Could not find the package.json for electron');
	const { version } = JSON.parse(fs.readFileSync(path, 'utf8')) as { version: string };

	return {
		appId: game.appId ?? `com.${game.name.replaceAll('-', '')}.app`,
		productName: game.productName,
		electronVersion: version,
		directories: { output: 'release' },
		artifactName: '${name}-${version}.${ext}',
		extraMetadata: { ...game, main },
		files: [`${game.compiled}/**/*`, `${game.out}/**/*`, 'package.json', '!**/*.map'],
		ignoredProductionDependencies: notPackaged,
		...(icon ? { icon } : {}),
		linux: { target: targets.linux, category: 'Game' },
		win: { target: targets.win },
		mac: { target: targets.mac, category: 'public.app-category.games' },
	};
}

/**
 * Packages the assembled app, resolving with the paths of the created artifacts.
 * A platform is built when its key is present, so ones without targets are left off.
 */
export async function pack(
	config: Configuration,
	projectDir: string,
	targets: Record<Platform, string[]>
): Promise<string[]> {
	// Imported here so `build` and `dev` never load the packaging toolchain.
	const { build } = await import('electron-builder');

	const options: CliOptions = { config, projectDir };

	for (const platform of platforms) {
		if (targets[platform].length) options[platform] = [];
	}

	return await build(options);
}

/** Runs the app in Electron, resolving with its exit code. */
export async function launch(...args: string[]): Promise<number> {
	let electron: string;

	try {
		// The package's entry point is the path to the binary.
		electron = ((await import('electron')) as unknown as { default: string }).default;
	} catch (error) {
		throw new Error(`Could not find Electron: ${io.errorText(error)}`, { cause: error });
	}

	// Some toolchains export this to make the binary behave as plain Node,
	// which would start the app with none of the Electron APIs available.
	const env = { ...process.env };
	delete env.ELECTRON_RUN_AS_NODE;

	const { resolve, reject, promise } = Promise.withResolvers<number>();
	const child = spawn(electron, args, { stdio: 'inherit', env });
	child.on('error', reject);
	child.on('exit', code => resolve(code ?? 0));

	return await promise;
}
