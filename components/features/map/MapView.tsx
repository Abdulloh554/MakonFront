'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Crosshair } from 'lucide-react'
import type { Property } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/ToastProvider'

const defaultCenter: [number, number] = [41.3111, 69.2797]

interface MapViewProps {
  properties: Property[]
  onMarkerClick: (property: Property) => void
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M$`
  if (price >= 1000) return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K$`
  return `${price}$`
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px">
        <div style="
          position:absolute;inset:0;
          background:rgba(24,95,165,0.2);
          border-radius:50%;
          animation:ping-user 1.8s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position:absolute;inset:3px;
          background:#185FA5;
          border:2.5px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(24,95,165,0.4);
        "></div>
      </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export default function MapView({ properties, onMarkerClick }: MapViewProps) {
  const { showToast } = useToast()
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const userMarkerRef = useRef<L.Marker | null>(null)
  const userCircleRef = useRef<L.Circle | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showNearby, setShowNearby] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nearbyIds, setNearbyIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    const markers = markersRef.current

    const displayed =
      showNearby && userLocation
        ? properties.filter((p) => nearbyIds.has(p.id))
        : properties

    const displayedIds = new Set(displayed.map((p) => p.id))
    for (const [id, marker] of markers.entries()) {
      if (!displayedIds.has(id)) {
        marker.remove()
        markers.delete(id)
      }
    }

    for (const p of displayed) {
      if (!p.location?.lat || !p.location?.lng) continue

      const price = formatPrice(p.price)
      const isActive = selectedId === p.id

      const existingMarker = markers.get(p.id)
      if (existingMarker && map.hasLayer(existingMarker)) {
        const element = existingMarker.getElement()
        if (element) {
          const markerDiv = element.querySelector('.map-price-badge')
          if (markerDiv) {
            if (isActive) markerDiv.classList.add('active')
            else markerDiv.classList.remove('active')
          }
        }
        existingMarker.setZIndexOffset(isActive ? 1000 : 0)
        continue
      }

      const priceIcon = L.divIcon({
        className: 'map-price-wrapper',
        html: `<div class="map-price-badge ${isActive ? 'active' : ''}">${price}</div>`,
        iconSize: [72, 34],
        iconAnchor: [36, 17],
      })

      const marker = L.marker([p.location.lat, p.location.lng], { icon: priceIcon })
        .addTo(map)
        .on('click', (e) => {
          if (e.originalEvent) e.originalEvent.stopPropagation()
          setSelectedId(p.id)
          onMarkerClick(p)
        })

      if (isActive) marker.setZIndexOffset(1000)
      markers.set(p.id, marker)
    }
  }, [properties, showNearby, userLocation, nearbyIds, selectedId, onMarkerClick])

  function findNearby() {
    if (showNearby) {
      setShowNearby(false)
      setNearbyIds(new Set())
      return
    }
    setLoading(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLocation(loc)
          setShowNearby(true)
          mapRef.current?.setView([loc.lat, loc.lng], 13)

          const sorted = [...properties].sort((a, b) => {
            const distA = getDistance(loc.lat, loc.lng, a.location.lat, a.location.lng)
            const distB = getDistance(loc.lat, loc.lng, b.location.lat, b.location.lng)
            return distA - distB
          })

          setNearbyIds(new Set(sorted.slice(0, 20).map((p) => p.id)))
          setLoading(false)
        },
        () => {
          showToast('Geolokatsiya yoqilmagan yoki mavjud emas', 'error')
          setLoading(false)
        },
        { enableHighAccuracy: true },
      )
    } else {
      showToast("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi", 'error')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!mapRef.current || !userLocation) return
    const map = mapRef.current

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
      }).addTo(map)
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
    }

    if (!userCircleRef.current) {
      userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: 600,
        color: '#185FA5',
        fillColor: '#185FA5',
        fillOpacity: 0.06,
        weight: 1.5,
        opacity: 0.25,
      }).addTo(map)
    } else {
      userCircleRef.current.setLatLng([userLocation.lat, userLocation.lng])
    }
  }, [userLocation])

  return (
    <div className="relative flex-1">
      <style>{`
        @keyframes ping-user {
          0%   { transform: scale(1); opacity: 0.6; }
          75%  { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        .map-price-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .map-price-badge {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(10px);
          color: #0f172a;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12.5px;
          font-weight: 800;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #e2e8f0;
          border-radius: 9999px;
          box-sizing: border-box;
          box-shadow:
            0 4px 12px rgba(15,23,42,0.10),
            0 1px 3px rgba(15,23,42,0.06);
          white-space: nowrap;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          cursor: pointer;
          user-select: none;
          letter-spacing: -0.01em;
        }

        .map-price-badge:hover {
          transform: scale(1.07) translateY(-1px);
          border-color: #378ADD;
          box-shadow:
            0 8px 20px rgba(59,130,246,0.18),
            0 2px 6px rgba(15,23,42,0.08);
        }

        .map-price-badge.active {
          background: linear-gradient(135deg, #185FA5, #378ADD);
          color: #ffffff;
          border-color: transparent;
          box-shadow:
            0 8px 24px rgba(24,95,165,0.38),
            0 2px 8px rgba(24,95,165,0.20);
          transform: scale(1.1) translateY(-2px);
        }

        .map-price-badge.active:hover {
          transform: scale(1.14) translateY(-2px);
        }

        .leaflet-container {
          font-family: 'Inter', system-ui, sans-serif !important;
        }
      `}</style>

      {/* Nearby button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={findNearby}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold disabled:opacity-50 transition-all"
          style={{
            background: showNearby
              ? 'linear-gradient(135deg, #185FA5, #378ADD)'
              : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: showNearby ? 'white' : '#0f172a',
            border: showNearby ? 'none' : '1.5px solid rgba(226,232,240,0.9)',
            boxShadow: showNearby
              ? '0 8px 24px rgba(24,95,165,0.35)'
              : '0 4px 16px rgba(15,23,42,0.12)',
          }}
        >
          <Crosshair
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            style={{ color: showNearby ? 'white' : '#185FA5' }}
          />
          {loading ? 'Topilmoqda...' : showNearby ? 'Yaqin elonlar' : 'Menga yaqin'}
        </motion.button>
      </div>

      {/* Location status */}
      <AnimatePresence>
        {userLocation && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              color: '#059669',
              border: '1px solid rgba(5,150,105,0.2)',
              boxShadow: '0 2px 10px rgba(15,23,42,0.10)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#34d399', boxShadow: '0 0 0 3px rgba(52,211,153,0.2)' }}
            />
            Joylashuv aniqlandi
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map container */}
      <div className="absolute inset-0">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
