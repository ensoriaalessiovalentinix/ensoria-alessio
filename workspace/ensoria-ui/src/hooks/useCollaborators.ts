import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, del } from '../lib/api'

export interface Collaborator {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  role?: string | null
  notes?: string | null
  createdAt: string
}

export function useCollaborators(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'collaborators'],
    queryFn: () => get<Collaborator[]>(`/projects/${projectId}/collaborators`),
    enabled: !!projectId,
  })
}

export function useAddCollaborator() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, ...body }: { projectId: string; name: string; email?: string; role?: string }) =>
      post(`/projects/${projectId}/collaborators`, body),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'collaborators'] }),
  })
}

export function useRemoveCollaborator() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
      del(`/projects/${projectId}/collaborators/${id}`),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'collaborators'] }),
  })
}
