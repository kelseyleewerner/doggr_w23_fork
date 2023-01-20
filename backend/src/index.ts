
import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import path from "path";



// import {App} from "./app";
// import {FastifyInstance} from "fastify";
//
// const app: FastifyInstance = App({
//     logger: {
//         level: 'info',
//         transport: {
//             target: 'pino-pretty'
//         }
//     }
// });
//
//
// const host_addr = '0.0.0.0';
// app.listen({port: 3000, host: host_addr},
//     (err, _address) => {
//         if (err) {
//             app.log.error(err);
//             process.exit();
//         }
//         const msg = `Server listening on '${host_addr}' ...`;
//         console.log(msg);
//         app.log.info(msg);
//     });
