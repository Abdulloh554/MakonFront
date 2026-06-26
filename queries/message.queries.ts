/**
 * @file message.queries.ts
 * @layer Queries
 * @responsibility Message-related TanStack Query hooks — useConversations, useMessages
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { messageApi } from '@/services/api'
import type { SendMessageRequest } from '@shared/types/message.types'
import { useUiStore } from '@/store/ui.store'
import { queryClient } from '@/lib/queryClient'

const MESSAGE_KEYS = {
  conversations: ['messages', 'conversations'] as const,
  list: (conversationId: string) => ['messages', 'list', conversationId] as const,
}

export function useConversations() {
  return useQuery({
    queryKey: MESSAGE_KEYS.conversations,
    queryFn: () => messageApi.conversations(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  })
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: MESSAGE_KEYS.list(conversationId),
    queryFn: () => messageApi.list(conversationId),
    staleTime: 1000 * 10,
    enabled: !!conversationId,
    refetchInterval: 1000 * 15,
  })
}

export function useSendMessage() {
  const addToast = useUiStore((s) => s.addToast)

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messageApi.send(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: MESSAGE_KEYS.list(response.message.conversationId),
      })
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.conversations })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })
}

export function useUpdateMessage() {
  const addToast = useUiStore((s) => s.addToast)

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => messageApi.update(id, text),
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })
}

export function useDeleteMessage() {
  const addToast = useUiStore((s) => s.addToast)

  return useMutation({
    mutationFn: (id: string) => messageApi.delete(id),
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })
}
