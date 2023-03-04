/** @module Seeds/Match */

import {faker} from "@faker-js/faker";
import {Seeder} from "../../lib/seed_manager";
import {User} from "../models/user";
import {Message} from "../models/message";
import {FastifyInstance} from "fastify";

// note here that using faker makes testing a bit...hard
// We can set a particular seed for faker, then use it later in our testing!
faker.seed(100);

/**
 * Seeds the match table
 */
export class MessageSeeder extends Seeder {

	override async run(app: FastifyInstance) {
		app.log.info("Seeding Messages...");
		// Remove everything in there currently
		await app.db.message.delete({});
		// get our users
		const users = await User.find();

		for (let i = 0; i < users.length; i++) {
			let newMessage = new Message();
			newMessage.sender = users[i];
			newMessage.recipient = users[i % 5];
			newMessage.message = faker.random.words(10);
			await newMessage.save();
			app.log.info("Finished seeding message for user: " + i);
		}
	}
}

export const MessageSeed = new MessageSeeder();
