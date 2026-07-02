'use client'

import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useHydrated } from '@/hooks/useHydrated'

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const isAdmin = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/profile' && hydrated && !user

  if (isAdmin || isLoginPage) {
    return (
      <main className="min-h-dvh flex flex-col w-full">
        {children}
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col w-full lg:pl-20 xl:pl-24 pb-20 lg:pb-0">
      <div
        className="flex-1 flex flex-col w-full max-w-7xl mx-auto bg-white"
        style={{ boxShadow: '0 0 0 1px var(--gray-200), 0 4px 32px rgba(15,23,42,0.06)' }}
      >
        {children}
      </div>
    </main>
  )
}
