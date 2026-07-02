'use client'

import type { Property } from '@/types'
import Image from 'next/image'
import { MapPin, Maximize, BedDouble, Building } from 'lucide-react'
import { DEAL_TYPE_LABELS } from '@/constants'
import { motion } from 'framer-motion'
import { useState } from 'react'

const dealBadgeClass: Record<string, string> = {
  sale: 'badge-sale',
  rent: 'badge-rent',
  daily: 'badge-daily',
  installment: 'badge-installment',
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US')}`
}

interface PropertyMiniCardProps {
  property: Property
  onLocate: (property: Property) => void
  onClick: () => void
}

export default function PropertyMiniCard({ property, onLocate, onClick }: PropertyMiniCardProps) {
  const [imgErr, setImgErr] = useState(false)
  const hasImage = property.images[0] && !imgErr
  const dealCls = dealBadgeClass[property.dealType] || 'badge-sale'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 rounded-xl border overflow-hidden cursor-pointer group transition-all duration-200 shrink-0"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="relative w-20 h-20 shrink-0 overflow-hidden bg-[var(--surface-2)]"
        onClick={onClick}
      >
        {hasImage ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            width={80}
            height={80}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgErr(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
        )}
        <div className="property-card-overlay absolute inset-0" />
      </div>

      <div className="flex-1 min-w-0 py-2 pr-2 flex flex-col justify-center" onClick={onClick}>
        <h4 className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1 leading-snug mb-0.5">
          {property.title}
        </h4>
        <p className="text-sm font-extrabold text-[var(--text-primary)] leading-none mb-1">
          {formatPrice(property.price)}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-medium">
          {property.rooms > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <BedDouble className="w-2.5 h-2.5" />
              {property.rooms}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5">
            <Maximize className="w-2.5 h-2.5" />
            {property.area}m²
          </span>
          <span className={`badge ${dealCls}`}>
            {DEAL_TYPE_LABELS[property.dealType]}
          </span>
        </div>
      </div>

      <div className="flex items-center pr-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            onLocate(property)
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'var(--surface-3)', color: 'var(--primary)' }}
          title="Xaritada ko'rsatish"
        >
          <MapPin className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
