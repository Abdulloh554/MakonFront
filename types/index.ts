export type PropertyType = 'apartment' | 'house' | 'cottage' | 'dacha' | 'commercial' | 'land'

export type DealType = 'daily' | 'sale' | 'rent' | 'installment'

export type PropertyStatus = 'ready' | 'half-ready' | 'land'

export interface FloorPlanRoom {
  id: string
  name: string
  image: string
}

export interface FloorPlanFloor {
  id: string
  name: string
  image?: string
  rooms: FloorPlanRoom[]
}

export interface FloorPlan {
  floors: FloorPlanFloor[]
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  location: {
    lat: number
    lng: number
    address: string
  }
  type: PropertyType
  dealType: DealType
  status: PropertyStatus
  sellerId: string
  createdAt: string
  rooms: number
  area: number
  floor?: number
  totalFloors?: number
  installmentMonths?: number
  installmentPrice?: number
  floorPlan?: FloorPlan
}

export interface Seller {
  id: string
  userId?: string
  name: string
  phone: string
  avatar: string
  rating: number
  totalListings: number
}

export interface User {
  id: string
  name: string
  phone: string
  avatar: string
  role?: 'seller' | 'buyer'
}

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  propertyId: string
  text: string
  createdAt: string
  read: boolean
}

export interface FilterOptions {
  dealType: DealType | 'all'
  propertyType: PropertyType | 'all'
  status: PropertyStatus | 'all'
  minPrice?: number
  maxPrice?: number
  search: string
}

export interface Review {
  id: string
  sellerId: string
  userId: string
  userName: string
  rating: number
  text: string
  createdAt: string
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  lastMessage: string
  lastMessageAt: string
  unread: number
}
