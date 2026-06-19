'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { getToken } from '@/services/api'
import type { Message } from '@/types'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'

interface TypingUser {
  userId: string
  isTyping: boolean
}

interface OnlineUser {
  userId: string
  online: boolean
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('user:typing', (data: TypingUser) => {
      setTypingUsers((prev) => {
        const next = new Map(prev)
        if (data.isTyping) {
          next.set(data.userId, true)
        } else {
          next.delete(data.userId)
        }
        return next
      })
    })

    socket.on('user:online', (data: OnlineUser) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        if (data.online) {
          next.add(data.userId)
        } else {
          next.delete(data.userId)
        }
        return next
      })
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const joinConversation = useCallback((partnerId: string) => {
    socketRef.current?.emit('join_conversation', { partnerId })
  }, [])

  const leaveConversation = useCallback((partnerId: string) => {
    socketRef.current?.emit('leave_conversation', { partnerId })
  }, [])

  const emitTypingStart = useCallback((toUserId: string) => {
    socketRef.current?.emit('typing_start', { toUserId })
  }, [])

  const emitTypingStop = useCallback((toUserId: string) => {
    socketRef.current?.emit('typing_stop', { toUserId })
  }, [])

  const onNewMessage = useCallback((handler: (message: Message) => void) => {
    socketRef.current?.on('new_message', handler)
    return () => {
      socketRef.current?.off('new_message', handler)
    }
  }, [])

  const onUnreadCount = useCallback((handler: (data: { count: number }) => void) => {
    socketRef.current?.on('unread_count', handler)
    return () => {
      socketRef.current?.off('unread_count', handler)
    }
  }, [])

  const onMessageUpdated = useCallback((handler: (message: Message) => void) => {
    socketRef.current?.on('message_updated', handler)
    return () => {
      socketRef.current?.off('message_updated', handler)
    }
  }, [])

  const onMessageDeleted = useCallback((handler: (data: { messageId: string }) => void) => {
    socketRef.current?.on('message_deleted', handler)
    return () => {
      socketRef.current?.off('message_deleted', handler)
    }
  }, [])

  return {
    socket: socketRef,
    connected,
    typingUsers,
    onlineUsers,
    joinConversation,
    leaveConversation,
    emitTypingStart,
    emitTypingStop,
    onNewMessage,
    onUnreadCount,
    onMessageUpdated,
    onMessageDeleted,
  }
}
