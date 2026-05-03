import type { FastifyInstance } from 'fastify';
import { CreateCollaboratorBody } from './collaborators.schema.js';
import * as collabService from './collaborators.service.js';

export default async function collaboratorsRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId/collaborators', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    const data = await collabService.listByProject(projectId);
    return { data };
  });

  fastify.post('/:projectId/collaborators', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = CreateCollaboratorBody.parse(request.body);
    const data = await collabService.create(projectId, body);
    return reply.status(201).send({ data });
  });

  fastify.delete('/:projectId/collaborators/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const data = await collabService.remove(projectId, id);
    return { data };
  });
}
