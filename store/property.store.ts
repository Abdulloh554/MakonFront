/**
 * @file property.store.ts
 * @layer Store
 * @responsibility Property filters, map state, selected property
 */

import { create } from 'zustand'
import type { PropertyFilters } from '@shared/types/property.types'

interface PropertyState {
  filters: PropertyFilters
  selectedPropertyId: string | null
  mapCenter: { lat: number; lng: number }
  mapZoom: number

  setFilters: (filters: Partial<PropertyFilters>) => void
  resetFilters: () => void
  selectProperty: (id: string | null) => void
  setMapCenter: (center: { lat: number; lng: number }) => void
  setMapZoom: (zoom: number) => void
}

const defaultFilters: PropertyFilters = {
  dealType: 'all',
  propertyType: 'all',
  status: 'all',
  search: '',
  page: 1,
  limit: 20,
}

export const usePropertyStore = create<PropertyState>((set) => ({
  filters: { ...defaultFilters },
  selectedPropertyId: null,
  mapCenter: { lat: 41.2995, lng: 69.2401 },
  mapZoom: 12,

  setFilters: (updates) =>
    set((state) => ({
      filters: { ...state.filters, ...updates, page: updates.page ?? 1 },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  selectProperty: (id) => set({ selectedPropertyId: id }),

  setMapCenter: (center) => set({ mapCenter: center }),

  setMapZoom: (zoom) => set({ mapZoom: zoom }),
}))
