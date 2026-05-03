import type { FastifyInstance } from 'fastify';
import { CreatePeopleBody, UpdatePeopleBody, StageChangeBody, PeopleQuery } from './people.schema.js';
import * as peopleService from './people.service.js';

export default async function peopleRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request) => {
    const query = PeopleQuery.parse(request.query);
    const data = await peopleService.list(query);
    return { data };
  });

  fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const data = await peopleService.getById(id);
    return { data };
  });

  fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const body = CreatePeopleBody.parse(request.body);
    const data = await peopleService.create(body);
    return reply.status(201).send({ data });
  });

  fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const body = UpdatePeopleBody.parse(request.body);
    const data = await peopleService.update(id, body);
    return { data };
  });

  fastify.patch('/:id/stage', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const { stage } = StageChangeBody.parse(request.body);
    const data = await peopleService.changeStage(id, stage);
    return { data };
  });

  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const data = await peopleService.remove(id);
    return { data };
  });
}
