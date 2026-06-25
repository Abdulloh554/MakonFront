'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import PropertyCard from '@/components/features/properties/PropertyCard'
import FilterBar from '@/components/features/properties/FilterBar'
import PropertyModal from '@/components/features/properties/PropertyModal'
import PageTransition from '@/components/layout/PageTransition'
import StaggerGrid, { StaggerItem } from '@/components/layout/StaggerGrid'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useProperties } from '@/queries/property.queries'
import type { FilterOptions, Property } from '@/types'
import { motion } from 'framer-motion'
import { SearchX, MapPin } from 'lucide-react'

const gradientMesh = {
  background: `
    radial-gradient(ellipse 80% 60% at 0% 0%, rgba(24,95,165,0.08) 0%, transparent 100%),
    radial-gradient(ellipse 60% 50% at 100% 0%, rgba(55,138,221,0.06) 0%, transparent 100%),
    radial-gradient(ellipse 50% 40% at 50% 100%, rgba(99,102,241,0.04) 0%, transparent 100%)
  `,
}

export default function HomePage() {
  const [filters, setFilters] = useState<FilterOptions>({
    dealType: 'all', propertyType: 'all', status: 'all',
    minPrice: undefined, maxPrice: undefined, search: '',
  })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const { data: properties = [], isLoading } = useProperties(filters)

  return (
    <PageTransition>
      <div
        className="sticky top-0 lg:top-0 z-20 border-b border-gray-100/80 px-4 md:px-6 lg:px-8 pt-4 pb-3"
        style={gradientMesh}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-center justify-between mb-3"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #185FA5 0%, #378ADD 60%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              E&apos;lonlar
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-[11px] text-slate-400 font-medium mt-0.5"
            >
              Ko&apos;chmas mulk bozoridagi eng so&apos;nggi takliflar
            </motion.p>
          </div>

          <div className="flex items-center gap-2">
            <motion.a
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 300 }}
              href="/map"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
              style={{
                background: 'rgba(24,95,165,0.08)',
                color: '#185FA5',
                border: '1px solid rgba(24,95,165,0.15)',
              }}
            >
              <MapPin className="w-3 h-3" />
              Xaritada topish
            </motion.a>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
              className="relative"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                  filter: 'blur(12px)',
                  opacity: 0.2,
                }}
              />
              <div className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span className="text-[11px] font-bold text-slate-700">{properties.length} ta elon</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <FilterBar filters={filters} onChange={setFilters} />
        </motion.div>
      </div>

      <div className="flex-1 px-4 md:px-6 lg:px-8 pt-5 pb-28 lg:pb-8">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[40vh]">
            <LoadingSpinner />
          </div>
        ) : properties.length === 0 ? (
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
