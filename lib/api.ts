import type {
  Property,
  Seller,
  User,
  Message,
  Review,
  FloorPlan,
  FilterOptions,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

// ─── Token management ───────────────────────────────────────────────
const TOKEN_KEY = "makon_jwt_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Request helper ─────────────────────────────────────────────────
async function request<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!options?.skipAuth) {
    const token = getToken();
    if (!token) {
      throw new Error("Avval tizimga kiring. Token topilmadi.");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
    }
    const body = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const errMessage = body?.error?.message || body?.error || body?.message || `API error: ${res.status}`;
    throw new Error(errMessage);
  }

  const json = await res.json();
  if (typeof json === "object" && json !== null && json.success === true) {
    return json.data as T;
  }
  return json as T;
}

// ─── Mappers ────────────────────────────────────────────────────────
function toId(
  v: string | { id?: string; _id?: string } | null | undefined,
): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v.id === "string") return v.id;
  if (typeof v._id === "string") return v._id;
  return String(v);
}

function mapProperty(p: Record<string, unknown>): Property {
  return {
    id: toId((p.id ?? p._id) as string | { id?: string; _id?: string } | null | undefined),
    title: p.title as string,
    description: p.description as string,
    price: p.price as number,
    images: (p.images as string[]) ?? [],
    location: (p.location ?? { lat: 0, lng: 0, address: "" }) as Property["location"],
    type: p.type as Property["type"],
    dealType: p.dealType as Property["dealType"],
    status: p.status as Property["status"],
    sellerId: toId((p.sellerId as { id?: string })?.id ?? (p.sellerId as string)),
    createdAt: p.createdAt as string,
    rooms: p.rooms as number,
    area: p.area as number,
    floor: p.floor as number | undefined,
    totalFloors: p.totalFloors as number | undefined,
    installmentMonths: p.installmentMonths as number | undefined,
    installmentPrice: p.installmentPrice as number | undefined,
    floorPlan: p.floorPlan as FloorPlan | undefined,
  };
}

function mapSeller(s: Record<string, unknown>): Seller {
  return {
    id: toId((s.id ?? s._id) as string | { id?: string; _id?: string } | null | undefined),
    name: s.name as string,
    phone: s.phone as string,
    avatar: (s.avatar as string) || "/avatars/default.svg",
    rating: (s.rating as number) ?? 0,
    totalListings: (s.totalListings as number) ?? 0,
  };
}

function mapUser(u: Record<string, unknown>): User {
  return {
    id: toId((u.id ?? u._id) as string | { id?: string; _id?: string } | null | undefined),
    name: u.name as string,
    phone: u.phone as string,
    avatar: (u.avatar as string) || "/avatars/user.svg",
    role: (u.role as "seller" | "buyer") || "buyer",
  };
}

function mapMessage(m: Record<string, unknown>): Message {
  return {
    id: toId((m.id ?? m._id) as string | { id?: string; _id?: string } | null | undefined),
    fromUserId: toId(((m.fromUserId as { id?: string })?.id ?? m.fromUserId) as string | { id?: string; _id?: string } | null | undefined),
    toUserId: toId(((m.toUserId as { id?: string })?.id ?? m.toUserId) as string | { id?: string; _id?: string } | null | undefined),
    propertyId: toId(((m.propertyId as { id?: string })?.id ?? m.propertyId) as string | { id?: string; _id?: string } | null | undefined),
    text: m.text as string,
    createdAt: m.createdAt as string,
    read: (m.read as boolean) ?? false,
  };
}

// ─── Auth API ───────────────────────────────────────────────────────
interface AuthResponse {
  token: string;
  user: Record<string, unknown>;
}

export async function apiLogin(phone: string, password: string): Promise<{ token: string; user: User }> {
  const data = await request<AuthResponse>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ phone, password }), skipAuth: true },
  );
  setToken(data.token);
  return { token: data.token, user: mapUser(data.user) };
}

export async function apiRegister(firstName: string, lastName: string, phone: string, password: string): Promise<{ token: string; user: User }> {
  const data = await request<AuthResponse>(
    "/auth/register",
    { method: "POST", body: JSON.stringify({ firstName, lastName, phone, password }), skipAuth: true },
  );
  setToken(data.token);
  return { token: data.token, user: mapUser(data.user) };
}

export async function apiFetchMe(): Promise<User> {
  const data = await request<Record<string, unknown>>("/auth/me");
  return mapUser(data);
}

// ─── Properties API ─────────────────────────────────────────────────
export async function apiFetchProperties(
  filters?: FilterOptions,
): Promise<Property[]> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.search) params.set("search", filters.search);
    if (filters.dealType && filters.dealType !== "all") params.set("dealType", filters.dealType);
    if (filters.propertyType && filters.propertyType !== "all") params.set("propertyType", filters.propertyType);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  }
  const qs = params.toString();
  const data = await request<Record<string, unknown>[]>(
    `/properties${qs ? `?${qs}` : ""}`,
    { skipAuth: true },
  );
  if (!Array.isArray(data)) {
    throw new Error("API returned invalid properties data");
  }
  return data.map(mapProperty);
}

export async function apiFetchProperty(id: string): Promise<Property> {
  const data = await request<Record<string, unknown>>(`/properties/${id}`, { skipAuth: true });
  return mapProperty(data);
}

export async function apiCreateProperty(
  data: Record<string, unknown>,
): Promise<Property> {
  const res = await request<Record<string, unknown>>("/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapProperty(res);
}

// ─── Sellers API ────────────────────────────────────────────────────
export async function apiFetchSellers(): Promise<Seller[]> {
  const data = await request<Record<string, unknown>[]>("/sellers", { skipAuth: true });
  return data.map(mapSeller);
}

export async function apiFetchSeller(id: string): Promise<Seller> {
  const data = await request<Record<string, unknown>>(`/sellers/${id}`, { skipAuth: true });
  return mapSeller(data);
}

export async function apiFetchSellerProperties(sellerId: string): Promise<Property[]> {
  const data = await request<Record<string, unknown>[]>(
    `/sellers/${sellerId}/properties`,
    { skipAuth: true },
  );
  return data.map(mapProperty);
}

function mapReview(r: Record<string, unknown>): Review {
  return {
    id: toId((r.id ?? r._id) as string | { id?: string; _id?: string } | null | undefined),
    sellerId: toId(r.sellerId as string | { id?: string; _id?: string } | null | undefined),
    userId: toId(r.userId as string | { id?: string; _id?: string } | null | undefined),
    userName: r.userName as string,
    rating: (r.rating as number) ?? 0,
    text: r.text as string,
    createdAt: r.createdAt as string,
  };
}

// ─── Reviews API ────────────────────────────────────────────────────
export async function apiFetchReviewsBySeller(sellerId: string): Promise<Review[]> {
  const data = await request<Record<string, unknown>[]>(
    `/reviews/seller/${sellerId}`,
    { skipAuth: true },
  );
  return data.map(mapReview);
}

export async function apiCreateReview(data: {
  sellerId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
}): Promise<Review> {
  const res = await request<Record<string, unknown>>("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapReview(res);
}

// ─── Messages API ───────────────────────────────────────────────────
export async function apiFetchMessages(userId: string): Promise<Message[]> {
  const data = await request<Record<string, unknown>[]>(
    `/messages?userId=${userId}`,
  );
  return data.map(mapMessage);
}

export async function apiSendMessage(
  toUserId: string,
  propertyId: string,
  text: string,
): Promise<Message> {
  const res = await request<Record<string, unknown>>("/messages", {
    method: "POST",
    body: JSON.stringify({ toUserId, propertyId: propertyId || "general", text }),
  });
  return mapMessage(res);
}

export async function apiUnreadCount(): Promise<number> {
  const res = await request<{ unread: number }>("/messages/unread");
  return res.unread;
}
