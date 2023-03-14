/** @module Routes */
import {FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions} from "fastify";
import {User} from "./db/models/user";
import {IPHistory} from "./db/models/ip_history";
import {Profile} from "./db/models/profile";
import {Match} from "./db/models/match";
import {Message} from "./db/models/message";
import {readFileSync} from "node:fs";
import {compare, hashSync} from "bcrypt";
import {UploadFileToMinio} from "./lib/minio";

/**
 * App plugin where we construct our routes
 * @param {FastifyInstance} app our main Fastify app instance
 */
export async function doggr_routes(app: FastifyInstance): Promise<void> {


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
			}
		});
		reply.send(users);
	});

	// Example of using QueryBuilder to perform more complex SQL queries
	app.get("/userMax", async (request: FastifyRequest, reply: FastifyReply) => {
		const query = app.db.user
			.createQueryBuilder("users")
			.select("MAX(users.id)", "maxID");

		// Typescript solution to "This function might return null/undefined"
		// We just label it here as possibly undefined in Typescript's typing
		const result: ({ maxID: number } | undefined) = await query.getRawOne();

		// This '?' is the second half of Typescript's null/undef handling and will throw exception if null
		reply.send(result?.maxID);
		console.log("Max user ID in database is: " + result);
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
		Body: {
			name: string,
			email: string,
			password: string,
		},
		Reply: IPostUsersResponse
	}>("/users", post_users_opts, async (req, reply: FastifyReply) => {

		const {name, email} = req.body;

		let {password} = req.body;

		// if we're in dev mode and pw isn't already bcrypt encrypted, do so now for convenience
		if (import.meta.env.DEV) {
			if (!password.startsWith("$2a$")) {
				password = hashSync(password, 2);
			}
		}

		const user = new User();
		user.name = name;
		user.email = email;
		user.password = password;

		const ip = new IPHistory();
		ip.ip = req.ip;
		ip.user = user;
		// transactional, transitively saves user to users table as well IFF both succeed
		await ip.save();

		//manually JSON stringify due to fastify bug with validation
		// https://github.com/fastify/fastify/issues/4017
		await reply.send(JSON.stringify({user, ip_address: ip.ip}));
	});

	app.post<{
		Body: {
			email: string,
			password: string,  //reminder this is already encrypted from the frontend!
		}
	}>("/login", async (req, reply) => {
		try {
			const {email, password} = req.body;

			let theUser = await app.db.user.findOneByOrFail({email});

			const hashCompare = await compare(password, theUser.password);

			if (hashCompare) {
				// User has authenticated successfully!
				const token = app.jwt.sign({email, id: theUser.id});
				await reply.send({token});
			} else {
				app.log.info("Password validation failed");
				await reply.status(401)
					.send("Incorrect Password");
			}
		} catch (err) {
			app.log.error(err);
			await reply.status(500)
				.send("Error: " + err);
		}
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

		//const {name} = req.fo;

		// Get file from request
		const data = await req.file();
		let upload = await UploadFileToMinio(data);

		const myUser = await app.db.user.findOneByOrFail({});

		const newProfile = new Profile();
		newProfile.name = "George";
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
	app.get("/matches", {
		onRequest: [app.auth]
	}, async (req, reply) => {

		// We can type this in vite-env.d.ts like we did on the backend, but we'll skip for speed now
		// @ts-ignore
		const {id} = req.user;
		/* You can do all of this in one step via SQL, but we're trying to avoid that here
		// We now have a problem -- our tokens are user-based, but our matches are profile-based.
		// This is normally a place where we'd refactor the flow, but instead we'll just pick a random profile from each
		*/
		let myProfile = await app.db.profile.findOneOrFail({
			where: {
				user: id,
			},
			// Note here we're getting a subrelation
			relations: ["user", "matches", "matches.matchee"],
		});

		// for each match, get a profile
		let matchedProfiles = myProfile.matches.map( (match) => match.matchee);
		console.log("Matched profiles:");
		console.log(matchedProfiles);
		reply.send(matchedProfiles);
	});

	app.post("/match", {
		onRequest: [app.auth]
	}, async (req: any, reply) => {
		const myMatch = new Match();
		myMatch.matcher = req.body.matcherID;
		myMatch.matchee = req.body.matcheeID;

		await myMatch.save();

		await reply.send(JSON.stringify(myMatch));
	});

	app.delete("/match", {
		onRequest: [app.auth]
	}, async (req: any, reply) => {
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

		// BONUS 3
		let res = await app.db.match.softRemove(myMatch);
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

		let res = await app.db.match.softRemove(myMatch);
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

	// BONUS 1

	app.get("/messages", {
		onRequest: [app.auth]
	}, async (req, reply) => {
		let messages = await app.db.message.find({
			relations: ['sender', 'recipient']
		});
		reply.send(messages);
	});

	app.get("/message/:id", {
		onRequest: [app.auth]
	}, async (req: any, reply: FastifyReply) => {
		const senderId = req.params.id;

		let messages = await app.db.message.find({
			relations: ['sender', 'recipient'],
			select: {
				deleted_at: false,
			},
			where: {
				sender: {
					id: senderId,
				},
			}
		});

		const recipients = messages.map(m => m.recipient);
		reply.send(recipients);
	});

	/**
	 * Route listing all senders from whom a given "matchee" has received a message
	 * @name get/recipient
	 * @function
	 */
	app.get("/recipient/:id", async (req: any, reply: FastifyReply) => {

		const id = req.params.id;

		let messages = await app.db.message.find({
			relations: ['sender', 'recipient'],
			select: {
				deleted_at: false,
			},
			where: {
				recipient: {
					id
				},
			}
		});

		const senders = messages.map(m => m.sender);
		reply.send(senders);
	});

	/**
	 * Create a new message between given sender and recipient
	 * @name post/message
	 * @function
	 */
	app.post("/message", {
		onRequest: [app.auth]
	}, async (req: any, reply: FastifyReply) => {

		const senderId = req.body.senderID;

		const newMessage = new Message();
		newMessage.sender = senderId;
		newMessage.recipient = req.body.recipientID;
		newMessage.message = req.body.message;

		// Check for bad words
		const badwordsString = readFileSync("./src/plugins/badwords.txt", {encoding: 'utf-8'});
		const badwords = badwordsString.split('\r\n');

		let badword = "";
		// https://stackoverflow.com/questions/47543879/string-includes-has-a-word-on-a-ban-list
		for (let i = 0; i <= badwords.length; i++) {
			if (newMessage.message.toLowerCase()
				.includes(badwords[i])) {
				badword = badwords[i];
				break;
			}
		}

		if (badword !== "") {
			// Update user table, increment badwords counter
			const user = await User.findOneByOrFail({id: senderId});
			user.badwords++;
			await user.save();

			await reply.status(500)
				.send({
					message: "Some people somewhere consider one or more of the words in your message to be evil, sorry!",
				});
		} else {
			await newMessage.save();
			await reply.send(JSON.stringify(newMessage));
		}
	});


	/**
	 * Delete all messages between a given sender and recipient.
	 * @name delete/message
	 * @function
	 */
	app.delete("/message", async (req: any, reply: FastifyReply) => {
		// BONUS 2
		const password = import.meta.env.ADMIN_PW;
		const chk_pw = req.body.admin_password;
		if (chk_pw != password) {
			await reply.status(500)
				.send({
					message: "Password missing or incorrect",
				});
		}

		const senderID = req.body.senderID;
		const recipientID = req.body.recipientID;

		const myMessage = await app.db.message.find({
			relations: ['sender', 'recipient'],
			select: ['id'],
			where: {
				sender: {
					id: senderID,
				},
				recipient: {
					id: recipientID,
				},
			},
		});

		let res = await app.db.message.softRemove(myMessage);
		await reply.send(JSON.stringify(res));
	});

	/**
	 * Remove all messages a user has sent
	 * @name delete/messages
	 * @function
	 */
	app.delete("/messages", async (req: any, reply: FastifyReply) => {
		const pw = import.meta.env.ADMIN_PW;
		const user_pw = req.body.pw;
		if (user_pw != pw) {
			await reply.status(500)
				.send({
					message: "Password incorrect",
				});
		}

		const senderID = req.body.senderID;
		const myMsg = await app.db.message.find({
			relations: ['sender'],
			select: ['id'],
			where: {
				sender: {
					id: senderID,
				}
			},
		});

		let res = await app.db.message.softRemove(myMsg);
		await reply.send(JSON.stringify(res));
	});

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
