'use client'

import type { Property, User, Message } from '../types'
import type { Seller, Review, FilterOptions } from '../types'
import { authApi, propertyApi, messageApi, sellerApi } from '../services/api'
import { normalizePhone, isValidUzbekPhone } from '../utils/phone'

let _properties: Property[] = []
let _sellers: Seller[] = []
let _messages: Message[] = []
let _reviews: Review[] = []

let _currentUser: User | null = null

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ─── Auth (in-memory only — no localStorage to prevent XSS data leaks) ──
export async function login(phone: string, password: string): Promise<User> {
  const normalized = normalizePhone(phone)
  const { user } = await authApi.login(normalized, password)
  _currentUser = user
  return user
}

export async function googleLogin(idToken: string): Promise<User> {
  const response = await fetch('/api/v1/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  })
  const body = await response.json()
  if (!body.success) throw new Error(body.error?.message || 'Google login failed')
  const { setCsrfToken } = await import('@/services/api')
  setCsrfToken(body.data.csrfToken)
  _currentUser = body.data.user
  return body.data.user
}

export async function register(firstName: string, lastName: string, phone: string, password: string): Promise<User> {
  const normalized = normalizePhone(phone)
  if (!isValidUzbekPhone(normalized)) {
    throw new Error("Noto'g'ri O'zbekiston telefon raqami")
  }
  const { user } = await authApi.register(firstName, lastName, normalized, password)
  _currentUser = user
  return user
}

export async function restoreSession(): Promise<User | null> {
  if (_currentUser) return _currentUser

  try {
    const user = await authApi.me()
    _currentUser = user
    return user
  } catch {
    return null
  }
}

export function getCurrentUser(): User | null {
  return _currentUser
}

export async function logout(): Promise<void> {
  try {
    await authApi.logout()
  } catch {
    // ignore
  }
  _currentUser = null
}

export function isAuthenticated(): boolean {
  return _currentUser !== null
}

// ─── Properties ─────────────────────────────────────────────────────
export async function syncProperties(): Promise<Property[]> {
  const properties = await propertyApi.list()
  _properties = properties
  return properties
}

export function getProperties(): Property[] {
  return _properties
}

export function getProperty(id: string): Property | undefined {
  return _properties.find((p) => p.id === id)
}

function filterProperties(props: Property[], filters: FilterOptions): Property[] {
  let result = props
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  }
  if (filters.dealType !== 'all') {
    result = result.filter((p) => p.dealType === filters.dealType)
  }
  if (filters.propertyType !== 'all') {
    result = result.filter((p) => p.type === filters.propertyType)
  }
  if (filters.status !== 'all') {
    result = result.filter((p) => p.status === filters.status)
  }
  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!)
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!)
  }
  return result
}

export function getFilteredProperties(filters: FilterOptions, source?: Property[]): Property[] {
  return filterProperties(source ?? _properties, filters)
}

export async function addProperty(
  property: Record<string, unknown>,
): Promise<Property> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be logged in to add property')
  }

  const body: Record<string, unknown> = {
    title: property.title,
    description: property.description,
    price: property.price,
    images: property.images,
    location: property.location,
    type: property.type,
    dealType: property.dealType,
    status: property.status,
    rooms: property.rooms,
    area: property.area,
    floor: property.floor,
    totalFloors: property.totalFloors,
    installmentMonths: property.installmentMonths,
    installmentPrice: property.installmentPrice,
  }

  const created = await propertyApi.create(body as never)
  _properties.unshift(created)
  return created
}

// ─── Sellers ────────────────────────────────────────────────────────
export async function syncSellers(): Promise<Seller[]> {
  const users = await sellerApi.list()
  _sellers = users.map((u) => ({
    id: u.id,
    userId: u.id,
    name: u.name,
    phone: u.phone,
    avatar: u.avatar,
    rating: 5.0,
    totalListings: _properties.filter((p) => p.sellerId === u.id).length,
    joinedAt: u.createdAt,
  }))
  return _sellers
}

export function getSellers(): Seller[] {
  return _sellers
}

export function getSeller(id: string): Seller | undefined {
  return _sellers.find((s) => s.id === id)
}

export async function fetchSeller(id: string): Promise<Seller | undefined> {
  try {
    const user = await sellerApi.detail(id)
    return {
      id: user.id,
      userId: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      rating: 5.0,
      totalListings: 0,
      joinedAt: user.createdAt,
    }
  } catch {
    return getSeller(id)
  }
}

export async function fetchSellerProperties(sellerId: string): Promise<Property[]> {
  try {
    return _properties.filter((p) => p.sellerId === sellerId)
  } catch {
    return _properties.filter((p) => p.sellerId === sellerId)
  }
}

export function getPropertiesBySeller(sellerId: string): Property[] {
  return _properties.filter((p) => p.sellerId === sellerId)
}

export function getSellerByUser(user: User): Seller | undefined {
  return _sellers.find(
    (s) => s.userId === user.id || s.phone === user.phone,
  )
}

export function getPropertiesByUser(user: User, source?: Property[]): Property[] {
  const seller = getSellerByUser(user)
  const sellerId = seller?.id ?? user.id
  return (source ?? _properties).filter(
    (p) => p.sellerId === sellerId || p.sellerId === user.id,
  )
}

// ─── Reviews ────────────────────────────────────────────────────────
export async function fetchReviewsBySeller(sellerId: string): Promise<Review[]> {
  // Reviews API not implemented yet; return empty
  return _reviews.filter((r) => r.sellerId === sellerId)
}

export function getReviewsBySeller(sellerId: string): Review[] {
  return _reviews.filter((r) => r.sellerId === sellerId)
}

export async function addReview(data: {
  sellerId: string
  userId: string
  userName: string
  rating: number
  text: string
}): Promise<Review> {
  const review: Review = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
  }
  _reviews.unshift(review)
  return review
}

// ─── Messages ───────────────────────────────────────────────────────
export function getMessages(userId: string): Message[] {
  return _messages
    .filter((m) => m.fromUserId === userId || m.toUserId === userId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
}

export function sendMessage(
  fromUserId: string,
  toUserId: string,
  propertyId: string,
  text: string,
): Message {
  const clientId = generateId()
  const tempId = clientId
  const now = new Date().toISOString()
  const msg: Message = {
    id: clientId,
    conversationId: tempId,
    fromUserId,
    toUserId,
    propertyId: propertyId || 'general',
    text,
    read: false,
    edited: false,
    createdAt: now,
    updatedAt: now,
  }
  _messages.push(msg)

  messageApi.send({ toUserId, propertyId: propertyId || 'general', text, tempId })
    .then((serverMsg) => {
      const idx = _messages.findIndex((m) => m.id === clientId)
      if (idx !== -1) {
        _messages[idx] = {
          ...serverMsg.message,
          id: serverMsg.message.id,
        }
      }
    })
    .catch(() => {})

  return msg
}

export function updateMessage(
  messageId: string,
  text: string,
): Message | null {
  const msg = _messages.find((m) => m.id === messageId)
  if (!msg) return null
  msg.text = text
  msg.edited = true
  msg.editedAt = new Date().toISOString()

  messageApi.update(messageId, text).catch(() => {})

  return msg
}

export function deleteMessage(messageId: string): void {
  _messages = _messages.filter((m) => m.id !== messageId)
  messageApi.delete(messageId).catch(() => {})
}

export function markMessageRead(messageId: string): void {
  const msg = _messages.find((m) => m.id === messageId)
  if (msg) msg.read = true
}

export function getUnreadCount(userId: string): number {
  return _messages.filter((m) => m.toUserId === userId && !m.read).length
}
