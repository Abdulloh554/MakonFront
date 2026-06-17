'use client'

import type { Property } from '@/types'
import { MapPin, Maximize, BedDouble, Building2 } from 'lucide-react'
import { PROPERTY_TYPE_LABELS, DEAL_TYPE_LABELS, STATUS_LABELS } from '@/constants'
import { motion } from 'framer-motion'
import { useState } from 'react'

const dealTypeConfig: Record<string, { bg: string; text: string; border: string }> = {
  sale:        { bg: '#E6F1FB', text: '#0C447C', border: 'rgba(24,95,165,0.2)' },
  rent:        { bg: '#f0fdf4', text: '#059669', border: 'rgba(5,150,105,0.2)' },
  daily:       { bg: '#fefce8', text: '#b45309', border: 'rgba(180,83,9,0.2)' },
  installment: { bg: '#f5f3ff', text: '#6d28d9', border: 'rgba(109,40,217,0.2)' },
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  ready:       { color: '#059669', dot: '#34d399', label: 'Tayyor uy' },
  'half-ready':{ color: '#d97706', dot: '#fbbf24', label: 'Yarim tayyor' },
  land:        { color: '#185FA5', dot: '#60a5fa', label: 'Tekis yer' },
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M$`
  if (price >= 1000) return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K$`
  return `${price}$`
}

interface PropertyCardProps {
  property: Property
  onClick?: () => void
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  const [imgErr, setImgErr] = useState(false)
  const deal = dealTypeConfig[property.dealType] || dealTypeConfig.sale
  const status = statusConfig[property.status] || statusConfig.ready

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(15,23,42,0.12), 0 8px 16px rgba(15,23,42,0.06)' }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="group bg-white rounded-2xl border overflow-hidden cursor-pointer transition-colors duration-300"
      style={{
        borderColor: 'rgba(226,232,240,0.8)',
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      }}
    >
      {/* Image area */}
      <div className="relative h-44 md:h-48 bg-slate-100 overflow-hidden">
        <motion.img
          src={imgErr || !property.images[0] ? '/placeholder.svg' : property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover"
          style={{ transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          whileHover={{ scale: 1.06 }}
          loading="lazy"
          onError={() => setImgErr(true)}
        />
        {/* Overlay gradients */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.05) 40%, transparent 100%)',
          }}
        />
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              color: status.color,
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: status.dot }}
            />
            {STATUS_LABELS[property.status]}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: deal.bg,
              color: deal.text,
              border: `1px solid ${deal.border}`,
              boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
            }}
          >
            {DEAL_TYPE_LABELS[property.dealType]}
          </span>
        </div>
        {/* Bottom price overlay */}
        <div className="absolute bottom-3 left-3">
          <p
            className="text-lg font-extrabold leading-none"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
            }}
          >
            {formatPrice(property.price)}
          </p>
          {property.dealType === 'installment' && property.installmentMonths && (
            <p className="text-[10px] text-white/80 font-medium mt-0.5">
              oyiga {formatPrice(property.installmentPrice || 0)} / {property.installmentMonths} oy
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-slate-800 line-clamp-1 mb-2.5 leading-snug">
          {property.title}
        </h3>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap">
          {property.rooms > 0 && (
            <div className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">{property.rooms} xona</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">{property.area} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">{PROPERTY_TYPE_LABELS[property.type]}</span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1 mt-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 truncate">{property.location.address.split(',')[0]}</span>
        </div>
      </div>
    </motion.div>
  )
}
