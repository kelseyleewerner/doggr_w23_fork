/** @module Server */

// This will let us use our basic middlewares now, then transition to hooks later

import staticFiles from "@fastify/static";
import Fastify, {FastifyInstance} from "fastify";
import path from "path";
import {getDirName} from "./lib/helpers";
import logger from "./lib/logger";
import {doggr_routes} from "./routes";
import DbPlugin from "./plugins/database";
import {AuthPlugin} from "./plugins/auth";
import cors from "@fastify/cors";
import multipart from '@fastify/multipart';
import dotenv from "dotenv";
dotenv.config();


/**
 * This is our main "Create App" function.  Note that it does NOT start the server, this only creates it
 * @function
 * @param useLogging Whether to log or not
 * @return  Promise<FastifyInstance>
 */
export async function buildApp(useLogging: boolean) {
	const app = useLogging ?
		Fastify({
			// enables fancy logs and disabling them during tests
			logger,
		})
		: Fastify({logger: false});

	try {

		await app.register(multipart);

		await app.register(cors, {
			origin: (origin, cb) => {
				cb(null, true);
			}
		});

		// add static file handling
		await app.register(staticFiles, {
			root: path.join(getDirName(import.meta), "../public"),
			prefix: "/public/",
		});

		// MUST COME BEFORE OUR ROUTES because auth needs to be defined by then!
		app.log.info("Creating authorization framework...");
		await app.register(AuthPlugin);

		// Adds all of our Router's routes to the app
		app.log.info("Registering routes");
		await app.register(doggr_routes);

		// Connects to postgres
		app.log.info("Connecting to Database...");
		await app.register(DbPlugin);

		app.log.info("App built successfully.");
	} catch (err) {
		console.error(err);
		process.exit(1);
	}

	return app;
}

/**
 * This is what actively starts the server listening on a port
 *
 * @param app: FastifyInstance main server instance created in buildApp()
 * @return  Promise<void> When server closes
 */
export async function listen(app: FastifyInstance) {
	try {

		let host = import.meta.env.VITE_IP_ADDR;
		let port = Number(import.meta.env.VITE_PORT);

		console.log(`In listen with host:port: ${host}:${port}`);
		await app.listen({ // Config object is optional and defaults to { host: 'localhost', port: 3000 }
			host,
			port,
		}, (err: any) => {  // Listen handler doesn't need to do much except report errors!

			if (err) {
				console.log("1");
				app.log.error(err);
			}
		});
	} catch (err) { // This will catch any errors that further bubble up from listen(), should be unnecessary
		console.log("2");
		app.log.error(err);
	}
}



