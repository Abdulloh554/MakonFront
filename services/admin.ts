// Admin user is stored in-memory only (not localStorage) to prevent XSS data leaks
// Admin auth uses httpOnly cookies set by the backend — no tokens stored on the client

let _adminUser: Record<string, unknown> | null = null
let _adminCsrfToken: string | null = null

export function getAdminUser(): Record<string, unknown> | null {
  return _adminUser
}

export function setAdminUser(user: Record<string, unknown>): void {
  _adminUser = user
}

export function clearAdminUser(): void {
  _adminUser = null
  _adminCsrfToken = null
}

export function isAdminLoggedIn(): boolean {
  return _adminUser !== null
}

export function adminLogout(): void {
  _adminUser = null
  _adminCsrfToken = null
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_adminCsrfToken) {
    headers['X-CSRF-Token'] = _adminCsrfToken
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  const res = await fetch(`/api/v1/admin${path}`, { headers, credentials: 'include', signal: controller.signal, ...options })
  clearTimeout(timeoutId)
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearAdminUser()
      window.location.href = '/admin'
      throw new Error('Sessiya tugagan. Qaytadan kiring.')
    }
    const body = await res.json().catch(() => ({ error: { message: res.statusText } }))
    const msg = body?.error?.message || body?.error || `Xatolik: ${res.status}`
    throw new Error(msg)
  }
  const json = await res.json()
  if (typeof json === 'object' && json !== null && json.success === true) return json.data as T
  return json as T
}

export function getAdminCsrfToken(): string | null {
  return _adminCsrfToken
}

export interface AdminStats {
  users: number; sellers: number; properties: number
  activeListings: number; messages: number; reviews: number; totalViews: number
}

export interface PaginatedResult<T> {
  data: T[]; total: number; page: number; totalPages: number
}

export async function apiAdminLogin(username: string, password: string): Promise<{ user: Record<string, unknown>; csrfToken: string }> {
  const data = await adminRequest<{ user: Record<string, unknown>; csrfToken: string }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  _adminUser = data.user
  _adminCsrfToken = data.csrfToken
  return data
}

export async function apiAdminStats(): Promise<AdminStats> {
  return adminRequest<AdminStats>('/stats')
}

export async function apiAdminUsers(page = 1, limit = 20): Promise<PaginatedResult<Record<string, unknown>>> {
  return adminRequest<PaginatedResult<Record<string, unknown>>>(`/users?page=${page}&limit=${limit}`)
}

export async function apiAdminUser(id: string): Promise<Record<string, unknown>> {
  return adminRequest<Record<string, unknown>>(`/users/${id}`)
}

export async function apiAdminDeleteUser(id: string): Promise<Record<string, unknown>> {
  return adminRequest<Record<string, unknown>>(`/users/${id}`, { method: 'DELETE' })
}

export async function apiAdminProperties(page = 1, limit = 20, filters?: Record<string, string>): Promise<PaginatedResult<Record<string, unknown>>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (filters) { for (const [k, v] of Object.entries(filters)) { if (v) params.set(k, v) } }
  return adminRequest<PaginatedResult<Record<string, unknown>>>(`/properties?${params}`)
}

export async function apiAdminDeleteProperty(id: string): Promise<Record<string, unknown>> {
  return adminRequest<Record<string, unknown>>(`/properties/${id}`, { method: 'DELETE' })
}

export async function apiAdminSellers(page = 1, limit = 20): Promise<PaginatedResult<Record<string, unknown>>> {
  return adminRequest<PaginatedResult<Record<string, unknown>>>(`/sellers?page=${page}&limit=${limit}`)
}

export async function apiAdminDeleteSeller(id: string): Promise<Record<string, unknown>> {
  return adminRequest<Record<string, unknown>>(`/sellers/${id}`, { method: 'DELETE' })
}

export async function apiAdminMessages(page = 1, limit = 20): Promise<PaginatedResult<Record<string, unknown>>> {
  return adminRequest<PaginatedResult<Record<string, unknown>>>(`/messages?page=${page}&limit=${limit}`)
}

export async function apiAdminToggleFeatured(id: string): Promise<Record<string, unknown>> {
  return adminRequest<Record<string, unknown>>(`/properties/${id}/feature`, { method: 'PATCH' })
}

export async function apiAdminReviews(page = 1, limit = 20): Promise<PaginatedResult<Record<string, unknown>>> {
  return adminRequest<PaginatedResult<Record<string, unknown>>>(`/reviews?page=${page}&limit=${limit}`)
}
