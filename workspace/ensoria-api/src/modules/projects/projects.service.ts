import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { CreateProjectBody, UpdateProjectBody } from './projects.schema.js';
import { PROJECT_STAGES, PROJECT_SUB_STATUSES } from './projects.schema.js';

export async function list(query: { stage?: string; peopleId?: string; search?: string }) {
  const where: Record<string, unknown> = {};
  if (query.stage) where.stage = query.stage;
  if (query.peopleId) where.peopleId = query.peopleId;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }
  return prisma.project.findMany({
    where,
    include: { people: true, conversations: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      people: true,
      conversations: { orderBy: { createdAt: 'desc' } },
      files: true,
      requirements: { orderBy: { createdAt: 'desc' } },
      milestones: { orderBy: { createdAt: 'desc' } },
      collaborators: true,
      plans: { orderBy: { createdAt: 'desc' } },
      analytics: { orderBy: { generatedAt: 'desc' } },
    },
  });
  if (!project) throw new NotFoundError('Project');
  return project;
}

export async function create(data: CreateProjectBody) {
  const project = await prisma.project.create({ data });
  if (data.peopleId) {
    await prisma.activity.create({
      data: {
        peopleId: data.peopleId,
        projectId: project.id,
        type: 'created',
        description: `Project "${data.name}" created`,
        metadata: JSON.stringify({ stage: data.stage }),
      },
    });
  }
  return project;
}

export async function update(id: string, data: UpdateProjectBody) {
  await getById(id);
  return prisma.project.update({ where: { id }, data });
}

export async function changeStage(id: string, stage: string) {
  if (!PROJECT_STAGES.includes(stage as typeof PROJECT_STAGES[number])) {
    throw new ValidationError(`Invalid stage. Must be one of: ${PROJECT_STAGES.join(', ')}`);
  }
  await getById(id);
  // Clear subStatus when moving between top-level stages
  const updated = await prisma.project.update({ where: { id }, data: { stage, subStatus: null } });
  await prisma.activity.create({
    data: {
      projectId: id,
      type: 'stage_changed',
      description: `Project stage changed to ${stage}`,
      metadata: JSON.stringify({ newStage: stage }),
    },
  });
  return updated;
}

export async function changeSubStatus(id: string, subStatus: string) {
  const project = await getById(id);
  const validSubs = PROJECT_SUB_STATUSES[project.stage];
  if (!validSubs || !validSubs.includes(subStatus as typeof validSubs[number])) {
    const valid = validSubs ? validSubs.join(', ') : '(no sub-statuses for this stage)';
    throw new ValidationError(`Invalid sub-status for stage "${project.stage}". Valid options: ${valid}`);
  }
  const updated = await prisma.project.update({ where: { id }, data: { subStatus } });
  await prisma.activity.create({
    data: {
      projectId: id,
      type: 'stage_changed',
      description: `Sub-status changed to ${subStatus}`,
      metadata: JSON.stringify({ newSubStatus: subStatus }),
    },
  });
  return updated;
}

export async function remove(id: string) {
  await getById(id);
  await prisma.project.delete({ where: { id } });
  return { success: true };
}
