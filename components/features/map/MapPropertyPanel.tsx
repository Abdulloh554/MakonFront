'use client'

import { useState, useRef, useEffect } from 'react'
import { Layers, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PropertyMiniCard from '@/components/features/properties/PropertyMiniCard'
import PropertyModal from '@/components/features/properties/PropertyModal'
import type { Property } from '@/types'

interface MapPropertyPanelProps {
  properties: Property[]
  onLocate: (property: Property) => void
}

export default function MapPropertyPanel({ properties, onLocate }: MapPropertyPanelProps) {
  const [open, setOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <>
      {/* Toggle button */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000]">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
          style={{
            background: open
              ? 'linear-gradient(135deg, #185FA5, #378ADD)'
              : 'var(--glass-panel-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: open ? 'white' : 'var(--gray-900)',
            border: open ? 'none' : '1.5px solid var(--gray-200)',
            boxShadow: open
              ? '0 6px 20px rgba(24,95,165,0.35)'
              : '0 4px 12px rgba(15,23,42,0.10)',
          }}
        >
          <Layers className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: -320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -320 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="absolute left-4 top-4 bottom-4 z-[1001] flex flex-col w-80 max-w-[85vw] rounded-2xl overflow-hidden"
            style={{
              background: 'var(--glass-panel-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 40px rgba(15,23,42,0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Elonlar ro&apos;yxati</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {properties.length} ta elon
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* Card list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {properties.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400 font-medium">
                  Hech qanday elon topilmadi
                </div>
              ) : (
                properties.map((p) => (
                  <PropertyMiniCard
                    key={p.id}
                    property={p}
                    onLocate={(prop) => {
                      onLocate(prop)
                      setOpen(false)
                    }}
                    onClick={() => setSelectedProperty(p)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Property modal */}
      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </>
  )
}
