
import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";

import fs from "fs/promises";
import path from "path";
import {Nastify} from "./nastify";

const app = Nastify();

app.use("/about", cors());

app.use("/about", (req, res, next) => {
    res.send("I am the about page");
    next();
});

app.use("/", async (req, res, next) => {

    const indexFile = await fs.readFile(path.resolve(__dirname, 'public', 'index.html'))
        .catch(err => {
            console.error(err);
            //send error result - 500!
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send("Error occurred", err);
            return next();
        });

    res.status(200).send(indexFile);
    return next();

});

async function main() {
    const server = await app.listen(8080, () => {
        console.log("Server is running");
    });
}

void main();

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
