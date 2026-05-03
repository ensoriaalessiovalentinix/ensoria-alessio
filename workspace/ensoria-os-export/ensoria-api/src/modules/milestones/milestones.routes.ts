import type { FastifyInstance } from 'fastify';
import { CreateMilestoneBody, UpdateMilestoneBody } from './milestones.schema.js';
import * as msService from './milestones.service.js';

export default async function milestonesRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId/milestones', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    const data = await msService.listByProject(projectId);
    return { data };
  });

  fastify.post('/:projectId/milestones', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = CreateMilestoneBody.parse(request.body);
    const data = await msService.create(projectId, body);
    return reply.status(201).send({ data });
  });

  fastify.put('/:projectId/milestones/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const body = UpdateMilestoneBody.parse(request.body);
    const data = await msService.update(projectId, id, body);
    return { data };
  });

  fastify.delete('/:projectId/milestones/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const data = await msService.remove(projectId, id);
    return { data };
  });
}
