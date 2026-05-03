import type { FastifyInstance } from 'fastify';
import { CreateProjectBody, UpdateProjectBody, StageChangeBody, SubStatusChangeBody, ProjectQuery } from './projects.schema.js';
import * as projectsService from './projects.service.js';

export default async function projectsRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request) => {
    const query = ProjectQuery.parse(request.query);
    const data = await projectsService.list(query);
    return { data };
  });

  fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const data = await projectsService.getById(id);
    return { data };
  });

  fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const body = CreateProjectBody.parse(request.body);
    const data = await projectsService.create(body);
    return reply.status(201).send({ data });
  });

  fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const body = UpdateProjectBody.parse(request.body);
    const data = await projectsService.update(id, body);
    return { data };
  });

  fastify.patch('/:id/stage', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const { stage } = StageChangeBody.parse(request.body);
    const data = await projectsService.changeStage(id, stage);
    return { data };
  });

  fastify.patch('/:id/substatus', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const { subStatus } = SubStatusChangeBody.parse(request.body);
    const data = await projectsService.changeSubStatus(id, subStatus);
    return { data };
  });

  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const data = await projectsService.remove(id);
    return { data };
  });
}
