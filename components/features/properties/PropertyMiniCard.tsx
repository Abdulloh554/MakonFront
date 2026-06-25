'use client'

import type { Property } from '@/types'
import { MapPin, Maximize, BedDouble } from 'lucide-react'
import { PROPERTY_TYPE_LABELS, DEAL_TYPE_LABELS } from '@/constants'
import { motion } from 'framer-motion'
import { useState } from 'react'

const dealColors: Record<string, string> = {
  sale: '#0C447C',
  rent: '#059669',
  daily: '#b45309',
  installment: '#6d28d9',
}

const dealBg: Record<string, string> = {
  sale: '#E6F1FB',
  rent: '#ecfdf5',
  daily: '#fefce8',
  installment: '#f5f3ff',
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M$`
  if (price >= 1000) return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K$`
  return `${price}$`
}

interface PropertyMiniCardProps {
  property: Property
  onLocate: (property: Property) => void
  onClick: () => void
}

export default function PropertyMiniCard({ property, onLocate, onClick }: PropertyMiniCardProps) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer group hover:border-blue-200 transition-all duration-200 shrink-0"
      style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
    >
      {/* Image */}
      <div
        className="relative w-20 h-20 shrink-0 bg-slate-100 overflow-hidden"
        onClick={onClick}
      >
        <img
          src={imgErr || !property.images[0] ? '/placeholder.svg' : property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={() => setImgErr(true)}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.25) 0%, transparent 50%)' }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 py-2 pr-2 flex flex-col justify-center" onClick={onClick}>
        <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 leading-snug mb-0.5">
          {property.title}
        </h4>
        <p className="text-sm font-extrabold text-slate-900 leading-none mb-1">
          {formatPrice(property.price)}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          {property.rooms > 0 && (
            <span className="flex items-center gap-0.5">
              <BedDouble className="w-2.5 h-2.5" />
              {property.rooms}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Maximize className="w-2.5 h-2.5" />
            {property.area}m²
          </span>
          <span
            className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold leading-none"
            style={{ background: dealBg[property.dealType] || dealBg.sale, color: dealColors[property.dealType] || dealColors.sale }}
          >
            {DEAL_TYPE_LABELS[property.dealType]}
          </span>
        </div>
      </div>

      {/* Locate button */}
      <div className="flex items-center pr-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            onLocate(property)
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: '#E6F1FB', color: '#185FA5' }}
          title="Xaritada ko'rsatish"
        >
          <MapPin className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
