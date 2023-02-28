/** @module Seeds/Match */

import {faker} from "@faker-js/faker";
import {Seeder} from "../../lib/seed_manager";
import {Profile} from "../models/profile";
import {Match, MatchBuilder} from "../models/match";
import {FastifyInstance} from "fastify";

faker.seed(100);

/**
 * Seeds the match table
 */
export class MatchSeeder extends Seeder {

	/**
	 * Runs the Match table's seed
	 * @function
	 * @param {FastifyInstance} app
	 * @returns {Promise<void>}
	 */
	override async run(app: FastifyInstance) {
		app.log.info("Seeding Matches...");
		// Remove everything in there currently
		await app.db.match.delete({});
		// get our users
		const profiles = await Profile.find();

		for (let i = 0; i < profiles.length; i++) {
			let newMatch: Match = MatchBuilder(profiles[i], profiles[i % 5]);
			newMatch.matchee = profiles[i % 5];
			await newMatch.save();
			app.log.info("Finished seeding match for profile: " + i);
		}
	}
}

export const MatchSeed = new MatchSeeder();


