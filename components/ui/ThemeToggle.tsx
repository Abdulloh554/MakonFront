'use client'

import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useThemeStore } from '@/store/theme.store'
import { useHydrated } from '@/hooks/useHydrated'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore()
  const hydrated = useHydrated()

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200 ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {hydrated && (
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] text-amber-400 drop-shadow-sm" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-slate-500" />
          )}
        </motion.div>
      )}
    </button>
  )
}
