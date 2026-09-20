import glslx from 'glslx';
import * as io from 'ioium/node';
import * as fs from 'node:fs';
import { basename } from 'node:path';
import type { Found } from './generate.js';

export interface Shader {
	name: string;
	vertex: string;
	fragment: string;
}

export function compileShaders(found: Found[]): Shader[] {
	using _ = io.start('Compiling shaders');

	const compiled: Shader[] = [];

	for (const [i, file] of found.entries()) {
		io.progress(i + 1, found.length, file.name);
		compiled.push(compileShader(file));
	}

	return compiled;
}

export function compileShader({ name, path }: Found): Shader {
	const { log, output } = glslx.compile(
		{ name: basename(path), contents: fs.readFileSync(path, 'utf8') },
		// Uniform and attribute names are what the renderers bind against, so nothing is renamed.
		{ format: 'json', renaming: 'none' }
	);

	if (log) io.warn(log.trimEnd());

	if (!output) throw new Error(`Could not compile the "${name}" shader`);

	const { shaders } = JSON.parse(output) as { shaders: { name: string; contents: string }[] };

	const missing = ['vertex', 'fragment'].filter(entry => !shaders.some(s => s.name === entry));

	if (missing.length) throw new Error(`The "${name}" shader does not export ${missing.join(' or ')}`);

	return {
		name,
		vertex: shaders.find(s => s.name === 'vertex')!.contents,
		fragment: shaders.find(s => s.name === 'fragment')!.contents,
	};
}
