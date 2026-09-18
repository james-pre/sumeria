import { fileURLToPath } from 'node:url';

export interface AppConfig {
	/** The server thread's entry point. */
	server: URL | string;
	/** The page to load, which must sit next to the client bundles. */
	page: URL | string;
}

/** Read once the app is ready, so an entry point can replace these on startup. */
export const config: AppConfig = {
	server: new URL('server_thread.js', import.meta.url),
	page: fileURLToPath(import.meta.resolve('@sumeria/client/index.html')),
};
