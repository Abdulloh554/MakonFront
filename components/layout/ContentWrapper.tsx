'use client'

import { usePathname } from 'next/navigation'
import { getCurrentUser } from '@/store'
import { useHydrated } from '@/hooks/useHydrated'

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const isAdmin = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/profile' && hydrated && !getCurrentUser()

  if (isAdmin || isLoginPage) {
    return (
      <main className="min-h-dvh flex flex-col w-full">
        {children}
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col w-full lg:pl-20 xl:pl-24">
      <div
        className="flex-1 flex flex-col w-full max-w-7xl mx-auto overflow-hidden"
        style={{
          background: 'white',
          boxShadow: '0 0 0 1px rgba(226,232,240,0.6), 0 4px 32px rgba(15,23,42,0.06)',
        }}
      >
        {children}
      </div>
    </main>
  )
}
