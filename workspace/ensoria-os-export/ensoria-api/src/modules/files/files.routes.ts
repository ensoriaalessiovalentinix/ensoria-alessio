import type { FastifyInstance } from 'fastify';
import { CreateFileBody } from './files.schema.js';
import * as filesService from './files.service.js';

export default async function filesRoutes(fastify: FastifyInstance) {
  fastify.get('/:projectId/files', { onRequest: [fastify.authenticate] }, async (request) => {
    const { projectId } = request.params as { projectId: string };
    const data = await filesService.listByProject(projectId);
    return { data };
  });

  fastify.post('/:projectId/files', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = CreateFileBody.parse(request.body);
    const data = await filesService.create(projectId, body);
    return reply.status(201).send({ data });
  });
}
