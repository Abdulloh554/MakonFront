'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, Users, PlusCircle, MessageCircle, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth.store'
import { useHydrated } from '@/hooks/useHydrated'

const navItems = [
  { href: '/', label: 'Asosiy', icon: Home },
  { href: '/map', label: 'Xarita', icon: MapPin },
  { href: '/sellers', label: 'Sotuvchilar', icon: Users },
  { href: '/add', label: "Qo'shish", icon: PlusCircle },
  { href: '/messages', label: 'Xabarlar', icon: MessageCircle },
  { href: '/profile', label: 'Profil', icon: User },
]

export default function Navbar() {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)

  if (pathname.startsWith('/admin')) return null
  if (pathname === '/profile' && hydrated && !user) return null

  return (
    <>
      {/* Mobile — modern floating glass pill with glow */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-0 pointer-events-none">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="pointer-events-auto mx-auto max-w-md rounded-[22px] p-[1.5px]"
          style={{
            background: 'linear-gradient(135deg, rgba(24,95,165,0.25), rgba(55,138,221,0.1), rgba(24,95,165,0.25))',
            boxShadow: '0 8px 40px rgba(24,95,165,0.15), 0 2px 8px rgba(15,23,42,0.08)',
          }}
        >
          <div
            className="rounded-[20px] backdrop-blur-2xl saturate-200"
            style={{
              background: 'rgba(255,255,255,0.88)',
            }}
          >
            <div className="flex items-center justify-around px-2 py-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-0"
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                            boxShadow: '0 4px 16px rgba(24,95,165,0.35)',
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <Icon
                      className={`w-5 h-5 relative z-10 transition-all duration-200 ${
                        isActive ? 'text-white scale-110 drop-shadow-sm' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={`hidden lg:inline text-[10px] leading-tight text-center font-semibold relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Desktop — modern floating glass sidebar with glow */}
      <motion.nav
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.1 }}
        className="hidden lg:flex lg:flex-col lg:fixed lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:w-16 xl:w-20 lg:z-50 lg:py-5 lg:items-center lg:gap-1 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 4px 32px rgba(15,23,42,0.08), 0 0 0 1px rgba(24,95,165,0.06)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="w-10 h-10 flex items-center justify-center mb-5 mt-1 rounded-xl hover:bg-blue-50/50 transition-colors">
          <motion.svg
            width="28" height="32" viewBox="0 0 120 132"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.15, rotate: -8 }}
          >
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#185FA5" />
                <stop offset="100%" stopColor="#378ADD" />
              </linearGradient>
            </defs>
            <path d="M60,0 C33,0 12,21 12,48 C12,74 60,132 60,132 C60,132 108,74 108,48 C108,21 87,0 60,0 Z" fill="url(#logoGrad)" />
            <circle cx="60" cy="46" r="24" fill="white" />
            <circle cx="60" cy="46" r="10" fill="#185FA5" />
          </motion.svg>
        </Link>

        <div className="w-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3" />

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="relative flex flex-col items-center gap-0.5 w-12 py-2.5 rounded-xl transition-all duration-200 group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                    boxShadow: '0 4px 16px rgba(24,95,165,0.35)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-[18px] h-[18px] relative z-10 transition-all duration-200 ${
                  isActive ? 'text-white drop-shadow-sm' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span
                className={`text-[9px] leading-tight text-center font-semibold relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </motion.nav>
    </>
  )
}
