import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateCollaboratorBody } from './collaborators.schema.js';

export async function listByProject(projectId: string) {
  return prisma.collaborator.findMany({ where: { projectId } });
}

export async function create(projectId: string, data: CreateCollaboratorBody) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project');
  return prisma.collaborator.create({ data: { ...data, projectId } });
}

export async function remove(projectId: string, id: string) {
  const collab = await prisma.collaborator.findFirst({ where: { id, projectId } });
  if (!collab) throw new NotFoundError('Collaborator');
  await prisma.collaborator.delete({ where: { id } });
  return { success: true };
}
