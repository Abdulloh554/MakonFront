'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/I18nContext'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { useFeaturedProperties } from '@/queries/property.queries'
import type { Property } from '@/types'
import { DEAL_TYPE_LABELS } from '@/constants'

function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US')}`
}

const dealBadgeClass: Record<string, string> = {
  sale: 'badge-sale',
  rent: 'badge-rent',
  daily: 'badge-daily',
  installment: 'badge-installment',
}

interface FeaturedCarouselProps {
  onSelect?: (property: Property) => void
}

export default function FeaturedCarousel({ onSelect }: FeaturedCarouselProps) {
  const { t } = useI18n()
  const { data: properties = [] } = useFeaturedProperties()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 400
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 pt-4 pb-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('home.featured_title')}</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Eng yaxshi takliflar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-10 text-[var(--text-muted)] text-sm">
          {t('common.no_data')}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect?.(p)}
              className="flex-shrink-0 w-[340px] md:w-[380px] snap-start rounded-2xl overflow-hidden cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="relative h-52 w-full" style={{ background: 'var(--surface-2)' }}>
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm" />
                )}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                }} />
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <p className="text-2xl font-extrabold text-white drop-shadow-sm">
                    {formatPrice(p.price)}
                  </p>
                </div>
                <div className="absolute top-3 left-3 z-10">
                  <span className={`badge ${dealBadgeClass[p.dealType] || 'badge-sale'}`}>
                    {DEAL_TYPE_LABELS[p.dealType]}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {p.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-[12px] text-[var(--text-secondary)]">
                  {p.rooms > 0 && (
                    <>
                      <span>{p.rooms} xona</span>
                      <span className="text-[var(--text-muted)]">·</span>
                    </>
                  )}
                  <span>{p.area} m²</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--text-muted)]">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{p.location?.address?.split(',')[0] || 'Toshkent'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
