import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateMilestoneBody, UpdateMilestoneBody } from './milestones.schema.js';

export async function listByProject(projectId: string) {
  return prisma.milestone.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
}

export async function create(projectId: string, data: CreateMilestoneBody) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project');
  return prisma.milestone.create({
    data: {
      ...data,
      projectId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
}

export async function update(projectId: string, id: string, data: UpdateMilestoneBody) {
  const ms = await prisma.milestone.findFirst({ where: { id, projectId } });
  if (!ms) throw new NotFoundError('Milestone');
  return prisma.milestone.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
}

export async function remove(projectId: string, id: string) {
  const ms = await prisma.milestone.findFirst({ where: { id, projectId } });
  if (!ms) throw new NotFoundError('Milestone');
  await prisma.milestone.delete({ where: { id } });
  return { success: true };
}
