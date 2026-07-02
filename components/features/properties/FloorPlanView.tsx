'use client'

import { useState } from 'react'
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
      <div className="absolute inset-0 animate-fade-in" onClick={selectedRoom ? () => setSelectedRoom(null) : onClose} />

      <div
        className="relative w-full max-w-5xl max-h-[90dvh] mx-4 flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="relative flex-1 bg-black min-h-[50dvh] overflow-hidden rounded-b-2xl">
          {!selectedRoom ? (
            <div key={`floor_${currentFloor}`} className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 animate-fade-in">
              {floor?.rooms.length === 0 && (
                <p className="text-white/40 text-sm">Xonalar mavjud emas</p>
              )}
              {floor?.rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoom(r.id)}
                  className="w-full max-w-xs px-6 py-4 rounded-2xl text-base font-semibold text-white text-center transition-transform hover:scale-[1.04] active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #185FA5 0%, #378ADD 100%)',
                    boxShadow: '0 8px 24px rgba(24,95,165,0.3)',
                  }}
                >
                  {r.name}
                </button>
              ))}
            </div>
          ) : (
            <div key={`room_${selectedRoom}`} className="relative w-full h-full flex items-center justify-center animate-fade-in">
              <img
                src={room?.image}
                alt={room?.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
