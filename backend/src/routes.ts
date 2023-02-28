/** @module Routes */
import cors from "cors";
import {FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions} from "fastify";
import {User} from "./db/models/user";
import {IPHistory} from "./db/models/ip_history";
import {Profile} from "./db/models/profile";
import {ILike, LessThan, Not} from "typeorm";
import {Match} from "./db/models/match";

/**
 * App plugin where we construct our routes
 * @param {FastifyInstance} app our main Fastify app instance
 */
export async function doggr_routes(app: FastifyInstance): Promise<void> {

	// Middleware
	// TODO: Refactor this in favor of fastify-cors
	app.use(cors());

	/**
	 * Route replying to /test path for test-testing
	 * @name get/test
	 * @function
	 */
	app.get("/test", async (request: FastifyRequest, reply: FastifyReply) => {
		reply.send("GET Test");
	});

	/**
	 * Route serving login form.
	 * @name get/users
	 * @function
	 */
	app.get("/users", async (request: FastifyRequest, reply: FastifyReply) => {
		// This will return all users along with their associated profiles and ip histories via relations
		// https://typeorm.io/find-options
		let users = await app.db.user.find({
			// This allows you to define which fields appear/do not appear in your result.
			select: {
				id: true,
				name: true,
				email: true,
				updated_at: true,
				created_at: false,
			},
			// This defines which of our OneToMany/ManyToMany relations we want to return along with each user
			relations: {
				profiles: true,
				ips: {
					// We don't need to return user as a part of ip_history because we already know the user
					user: false
				},
			},
			where: {
				// This will filter our results only to users with an id less than 70.  How cute is this?!?
				id: LessThan(70),
				profiles: {
					// People who name their dog this deserve to be left out, and people naming other species this definitely do
					// No offense, people with pets named spot
					name: Not(ILike("spot")),
				}
			}
		});
		reply.send(users);
	});

	// CRUD impl for users
	// Create new user

	// Appease fastify gods
	const post_users_opts: RouteShorthandOptions = {
		schema: {
			body: {
				type: 'object',
				properties: {
					name: {type: 'string'},
					email: {type: 'string'}
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						user: {type: 'object'},
						ip_address: {type: 'string'}
					}
				}
			}
		}
	};

	/**
	 * Route allowing creation of a new user.
	 * @name post/users
	 * @function
	 * @param {string} name - user's full name
	 * @param {string} email - user's email address
	 * @returns {IPostUsersResponse} user and IP Address used to create account
	 */
	app.post<{
		Body: IPostUsersBody,
		Reply: IPostUsersResponse
	}>("/users", post_users_opts, async (req, reply: FastifyReply) => {

		const {name, email} = req.body;

		const user = new User();
		user.name = name;
		user.email = email;

		const ip = new IPHistory();
		ip.ip = req.ip;
		ip.user = user;
		// transactional, transitively saves user to users table as well IFF both succeed
		await ip.save();

		//manually JSON stringify due to fastify bug with validation
		// https://github.com/fastify/fastify/issues/4017
		await reply.send(JSON.stringify({user, ip_address: ip.ip}));
	});


	// PROFILE Route
	/**
	 * Route listing all current profiles
	 * @name get/profiles
	 * @function
	 */
	app.get("/profiles", async (req, reply) => {
		let profiles = await app.db.profile.find();
		reply.send(profiles);
	});


	app.post("/profiles", async (req: any, reply: FastifyReply) => {

		const {name} = req.body;

		const myUser = await app.db.user.findOneByOrFail({});

		const newProfile = new Profile();
		newProfile.name = name;
		newProfile.picture = "ph.jpg";
		newProfile.user = myUser;

		await newProfile.save();

		//manually JSON stringify due to fastify bug with validation
		// https://github.com/fastify/fastify/issues/4017
		await reply.send(JSON.stringify(newProfile));
	});

	app.delete("/profiles", async (req: any, reply: FastifyReply) => {

		const myProfile = await app.db.profile.findOneByOrFail({});
		let res = await myProfile.remove();

		//manually JSON stringify due to fastify bug with validation
		// https://github.com/fastify/fastify/issues/4017
		await reply.send(JSON.stringify(res));
	});

	app.put("/profiles", async (request, reply) => {
		const myProfile = await app.db.profile.findOneByOrFail({});


		myProfile.name = "APP.PUT NAME CHANGED";
		let res = await myProfile.save();

		//manually JSON stringify due to fastify bug with validation
		// https://github.com/fastify/fastify/issues/4017
		await reply.send(JSON.stringify(res));
	});

	// HW2 additions (1-6)
	app.get("/matches", async (req, reply) => {
		let matches = await app.db.match.find({
			relations: ["matcher", "matchee"],
		});

		reply.send(matches);

	});

	app.post("/match", async (req: any, reply) => {
		const myMatch = new Match();
		myMatch.matcher = req.body.matcherID;
		myMatch.matchee = req.body.matcheeID;

		await myMatch.save();

		await reply.send(JSON.stringify(myMatch));
	});

	app.delete("/match", async (req: any, reply) => {
		const matcherID = req.body.matcherID;
		const matcheeID = req.body.matcheeID;

		const myMatch = await app.db.match.findOneOrFail({
			relations: ['matcher', 'matchee'],
			select: ['id'],
			where: {
				matcher: {
					id: matcherID,
				},
				matchee: {
					id: matcheeID,
				},
			},
		});

		let res = await app.db.match.remove(myMatch);
		await reply.send(JSON.stringify(res));
	});

	app.delete("/matches", async (req: any, reply) => {
		const matcherId = req.body.matcherID;
		const myMatch = await app.db.match.find({
			relations: ['matcher'],
			select: ['id'],
			where: {
				matcher: {
					id: matcherId,
				}
			},
		});

		let res = await app.db.match.remove(myMatch);
		await reply.send(JSON.stringify(res));
	});

	app.get("/match/:matcherId", async (req: any, reply) => {
		const matcherId = req.params.matcherId;

		let matches = await app.db.match.find({
			relations: ['matcher', 'matchee'],
			where: {
				matcher: {
					id: matcherId,
				},
			}
		});

		const matchees = matches.map(m => m.matchee);
		reply.send(matchees);
	});

	app.get("/matchee/:matcheeId", async (req: any, reply) => {
		const matcheeId = req.params.matcheeId;

		let matches = await app.db.match.find({
			relations: ['matcher', 'matchee'],
			where: {
				matchee: {
					id: matcheeId,
				},
			}
		});

		const matchers = matches.map(m => m.matcher);
		await reply.send(matchers);
	});

}

// Appease typescript request gods
interface IPostUsersBody {
	name: string,
	email: string,
}

/**
 * Response type for post/users
 */
export type IPostUsersResponse = {
	/**
	 * User created by request
	 */
	user: User,
	/**
	 * IP Address user used to create account
	 */
	ip_address: string
}
