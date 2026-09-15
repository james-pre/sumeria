import * as fs from 'node:fs';
import { world } from './world.js';
import type { WorldData } from '@sumeria/core';

export interface WorldFile extends WorldData {}

export function loadFromPath(path: string) {
	let data;

	try {
		data = JSON.parse(fs.readFileSync(path, 'utf8'));
	} catch (error) {
		throw new Error('Invalid or missing world file: ' + path, { cause: error });
	}

	world.load(data);
}
