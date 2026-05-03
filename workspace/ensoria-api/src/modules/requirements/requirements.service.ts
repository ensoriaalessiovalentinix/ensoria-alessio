import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateRequirementBody, UpdateRequirementBody } from './requirements.schema.js';

export async function listByProject(projectId: string) {
  return prisma.requirement.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
}

export async function create(projectId: string, data: CreateRequirementBody) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project');
  return prisma.requirement.create({ data: { ...data, projectId } });
}

export async function update(projectId: string, id: string, data: UpdateRequirementBody) {
  const req = await prisma.requirement.findFirst({ where: { id, projectId } });
  if (!req) throw new NotFoundError('Requirement');
  return prisma.requirement.update({ where: { id }, data });
}

export async function remove(projectId: string, id: string) {
  const req = await prisma.requirement.findFirst({ where: { id, projectId } });
  if (!req) throw new NotFoundError('Requirement');
  await prisma.requirement.delete({ where: { id } });
  return { success: true };
}
