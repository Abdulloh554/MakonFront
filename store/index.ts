'use client'

import type { Property, Seller, User, Message, Review, FilterOptions } from '../types'
import {
  apiLogin,
  apiRegister,
  apiFetchProperties,
  apiFetchSellers,
  apiFetchSeller,
  apiFetchSellerProperties,
  apiCreateProperty,
  apiFetchReviewsBySeller,
  apiCreateReview,
  apiSendMessage,
  apiFetchMe,
  clearToken,
  getToken,
} from '../services/api'
import { normalizePhone, isValidUzbekPhone } from '../utils/phone'

let _properties: Property[] = []
let _sellers: Seller[] = []
let _messages: Message[] = []
let _reviews: Review[] = []

const KEY_CURRENT_USER = 'makon_current_user'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function getUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY_CURRENT_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setUserToStorage(user: User | null): void {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(KEY_CURRENT_USER)
    }
  } catch {
    // ignore
  }
}

// ─── Auth ───────────────────────────────────────────────────────────
export async function login(phone: string, password: string): Promise<User> {
  const normalized = normalizePhone(phone)
  const { user } = await apiLogin(normalized, password)
  setUserToStorage(user)
  return user
}

export async function register(firstName: string, lastName: string, phone: string, password: string): Promise<User> {
  const normalized = normalizePhone(phone)
  if (!isValidUzbekPhone(normalized)) {
    throw new Error("Noto'g'ri O'zbekiston telefon raqami")
  }
  const { user } = await apiRegister(firstName, lastName, normalized, password)
  setUserToStorage(user)
  return user
}

export async function restoreSession(): Promise<User | null> {
  const token = getToken()
  if (!token) return null
  try {
    const user = await apiFetchMe()
    setUserToStorage(user)
    return user
  } catch {
    clearToken()
    setUserToStorage(null)
    return null
  }
}

export function getCurrentUser(): User | null {
  return getUserFromStorage()
}

export function logout(): void {
  clearToken()
  setUserToStorage(null)
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

// ─── Properties ─────────────────────────────────────────────────────
export async function syncProperties(): Promise<Property[]> {
  const properties = await apiFetchProperties()
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
  property: Omit<Property, 'id' | 'createdAt' | 'sellerId'>,
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

  const created = await apiCreateProperty(body)
  _properties.unshift(created)
  return created
}

// ─── Sellers ────────────────────────────────────────────────────────
export async function syncSellers(): Promise<Seller[]> {
  const sellers = await apiFetchSellers()
  _sellers = sellers
  return sellers
}

export function getSellers(): Seller[] {
  return _sellers.map((s) => ({
    ...s,
    totalListings: _properties.filter((p) => p.sellerId === s.id).length,
  }))
}

export function getSeller(id: string): Seller | undefined {
  const s = _sellers.find((s) => s.id === id)
  if (!s) return undefined
  return { ...s, totalListings: _properties.filter((p) => p.sellerId === id).length }
}

export async function fetchSeller(id: string): Promise<Seller | undefined> {
  try {
    return await apiFetchSeller(id)
  } catch {
    return getSeller(id)
  }
}

export async function fetchSellerProperties(sellerId: string): Promise<Property[]> {
  try {
    return await apiFetchSellerProperties(sellerId)
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
  try {
    const reviews = await apiFetchReviewsBySeller(sellerId)
    _reviews = _reviews.filter((r) => r.sellerId !== sellerId).concat(reviews)
    return reviews
  } catch {
    return _reviews.filter((r) => r.sellerId === sellerId)
  }
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
  const review = await apiCreateReview(data)
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
  const now = new Date().toISOString()
  const msg: Message = {
    id: clientId,
    fromUserId,
    toUserId,
    propertyId,
    text,
    createdAt: now,
    read: false,
  }
  _messages.push(msg)

  apiSendMessage(toUserId, propertyId || 'general', text)
    .then((serverMsg) => {
      const idx = _messages.findIndex((m) => m.id === clientId)
      if (idx !== -1) {
        _messages[idx] = serverMsg
      } else {
        const contentIdx = _messages.findIndex(
          (m) =>
            m.fromUserId === fromUserId &&
            m.toUserId === toUserId &&
            m.text === text &&
            m.createdAt === now,
        )
        if (contentIdx !== -1) {
          _messages[contentIdx] = serverMsg
        } else {
          _messages.push(serverMsg)
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
  return msg
}

export function deleteMessage(messageId: string): void {
  _messages = _messages.filter((m) => m.id !== messageId)
}

export function markMessageRead(messageId: string): void {
  const msg = _messages.find((m) => m.id === messageId)
  if (msg) msg.read = true
}

export function getUnreadCount(userId: string): number {
  return _messages.filter((m) => m.toUserId === userId && !m.read).length
}
