import type { FastifyInstance } from 'fastify';
import * as dashboardService from './dashboard.service.js';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, async () => {
    const data = await dashboardService.getDashboard();
    return { data };
  });
}
