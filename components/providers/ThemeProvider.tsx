'use client'

import { useEffect } from 'react'
import { initTheme, useThemeStore } from '@/store/theme.store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useThemeStore((s) => s.hydrated)

  useEffect(() => {
    if (!hydrated) initTheme()
  }, [hydrated])

  return <>{children}</>
}
