/**
 * @file property.queries.ts
 * @layer Queries
 * @responsibility Property-related TanStack Query hooks — useProperties, useProperty, useInfiniteProperties
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyApi } from '@/services/api'
import type { PropertyFilters, CreatePropertyRequest } from '@shared/types/property.types'
import { useUiStore } from '@/store/ui.store'

const PROPERTY_KEYS = {
  all: ['properties'] as const,
  list: (filters: PropertyFilters) => ['properties', 'list', filters] as const,
  detail: (id: string) => ['properties', 'detail', id] as const,
  mine: ['properties', 'mine'] as const,
}

export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: PROPERTY_KEYS.list(filters),
    queryFn: () => propertyApi.list(filters),
    staleTime: 1000 * 60 * 2,
  })
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: PROPERTY_KEYS.detail(id),
    queryFn: () => propertyApi.detail(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  })
}

export function useInfiniteProperties(filters: Omit<PropertyFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['properties', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      propertyApi.list({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  const addToast = useUiStore((s) => s.addToast)

  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => propertyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all })
      addToast({ type: 'success', message: 'Property created successfully' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient()
  const addToast = useUiStore((s) => s.addToast)

  return useMutation({
    mutationFn: (data: Partial<CreatePropertyRequest>) => propertyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(id) })
      addToast({ type: 'success', message: 'Property updated successfully' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  const addToast = useUiStore((s) => s.addToast)

  return useMutation({
    mutationFn: (id: string) => propertyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all })
      addToast({ type: 'success', message: 'Property deleted successfully' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => propertyApi.featured(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useMyProperties() {
  return useQuery({
    queryKey: PROPERTY_KEYS.mine,
    queryFn: () => propertyApi.mine(),
    staleTime: 1000 * 60 * 2,
  })
}
