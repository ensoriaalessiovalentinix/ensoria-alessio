import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { CreatePeopleBody, UpdatePeopleBody } from './people.schema.js';
import { PEOPLE_STAGES } from './people.schema.js';

export async function list(query: { type?: string; stage?: string; search?: string }) {
  const where: Record<string, unknown> = {};
  if (query.type) where.type = query.type;
  if (query.stage) where.stage = query.stage;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
      { company: { contains: query.search } },
    ];
  }
  return prisma.people.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function getById(id: string) {
  const person = await prisma.people.findUnique({
    where: { id },
    include: { projects: true },
  });
  if (!person) throw new NotFoundError('People');
  return person;
}

export async function create(data: CreatePeopleBody) {
  return prisma.people.create({ data });
}

export async function update(id: string, data: UpdatePeopleBody) {
  await getById(id);
  return prisma.people.update({ where: { id }, data });
}

export async function changeStage(id: string, stage: string) {
  if (!PEOPLE_STAGES.includes(stage as typeof PEOPLE_STAGES[number])) {
    throw new ValidationError(`Invalid stage. Must be one of: ${PEOPLE_STAGES.join(', ')}`);
  }
  await getById(id);
  const updated = await prisma.people.update({ where: { id }, data: { stage } });
  await prisma.activity.create({
    data: {
      peopleId: id,
      type: 'stage_changed',
      description: `Stage changed to ${stage}`,
      metadata: JSON.stringify({ newStage: stage }),
    },
  });
  return updated;
}

export async function remove(id: string) {
  await getById(id);
  await prisma.people.delete({ where: { id } });
  return { success: true };
}
