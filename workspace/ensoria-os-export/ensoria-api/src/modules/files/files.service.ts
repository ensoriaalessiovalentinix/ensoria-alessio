import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateFileBody } from './files.schema.js';

export async function listByProject(projectId: string) {
  return prisma.projectFile.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
}

export async function create(projectId: string, data: CreateFileBody) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project');
  return prisma.projectFile.create({ data: { ...data, projectId } });
}
