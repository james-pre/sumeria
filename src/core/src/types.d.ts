/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { UUID } from 'utilium';

declare global {
	// @ts-ignore 2451
	const crypto: {
		randomUUID(): UUID;
	};
}
