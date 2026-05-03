import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { errorHandler } from './lib/errors.js';
import authPlugin from './plugins/auth.js';

// Module routes
import authRoutes from './modules/auth/auth.routes.js';
import peopleRoutes from './modules/people/people.routes.js';
import projectsRoutes from './modules/projects/projects.routes.js';
import conversationsRoutes from './modules/conversations/conversations.routes.js';
import requirementsRoutes from './modules/requirements/requirements.routes.js';
import milestonesRoutes from './modules/milestones/milestones.routes.js';
import collaboratorsRoutes from './modules/collaborators/collaborators.routes.js';
import plansRoutes from './modules/plans/plans.routes.js';
import filesRoutes from './modules/files/files.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import mcpPlugin from './modules/mcp/mcp.plugin.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Error handler
  app.setErrorHandler(errorHandler);

  // CORS
  await app.register(cors, { origin: true });

  // JWT
  await app.register(jwt, { secret: config.jwtSecret });

  // Auth decorator
  await app.register(authPlugin);

  // Routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(peopleRoutes, { prefix: '/api/people' });
  await app.register(projectsRoutes, { prefix: '/api/projects' });
  await app.register(conversationsRoutes, { prefix: '/api/projects' });
  await app.register(requirementsRoutes, { prefix: '/api/projects' });
  await app.register(milestonesRoutes, { prefix: '/api/projects' });
  await app.register(collaboratorsRoutes, { prefix: '/api/projects' });
  await app.register(plansRoutes, { prefix: '/api/projects' });
  await app.register(filesRoutes, { prefix: '/api/projects' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });

  // MCP Server
  await app.register(mcpPlugin);

  // Health check
  app.get('/health', async () => ({ status: 'ok', service: 'ensoria-os' }));

  return app;
}
