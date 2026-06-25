/**
 * @file api.ts
 * @layer Service
 * @responsibility Typed API client — handles auth via httpOnly cookies, CSRF, automatic 401 refresh
 */

import type { ApiResponse, ApiError } from '@shared/types/api.types'
import type { AuthResponse, RefreshResponse, User } from '@shared/types/user.types'
import type { Property, CreatePropertyRequest, PropertyFilters } from '@shared/types/property.types'
import type { Conversation, Message, SendMessageRequest, SendMessageResponse } from '@shared/types/message.types'
import type { Payment } from '@shared/types/payment.types'
import { API_ROUTES } from '@shared/constants/routes'

let csrfToken: string | null = null
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

export function setCsrfToken(token: string): void {
  csrfToken = token
}

export function getCsrfToken(): string | null {
  return csrfToken
}

export function clearCsrfToken(): void {
  csrfToken = null
}

class ApiClientError extends Error {
  public statusCode: number
  public code: string
  public details?: unknown

  public constructor(error: ApiError['error']) {
    super(error.message)
    this.name = 'ApiClientError'
    this.statusCode = 0
    this.code = error.code
    this.details = error.details
  }
}

async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch(API_ROUTES.AUTH.REFRESH, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      return false
    }

    const body: ApiResponse<RefreshResponse> = await response.json()

    if (!body.success) {
      return false
    }

    setCsrfToken(body.data.csrfToken)
    return true
  } catch {
    return false
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean; skipCsrf?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (!options.skipCsrf && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  let response = await fetch(path, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
    credentials: 'include',
  })

  // Auto-refresh on 401
  if (response.status === 401 && !options.skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshSession().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }

    const refreshed = await refreshPromise

    if (refreshed) {
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }

      response = await fetch(path, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers as Record<string, string>),
        },
        credentials: 'include',
      })
    } else {
      clearCsrfToken()
      window.location.href = '/profile'
      throw new ApiClientError({ code: 'UNAUTHORIZED', message: 'Session expired. Please log in again.' })
    }
  }

  if (!response.ok) {
    let errorBody: ApiError['error'] | undefined

    try {
      const body: ApiResponse<unknown> = await response.json()
      if (!body.success) {
        errorBody = body.error
      }
    } catch {
      // JSON parse failed
    }

    throw new ApiClientError(
      errorBody || {
        code: 'INTERNAL_ERROR',
        message: `Request failed with status ${response.status}`,
      },
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body: ApiResponse<T> = await response.json()

  if (!body.success) {
    throw new ApiClientError(body.error)
  }

  return body.data
}

// ─── Auth API ──────────────────────────────────────────────────────────

export const authApi = {
  async login(phone: string, password: string): Promise<{ user: User; csrfToken: string }> {
    const data = await request<AuthResponse>(API_ROUTES.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
      skipAuth: true,
    })

    setCsrfToken(data.csrfToken)
    return data
  },

  async register(firstName: string, lastName: string, phone: string, password: string): Promise<{ user: User; csrfToken: string }> {
    const data = await request<AuthResponse>(API_ROUTES.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, phone, password }),
      skipAuth: true,
    })

    setCsrfToken(data.csrfToken)
    return data
  },

  async me(): Promise<User> {
    return request<User>(API_ROUTES.AUTH.ME, { skipAuth: true })
  },

  async logout(): Promise<void> {
    await request(API_ROUTES.AUTH.LOGOUT, { method: 'POST' })
    clearCsrfToken()
  },

  async forgotPassword(phone: string): Promise<{ message: string }> {
    return request(API_ROUTES.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ phone }),
      skipAuth: true,
    })
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return request(API_ROUTES.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    })
  },
}

// ─── Upload API ───────────────────────────────────────────────────────

export async function apiUploadImage(base64: string): Promise<string> {
  const data = await request<{ url: string }>(API_ROUTES.IMAGES.UPLOAD, {
    method: 'POST',
    body: JSON.stringify({ image: base64 }),
  })
  return data.url
}

// ─── Properties API ────────────────────────────────────────────────────

export const propertyApi = {
  async list(filters?: PropertyFilters): Promise<Property[]> {
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.dealType && filters.dealType !== 'all') params.set('dealType', filters.dealType)
    if (filters?.propertyType && filters.propertyType !== 'all') params.set('propertyType', filters.propertyType)
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
    if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.limit) params.set('limit', String(filters.limit))

    const qs = params.toString()
    return request<Property[]>(
      `${API_ROUTES.PROPERTIES.LIST}${qs ? `?${qs}` : ''}`,
      { skipAuth: true },
    )
  },

  async detail(id: string): Promise<Property> {
    return request<Property>(API_ROUTES.PROPERTIES.DETAIL(id), { skipAuth: true })
  },

  async create(data: CreatePropertyRequest): Promise<Property> {
    return request<Property>(API_ROUTES.PROPERTIES.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Partial<CreatePropertyRequest>): Promise<Property> {
    return request<Property>(API_ROUTES.PROPERTIES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string): Promise<void> {
    await request(API_ROUTES.PROPERTIES.DELETE(id), { method: 'DELETE' })
  },

  async mine(): Promise<Property[]> {
    return request<Property[]>(API_ROUTES.PROPERTIES.MINE)
  },
}

// ─── Messages API ──────────────────────────────────────────────────────

export const messageApi = {
  async conversations(): Promise<Conversation[]> {
    return request<Conversation[]>(API_ROUTES.MESSAGES.CONVERSATIONS)
  },

  async list(conversationId: string): Promise<Message[]> {
    return request<Message[]>(API_ROUTES.MESSAGES.LIST(conversationId))
  },

  async send(data: SendMessageRequest): Promise<SendMessageResponse> {
    return request<SendMessageResponse>(API_ROUTES.MESSAGES.SEND, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, text: string): Promise<Message> {
    return request<Message>(API_ROUTES.MESSAGES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify({ text }),
    })
  },

  async delete(id: string): Promise<void> {
    await request(API_ROUTES.MESSAGES.DELETE(id), { method: 'DELETE' })
  },
}

// ─── Sellers API ───────────────────────────────────────────────────────

export const sellerApi = {
  async list(): Promise<User[]> {
    return request<User[]>(API_ROUTES.SELLERS.LIST, { skipAuth: true })
  },

  async detail(id: string): Promise<User> {
    return request<User>(API_ROUTES.SELLERS.DETAIL(id), { skipAuth: true })
  },
}

// ─── Payments API ──────────────────────────────────────────────────────

export const paymentApi = {
  async create(data: { propertyId: string; amount: number; provider: string }): Promise<Payment> {
    return request<Payment>(API_ROUTES.PAYMENTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async history(): Promise<Payment[]> {
    return request<Payment[]>(API_ROUTES.PAYMENTS.HISTORY)
  },
}
