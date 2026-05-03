import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { CreatePlanBody, UpdatePlanBody } from './plans.schema.js';

export async function listByProject(projectId: string) {
  return prisma.projectPlan.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
}

export async function create(projectId: string, data: CreatePlanBody) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project');
  // Auto-increment version
  const last = await prisma.projectPlan.findFirst({
    where: { projectId },
    orderBy: { version: 'desc' },
  });
  return prisma.projectPlan.create({
    data: { ...data, projectId, version: (last?.version ?? 0) + 1 },
  });
}

export async function update(projectId: string, id: string, data: UpdatePlanBody) {
  const plan = await prisma.projectPlan.findFirst({ where: { id, projectId } });
  if (!plan) throw new NotFoundError('Plan');
  return prisma.projectPlan.update({
    where: { id },
    data: { ...data, version: plan.version + 1 },
  });
}

export async function remove(projectId: string, id: string) {
  const plan = await prisma.projectPlan.findFirst({ where: { id, projectId } });
  if (!plan) throw new NotFoundError('Plan');
  await prisma.projectPlan.delete({ where: { id } });
  return { success: true };
}
