'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import PropertyCard from '@/components/PropertyCard'
import FilterBar from '@/components/FilterBar'
import PropertyModal from '@/components/PropertyModal'
import PageTransition from '@/components/PageTransition'
import StaggerGrid, { StaggerItem } from '@/components/StaggerGrid'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getFilteredProperties, useHydrated, syncProperties } from '@/lib/store'
import type { FilterOptions, Property } from '@/lib/types'
import { motion } from 'framer-motion'
import { SearchX } from 'lucide-react'

export default function HomePage() {
  const hydrated = useHydrated()
  const [filters, setFilters] = useState<FilterOptions>({
    dealType: 'all', propertyType: 'all', status: 'all',
    minPrice: undefined, maxPrice: undefined, search: '',
  })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [properties, setProperties] = useState<Property[]>([])

  // Sync from backend on mount
  useEffect(() => {
    if (!hydrated) return
    let active = true
    Promise.resolve().then(() => {
      if (active) setProperties(getFilteredProperties(filters))
    })
    syncProperties().then(() => {
      if (active) setProperties(getFilteredProperties(filters))
    })
    return () => { active = false }
  }, [hydrated, filters])

  if (!hydrated) {
    return <PageTransition><div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div></PageTransition>
  }

  return (
    <PageTransition>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 px-4 md:px-6 lg:px-8 pt-4 pb-3"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(226,232,240,0.7)',
        }}
      >
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-2.5 mb-3"
        >
          <motion.div
            initial={{ scale: 0.6, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-9 h-9 flex items-center justify-center shrink-0"
          >
            <svg width="30" height="33" viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <path d="M60,0 C33,0 12,21 12,48 C12,74 60,132 60,132 C60,132 108,74 108,48 C108,21 87,0 60,0 Z" fill="#185FA5"/>
              <circle cx="60" cy="46" r="24" fill="#FFFFFF"/>
              <circle cx="60" cy="46" r="10" fill="#185FA5"/>
            </svg>
          </motion.div>

          <div className="flex-1 min-w-0">
            <h1
              className="text-xl font-black tracking-tight leading-none"
              style={{
                background: 'linear-gradient(135deg, #185FA5 0%, #378ADD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Makon
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ko&apos;chmas mulk platformasi</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'var(--gray-100)' }}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-xs font-bold text-slate-600">{properties.length} ta elon</span>
          </motion.div>
        </motion.div>

        {/* Filter bar */}
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Property grid */}
      <div className="flex-1 px-4 md:px-6 lg:px-8 pt-5 pb-28 lg:pb-8">
        {properties.length === 0 ? (
          <EmptyState
            icon={<SearchX className="w-8 h-8 text-slate-300" />}
            title="Hech narsa topilmadi"
            description="Boshqa filtrlarni sinab ko'ring"
          />
        ) : (
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties.map((p) => (
              <StaggerItem key={p.id}>
                <PropertyCard property={p} onClick={() => setSelectedProperty(p)} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </PageTransition>
  )
}
