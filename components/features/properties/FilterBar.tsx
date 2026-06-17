'use client'

import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import type { FilterOptions } from '@/types'
import type { DealType, PropertyType, PropertyStatus } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

const dealTypes: { value: DealType | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'Barchasi', emoji: '🏠' },
  { value: 'daily', label: 'Kunlik', emoji: '📅' },
  { value: 'sale', label: 'Sotiladi', emoji: '🔑' },
  { value: 'rent', label: 'Ijara', emoji: '📋' },
  { value: 'installment', label: 'Nasiya', emoji: '💳' },
]

const propertyTypes: { value: PropertyType | 'all'; label: string }[] = [
  { value: 'all', label: 'Barcha' },
  { value: 'apartment', label: 'Kvartira' },
  { value: 'house', label: 'Hovli' },
  { value: 'cottage', label: 'Kottej' },
  { value: 'dacha', label: 'Dacha' },
  { value: 'commercial', label: 'Tijorat' },
  { value: 'land', label: 'Yer' },
]

const statuses: { value: PropertyStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Barcha holat' },
  { value: 'ready', label: 'Tayyor' },
  { value: 'half-ready', label: 'Yarim tayyor' },
  { value: 'land', label: 'Tekis yer' },
]

interface FilterBarProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    setTimeout(() => document.addEventListener('click', handleClick), 0)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  function update(key: keyof FilterOptions, value: string | number | undefined) {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.dealType !== 'all' ||
    filters.propertyType !== 'all' ||
    filters.status !== 'all' ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined

  return (
    <div className="space-y-2" ref={panelRef}>
      {/* Search + Filter toggle row */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--gray-400)' }}
          />
          <input
            type="text"
            placeholder="Qidirish..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
            style={{
              background: 'var(--gray-100)',
              border: '1.5px solid transparent',
              color: 'var(--gray-900)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.background = 'white'
              e.target.style.borderColor = '#378ADD'
              e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
            }}
            onBlur={(e) => {
              e.target.style.background = 'var(--gray-100)'
              e.target.style.borderColor = 'transparent'
              e.target.style.boxShadow = 'none'
            }}
          />
          <AnimatePresence>
            {filters.search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => update('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen(!open)}
          className="relative p-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5"
          style={
            open || hasActiveFilters
              ? {
                  background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(24,95,165,0.30)',
                }
              : {
                  background: 'var(--gray-100)',
                  color: 'var(--gray-500)',
                }
          }
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasActiveFilters && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"
            />
          )}
        </motion.button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'white',
              border: '1.5px solid var(--gray-150)',
              boxShadow: '0 16px 40px rgba(15,23,42,0.10), 0 4px 12px rgba(15,23,42,0.06)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--gray-100)' }}
            >
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Filtrlash</span>
              {hasActiveFilters && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    onChange({
                      dealType: 'all',
                      propertyType: 'all',
                      status: 'all',
                      minPrice: undefined,
                      maxPrice: undefined,
                      search: filters.search,
                    })
                  }
                  className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                  style={{
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                  }}
                >
                  Tozalash
                </motion.button>
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Deal type */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Bitim turi</label>
                <div className="flex flex-wrap gap-1.5">
                  {dealTypes.map((t) => (
                    <motion.button
                      key={t.value}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => update('dealType', t.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                      style={
                        filters.dealType === t.value
                          ? {
                              background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                              color: 'white',
                              boxShadow: '0 3px 10px rgba(24,95,165,0.25)',
                            }
                          : {
                              background: 'var(--gray-100)',
                              color: 'var(--gray-600)',
                            }
                      }
                    >
                      {t.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mulk turi</label>
                <div className="flex flex-wrap gap-1.5">
                  {propertyTypes.map((t) => (
                    <motion.button
                      key={t.value}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => update('propertyType', t.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                      style={
                        filters.propertyType === t.value
                          ? {
                              background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                              color: 'white',
                              boxShadow: '0 3px 10px rgba(24,95,165,0.25)',
                            }
                          : {
                              background: 'var(--gray-100)',
                              color: 'var(--gray-600)',
                            }
                      }
                    >
                      {t.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Holati</label>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((t) => (
                    <motion.button
                      key={t.value}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => update('status', t.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                      style={
                        filters.status === t.value
                          ? {
                              background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                              color: 'white',
                              boxShadow: '0 3px 10px rgba(24,95,165,0.25)',
                            }
                          : {
                              background: 'var(--gray-100)',
                              color: 'var(--gray-600)',
                            }
                      }
                    >
                      {t.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Min narx ($)</label>
                  <input
                    type="number"
                    value={filters.minPrice ?? ''}
                    onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: 'var(--gray-100)',
                      border: '1.5px solid transparent',
                      color: 'var(--gray-900)',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'white'
                      e.target.style.borderColor = '#378ADD'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'var(--gray-100)'
                      e.target.style.borderColor = 'transparent'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Max narx ($)</label>
                  <input
                    type="number"
                    value={filters.maxPrice ?? ''}
                    onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="999 999"
                    className="w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: 'var(--gray-100)',
                      border: '1.5px solid transparent',
                      color: 'var(--gray-900)',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'white'
                      e.target.style.borderColor = '#378ADD'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'var(--gray-100)'
                      e.target.style.borderColor = 'transparent'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
