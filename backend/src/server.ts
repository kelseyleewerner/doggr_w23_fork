// This will let us use our basic middlewares now, then transition to hooks later
import fastifyMiddie from "@fastify/middie";
import staticFiles from "@fastify/static";
import Fastify from "fastify";
import path from "path";
import {getDirName} from "./lib/helpers";
import logger from "./lib/logger";
import {doggr_routes} from "./routes";


// This is our main "Create App" function.  Note that it does NOT start the server, this only creates it
export async function buildApp(useLogging: boolean) {
	// enables fancy logs and disabling them during tests
	const app = useLogging ?
		Fastify({
			logger,
		})
		: Fastify({logger: false});

	// add express-like 'app.use' middleware support
	await app.register(fastifyMiddie);

	// add static file handling
	await app.register(staticFiles, {
		root: path.join(getDirName(import.meta), "../public"),
		prefix: "/public/",
	});

	// Adds all of our Router's routes to the app
	await app.register(doggr_routes);

	// VITEST sets this MODE env var to "test" when testing, so we bail on database
	if (import.meta.env.MODE !== "test") {
		// try {
		// 	app.log.info("Connecting to Database...");
		// 	// IMPORTANT - read Production Replacement here: https://vitejs.dev/guide/env-and-mode.html
		// 	// Yes, Javascript REALLY IS this annoying
		// 	const mongoHost = import.meta.env.VITE_MONGO_HOST;
		// 	await mongoose.connect(`mongodb://${mongoHost}:27017`,);
		// 	app.log.info("DB connected...");
		// } catch (err) {
		// 	app.log.error(err);
		// }
	}

	return app;
}

// Takes a created app and starts it listening on given port
export async function listen(app: any) {
	try {
		void await app.listen({ // Config object is optional and defaults to { host: 'localhost', port: 3000 }
			host: import.meta.env.VITE_IP_ADDR,
			port: Number(import.meta.env.VITE_PORT),
		}, (err: any) => {  // Listen handler doesn't need to do much except report errors!
			if (err) {
				app.log.error(err);
			}
		});
	} catch (err) { // This will catch any errors that further bubble up from listen(), should be unnecessary
		app.log.error(err);
	}
}



