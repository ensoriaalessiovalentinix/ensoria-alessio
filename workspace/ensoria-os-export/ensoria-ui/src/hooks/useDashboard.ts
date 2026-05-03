import { useQuery } from '@tanstack/react-query'
import { get } from '../lib/api'

export interface DashboardData {
  metrics: {
    totalPeople: number
    totalProjects: number
    pipelineValue: number
    winRate: number
    avgDealSize: number
  }
  stageDistribution: Record<string, number>
  recentActivity: {
    id: string
    type: string
    description: string
    peopleName: string | null
    createdAt: string
  }[]
  projectsByStage: Record<string, unknown[]>
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => get<DashboardData>('/dashboard'),
  })
}
