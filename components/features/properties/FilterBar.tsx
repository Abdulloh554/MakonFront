'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FilterOptions } from '@/types'
import type { DealType, PropertyType, PropertyStatus } from '@/types'

const dealTypes: { value: DealType | 'all'; label: string }[] = [
  { value: 'all', label: 'Barchasi' },
  { value: 'daily', label: 'Kunlik' },
  { value: 'sale', label: 'Sotiladi' },
  { value: 'rent', label: 'Ijara' },
  { value: 'installment', label: 'Nasiya' },
]

const propertyTypes: { value: PropertyType | 'all'; label: string }[] = [
  { value: 'all', label: 'Barcha' },
  { value: 'apartment', label: 'Kvartira' },
  { value: 'house', label: 'Hovli' },
  { value: 'cottage', label: 'Kottej' },
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
  const [searchText, setSearchText] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    requestAnimationFrame(() => document.addEventListener('click', handleClick))
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  function update(key: keyof FilterOptions, value: string | number | undefined) {
    onChange({ ...filters, [key]: value })
  }

  function onSearchChange(value: string) {
    setSearchText(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      update('search', value)
    }, 300)
  }

  const hasActiveFilters =
    filters.dealType !== 'all' ||
    filters.propertyType !== 'all' ||
    filters.status !== 'all' ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined

  return (
    <div className="space-y-2" ref={panelRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Manzil, ko'cha yoki nom..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm font-medium rounded-xl outline-none transition-all duration-200 placeholder:text-[var(--text-muted)]"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              border: '2px solid transparent',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--surface)' }}
            onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--surface-2)' }}
          />
          {searchText && (
            <button
              onClick={() => { setSearchText(''); update('search', ''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors hover:bg-[var(--surface-3)]"
            >
              <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label="Filtrlash"
          aria-expanded={open}
          className="relative p-2.5 rounded-xl transition-all duration-200"
          style={{
            background: open || hasActiveFilters ? 'var(--primary)' : 'var(--surface-2)',
            color: open || hasActiveFilters ? '#fff' : 'var(--text-secondary)',
          }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: 'var(--danger)' }} />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="rounded-2xl overflow-hidden border origin-top"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Filtrlash</span>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onChange({
                    dealType: 'all', propertyType: 'all', status: 'all',
                    minPrice: undefined, maxPrice: undefined,
                    search: filters.search,
                  })
                }}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                style={{ background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}
              >
                Tozalash
              </button>
            )}
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Bitim turi</label>
              <div className="flex flex-wrap gap-1.5">
                {dealTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update('dealType', t.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                    style={{
                      background: filters.dealType === t.value ? 'var(--primary)' : 'var(--surface-2)',
                      color: filters.dealType === t.value ? '#fff' : 'var(--text-secondary)',
                      border: filters.dealType === t.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Mulk turi</label>
              <div className="flex flex-wrap gap-1.5">
                {propertyTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update('propertyType', t.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                    style={{
                      background: filters.propertyType === t.value ? 'var(--primary)' : 'var(--surface-2)',
                      color: filters.propertyType === t.value ? '#fff' : 'var(--text-secondary)',
                      border: filters.propertyType === t.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Holati</label>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => update('status', s.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                    style={{
                      background: filters.status === s.value ? 'var(--primary)' : 'var(--surface-2)',
                      color: filters.status === s.value ? '#fff' : 'var(--text-secondary)',
                      border: filters.status === s.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Min narx ($)</label>
                <input
                  type="number"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl text-sm font-medium outline-none transition-all duration-200 placeholder:text-[var(--text-muted)]"
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                    border: '2px solid transparent',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--surface)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--surface-2)' }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Max narx ($)</label>
                <input
                  type="number"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="999 999"
                  className="w-full px-3 py-2 rounded-xl text-sm font-medium outline-none transition-all duration-200 placeholder:text-[var(--text-muted)]"
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                    border: '2px solid transparent',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--surface)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--surface-2)' }}
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
