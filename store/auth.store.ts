/**
 * @file auth.store.ts
 * @layer Store
 * @responsibility Auth state — user, CSRF token, login/logout actions
 */

import { create } from 'zustand'
import type { User } from '@shared/types/user.types'
import { authApi, setCsrfToken, clearCsrfToken } from '@/services/api'

interface AuthState {
  user: User | null
  csrfToken: string | null
  isLoading: boolean
  isAuthenticated: boolean

  setUser: (user: User | null) => void
  setCsrfToken: (token: string | null) => void

  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  csrfToken: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: user !== null }),

  setCsrfToken: (token) => {
    if (token) {
      setCsrfToken(token)
    } else {
      clearCsrfToken()
    }
    set({ csrfToken: token })
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { user, csrfToken } = await authApi.login(email, password)
      setCsrfToken(csrfToken)
      set({ user, isAuthenticated: true, isLoading: false })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (firstName, lastName, email, password) => {
    set({ isLoading: true })
    try {
      const { user, csrfToken } = await authApi.register(firstName, lastName, email, password)
      setCsrfToken(csrfToken)
      set({ user, isAuthenticated: true, isLoading: false })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Proceed with local logout even if API fails
    }
    clearCsrfToken()
    set({ user: null, csrfToken: null, isAuthenticated: false })
  },

  restoreSession: async () => {
    set({ isLoading: true })
    try {
      const u = await authApi.me()
      if (u) {
        set({ user: u, isAuthenticated: true, isLoading: false })
      } else {
        clearCsrfToken()
        set({ user: null, csrfToken: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      clearCsrfToken()
      set({ user: null, csrfToken: null, isAuthenticated: false, isLoading: false })
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}))
