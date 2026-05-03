import type { FastifyInstance } from 'fastify';
import { CreateConversationBody } from './conversations.schema.js';
import * as convService from './conversations.service.js';

export default async function conversationsRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId/conversations', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    const data = await convService.listByProject(projectId);
    return { data };
  });

  fastify.post('/:projectId/conversations', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = CreateConversationBody.parse(request.body);
    const data = await convService.create(projectId, body);
    return reply.status(201).send({ data });
  });
}
