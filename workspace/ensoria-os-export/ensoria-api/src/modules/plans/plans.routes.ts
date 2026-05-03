import type { FastifyInstance } from 'fastify';
import { CreatePlanBody, UpdatePlanBody } from './plans.schema.js';
import * as plansService from './plans.service.js';

export default async function plansRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId/plans', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    const data = await plansService.listByProject(projectId);
    return { data };
  });

  fastify.post('/:projectId/plans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = CreatePlanBody.parse(request.body);
    const data = await plansService.create(projectId, body);
    return reply.status(201).send({ data });
  });

  fastify.put('/:projectId/plans/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const body = UpdatePlanBody.parse(request.body);
    const data = await plansService.update(projectId, id, body);
    return { data };
  });

  fastify.delete('/:projectId/plans/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const data = await plansService.remove(projectId, id);
    return { data };
  });
}
