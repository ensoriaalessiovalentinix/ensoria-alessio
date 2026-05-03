import type { FastifyInstance } from 'fastify';
import { RegisterBody, LoginBody } from './auth.schema.js';
import * as authService from './auth.service.js';
import { prisma } from '../../lib/prisma.js';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const body = RegisterBody.parse(request.body);
    const user = await authService.register(body);
    const token = fastify.jwt.sign({ userId: user.id, email: user.email, role: user.role });
    return reply.status(201).send({ data: { user, token } });
  });

  fastify.post('/login', async (request) => {
    const body = LoginBody.parse(request.body);
    const user = await authService.login(body);
    const token = fastify.jwt.sign({ userId: user.id, email: user.email, role: user.role });
    return { data: { user, token } };
  });

  fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return { data: { user } };
  });
}
