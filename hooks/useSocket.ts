/**
 * @file useSocket.ts
 * @layer Hook
 * @responsibility ALL Socket.IO logic — connect, events, cleanup. Single source of truth for socket interactions.
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { SOCKET_EVENTS } from '@shared/constants/events'
import type { Message } from '@shared/types/message.types'
import { useAuthStore } from '@/store/auth.store'

interface TypingUser {
  userId: string
  conversationId: string
}

export function useSocket() {
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const listenerCleanups = useRef<Array<() => void>>([])

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket()
      return
    }

    const socket = connectSocket()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    socket.on(SOCKET_EVENTS.SERVER.TYPING_START, (data: TypingUser) => {
      setTypingUsers((prev) => {
        const next = new Map(prev)
        const conversationUsers = next.get(data.conversationId) || new Set()
        conversationUsers.add(data.userId)
        next.set(data.conversationId, conversationUsers)
        return next
      })

      // Auto-clear typing after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev)
          const conversationUsers = next.get(data.conversationId)
          if (conversationUsers) {
            conversationUsers.delete(data.userId)
            if (conversationUsers.size === 0) {
              next.delete(data.conversationId)
            }
          }
          return next
        })
      }, 3000)
    })

    socket.on(SOCKET_EVENTS.SERVER.USER_ONLINE, (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId))
    })

    socket.on(SOCKET_EVENTS.SERVER.USER_OFFLINE, (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
    })

    socket.on(SOCKET_EVENTS.SERVER.TYPING_STOP, (data: TypingUser) => {
      setTypingUsers((prev) => {
        const next = new Map(prev)
        const conversationUsers = next.get(data.conversationId)
        if (conversationUsers) {
          conversationUsers.delete(data.userId)
          if (conversationUsers.size === 0) {
            next.delete(data.conversationId)
          }
        }
        return next
      })
    })

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off(SOCKET_EVENTS.SERVER.USER_ONLINE)
      socket.off(SOCKET_EVENTS.SERVER.USER_OFFLINE)
      socket.off(SOCKET_EVENTS.SERVER.TYPING_START)
      socket.off(SOCKET_EVENTS.SERVER.TYPING_STOP)

      listenerCleanups.current.forEach((cleanup) => cleanup())
      listenerCleanups.current = []

      disconnectSocket()
    }
  }, [isAuthenticated])

  const joinConversation = useCallback((conversationId: string) => {
    getSocket()?.emit(SOCKET_EVENTS.CLIENT.JOIN_CONVERSATION, { conversationId })
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    getSocket()?.emit(SOCKET_EVENTS.CLIENT.LEAVE_CONVERSATION, { conversationId })
  }, [])

  const emitTypingStart = useCallback((conversationId: string) => {
    getSocket()?.emit(SOCKET_EVENTS.CLIENT.TYPING_START, { conversationId })
  }, [])

  const emitTypingStop = useCallback((conversationId: string) => {
    getSocket()?.emit(SOCKET_EVENTS.CLIENT.TYPING_STOP, { conversationId })
  }, [])

  const markRead = useCallback((conversationId: string, messageIds: string[]) => {
    getSocket()?.emit(SOCKET_EVENTS.CLIENT.MARK_READ, { conversationId, messageIds })
  }, [])

  // Typed event listeners that return cleanup functions
  const onNewMessage = useCallback((handler: (message: Message) => void) => {
    const socket = getSocket()
    if (!socket) return () => {}

    socket.on(SOCKET_EVENTS.SERVER.MESSAGE_NEW, handler)
    const cleanup = () => socket.off(SOCKET_EVENTS.SERVER.MESSAGE_NEW, handler)
    listenerCleanups.current.push(cleanup)
    return cleanup
  }, [])

  const onMessageUpdated = useCallback((handler: (message: Message) => void) => {
    const socket = getSocket()
    if (!socket) return () => {}

    socket.on(SOCKET_EVENTS.SERVER.MESSAGE_UPDATED, handler)
    const cleanup = () => socket.off(SOCKET_EVENTS.SERVER.MESSAGE_UPDATED, handler)
    listenerCleanups.current.push(cleanup)
    return cleanup
  }, [])

  const onMessageDeleted = useCallback((handler: (data: { messageId: string }) => void) => {
    const socket = getSocket()
    if (!socket) return () => {}

    socket.on(SOCKET_EVENTS.SERVER.MESSAGE_DELETED, handler)
    const cleanup = () => socket.off(SOCKET_EVENTS.SERVER.MESSAGE_DELETED, handler)
    listenerCleanups.current.push(cleanup)
    return cleanup
  }, [])

  const onUnreadCount = useCallback((handler: (data: { count: number }) => void) => {
    const socket = getSocket()
    if (!socket) return () => {}

    socket.on(SOCKET_EVENTS.SERVER.UNREAD_COUNT, handler)
    const cleanup = () => socket.off(SOCKET_EVENTS.SERVER.UNREAD_COUNT, handler)
    listenerCleanups.current.push(cleanup)
    return cleanup
  }, [])

  return {
    connected,
    typingUsers,
    onlineUsers,
    joinConversation,
    leaveConversation,
    emitTypingStart,
    emitTypingStop,
    markRead,
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
    onUnreadCount,
  }
}
