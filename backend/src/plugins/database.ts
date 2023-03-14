/** @module DatabasePlugin */
import "reflect-metadata";
import fp from "fastify-plugin";
import TypeORM from "typeorm";
import {User} from "../db/models/user";
import {IPHistory} from "../db/models/ip_history";
import {Match} from "../db/models/match";
import {FastifyInstance, FastifyPluginOptions} from "fastify";
import {AppDataSource} from "../db/datasources/dev_datasource";
import {Profile} from "../db/models/profile";
import {Message} from "../db/models/message";


/** This is AWESOME - we're telling typescript we're adding our own "thing" to base 'app', so we get FULL IDE/TS support */
declare module 'fastify' {

	interface FastifyInstance {
		db: DBConfigOpts
	}

	// interface FastifyRequest {
	// 	myPluginProp: string
	// }
	// interface FastifyReply {
	// 	myPluginProp: number
	// }
}

interface DBConfigOpts {
	user: TypeORM.Repository<User>,
	ip: TypeORM.Repository<IPHistory>,
	profile: TypeORM.Repository<Profile>,
	match: TypeORM.Repository<Match>,

	message: TypeORM.Repository<Message>,
	connection: TypeORM.DataSource,
}

/**
 * Connects and decorates fastify with our Database connection
 * @function
 */
const DbPlugin = fp(async (app: FastifyInstance, options: FastifyPluginOptions, done: any) => {

	const dataSourceConnection = AppDataSource;

	await dataSourceConnection.initialize();


	// this object will be accessible from any fastify server instance
	// app.status(200).send()
	// app.db.user
	app.decorate("db", {
		connection: dataSourceConnection,
		user: dataSourceConnection.getRepository(User),
		ip: dataSourceConnection.getRepository(IPHistory),
		match: dataSourceConnection.getRepository(Match),
		message: dataSourceConnection.getRepository(Message),
		profile: dataSourceConnection.getRepository(Profile),
	});

	done();
}, {
	name: "database-plugin"
});

export default DbPlugin;
