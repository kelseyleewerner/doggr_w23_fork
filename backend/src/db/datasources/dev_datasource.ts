// We need dotenv here because our datasources are processed from CLI in addition to vite
import dotenv from "dotenv";
import TypeORM from 'typeorm';
// Similar reasoning as above, we need to add the file extensions to this file's imports for CLI usage
import { User } from "../models/user";
import { IPHistory } from "../models/ip_history";
import { Initialize1676281754950 } from "../migrations/1676281754950-Initialize";
import { Profile } from "../models/profile.js";
import { ProfilesMigration1676586883555 } from "../migrations/1676586883555-ProfilesMigration.js";
import { Match } from "../models/match.js";
import { AddMatches1677583994719 } from "../migrations/1677583994719-AddMatches";
import { Message } from "../models/message.js";
import {AddMessages1677588107950} from "../migrations/1677588107950-AddMessages.js";
import {SoftDelete1677590464271} from "../migrations/1677590464271-SoftDelete.js";
import {AddPasswords1678228205782} from "../migrations/1678228205782-AddPasswords";

dotenv.config();

// @ts-ignore 
const env = process.env;

export const AppDataSource = new TypeORM.DataSource({
	type: "postgres",
	host: env.VITE_DB_HOST,
	port: Number(env.VITE_DB_PORT),
	username: env.VITE_DB_USER,
	password: env.VITE_DB_PASS,
	database: env.VITE_DB_NAME,
	// entities are used to tell TypeORM which tables to create in the database
	entities: [
		User,
		IPHistory,
		Profile,
		Match,
		Message
	],
	migrations: [
		Initialize1676281754950,
		ProfilesMigration1676586883555,
		AddMatches1677583994719,
		AddMessages1677588107950,
		SoftDelete1677590464271,
		AddPasswords1678228205782
	],
	// DANGER DANGER our convenience will nuke production data!
	synchronize: false
});
