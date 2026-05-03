import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from '../types/index.js';
import { UnauthorizedError } from '../lib/errors.js';

export default fp(async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async function (request: FastifyRequest, _reply: FastifyReply) {
    try {
      await request.jwtVerify<JwtPayload>();
    } catch {
      throw new UnauthorizedError();
    }
  });
});
