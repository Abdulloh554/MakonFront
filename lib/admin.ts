const ADMIN_TOKEN_KEY = 'makon_admin_token'
const ADMIN_USER_KEY = 'makon_admin_user'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

function setToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

function clearToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function getAdminUser(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(ADMIN_USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setAdminUser(user: Record<string, unknown>): void {
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
}

export function clearAdminUser(): void {
  localStorage.removeItem(ADMIN_USER_KEY)
}

export function isAdminLoggedIn(): boolean {
  return getToken() !== null && getAdminUser() !== null
}

export function adminLogout(): void {
  clearToken()
  clearAdminUser()
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`/api/admin${path}`, { headers, ...options })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearToken()
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

export interface AdminStats {
  users: number; sellers: number; properties: number
  activeListings: number; messages: number; reviews: number; totalViews: number
}

export interface PaginatedResult<T> {
  data: T[]; total: number; page: number; totalPages: number
}

export async function apiAdminLogin(username: string, password: string): Promise<{ token: string; user: Record<string, unknown> }> {
  const data = await adminRequest<{ token: string; user: Record<string, unknown> }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  setToken(data.token)
  setAdminUser(data.user)
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

export async function apiAdminReviews(page = 1, limit = 20): Promise<PaginatedResult<Record<string, unknown>>> {
  return adminRequest<PaginatedResult<Record<string, unknown>>>(`/reviews?page=${page}&limit=${limit}`)
}
