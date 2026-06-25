import { usePropertyStore } from '@/store/property.store'

describe('property.store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usePropertyStore.setState({
      filters: { dealType: 'all', propertyType: 'all', status: 'all', search: '', page: 1, limit: 20 },
      selectedPropertyId: null,
      mapCenter: { lat: 41.2995, lng: 69.2401 },
      mapZoom: 12,
    })
  })

  it('has correct initial state with default filters', () => {
    const state = usePropertyStore.getState()
    expect(state.filters).toEqual({
      dealType: 'all',
      propertyType: 'all',
      status: 'all',
      search: '',
      page: 1,
      limit: 20,
    })
    expect(state.selectedPropertyId).toBeNull()
    expect(state.mapCenter).toEqual({ lat: 41.2995, lng: 69.2401 })
    expect(state.mapZoom).toBe(12)
  })

  it('setFilters updates filters with partial data', () => {
    usePropertyStore.getState().setFilters({ dealType: 'sale', search: 'apartment' })
    const state = usePropertyStore.getState()
    expect(state.filters.dealType).toBe('sale')
    expect(state.filters.search).toBe('apartment')
    expect(state.filters.propertyType).toBe('all')
    expect(state.filters.page).toBe(1)
  })

  it('setFilters resets page to 1 when not provided', () => {
    usePropertyStore.setState({ filters: { ...usePropertyStore.getState().filters, page: 5 } })
    usePropertyStore.getState().setFilters({ search: 'test' })
    expect(usePropertyStore.getState().filters.page).toBe(1)
  })

  it('setFilters keeps provided page value', () => {
    usePropertyStore.getState().setFilters({ page: 3 })
    expect(usePropertyStore.getState().filters.page).toBe(3)
  })

  it('resetFilters restores default filters', () => {
    usePropertyStore.getState().setFilters({ dealType: 'rent', search: 'house', page: 2 })
    usePropertyStore.getState().resetFilters()
    const state = usePropertyStore.getState()
    expect(state.filters).toEqual({
      dealType: 'all',
      propertyType: 'all',
      status: 'all',
      search: '',
      page: 1,
      limit: 20,
    })
  })

  it('selectProperty sets selectedPropertyId', () => {
    usePropertyStore.getState().selectProperty('prop-1')
    expect(usePropertyStore.getState().selectedPropertyId).toBe('prop-1')

    usePropertyStore.getState().selectProperty(null)
    expect(usePropertyStore.getState().selectedPropertyId).toBeNull()
  })

  it('setMapCenter updates map center', () => {
    usePropertyStore.getState().setMapCenter({ lat: 41.3, lng: 69.2 })
    expect(usePropertyStore.getState().mapCenter).toEqual({ lat: 41.3, lng: 69.2 })
  })

  it('setMapZoom updates map zoom', () => {
    usePropertyStore.getState().setMapZoom(15)
    expect(usePropertyStore.getState().mapZoom).toBe(15)
  })
})
