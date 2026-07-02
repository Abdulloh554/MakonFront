/**
 * @file theme.store.ts
 * @layer Store
 * @responsibility Dark/light mode state — persists to localStorage
 */

import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  hydrated: boolean
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('makon-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  hydrated: false,

  setTheme: (theme) => {
    localStorage.setItem('makon-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme, hydrated: true })
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    get().setTheme(next)
  },
}))

export function initTheme() {
  const attr = document.documentElement.getAttribute('data-theme') as Theme | null
  const isDark = attr === 'dark' || document.documentElement.classList.contains('dark')
  const theme: Theme = isDark ? 'dark' : 'light'
  if (!attr) document.documentElement.setAttribute('data-theme', theme)
  useThemeStore.setState({ theme, hydrated: true })
}
