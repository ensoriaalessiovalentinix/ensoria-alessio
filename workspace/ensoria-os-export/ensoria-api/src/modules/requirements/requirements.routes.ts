import type { FastifyInstance } from 'fastify';
import { CreateRequirementBody, UpdateRequirementBody } from './requirements.schema.js';
import * as reqService from './requirements.service.js';

export default async function requirementsRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId/requirements', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    const data = await reqService.listByProject(projectId);
    return { data };
  });

  fastify.post('/:projectId/requirements', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = CreateRequirementBody.parse(request.body);
    const data = await reqService.create(projectId, body);
    return reply.status(201).send({ data });
  });

  fastify.put('/:projectId/requirements/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const body = UpdateRequirementBody.parse(request.body);
    const data = await reqService.update(projectId, id, body);
    return { data };
  });

  fastify.delete('/:projectId/requirements/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const data = await reqService.remove(projectId, id);
    return { data };
  });
}
