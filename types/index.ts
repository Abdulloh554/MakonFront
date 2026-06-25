/**
 * @file index.ts
 * @layer Frontend Types
 * @responsibility Re-exports all shared types for frontend consumption
 */

export type {
  ApiResponse,
  ApiSuccess,
  ApiError,
  ApiErrorBody,
  ApiErrorDetail,
  PaginationMeta,
  ErrorCode,
} from '@shared/types/api.types'
export { ERROR_CODES } from '@shared/types/api.types'

export type {
  User,
  UserRole,
  AuthProvider,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@shared/types/user.types'
export { USER_ROLES, AUTH_PROVIDERS } from '@shared/types/user.types'

export type {
  Property,
  PropertyType,
  DealType,
  PropertyStatus,
  PropertyLocation,
  PropertyFilters,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  FloorPlan,
  FloorPlanFloor,
  FloorPlanRoom,
} from '@shared/types/property.types'
export { PROPERTY_TYPES, DEAL_TYPES, PROPERTY_STATUSES } from '@shared/types/property.types'

// Re-import locally for the frontend-specific types below
import type { DealType as _DealType, PropertyType as _PropertyType, PropertyStatus as _PropertyStatus } from '@shared/types/property.types'

export type {
  Message,
  MessageWithTempId,
  Conversation,
  SendMessageRequest,
  SendMessageResponse,
  MarkReadRequest,
} from '@shared/types/message.types'

export type {
  Payment,
  PaymentProvider,
  PaymentStatus,
  CreatePaymentRequest,
  PaymentHistoryResponse,
} from '@shared/types/payment.types'
export { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '@shared/types/payment.types'

export { API_ROUTES } from '@shared/constants/routes'
export { SOCKET_EVENTS } from '@shared/constants/events'
export type { ClientSocketEvent, ServerSocketEvent } from '@shared/constants/events'

// ─── Frontend-specific types ─────────────────────────────────────────

export interface FilterOptions {
  search: string
  dealType: _DealType | 'all'
  propertyType: _PropertyType | 'all'
  status: _PropertyStatus | 'all'
  minPrice: number | undefined
  maxPrice: number | undefined
}

export interface Seller {
  id: string
  userId: string
  name: string
  phone: string
  avatar?: string
  rating: number
  totalListings: number
  joinedAt: string
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
