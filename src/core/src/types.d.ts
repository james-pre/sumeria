/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { UUID } from 'utilium';

declare global {
	// @ts-ignore 2451
	const crypto: {
		randomUUID(): UUID;
	};

	function setTimeout(callback: () => unknown, ms?: number): number;
	function clearTimeout(handle: number): void;

	interface URL {
		hash: string;
		host: string;
		hostname: string;
		href: string;
		toString(): string;
		readonly origin: string;
		password: string;
		pathname: string;
		port: string;
		protocol: string;
		search: string;
		readonly searchParams: any;
		username: string;
		toJSON(): string;
	}

	var URL: {
		prototype: URL;
		new (url: string | URL, base?: string | URL): URL;
		canParse(url: string | URL, base?: string | URL): boolean;
		createObjectURL(obj: any): string;
		parse(url: string | URL, base?: string | URL): URL | null;
		revokeObjectURL(url: string): void;
	};
}
