import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateConversationBody } from './conversations.schema.js';

export async function listByProject(projectId: string) {
  return prisma.conversation.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function create(projectId: string, data: CreateConversationBody) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project');
  return prisma.conversation.create({ data: { ...data, projectId } });
}
