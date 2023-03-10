import {FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest} from "fastify";
import Jwt, {VerifyPayloadType} from "@fastify/jwt";
import fp from "fastify-plugin";


declare module 'fastify' {
	interface FastifyRequest {
		// You can easily find the type of this return using intellisense inferral below
		jwtVerify(): Promise<VerifyPayloadType>
	}
	interface FastifyInstance {
		auth(): void,
	}
}

export const AuthPlugin = fp(async function(fastify: FastifyInstance, opts: FastifyPluginOptions) {
	fastify.register(import("@fastify/jwt"), {
		secret: "superSecret"
	});

	fastify.decorate("auth", async function(request: FastifyRequest, reply: FastifyReply) {
		try {
			// This is the thing we added in our interface above
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});
});
