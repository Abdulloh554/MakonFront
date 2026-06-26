/**
 * @file auth.queries.ts
 * @layer Queries
 * @responsibility Auth-related TanStack Query hooks — useMe, useSession
 */

import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'

const AUTH_KEYS = {
  me: ['auth', 'me'] as const,
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser)

  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const user = await authApi.me()
      setUser(user)
      return user
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
  })
}

export function useSession() {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    isLoggedIn: isAuthenticated && !!user,
  }
}
