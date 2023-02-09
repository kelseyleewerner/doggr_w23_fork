import cors from "cors";
import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {usersData} from "./lib/mockData";

// This is the fn we pass to app.register() in order to configure all of our routes
export async function doggr_routes(app: FastifyInstance) {

	// Add CORS middleware
	// TODO: Refactor this in favor of fastify-cors
	app.use(cors());

	// READ THIS LINK FOR EASY TO MISS SNAGS!
	// https://www.fastify.io/docs/latest/Reference/Routes/#async-await
	// SERIOUSLY, REALLY READ IT!
	app.get("/about", async () => {
		return "about:GET";
	});

	// Directly returns index.html file
	app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
		return reply.status(200)
			.sendFile("index.html");
	});

	// This expects a POST request with JSON payload like: const payload = { newUser: "tom" };
	app.post("/users", async function createUser(request: FastifyRequest, reply: FastifyReply) {
		const newUser = request.body;

		if (!newUser) {
			// Fastify handles errors for us nicely!
			throw new Error("Error creating user");
		}

		reply.status(201)
			.send(newUser);
	});

	// Note that Fastify doesn't require you to res.send() or res.json() or res.end() or anything like that
	// It's all handled for you!
	// https://www.fastify.io/docs/latest/Reply/
	app.get("/usersData", async () => {
		return usersData;
	});

	//https://www.fastify.io/docs/latest/Reference/TypeScript/#using-generics
	interface UserIDQueryParams {
		userID: string;
	}

	//https://www.fastify.io/docs/latest/Reference/Request/
	app.get<{ Params: UserIDQueryParams }>("/users/:userID", async (request) => {
		const {userID} = request.params;
		return {
			// also valid
			// userID: request.params['userID']
			// userID: request.params.userID
			// userID: userID
			userID,
			first_name: "Bobinsky",
			last_name: "Oso",
		};
	});

	// This replaces our old app.use("*") catchall route
	app.setNotFoundHandler(defaultRoute);
}

const defaultRoute = async (req: FastifyRequest, res: FastifyReply) => {
	return res.status(404)
		.send({
			message: "This page doesn't exist!",
		});
};
