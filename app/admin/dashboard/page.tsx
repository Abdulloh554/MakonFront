'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, Store, MessageSquare, Star, Eye, TrendingUp, Search } from 'lucide-react'
import { apiAdminStats, isAdminLoggedIn, type AdminStats } from '@/services/admin'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useI18n } from '@/lib/i18n/I18nContext'

export default function AdminDashboard() {
  const router = useRouter()
  const { t } = useI18n()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  const cards = [
    { key: 'users', label: t('admin.dashboard.users'), icon: Users, color: 'from-blue-500 to-blue-600', href: '/admin/users' },
    { key: 'sellers', label: t('admin.dashboard.sellers'), icon: Store, color: 'from-emerald-500 to-emerald-600', href: '/admin/sellers' },
    { key: 'properties', label: t('admin.dashboard.properties'), icon: Building2, color: 'from-violet-500 to-violet-600', href: '/admin/properties' },
    { key: 'activeListings', label: t('admin.dashboard.active_listings'), icon: TrendingUp, color: 'from-amber-500 to-amber-600', href: '/admin/properties' },
    { key: 'messages', label: t('admin.dashboard.messages'), icon: MessageSquare, color: 'from-rose-500 to-rose-600', href: '/admin/messages' },
    { key: 'reviews', label: t('admin.dashboard.reviews'), icon: Star, color: 'from-cyan-500 to-cyan-600', href: '#' },
    { key: 'totalViews', label: t('admin.dashboard.views'), icon: Eye, color: 'from-orange-500 to-orange-600', href: '#' },
  ]

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/admin'); return }
    apiAdminStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('admin.dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const value = stats ? stats[card.key as keyof AdminStats] : 0
          const display = card.key === 'totalViews' ? (value as number).toLocaleString() : String(value)
          return (
            <motion.button key={card.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => router.push(card.href)}
              className="relative bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all text-left active:scale-[0.98]">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-sm`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{display}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('admin.dashboard.quick_actions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickLink href="/admin/users" label={t('admin.dashboard.quick_users')} sub={t('admin.dashboard.quick_users_sub')} icon={Users} />
          <QuickLink href="/admin/properties" label={t('admin.dashboard.quick_properties')} sub={t('admin.dashboard.quick_properties_sub')} icon={Search} />
          <QuickLink href="/admin/sellers" label={t('admin.dashboard.quick_sellers')} sub={t('admin.dashboard.quick_sellers_sub')} icon={Store} />
          <QuickLink href="/admin/messages" label={t('admin.dashboard.quick_messages')} sub={t('admin.dashboard.quick_messages_sub')} icon={MessageSquare} />
        </div>
      </div>
    </div>
  )
}

function QuickLink({ href, label, sub, icon: Icon }: { href: string; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }) {
  const router = useRouter()
  return (
    <button onClick={() => router.push(href)}
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left active:scale-[0.98]">
      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </button>
  )
}
