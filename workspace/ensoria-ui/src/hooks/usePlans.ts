import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '../lib/api'

export interface Plan {
  id: string
  title: string
  content: string
  version: number
  createdAt: string
}

export function usePlans(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'plans'],
    queryFn: () => get<Plan[]>(`/projects/${projectId}/plans`),
    enabled: !!projectId,
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, ...body }: { projectId: string; title: string; content: string }) =>
      post(`/projects/${projectId}/plans`, body),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'plans'] }),
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, id, ...body }: { projectId: string; id: string; title?: string; content?: string }) =>
      put(`/projects/${projectId}/plans/${id}`, body),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'plans'] }),
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
      del(`/projects/${projectId}/plans/${id}`),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'plans'] }),
  })
}
