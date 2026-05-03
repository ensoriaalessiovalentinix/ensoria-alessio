import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, patch, del } from '../lib/api'

export interface People {
  id: string
  type: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  stage: string
  notes?: string | null
  tags?: string
  createdAt: string
  updatedAt: string
  projects?: { id: string; name: string; stage: string }[]
}

export interface PeopleFilters {
  type?: string
  stage?: string
  search?: string
}

export function usePeople(filters?: PeopleFilters) {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.stage) params.set('stage', filters.stage)
  if (filters?.search) params.set('search', filters.search)
  const qs = params.toString()

  return useQuery({
    queryKey: ['people', filters],
    queryFn: () => get<People[]>(`/people${qs ? `?${qs}` : ''}`),
  })
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: ['people', id],
    queryFn: () => get<People>(`/people/${id}`),
    enabled: !!id,
  })
}

export function useCreatePeople() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<People>) => post<People>('/people', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  })
}

export function useUpdatePeople() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<People> & { id: string }) =>
      put<People>(`/people/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['people'] }) },
  })
}

export function useDeletePeople() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/people/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['people'] }),
  })
}

export function useChangePeopleStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      patch<People>(`/people/${id}/stage`, { stage }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['people'] }) },
  })
}
