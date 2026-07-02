'use client'

import type { Property } from '@/types'
import { MapPin, Maximize, BedDouble, Building2, Heart, Building } from 'lucide-react'
import { PROPERTY_TYPE_LABELS, DEAL_TYPE_LABELS } from '@/constants'
import { useState, memo } from 'react'
import { useI18n } from '@/lib/i18n/I18nContext'

const dealBadgeClass: Record<string, string> = {
  sale: 'badge-sale',
  rent: 'badge-rent',
  daily: 'badge-daily',
  installment: 'badge-installment',
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US')}`
}

function formatCompactPrice(price: number): string {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`
  return `$${price}`
}

interface PropertyCardProps {
  property: Property
  onClick?: () => void
}

function PropertyCard({ property, onClick }: PropertyCardProps) {
  const { t } = useI18n()
  const [imgErr, setImgErr] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const hasImage = property.images[0] && !imgErr
  const dealCls = dealBadgeClass[property.dealType] || 'badge-sale'

  return (
    <div onClick={onClick} className="property-card group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
        {hasImage ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.07]"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
        )}

        <div className="property-card-overlay absolute inset-0" />

        <div className="absolute top-3 left-3">
          <span className={`badge ${dealCls}`}>
            {DEAL_TYPE_LABELS[property.dealType]}
          </span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setFavorite(!favorite) }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          aria-label={favorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-150 ${favorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-[var(--surface)]">
        <p className="text-xl font-extrabold leading-none text-[var(--text-primary)]">
          {formatPrice(property.price)}
        </p>
        {property.dealType === 'installment' && property.installmentMonths && (
          <p className="text-[11px] text-[var(--text-muted)] font-medium">
            {formatCompactPrice(property.installmentPrice || 0)} / oy · {property.installmentMonths} oy
          </p>
        )}

        <h3 className="text-base font-medium text-[var(--text-primary)] leading-snug line-clamp-1">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 flex-wrap text-[13px] text-[var(--text-secondary)]">
          {property.rooms > 0 && (
            <>
              <span className="inline-flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 shrink-0" />
                {t('property.rooms', { n: property.rooms })}
              </span>
              <span className="text-[var(--text-muted)]">·</span>
            </>
          )}
          <span className="inline-flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5 shrink-0" />
            {property.area} m²
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            {PROPERTY_TYPE_LABELS[property.type]}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-[var(--border)]">
          <span className="inline-flex items-center gap-1 min-w-0 text-[12px] text-[var(--text-secondary)]">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{property.location.address.split(',')[0]}</span>
          </span>
          <a
            href="/map"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0 transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            {t('property.on_map')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default memo(PropertyCard)
