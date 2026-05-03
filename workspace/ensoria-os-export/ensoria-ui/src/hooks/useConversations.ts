import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post } from '../lib/api'

export interface Conversation {
  id: string
  projectId: string
  channel: string
  direction: string
  subject?: string | null
  content: string
  sentiment?: number | null
  createdAt: string
}

export function useConversations(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'conversations'],
    queryFn: () => get<Conversation[]>(`/projects/${projectId}/conversations`),
    enabled: !!projectId,
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, ...body }: { projectId: string; channel: string; direction: string; subject?: string; content: string }) =>
      post(`/projects/${projectId}/conversations`, body),
    onSuccess: (_, { projectId }) => qc.invalidateQueries({ queryKey: ['projects', projectId, 'conversations'] }),
  })
}
