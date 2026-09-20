#!/usr/bin/env node
import { Command } from 'commander';
import * as io from 'ioium/node';
import { relative } from 'node:path';
import $pkg from '../package.json' with { type: 'json' };
import { assemble, writeBuilderConfig } from './build.js';
import { launch, pack } from './electron.js';

const cli = new Command()
	.name('sumeria')
	.version($pkg.version)
	.description($pkg.description)
	.option('-p, --project <path>', 'path to the game package', '.')
	.option('--skip-compile', 'reuse the existing compiled output instead of running tsc', false)
	.option('-v, --verbose', 'show debug output')
	.hook('preAction', () => {
		if (cli.opts().verbose) io._setDebugOutput(true);
	});

cli.command('build', { isDefault: true })
	.description('assemble the app')
	.option('--dev', 'emit sourcemaps and skip minification')
	.action(async function cli_build() {
		writeBuilderConfig(await assemble(this.optsWithGlobals()), []);
	});

cli.command('dev')
	.description('assemble unminified, then run it in Electron')
	.argument('[args...]', 'arguments forwarded to Electron after --')
	.action(async function cli_dev(args) {
		const { game, root } = await assemble({ ...this.optsWithGlobals(), dev: true });

		io.info('Starting', game.productName);

		const code = await launch(root, ...args);

		if (code) io.exit(`${game.productName} exited with code ${code}`, code);
	});

cli.command('pack')
	.description('assemble, then package with electron-builder')
	.argument('[targets...]', 'electron-builder targets')
	.addHelpText(
		'after',
		"\nTargets are electron-builder target names, a platform name for that platform's default,"
			+ '\nor <platform>:<target>. Without any, the host platform default is built.'
	)
	.action(async function cli_pack(named) {
		const assembled = await assemble({ ...this.optsWithGlobals(), dev: false });
		const { config, targets } = writeBuilderConfig(assembled, named);

		const artifacts = await io.track('Packaging', pack(config, assembled.root, targets));

		for (const artifact of artifacts) io.info('Created', relative(assembled.root, artifact));
	});

try {
	await cli.parseAsync();
} catch (error) {
	io.exit(io.errorText(error), 1);
}
