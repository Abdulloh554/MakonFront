'use client'

import { useI18n } from '@/lib/i18n/I18nContext'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const AUTH_PAGES = ['/login', '/register', '/auth/callback', '/reset']

const HeavyLayout = dynamic(() => import('./HeavyLayout'), {
  ssr: false,
})

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const pathname = usePathname()
  const isAuthPage = AUTH_PAGES.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return <HeavyLayout>{children}</HeavyLayout>
}
