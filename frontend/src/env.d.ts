/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MATCHING_API_BASE_URL: string;
	readonly VITE_USER_API_BASE_URL: string;
	readonly VITE_WEBSOCKET_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
