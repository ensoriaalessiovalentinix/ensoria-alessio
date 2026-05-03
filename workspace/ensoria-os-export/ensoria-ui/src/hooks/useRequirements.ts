import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '../lib/api'

export interface Requirement {
  id: string
  title: string
  description?: string | null
  category: string
  status: string
  priority: string
  createdAt: string
}

export function useRequirements(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'requirements'],
    queryFn: () => get<Requirement[]>(`/projects/${projectId}/requirements`),
    enabled: !!projectId,
  })
}

export function useCreateRequirement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, ...body }: { projectId: string; title: string; description?: string; category?: string; status?: string; priority?: string }) =>
      post(`/projects/${projectId}/requirements`, body),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'requirements'] }),
  })
}

export function useUpdateRequirement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, id, ...body }: { projectId: string; id: string; title?: string; description?: string; status?: string; priority?: string }) =>
      put(`/projects/${projectId}/requirements/${id}`, body),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'requirements'] }),
  })
}

export function useDeleteRequirement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
      del(`/projects/${projectId}/requirements/${id}`),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'requirements'] }),
  })
}
