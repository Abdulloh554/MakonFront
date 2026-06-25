'use client'

import { useEffect, useState, startTransition } from 'react'
import { Users, ChevronRight, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '@/components/layout/PageTransition'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { syncSellers, getSellers } from '@/store'
import { useHydrated } from '@/hooks/useHydrated'
import type { Seller } from '@/types'
import { useRouter } from 'next/navigation'

export default function SellersPage() {
  const hydrated = useHydrated()
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>([])

  useEffect(() => {
    if (!hydrated) return
    startTransition(() => setSellers(getSellers()))
    syncSellers().then(() => startTransition(() => setSellers(getSellers())))
  }, [hydrated])

  if (!hydrated) {
    return <PageTransition><div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div></PageTransition>
  }

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="sticky top-0 lg:top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-4 md:px-6 lg:px-8 py-3"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm"
          >
            <Users className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Sotuvchilar</h1>
            <p className="text-[10px] text-gray-400 font-medium">{sellers.length} ta sotuvchi</p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 px-4 md:px-6 lg:px-8 pt-5 pb-28 lg:pb-8">
        {sellers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8 text-slate-300" />}
            title="Hozircha sotuvchilar yo'q"
            description="Tez orada sotuvchilar paydo bo'ladi"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(15,23,42,0.10), 0 4px 12px rgba(15,23,42,0.06)' }}
                whileTap={{ scale: 0.985 }}
                onClick={() => router.push(`/sellers/${seller.id}`)}
                className="cursor-pointer rounded-2xl p-4 transition-colors"
                style={{
                  background: 'white',
                  border: '1.5px solid rgba(226,232,240,0.8)',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
                    style={{
                      background: [
                        'linear-gradient(135deg, #f59e0b, #f97316)',
                        'linear-gradient(135deg, #94a3b8, #64748b)',
                        'linear-gradient(135deg, #d97706, #b45309)',
                        'linear-gradient(135deg, #185FA5, #378ADD)',
                      ][index % 4],
                    }}
                  >
                    {seller.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{seller.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-amber-600">{seller.rating}</span>
                      </div>
                      <span className="text-xs text-slate-400">{seller.totalListings} ta elon</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
