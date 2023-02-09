/// <reference types="vite/client" />

// Typecheck our Env file! Safety (and verbosity) abound
import {Vitest} from "vitest";

interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string;
	readonly VITE_IP_ADDR: string;
	readonly VITE_PORT: number;
	readonly VITE_LOGS_DIR: string;
	readonly VITE_MONGO_HOST: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
	readonly vitest: Vitest;
}
