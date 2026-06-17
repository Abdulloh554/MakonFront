'use client'

import type { Property, Seller, User, Message, Review, FilterOptions } from './types'
import { useEffect, useState } from 'react'
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
} from './api'
import { normalizePhone, isValidUzbekPhone } from './phone'

// ─── Hydration ──────────────────────────────────────────────────────
export function useHydrated(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return mounted
}

// ─── Storage helpers ────────────────────────────────────────────────
const STORAGE_KEYS = {
  properties: 'makon_properties',
  sellers: 'makon_sellers',
  currentUser: 'makon_current_user',
  messages: 'makon_messages',
  reviews: 'makon_reviews',
} as const

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function getData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      if (key === STORAGE_KEYS.properties && Array.isArray(data)) {
        const stripped = (data as Property[]).map((p) => ({ ...p, images: [''] }))
        try {
          localStorage.setItem(key, JSON.stringify(stripped))
          return
        } catch {}
      }
      throw new Error('Xotira chegarasiga yetildi. Iltimos, eski elonlarni o\'chiring.')
    }
    throw err
  }
}

// ─── Auth ───────────────────────────────────────────────────────────
export async function login(phone: string, password: string): Promise<User> {
  const normalized = normalizePhone(phone)

  try {
    const { user } = await apiLogin(normalized, password)
    setData(STORAGE_KEYS.currentUser, user)
    return user
  } catch (err) {
    throw err
  }
}

export async function register(firstName: string, lastName: string, phone: string, password: string): Promise<User> {
  const normalized = normalizePhone(phone)
  if (!isValidUzbekPhone(normalized)) {
    throw new Error("Noto'g'ri O'zbekiston telefon raqami")
  }

  const { user } = await apiRegister(firstName, lastName, normalized, password)
  setData(STORAGE_KEYS.currentUser, user)
  return user
}

export async function restoreSession(): Promise<User | null> {
  const token = getToken()
  if (!token) return null
  try {
    const user = await apiFetchMe()
    setData(STORAGE_KEYS.currentUser, user)
    return user
  } catch {
    clearToken()
    setData(STORAGE_KEYS.currentUser, null)
    return null
  }
}

export function getCurrentUser(): User | null {
  return getData<User | null>(STORAGE_KEYS.currentUser, null)
}

export function logout(): void {
  clearToken()
  setData(STORAGE_KEYS.currentUser, null)
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

// ─── Properties ─────────────────────────────────────────────────────
export async function syncProperties(): Promise<Property[]> {
  try {
    const properties = await apiFetchProperties()
    setData(STORAGE_KEYS.properties, properties)
    return properties
  } catch {
    // Keep local cache on failure
    return getProperties()
  }
}

export function getProperties(): Property[] {
  return getData<Property[]>(STORAGE_KEYS.properties, [])
}

export function getProperty(id: string): Property | undefined {
  return getProperties().find((p) => p.id === id)
}

export function getFilteredProperties(filters: FilterOptions): Property[] {
  let props = getProperties()
  if (filters.search) {
    const q = filters.search.toLowerCase()
    props = props.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  }
  if (filters.dealType !== 'all') {
    props = props.filter((p) => p.dealType === filters.dealType)
  }
  if (filters.propertyType !== 'all') {
    props = props.filter((p) => p.type === filters.propertyType)
  }
  if (filters.status !== 'all') {
    props = props.filter((p) => p.status === filters.status)
  }
  if (filters.minPrice !== undefined) {
    props = props.filter((p) => p.price >= filters.minPrice!)
  }
  if (filters.maxPrice !== undefined) {
    props = props.filter((p) => p.price <= filters.maxPrice!)
  }
  return props
}

export async function addProperty(
  property: Omit<Property, 'id' | 'createdAt' | 'sellerId'>,
): Promise<Property> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be logged in to add property')
  }

  // 1. Save to backend first
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

  // 2. Save to localStorage cache
  const props = getProperties()
  props.unshift(created)
  setData(STORAGE_KEYS.properties, props)

  return created
}

// ─── Sellers ────────────────────────────────────────────────────────
export async function syncSellers(): Promise<Seller[]> {
  try {
    const sellers = await apiFetchSellers()
    setData(STORAGE_KEYS.sellers, sellers)
    return sellers
  } catch {
    // Keep local cache on failure
    return getData<Seller[]>(STORAGE_KEYS.sellers, [])
  }
}

export function getSellers(): Seller[] {
  const sellers = getData<Seller[]>(STORAGE_KEYS.sellers, [])
  const props = getProperties()
  return sellers.map((s) => ({
    ...s,
    totalListings: props.filter((p) => p.sellerId === s.id).length,
  }))
}

export function getSeller(id: string): Seller | undefined {
  const s = getData<Seller[]>(STORAGE_KEYS.sellers, []).find(
    (s) => s.id === id,
  )
  if (!s) return undefined
  const props = getProperties()
  return { ...s, totalListings: props.filter((p) => p.sellerId === id).length }
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
    return getProperties().filter((p) => p.sellerId === sellerId)
  }
}

export function getPropertiesBySeller(sellerId: string): Property[] {
  return getProperties().filter((p) => p.sellerId === sellerId)
}

export function getSellerByUser(user: User): Seller | undefined {
  return getData<Seller[]>(STORAGE_KEYS.sellers, []).find(
    (s) => s.userId === user.id || s.phone === user.phone,
  )
}

export function getPropertiesByUser(user: User): Property[] {
  const seller = getSellerByUser(user)
  const sellerId = seller?.id ?? user.id
  return getProperties().filter(
    (p) => p.sellerId === sellerId || p.sellerId === user.id,
  )
}

// ─── Reviews ────────────────────────────────────────────────────────
export async function fetchReviewsBySeller(sellerId: string): Promise<Review[]> {
  try {
    const reviews = await apiFetchReviewsBySeller(sellerId)
    const all = getData<Review[]>(STORAGE_KEYS.reviews, [])
    const filtered = all.filter((r) => r.sellerId !== sellerId)
    setData(STORAGE_KEYS.reviews, [...filtered, ...reviews])
    return reviews
  } catch {
    return getData<Review[]>(STORAGE_KEYS.reviews, []).filter((r) => r.sellerId === sellerId)
  }
}

export function getReviewsBySeller(sellerId: string): Review[] {
  return getData<Review[]>(STORAGE_KEYS.reviews, []).filter((r) => r.sellerId === sellerId)
}

export async function addReview(data: {
  sellerId: string
  userId: string
  userName: string
  rating: number
  text: string
}): Promise<Review> {
  const review = await apiCreateReview(data)
  const all = getData<Review[]>(STORAGE_KEYS.reviews, [])
  all.unshift(review)
  setData(STORAGE_KEYS.reviews, all)
  return review
}

// ─── Messages ───────────────────────────────────────────────────────
export function getMessages(userId: string): Message[] {
  const all = getData<Message[]>(STORAGE_KEYS.messages, [])
  return all
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
  // Optimistic local save
  const msg: Message = {
    id: generateId(),
    fromUserId,
    toUserId,
    propertyId,
    text,
    createdAt: new Date().toISOString(),
    read: false,
  }
  const all = getData<Message[]>(STORAGE_KEYS.messages, [])
  all.push(msg)
  setData(STORAGE_KEYS.messages, all)

  // Fire-and-forget to backend
  apiSendMessage(toUserId, propertyId || 'general', text)
    .then((serverMsg) => {
      // Replace optimistic message with server version
      const msgs = getData<Message[]>(STORAGE_KEYS.messages, [])
      const idx = msgs.findIndex((m) => m.id === msg.id)
      if (idx !== -1) {
        msgs[idx] = serverMsg
        setData(STORAGE_KEYS.messages, msgs)
      }
    })
    .catch(() => {})

  return msg
}

export function updateMessage(
  messageId: string,
  text: string,
): Message | null {
  const all = getData<Message[]>(STORAGE_KEYS.messages, [])
  const msg = all.find((m) => m.id === messageId)
  if (!msg) return null
  msg.text = text
  setData(STORAGE_KEYS.messages, all)
  return msg
}

export function deleteMessage(messageId: string): void {
  const all = getData<Message[]>(STORAGE_KEYS.messages, [])
  const updated = all.filter((m) => m.id !== messageId)
  setData(STORAGE_KEYS.messages, updated)
}

export function markMessageRead(messageId: string): void {
  const all = getData<Message[]>(STORAGE_KEYS.messages, [])
  const msg = all.find((m) => m.id === messageId)
  if (msg) {
    msg.read = true
    setData(STORAGE_KEYS.messages, all)
  }
}

export function getUnreadCount(userId: string): number {
  const all = getData<Message[]>(STORAGE_KEYS.messages, [])
  return all.filter((m) => m.toUserId === userId && !m.read).length
}
