'use client'

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n/I18nContext'
import dynamic from 'next/dynamic'
import PropertyModal from '@/components/features/properties/PropertyModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import MapPropertyPanel from '@/components/features/map/MapPropertyPanel'
import type { MapViewHandle } from '@/components/features/map/MapView'

const MapView = dynamic(() => import('@/components/features/map/MapView'), { ssr: false })
import { getProperties, syncProperties } from '@/store'
import { useHydrated } from '@/hooks/useHydrated'
import type { Property } from '@/types'

export default function MapPage() {
  const { t } = useI18n()
  const hydrated = useHydrated()
  const [properties, setProperties] = useState<Property[]>(() => getProperties())
  const mapRef = useRef<MapViewHandle>(null)

  useEffect(() => {
    if (!hydrated) return
    let active = true
    syncProperties().then((synced) => {
      if (active) setProperties(synced)
    })
    return () => { active = false }
  }, [hydrated])

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  if (!hydrated) {
    return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
  }

  return (
    <div className="flex-1 flex flex-col pb-20 lg:pb-0 relative">
      <div className="absolute inset-0">
        <MapView ref={mapRef} properties={properties} onMarkerClick={setSelectedProperty} />
      </div>
      <MapPropertyPanel
        properties={properties}
        onLocate={(p) => {
          if (p.location?.lat && p.location?.lng) {
            mapRef.current?.flyTo(p.location.lat, p.location.lng)
          }
        }}
      />
      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  )
}
