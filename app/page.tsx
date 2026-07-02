'use client'

import { useState } from 'react'
import { Sparkles, MapPin, User, LogIn } from 'lucide-react'
import PropertyCard from '@/components/features/properties/PropertyCard'
import FilterBar from '@/components/features/properties/FilterBar'
import dynamic from 'next/dynamic'

const PropertyModal = dynamic(() => import('@/components/features/properties/PropertyModal'), { ssr: false })
import PageTransition from '@/components/layout/PageTransition'
import StaggerGrid, { StaggerItem } from '@/components/layout/StaggerGrid'
import EmptyState from '@/components/ui/EmptyState'
import { useProperties } from '@/queries/property.queries'
import type { FilterOptions, Property } from '@/types'
import { SearchX } from 'lucide-react'
import FeaturedCarousel from '@/components/features/carousel/FeaturedCarousel'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { useHydrated } from '@/hooks/useHydrated'
import { useI18n } from '@/lib/i18n/I18nContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function HomePage() {
  const { t } = useI18n()
  const [filters, setFilters] = useState<FilterOptions>({
    dealType: 'all', propertyType: 'all', status: 'all',
    minPrice: undefined, maxPrice: undefined, search: '',
  })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const { data: properties = [], isLoading } = useProperties(filters)
  const user = useAuthStore((s) => s.user)
  const hydrated = useHydrated()

  return (
    <PageTransition>
      {/* Header — minimal */}
      <header className="sticky top-0 z-20 border-b" style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}>
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
              Makon
            </h1>
            <span className="hidden sm:inline text-[11px] font-medium text-[var(--text-muted)]">
              {t('home.hero.subtitle')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {hydrated && user ? (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all hover:opacity-80"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('profile.my_profile')}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all hover:opacity-80"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('home.profile_button')}</span>
              </Link>
            )}
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pb-4">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
      </header>

      {/* Featured carousel */}
      <FeaturedCarousel onSelect={(p) => setSelectedProperty(p)} />

      {/* Stats + map row */}
      <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-gold)' }} />
          {t('home.stats_count', { count: properties.length })}
        </div>

        <Link
          href="/map"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold transition-all hover:opacity-80"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--primary)',
            border: '1px solid var(--border)',
          }}
        >
          <MapPin className="w-3.5 h-3.5" />
          {t('home.map_button')}
        </Link>
      </div>

      {/* Property grid */}
      <div className="flex-1 px-4 md:px-6 lg:px-8 pt-2 pb-28 lg:pb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-card-img" />
                <div className="skeleton-card-body">
                  <div className="skeleton-line" style={{ width: '40%' }} />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line-short" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon={<SearchX className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />}
            title={t('search.no_results')}
            description="Boshqa filtrlarni sinab ko'ring"
          />
        ) : (
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
