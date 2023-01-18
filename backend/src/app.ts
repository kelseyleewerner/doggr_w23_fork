import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {usersData} from "../test/mockData";

export function App(opts = {}) {
    const app: FastifyInstance = fastify(opts);

    addRoutes(app);

    return app;
}


function addRoutes(app: FastifyInstance) {
    app.get('/', async function (_request: FastifyRequest, _reply: FastifyReply) {
        return {hello: 'world!'};
    });

    app.get('/users', async () => {
        return usersData;
    });

    return app;
}
