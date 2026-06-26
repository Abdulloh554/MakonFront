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
        className="flex-1 flex flex-col w-full max-w-7xl mx-auto bg-white shadow-[0_0_0_1px_rgba(226,232,240,0.6),0_4px_32px_rgba(15,23,42,0.06)]"
      >
        {children}
      </div>
    </main>
  )
}
