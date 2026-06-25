const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  vi.resetAllMocks()
})

// Dynamically import with fresh module state
async function freshApi() {
  vi.resetModules()
  return import('@/services/api')
}

// ─── Helper factories ────────────────────────────────────────────────────

function mockApiResponse<T>(data: T): Response {
  return {
    ok: true, status: 200,
    json: vi.fn().mockResolvedValue({ success: true, data }),
    headers: new Headers(), redirected: false, statusText: 'OK',
    type: 'basic', url: '', clone: vi.fn(), body: null, bodyUsed: false,
    arrayBuffer: vi.fn(), blob: vi.fn(), formData: vi.fn(), text: vi.fn(),
  } as unknown as Response
}

function mockErrorResponse(): Response {
  return {
    ok: false, status: 500,
    json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    headers: new Headers(), redirected: false, statusText: 'Internal Server Error',
    type: 'basic', url: '', clone: vi.fn(), body: null, bodyUsed: false,
    arrayBuffer: vi.fn(), blob: vi.fn(), formData: vi.fn(), text: vi.fn(),
  } as unknown as Response
}

function mockApiError(code: string, message: string): Response {
  return {
    ok: false, status: 400,
    json: vi.fn().mockResolvedValue({ success: false, error: { code, message } }),
    headers: new Headers(), redirected: false, statusText: 'Bad Request',
    type: 'basic', url: '', clone: vi.fn(), body: null, bodyUsed: false,
    arrayBuffer: vi.fn(), blob: vi.fn(), formData: vi.fn(), text: vi.fn(),
  } as unknown as Response
}

function mockResponse(status: number, body: unknown, ok?: boolean): Response {
  return {
    ok: ok ?? (status >= 200 && status < 300), status,
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers(), redirected: false, statusText: status === 200 ? 'OK' : 'Error',
    type: 'basic', url: '', clone: vi.fn(), body: null, bodyUsed: false,
    arrayBuffer: vi.fn(), blob: vi.fn(), formData: vi.fn(), text: vi.fn(),
  } as unknown as Response
}

// ─── CSRF Token ──────────────────────────────────────────────────────────

describe('CSRF Token management', () => {
  it('setCsrfToken stores token', async () => {
    const { setCsrfToken, getCsrfToken } = await freshApi()
    setCsrfToken('test-token')
    expect(getCsrfToken()).toBe('test-token')
  })
  it('clearCsrfToken removes token', async () => {
    const { setCsrfToken, getCsrfToken, clearCsrfToken } = await freshApi()
    setCsrfToken('test-token')
    clearCsrfToken()
    expect(getCsrfToken()).toBeNull()
  })
  it('getCsrfToken returns null initially', async () => {
    const { getCsrfToken } = await freshApi()
    expect(getCsrfToken()).toBeNull()
  })
})

// ─── request() ──────────────────────────────────────────────────────────

describe('API request()', () => {
  it('sends Content-Type header', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: '1' }))
    await authApi.me()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    )
  })

  it('sends X-CSRF-Token header when csrfToken is set', async () => {
    const { propertyApi, setCsrfToken } = await freshApi()
    setCsrfToken('csrf-abc')
    mockFetch.mockResolvedValue(mockApiResponse([]))
    await propertyApi.list()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: expect.objectContaining({ 'X-CSRF-Token': 'csrf-abc' }) }),
    )
  })

  it('sends credentials: include', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: '1' }))
    await authApi.me()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('throws ApiClientError on non-ok response', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiError('VALIDATION_ERROR', 'Invalid input'))
    await expect(authApi.me()).rejects.toThrow('Invalid input')
  })

  it('throws ApiClientError on 500 with fallback message', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockErrorResponse())
    await expect(authApi.me()).rejects.toThrow('Request failed with status 500')
  })

  it('handles 204 no content', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockResponse(204, null))
    const result = await authApi.logout()
    expect(result).toBeUndefined()
  })

  it('throws on unsuccessful response structure', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockResponse(200, { success: false, error: { code: 'ERROR', message: 'Not successful' } }, true))
    await expect(authApi.me()).rejects.toThrow('Not successful')
  })
})

// ─── 401 Auto-Refresh ──────────────────────────────────────────────────

describe('401 auto-refresh', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' }, writable: true,
    })
  })

  it('refreshes session on 401 and retries', async () => {
    const { messageApi, setCsrfToken, getCsrfToken } = await freshApi()
    setCsrfToken('old-csrf')

    mockFetch
      .mockResolvedValueOnce(mockResponse(401, {
        success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      }, false))
      .mockResolvedValueOnce(mockApiResponse({ csrfToken: 'new-csrf', user: { id: '1' } }))
      .mockResolvedValueOnce(mockApiResponse([{ id: 'conv-1' }]))

    const result = await messageApi.conversations()

    expect(getCsrfToken()).toBe('new-csrf')
    expect(result).toEqual([{ id: 'conv-1' }])
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('redirects to /profile if refresh fails on 401', async () => {
    const { messageApi, setCsrfToken } = await freshApi()
    setCsrfToken('old-csrf')

    mockFetch
      .mockResolvedValueOnce(mockResponse(401, {
        success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      }, false))
      .mockResolvedValueOnce(mockApiError('REFRESH_FAILED', 'No'))

    await expect(messageApi.conversations()).rejects.toThrow('Session expired')
    expect(window.location.href).toBe('/profile')
  })

  it('deduplicates concurrent refresh calls', async () => {
    const { propertyApi, setCsrfToken } = await freshApi()
    setCsrfToken('old-csrf')

    mockFetch
      .mockResolvedValueOnce(mockResponse(401, {
        success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      }, false))
      .mockResolvedValueOnce(mockResponse(401, {
        success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      }, false))
      .mockResolvedValueOnce(mockApiResponse({ csrfToken: 'refreshed', user: { id: '1' } }))
      .mockResolvedValueOnce(mockApiResponse({ id: '1' }))
      .mockResolvedValueOnce(mockApiResponse({ id: '2' }))

    const [res1, res2] = await Promise.all([
      propertyApi.create({ title: 'P1', price: 100000, type: 'apartment' as const, dealType: 'sale' as const, location: { lat: 0, lng: 0, address: 'A', city: 'C' } }),
      propertyApi.create({ title: 'P2', price: 200000, type: 'apartment' as const, dealType: 'sale' as const, location: { lat: 0, lng: 0, address: 'B', city: 'C' } }),
    ])

    const refreshCalls = mockFetch.mock.calls.filter(
      (call: unknown[]) => (call[0] as string).includes('/auth/refresh'),
    )
    expect(refreshCalls.length).toBe(1)
    expect(res1).toEqual({ id: '1' })
    expect(res2).toEqual({ id: '2' })
  })
})

// ─── authApi ─────────────────────────────────────────────────────────────

describe('authApi', () => {
  it('login calls correct endpoint with body', async () => {
    const { authApi, getCsrfToken } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ user: { id: '1' }, csrfToken: 'csrf-1' }))
    const result = await authApi.login('+998901234567', 'mypass')
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/auth/login',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ phone: '+998901234567', password: 'mypass' }) }),
    )
    expect(result.user.id).toBe('1')
    expect(result.csrfToken).toBe('csrf-1')
    expect(getCsrfToken()).toBe('csrf-1')
  })

  it('register calls correct endpoint', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ user: { id: '2' }, csrfToken: 'csrf-2' }))
    const result = await authApi.register('Jane', 'Doe', '+998901234567', 'pass')
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/auth/register',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ firstName: 'Jane', lastName: 'Doe', phone: '+998901234567', password: 'pass' }) }),
    )
    expect(result.user.id).toBe('2')
  })

  it('me returns user data', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: '1', name: 'John' }))
    const user = await authApi.me()
    expect(user).toEqual({ id: '1', name: 'John' })
  })

  it('logout clears CSRF token', async () => {
    const { authApi, setCsrfToken, getCsrfToken } = await freshApi()
    setCsrfToken('csrf-to-clear')
    mockFetch.mockResolvedValue(mockResponse(200, { success: true }))
    await authApi.logout()
    expect(getCsrfToken()).toBeNull()
  })

  it('forgotPassword sends correct payload', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ message: 'Sent' }))
    const result = await authApi.forgotPassword('+998901234567')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/forgot-password', expect.objectContaining({ method: 'POST' }))
    expect(result.message).toBe('Sent')
  })

  it('resetPassword sends correct payload', async () => {
    const { authApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ message: 'Reset' }))
    const result = await authApi.resetPassword('token-abc', 'newpass')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/reset-password', expect.objectContaining({ method: 'POST' }))
    expect(result.message).toBe('Reset')
  })
})

// ─── propertyApi ─────────────────────────────────────────────────────────

describe('propertyApi', () => {
  it('list sends query params', async () => {
    const { propertyApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse([{ id: '1' }]))
    await propertyApi.list({ dealType: 'sale', propertyType: 'apartment', status: 'ready', search: 'center', page: 1, limit: 10 })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('dealType=sale')
    expect(url).toContain('propertyType=apartment')
    expect(url).toContain('status=ready')
    expect(url).toContain('search=center')
    expect(url).toContain('page=1')
    expect(url).toContain('limit=10')
  })

  it('list skips "all" filters', async () => {
    const { propertyApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse([]))
    await propertyApi.list({ dealType: 'all', propertyType: 'all', status: 'all' })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).not.toContain('dealType')
    expect(url).not.toContain('propertyType')
    expect(url).not.toContain('status')
  })

  it('list handles minPrice and maxPrice', async () => {
    const { propertyApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse([]))
    await propertyApi.list({ minPrice: 10000, maxPrice: 500000 })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('minPrice=10000')
    expect(url).toContain('maxPrice=500000')
  })

  it('detail calls correct URL', async () => {
    const { propertyApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: 'prop-1' }))
    const result = await propertyApi.detail('prop-1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/properties/prop-1', expect.any(Object))
    expect(result.id).toBe('prop-1')
  })

  it('create sends POST', async () => {
    const { propertyApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: 'new' }))
    const result = await propertyApi.create({ title: 'New', price: 100000, type: 'apartment' as const, dealType: 'sale' as const, location: { lat: 0, lng: 0, address: 'T', city: 'T' } })
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/properties', expect.objectContaining({ method: 'POST' }))
    expect(result.id).toBe('new')
  })

  it('update sends PUT', async () => {
    const { propertyApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: 'p1', title: 'Updated' }))
    const result = await propertyApi.update('p1', { title: 'Updated' })
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/properties/p1', expect.objectContaining({ method: 'PUT' }))
    expect(result.title).toBe('Updated')
  })

  it('delete sends DELETE', async () => {
    const { propertyApi } = await freshApi()
    mockFetch.mockResolvedValue(mockResponse(204, null))
    await propertyApi.delete('p1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/properties/p1', expect.objectContaining({ method: 'DELETE' }))
  })

  it('mine calls correct endpoint', async () => {
    const { propertyApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse([{ id: 'mine-1' }]))
    const result = await propertyApi.mine()
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/properties/mine', expect.any(Object))
    expect(result).toEqual([{ id: 'mine-1' }])
  })
})

// ─── messageApi ─────────────────────────────────────────────────────────

describe('messageApi', () => {
  it('conversations', async () => {
    const { messageApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse([{ id: 'c1' }]))
    expect(await messageApi.conversations()).toEqual([{ id: 'c1' }])
  })
  it('list', async () => {
    const { messageApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse([{ id: 'm1' }]))
    expect(await messageApi.list('c1')).toEqual([{ id: 'm1' }])
  })
  it('send', async () => {
    const { messageApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ message: { id: 'm1' }, tempId: 't1' }))
    const r = await messageApi.send({ toUserId: 'u', propertyId: 'p', text: 'hi', tempId: 't' })
    expect(r.message.id).toBe('m1')
  })
  it('update', async () => {
    const { messageApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: 'm1', text: 'x' }))
    expect((await messageApi.update('m1', 'x')).text).toBe('x')
  })
  it('delete', async () => {
    const { messageApi } = await freshApi()
    mockFetch.mockResolvedValue(mockResponse(204, null))
    await messageApi.delete('m1')
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/messages/m1', expect.objectContaining({ method: 'DELETE' }))
  })
})

// ─── apiUploadImage ──────────────────────────────────────────────────────

describe('apiUploadImage', () => {
  it('sends base64 image and returns url', async () => {
    const { apiUploadImage } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ url: 'https://cdn.example.com/img.jpg' }))
    expect(await apiUploadImage('base64data')).toBe('https://cdn.example.com/img.jpg')
  })
})

// ─── sellerApi ──────────────────────────────────────────────────────────

describe('sellerApi', () => {
  it('list', async () => {
    const { sellerApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse([{ id: 's1' }]))
    expect(await sellerApi.list()).toEqual([{ id: 's1' }])
  })
  it('detail', async () => {
    const { sellerApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: 's1' }))
    expect((await sellerApi.detail('s1')).id).toBe('s1')
  })
})

// ─── paymentApi ─────────────────────────────────────────────────────────

describe('paymentApi', () => {
  it('create', async () => {
    const { paymentApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse({ id: 'pay-1' }))
    expect((await paymentApi.create({ propertyId: 'p1', amount: 100, provider: 'stripe' })).id).toBe('pay-1')
  })
  it('history', async () => {
    const { paymentApi } = await freshApi()
    mockFetch.mockResolvedValue(mockApiResponse([{ id: 'pay-1' }]))
    expect(await paymentApi.history()).toEqual([{ id: 'pay-1' }])
  })
})
