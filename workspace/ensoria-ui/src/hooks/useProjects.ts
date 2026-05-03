import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, patch, del } from '../lib/api'

export interface Project {
  id: string
  name: string
  description?: string | null
  stage: string
  value?: number | null
  peopleId: string
  subStatus?: string | null
  people?: { id: string; name: string; company?: string | null }
  createdAt: string
  updatedAt: string
  conversations?: unknown[]
  requirements?: unknown[]
  milestones?: unknown[]
  collaborators?: unknown[]
  plans?: unknown[]
  files?: unknown[]
  analytics?: unknown[]
}

export function useProjects(filters?: { stage?: string; peopleId?: string; search?: string }) {
  const params = new URLSearchParams()
  if (filters?.stage) params.set('stage', filters.stage)
  if (filters?.peopleId) params.set('peopleId', filters.peopleId)
  if (filters?.search) params.set('search', filters.search)
  const qs = params.toString()

  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => get<Project[]>(`/projects${qs ? `?${qs}` : ''}`),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => get<Project>(`/projects/${id}`),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Project>) => post<Project>('/projects', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Project> & { id: string }) =>
      put<Project>(`/projects/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }) },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useChangeProjectStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      patch<Project>(`/projects/${id}/stage`, { stage }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }) },
  })
}
