import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '../lib/api'

export interface Milestone {
  id: string
  title: string
  description?: string | null
  dueDate?: string | null
  status: string
  createdAt: string
}

export function useMilestones(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'milestones'],
    queryFn: () => get<Milestone[]>(`/projects/${projectId}/milestones`),
    enabled: !!projectId,
  })
}

export function useCreateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, ...body }: { projectId: string; title: string; description?: string; dueDate?: string; status?: string }) =>
      post(`/projects/${projectId}/milestones`, body),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'milestones'] }),
  })
}

export function useUpdateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, id, ...body }: { projectId: string; id: string; title?: string; status?: string; dueDate?: string }) =>
      put(`/projects/${projectId}/milestones/${id}`, body),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'milestones'] }),
  })
}

export function useDeleteMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
      del(`/projects/${projectId}/milestones/${id}`),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'milestones'] }),
  })
}
