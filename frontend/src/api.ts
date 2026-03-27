const API_URL = import.meta.env.VITE_API_URL || '/api'

// ── Types ────────────────────────────────────────────────────────────────

export type Category = 'CINEMA' | 'CONCERT' | 'EXHIBITION' | 'THEATRE' | 'FESTIVAL'

export interface Event {
  id: number
  title: string
  description: string
  category: string
  date: string
  venue: string
  city: string
  imageUrl: string | null
  price: number | null
  externalLink: string | null
  tags: string[]
  source: string
  status: string
  wantToGoCount: number
  currentUserInterested: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

export interface User {
  id: number
  email: string
  displayName: string
  photoUrl: string | null
  bio: string | null
  city: string | null
  role: string
  preferredCategories: Category[]
  tasteTags: string[]
}

export interface AuthResponse {
  token: string
  type: string
  email: string
  firstName: string
  lastName: string
}

export interface Match {
  id: number
  event: Event
  matchedUser: User
  compatibilityScore: number
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED'
  myAccepted: boolean | null
  theirAccepted: boolean | null
  expiresAt: string
  createdAt: string
}

// ── Token management ─────────────────────────────────────────────────────

let authToken: string | null = localStorage.getItem('authToken')

export function setToken(token: string) {
  authToken = token
  localStorage.setItem('authToken', token)
}

export function getToken(): string | null {
  return authToken
}

export function clearToken() {
  authToken = null
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
}

// Keep backward compat with Maria's code
export function setAuthToken(token: string | null) {
  if (token) setToken(token)
  else clearToken()
}
export function getAuthToken(): string | null {
  return authToken
}

// ── Helpers ──────────────────────────────────────────────────────────────

function headers(auth = false): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (auth && authToken) h['Authorization'] = `Bearer ${authToken}`
  return h
}

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed (${res.status})`)
  }
  return res.json()
}

// ── Auth API ─────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse & { user?: User }>(`${API_URL}/auth/login`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, displayName: string) =>
    request<AuthResponse & { user?: User }>(`${API_URL}/auth/signup`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ email, firstName: displayName, lastName: '', password }),
    }),
}

// ── Backward compat for Maria's old standalone functions ─────────────────

export async function signup(email: string, firstName: string, lastName: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>(`${API_URL}/auth/signup`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ email, firstName, lastName, password }),
  })
  setToken(data.token)
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>(`${API_URL}/auth/login`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export async function fetchEvents(params?: Record<string, string>): Promise<PageResponse<Event>> {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return request<PageResponse<Event>>(`${API_URL}/events${query}`, { headers: headers(true) })
}

export async function fetchEvent(id: number): Promise<Event> {
  return request<Event>(`${API_URL}/events/${id}`, { headers: headers(true) })
}

// ── Events API ───────────────────────────────────────────────────────────

export const eventsApi = {
  list: (params?: { category?: string; city?: string; q?: string; page?: number }) => {
    const p: Record<string, string> = {}
    if (params?.category) p.category = params.category
    if (params?.city) p.city = params.city
    if (params?.q) p.q = params.q
    if (params?.page !== undefined) p.page = String(params.page)
    const query = Object.keys(p).length ? '?' + new URLSearchParams(p).toString() : ''
    return request<PageResponse<Event>>(`${API_URL}/events${query}`, { headers: headers(true) })
  },

  get: (id: number) =>
    request<Event>(`${API_URL}/events/${id}`, { headers: headers(true) }),

  expressInterest: (eventId: number) =>
    fetch(`${API_URL}/events/${eventId}/interest`, { method: 'POST', headers: headers(true) }),

  removeInterest: (eventId: number) =>
    fetch(`${API_URL}/events/${eventId}/interest`, { method: 'DELETE', headers: headers(true) }),
}

// ── Matches API ──────────────────────────────────────────────────────────

export const matchesApi = {
  getMatches: () =>
    request<Match[]>(`${API_URL}/matches`, { headers: headers(true) }),

  getOutings: () =>
    request<Match[]>(`${API_URL}/outings`, { headers: headers(true) }),

  accept: (id: number) =>
    request<Match>(`${API_URL}/matches/${id}/accept`, { method: 'POST', headers: headers(true) }),

  reject: (id: number) =>
    request<Match>(`${API_URL}/matches/${id}/reject`, { method: 'POST', headers: headers(true) }),
}

// ── User API ─────────────────────────────────────────────────────────────

export const userApi = {
  me: () =>
    request<User>(`${API_URL}/users/me`, { headers: headers(true) }),

  updateMe: (data: Partial<User>) =>
    request<User>(`${API_URL}/users/me`, {
      method: 'PUT', headers: headers(true), body: JSON.stringify(data),
    }),
}
