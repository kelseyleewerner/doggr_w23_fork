// actually call the above Create App function
import {buildApp, listen} from "./server";

const app = await buildApp(true);
// Make our new app start listening, but NOT our tests, because our tests won't call listen!
void await listen(app);

// boilerplate - doggr here matches with vite.config.js::exportName
export const doggr = app;

