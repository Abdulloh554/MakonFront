'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X } from 'lucide-react'
import type { FloorPlan } from '@/types'

interface FloorPlanViewProps {
  plan: FloorPlan
  onClose: () => void
}

export default function FloorPlanView({ plan, onClose }: FloorPlanViewProps) {
  const [currentFloor, setCurrentFloor] = useState(plan.floors[0]?.id ?? '')
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  const floor = plan.floors.find((f) => f.id === currentFloor) ?? plan.floors[0]
  const room = selectedRoom ? floor?.rooms.find((r) => r.id === selectedRoom) : null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
        onClick={selectedRoom ? () => setSelectedRoom(null) : onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative w-full max-w-5xl max-h-[90dvh] mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-lg rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={selectedRoom ? () => setSelectedRoom(null) : onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {selectedRoom ? room?.name : floor?.name}
              </h3>
              <p className="text-[11px] text-white/60">
                {selectedRoom ? `${floor?.name} — ${room?.name}` : `${plan.floors.length} qavat`}
              </p>
            </div>
          </div>

          {/* Floor switcher */}
          {!selectedRoom && plan.floors.length > 1 && (
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              {plan.floors.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setCurrentFloor(f.id); setSelectedRoom(null) }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    f.id === currentFloor
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {selectedRoom && (
            <button
              onClick={() => setSelectedRoom(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="relative flex-1 bg-black min-h-[50dvh] overflow-hidden rounded-b-2xl">
          <AnimatePresence mode="wait">
            {!selectedRoom ? (
              <motion.div
                key={`floor_${currentFloor}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full flex flex-col items-center justify-center gap-4 p-6"
              >
                {floor?.rooms.length === 0 && (
                  <p className="text-white/40 text-sm">Xonalar mavjud emas</p>
                )}
                {floor?.rooms.map((r) => (
                  <motion.button
                    key={r.id}
                    onClick={() => setSelectedRoom(r.id)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full max-w-xs px-6 py-4 rounded-2xl text-base font-semibold text-white text-center transition-colors"
                    style={{
                      background: 'linear-gradient(135deg, #185FA5 0%, #378ADD 100%)',
                      boxShadow: '0 8px 24px rgba(24,95,165,0.3)',
                    }}
                  >
                    {r.name}
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`room_${selectedRoom}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={room?.image}
                  alt={room?.name}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
