import * as z from 'zod';
import { omit } from 'utilium';

export const BuildOptions = z.object({
	/** Reverse-DNS id for the packaged app, derived from the package name when omitted. */
	appId: z.string().optional(),
	/** Path to the app icon, relative to the package. */
	icon: z.string().optional(),
	/** Path to the controls config, relative to the package. */
	controls: z.string().default('controls.json'),
	/** Where the game's TypeScript lives, which is what the convention scan reads. */
	source: z.string().default('src'),
	/** Where the game's compiled JavaScript lands, matching its tsconfig `outDir`. */
	compiled: z.string().default('dist'),
	/** Where to assemble the browser-side bundles. */
	out: z.string().default('build'),
	/** Targets `pack` builds when none are named on the command line. */
	targets: z.array(z.string()).default([]),
});

export const GamePackage = z
	.object({
		name: z.string().transform(name => name.replace(/^@[^/]+\//, '')),
		version: z.string().default('0.0.0'),
		description: z.string().optional(),
		/** Display name for the installed app, defaulting to the unscoped package name. */
		productName: z.string().optional(),
		sumeria: BuildOptions.prefault({}),
		type: z.literal('module'),
	})
	.transform(pkg => Object.assign({ productName: pkg.name }, omit(pkg, 'sumeria'), pkg.sumeria));

export interface GamePackage extends z.infer<typeof GamePackage> {}
