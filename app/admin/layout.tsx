'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Building2, Store, MessageSquare,
  LogOut, Menu, ChevronRight, ShieldAlert
} from 'lucide-react'
import { isAdminLoggedIn, adminLogout, getAdminUser } from '@/services/admin'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/properties', label: "E'lonlar", icon: Building2 },
  { href: '/admin/sellers', label: 'Sotuvchilar', icon: Store },
  { href: '/admin/messages', label: 'Xabarlar', icon: MessageSquare },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === '/admin' || !isAdminLoggedIn()) {
    return <>{children}</>
  }

  const user = getAdminUser()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm truncate">Admin Panel</h2>
              <p className="text-[11px] text-gray-400 truncate">{user?.firstName as string || ''} {user?.lastName as string || ''}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <button key={item.href} onClick={() => { router.push(item.href); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0" />}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button onClick={() => { adminLogout(); router.replace('/admin') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-all">
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="flex items-center justify-between px-4 lg:px-6 h-14">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden font-semibold text-sm text-gray-900">
              Admin Panel
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:block">{user?.firstName as string || ''} {user?.lastName as string || ''}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(user?.firstName as string || 'A')[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
