import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, patch, del } from '../lib/api'
import type { User } from '../stores/authStore'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => get<{ user: User }>('/auth/me'),
    retry: false,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      post<{ user: User; token: string }>('/auth/login', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { email: string; password: string; name: string }) =>
      post<{ user: User; token: string }>('/auth/register', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}
