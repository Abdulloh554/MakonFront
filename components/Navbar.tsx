'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, Users, PlusCircle, MessageCircle, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser, useHydrated } from '@/lib/store'

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

  if (pathname.startsWith('/admin')) return null
  if (pathname === '/profile' && hydrated && !getCurrentUser()) return null

  return (
    <>
      {/* Mobile bottom nav — floating glassmorphism pill */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-0"
        style={{ background: 'transparent' }}
      >
        <div
          className="mx-auto max-w-md"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            borderRadius: 22,
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 8px 32px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.06)',
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
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-0"
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #185FA5, #378ADD)',
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
                      isActive ? 'text-white scale-110' : 'text-slate-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] leading-tight text-center font-semibold relative z-10 transition-colors duration-200 ${
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
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-20 xl:w-24 lg:z-50 lg:py-6 lg:items-center lg:gap-1"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(226,232,240,0.8)',
          boxShadow: '2px 0 20px rgba(15,23,42,0.06)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="w-11 h-11 flex items-center justify-center mb-8">
          <svg width="40" height="44" viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M60,0 C33,0 12,21 12,48 C12,74 60,132 60,132 C60,132 108,74 108,48 C108,21 87,0 60,0 Z" fill="#185FA5"/>
            <circle cx="60" cy="46" r="24" fill="#FFFFFF"/>
            <circle cx="60" cy="46" r="10" fill="#185FA5"/>
          </svg>
        </Link>

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
              className="relative flex flex-col items-center gap-1 w-14 py-3 rounded-2xl transition-all duration-200 group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-all duration-200 ${
                  isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span
                className={`text-[10px] leading-tight text-center font-semibold relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
