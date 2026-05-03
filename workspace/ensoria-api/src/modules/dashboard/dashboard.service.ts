import { prisma } from '../../lib/prisma.js';

export async function getDashboard() {
  const [totalPeople, totalProjects, people, projects, recentActivity] = await Promise.all([
    prisma.people.count(),
    prisma.project.count(),
    prisma.people.findMany({
      select: { id: true, name: true, stage: true, type: true },
    }),
    prisma.project.findMany({
      include: { people: { select: { id: true, name: true, company: true } } },
    }),
    prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        people: { select: { id: true, name: true } },
      },
    }),
  ]);

  const pipelineValue = projects.reduce((sum, p) => sum + (p.value || 0), 0);

  // Win rate: projects that reached "Live" or "Validated" vs total
  const wonProjects = projects.filter(p =>
    ['Live', 'Validated'].includes(p.stage)
  ).length;
  const winRate = projects.length > 0 ? wonProjects / projects.length : 0;

  const avgDealSize = projects.length > 0 ? pipelineValue / projects.length : 0;

  // Stage distribution
  const peopleStageDist: Record<string, number> = {};
  for (const p of people) {
    peopleStageDist[p.stage] = (peopleStageDist[p.stage] || 0) + 1;
  }

  // Projects by stage
  const projectsByStage: Record<string, typeof projects> = {};
  for (const p of projects) {
    if (!projectsByStage[p.stage]) projectsByStage[p.stage] = [];
    projectsByStage[p.stage].push(p);
  }

  return {
    metrics: {
      totalPeople,
      totalProjects,
      pipelineValue,
      winRate: Math.round(winRate * 100) / 100,
      avgDealSize: Math.round(avgDealSize * 100) / 100,
    },
    stageDistribution: peopleStageDist,
    recentActivity: recentActivity.map(a => ({
      id: a.id,
      type: a.type,
      description: a.description,
      peopleName: a.people?.name || null,
      createdAt: a.createdAt,
    })),
    projectsByStage,
  };
}
