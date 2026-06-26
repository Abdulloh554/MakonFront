import {
  getAdminUser, setAdminUser, clearAdminUser, isAdminLoggedIn, adminLogout,
  apiAdminLogin, apiAdminStats, apiAdminUsers, apiAdminUser, apiAdminDeleteUser,
  apiAdminProperties, apiAdminDeleteProperty, apiAdminSellers, apiAdminDeleteSeller,
  apiAdminMessages, apiAdminReviews,
} from '@/services/admin'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  vi.clearAllMocks()
  clearAdminUser()
})

function mockAdminResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({ success: true, data }),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
  } as unknown as Response
}

function mockAdminErrorResponse(status: number, message: string) {
  return {
    ok: false,
    status,
    json: vi.fn().mockResolvedValue({ error: { message } }),
    headers: new Headers(),
    redirected: false,
    statusText: status === 401 ? 'Unauthorized' : status === 500 ? 'Internal Server Error' : 'Error',
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
  } as unknown as Response
}

// ─── In-memory user management ──────────────────────────────────────────

describe('admin service - in-memory user', () => {
  it('getAdminUser returns null initially', () => {
    expect(getAdminUser()).toBeNull()
  })

  it('setAdminUser stores user in memory', () => {
    const user = { id: 'admin-1', username: 'admin' }
    setAdminUser(user)
    expect(getAdminUser()).toEqual(user)
  })

  it('clearAdminUser clears user', () => {
    setAdminUser({ id: 'admin-1' })
    clearAdminUser()
    expect(getAdminUser()).toBeNull()
  })

  it('isAdminLoggedIn returns false when no user', () => {
    expect(isAdminLoggedIn()).toBe(false)
  })

  it('isAdminLoggedIn returns true when user is set', () => {
    setAdminUser({ id: 'admin-1' })
    expect(isAdminLoggedIn()).toBe(true)
  })

  it('adminLogout clears user', () => {
    setAdminUser({ id: 'admin-1' })
    adminLogout()
    expect(getAdminUser()).toBeNull()
    expect(isAdminLoggedIn()).toBe(false)
  })
})

// ─── API functions ───────────────────────────────────────────────────────

describe('apiAdminLogin', () => {
  it('correctly authenticates and stores admin user', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ user: { id: 'admin-1', username: 'admin' } }))
    const result = await apiAdminLogin('admin', 'password')
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/admin/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password' }),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        credentials: 'include',
      }),
    )
    expect(result.user).toEqual({ id: 'admin-1', username: 'admin' })
    expect(getAdminUser()).toEqual({ id: 'admin-1', username: 'admin' })
  })
})

describe('apiAdminStats', () => {
  it('returns stats', async () => {
    const stats = {
      users: 100, sellers: 20, properties: 500,
      activeListings: 300, messages: 1000, reviews: 50, totalViews: 50000,
    }
    mockFetch.mockResolvedValue(mockAdminResponse(stats))
    const result = await apiAdminStats()
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/admin/stats',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    )
    expect(result).toEqual(stats)
  })
})

describe('apiAdminUsers', () => {
  it('paginates with default params', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ data: [{ id: 'user-1' }], total: 1, page: 1, totalPages: 1 }))
    const result = await apiAdminUsers()
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/users?page=1&limit=20', expect.any(Object))
    expect(result.data).toEqual([{ id: 'user-1' }])
    expect(result.total).toBe(1)
  })

  it('paginates with custom params', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ data: [], total: 0, page: 2, totalPages: 0 }))
    await apiAdminUsers(2, 50)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/users?page=2&limit=50', expect.any(Object))
  })
})

describe('apiAdminUser', () => {
  it('fetches a single user by id', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ id: 'user-1', name: 'John' }))
    const result = await apiAdminUser('user-1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/users/user-1', expect.any(Object))
    expect(result).toEqual({ id: 'user-1', name: 'John' })
  })
})

describe('apiAdminDeleteUser', () => {
  it('deletes a user', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ id: 'user-1', deleted: true }))
    const result = await apiAdminDeleteUser('user-1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/users/user-1', expect.objectContaining({ method: 'DELETE' }))
    expect(result).toEqual({ id: 'user-1', deleted: true })
  })
})

describe('apiAdminProperties', () => {
  it('fetches properties with filters', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ data: [], total: 0, page: 1, totalPages: 0 }))
    await apiAdminProperties(1, 10, { status: 'active' })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('page=1')
    expect(url).toContain('limit=10')
    expect(url).toContain('status=active')
  })
})

describe('apiAdminDeleteProperty', () => {
  it('deletes a property', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ id: 'prop-1', deleted: true }))
    const result = await apiAdminDeleteProperty('prop-1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/properties/prop-1', expect.objectContaining({ method: 'DELETE' }))
    expect(result).toEqual({ id: 'prop-1', deleted: true })
  })
})

describe('apiAdminSellers', () => {
  it('fetches paginated sellers', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ data: [{ id: 'seller-1' }], total: 1, page: 1, totalPages: 1 }))
    const result = await apiAdminSellers()
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/sellers?page=1&limit=20', expect.any(Object))
    expect(result.data).toEqual([{ id: 'seller-1' }])
  })
})

describe('apiAdminDeleteSeller', () => {
  it('deletes a seller', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ id: 'seller-1', deleted: true }))
    await apiAdminDeleteSeller('seller-1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/sellers/seller-1', expect.objectContaining({ method: 'DELETE' }))
  })
})

describe('apiAdminMessages', () => {
  it('fetches paginated messages', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ data: [{ id: 'msg-1' }], total: 1, page: 1, totalPages: 1 }))
    const result: unknown = await apiAdminMessages()
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/messages?page=1&limit=20', expect.any(Object))
    void result
  })
})

describe('apiAdminReviews', () => {
  it('fetches paginated reviews', async () => {
    mockFetch.mockResolvedValue(mockAdminResponse({ data: [{ id: 'rev-1' }], total: 1, page: 1, totalPages: 1 }))
    const result: unknown = await apiAdminReviews()
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/admin/reviews?page=1&limit=20', expect.any(Object))
    void result
  })
})

// ─── Error handling ──────────────────────────────────────────────────────

describe('admin error handling', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
  })

  it('redirects to /admin on 401', async () => {
    mockFetch.mockResolvedValue(mockAdminErrorResponse(401, 'Unauthorized'))
    await expect(apiAdminStats()).rejects.toThrow('Sessiya tugagan. Qaytadan kiring.')
    expect(window.location.href).toBe('/admin')
  })

  it('redirects to /admin on 403', async () => {
    mockFetch.mockResolvedValue(mockAdminErrorResponse(403, 'Forbidden'))
    await expect(apiAdminStats()).rejects.toThrow('Sessiya tugagan. Qaytadan kiring.')
    expect(window.location.href).toBe('/admin')
  })

  it('throws generic error message on other failures', async () => {
    mockFetch.mockResolvedValue(mockAdminErrorResponse(500, 'Server error'))
    await expect(apiAdminStats()).rejects.toThrow('Server error')
  })

  it('handles non-JSON error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new SyntaxError('Bad JSON')),
      headers: new Headers(),
      redirected: false,
      statusText: 'Internal Server Error',
      type: 'basic',
      url: '',
      clone: vi.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: vi.fn(),
      blob: vi.fn(),
      formData: vi.fn(),
      text: vi.fn(),
    } as unknown as Response)

    await expect(apiAdminStats()).rejects.toThrow('Internal Server Error')
  })

  it('clears admin user on 401', async () => {
    setAdminUser({ id: 'admin-1' })
    mockFetch.mockResolvedValue(mockAdminErrorResponse(401, 'Unauthorized'))
    await expect(apiAdminStats()).rejects.toThrow()
    expect(getAdminUser()).toBeNull()
  })
})
