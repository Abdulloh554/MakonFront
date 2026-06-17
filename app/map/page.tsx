'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import PropertyModal from '@/components/features/properties/PropertyModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const MapView = dynamic(() => import('@/components/features/map/MapView'), { ssr: false })
import { getProperties, syncProperties } from '@/store'
import { useHydrated } from '@/hooks/useHydrated'
import type { Property } from '@/types'

export default function MapPage() {
  const hydrated = useHydrated()
  const [properties, setProperties] = useState<Property[]>(() => getProperties())

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
    <div className="flex-1 flex flex-col pb-20 lg:pb-0">
      <MapView properties={properties} onMarkerClick={setSelectedProperty} />
      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  )
}
