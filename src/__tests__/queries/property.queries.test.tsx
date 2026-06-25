import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  useProperties,
  useProperty,
  useMyProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useInfiniteProperties,
} from '@/queries/property.queries'
import { propertyApi } from '@/services/api'

vi.mock('@/services/api', () => ({
  propertyApi: {
    list: vi.fn(),
    detail: vi.fn(),
    mine: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/store/ui.store', () => ({
  useUiStore: vi.fn((selector) => {
    const state = {
      addToast: vi.fn(),
    }
    return selector ? selector(state) : state
  }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

const mockProperties = [
  {
    id: '1', title: 'Property 1', price: 100000,
    type: 'apartment' as const, dealType: 'sale' as const, status: 'ready' as const,
    rooms: 2, area: 50,
    location: { lat: 41.3, lng: 69.2, address: 'Test', city: 'Tashkent' },
    images: [], views: 0, favorites: [], isActive: true,
    sellerId: 'seller-1',
    description: 'desc',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  },
]

describe('useProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns query with correct key and fetcher', async () => {
    vi.mocked(propertyApi.list).mockResolvedValue(mockProperties)

    const { result } = renderHook(
      () => useProperties({ dealType: 'all', propertyType: 'all', status: 'all', search: '', page: 1, limit: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(propertyApi.list).toHaveBeenCalledWith({
      dealType: 'all', propertyType: 'all', status: 'all', search: '', page: 1, limit: 20,
    })
    expect(result.current.data).toEqual(mockProperties)
  })

  it('returns loading state initially', () => {
    vi.mocked(propertyApi.list).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(
      () => useProperties({ dealType: 'all', propertyType: 'all', status: 'all', search: '', page: 1, limit: 20 }),
      { wrapper: createWrapper() },
    )

    expect(result.current.isLoading).toBe(true)
  })

  it('handles error state', async () => {
    vi.mocked(propertyApi.list).mockRejectedValue(new Error('Failed to fetch'))

    const { result } = renderHook(
      () => useProperties({ dealType: 'all', propertyType: 'all', status: 'all', search: '', page: 1, limit: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })

  it('returns empty array when no data', async () => {
    vi.mocked(propertyApi.list).mockResolvedValue([])

    const { result } = renderHook(
      () => useProperties({ dealType: 'all', propertyType: 'all', status: 'all', search: '', page: 1, limit: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns detail query with correct fetcher', async () => {
    vi.mocked(propertyApi.detail).mockResolvedValue(mockProperties[0])

    const { result } = renderHook(
      () => useProperty('1'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(propertyApi.detail).toHaveBeenCalledWith('1')
    expect(result.current.data).toEqual(mockProperties[0])
  })

  it('is disabled when id is empty', () => {
    const { result } = renderHook(
      () => useProperty(''),
      { wrapper: createWrapper() },
    )

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useMyProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns query with correct fetcher', async () => {
    vi.mocked(propertyApi.mine).mockResolvedValue(mockProperties)

    const { result } = renderHook(
      () => useMyProperties(),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(propertyApi.mine).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockProperties)
  })
})

describe('useCreateProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct mutation', async () => {
    vi.mocked(propertyApi.create).mockResolvedValue(mockProperties[0])

    const { result } = renderHook(
      () => useCreateProperty(),
      { wrapper: createWrapper() },
    )

    const data = {
      title: 'New Prop', price: 100000, type: 'apartment' as const,
      dealType: 'sale' as const,
      location: { lat: 41.3, lng: 69.2, address: 'Test', city: 'Tashkent' },
    }

    result.current.mutate(data)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(propertyApi.create).toHaveBeenCalledWith(data)
  })
})

describe('useUpdateProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct mutation', async () => {
    vi.mocked(propertyApi.update).mockResolvedValue(mockProperties[0])

    const { result } = renderHook(
      () => useUpdateProperty('1'),
      { wrapper: createWrapper() },
    )

    result.current.mutate({ title: 'Updated' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(propertyApi.update).toHaveBeenCalledWith('1', { title: 'Updated' })
  })
})

describe('useDeleteProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct mutation', async () => {
    vi.mocked(propertyApi.delete).mockResolvedValue(undefined)

    const { result } = renderHook(
      () => useDeleteProperty(),
      { wrapper: createWrapper() },
    )

    result.current.mutate('1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(propertyApi.delete).toHaveBeenCalledWith('1')
  })
})

describe('useInfiniteProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns infinite query with correct fetcher', async () => {
    vi.mocked(propertyApi.list).mockResolvedValue(mockProperties)

    const { result } = renderHook(
      () => useInfiniteProperties({ dealType: 'all', propertyType: 'all', status: 'all', search: '' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(propertyApi.list).toHaveBeenCalledWith({
      dealType: 'all', propertyType: 'all', status: 'all', search: '', page: 1, limit: 20,
    })
    expect(result.current.data?.pages[0]).toEqual(mockProperties)
  })

  it('has hasNextPage as false when page has less than 20 items', async () => {
    vi.mocked(propertyApi.list).mockResolvedValue(mockProperties)

    const { result } = renderHook(
      () => useInfiniteProperties({ dealType: 'all', propertyType: 'all', status: 'all', search: '' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(false)
  })
})
