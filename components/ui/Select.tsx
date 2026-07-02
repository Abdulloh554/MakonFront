'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/lib/i18n/I18nContext'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  size?: 'md' | 'sm'
}

export default function Select({ value, onChange, options, placeholder, className = '', size = 'md' }: SelectProps) {
  const { t } = useI18n()
  const resolvedPlaceholder = placeholder || t('select.placeholder')
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) {
      updatePos()
    }
  }, [open, updatePos])

  useEffect(() => {
    if (!open) return
    function handleScroll() { updatePos() }
    function handleResize() { updatePos() }
    document.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [open, updatePos])

  const selected = options.find(o => o.value === value)

  const btnClass = size === 'sm'
    ? 'px-3 py-[7px] text-xs'
    : 'px-4 py-[10px] text-sm'

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none cursor-pointer ${btnClass} ${open ? 'border-blue-400 ring-2 ring-blue-500/20' : ''}`}
      >
        <span className={selected ? '' : 'text-gray-400'}>{selected ? selected.label : resolvedPlaceholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          data-select-portal=""
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
          className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[99999]"
        >
          {resolvedPlaceholder && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-gray-400 hover:bg-gray-50 transition-colors ${size === 'sm' ? 'text-xs' : 'text-sm'} ${!value ? 'bg-gray-50 font-medium text-gray-600' : ''}`}
            >
              {resolvedPlaceholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${size === 'sm' ? 'text-xs' : 'text-sm'} ${value === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
