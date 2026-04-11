const API_URL = import.meta.env.VITE_API_URL || '/api'

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
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

export interface AuthResponse {
  token: string
  type: string
  email: string
  displayName: string
}

export interface SignupPayload {
  email: string
  displayName: string
  password: string
  dateOfBirth?: string
  city?: string
}

export interface PreferencesPayload {
  preferredCategories: string[]
  interestTags: string[]
  geographicRadiusKm: number
}

export interface UserPreferences extends PreferencesPayload {
  updatedAt?: string
}

export interface MatchEvent {
  id: number
  title: string
  category: string
  date: string
  city: string
  venue: string
}

export interface MatchSummary {
  id: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED' | 'CANCELLED'
  compatibilityScore: number
  matchedUserName: string
  event: MatchEvent
}

export interface NotificationItem {
  id: number
  status: 'UNREAD' | 'READ'
  createdAt: string
  message: string
  match: MatchSummary
}

export interface MatchDetail extends MatchSummary {
  matchedUserBio?: string
  matchedUserCity?: string
  matchedUserTags?: string[]
}

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

function getHeaders(includeAuth = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (includeAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const fullPayload = {
    email: payload.email,
    displayName: payload.displayName,
    password: payload.password,
    dateOfBirth: payload.dateOfBirth,
    city: payload.city,
  }

  try {
    let res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(fullPayload),
    })

    if (!res.ok) {
      try {
        const error = await res.json()
        throw new Error(error.message || `Signup failed with status ${res.status}`)
      } catch (e) {
        if (e instanceof Error) throw e
        throw new Error(`Signup failed with status ${res.status}`)
      }
    }
    const data = await res.json()
    setAuthToken(data.token)
    return data
  } catch (e) {
    if (e instanceof TypeError && e.message.includes('fetch')) {
      throw new Error('NetworkError when attempting to fetch resource on sign up. Backend may not be running.')
    }
    throw e
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      try {
        const error = await res.json()
        throw new Error(error.message || `Login failed with status ${res.status}`)
      } catch (e) {
        if (e instanceof Error) throw e
        throw new Error(`Login failed with status ${res.status}`)
      }
    }
    const data = await res.json()
    setAuthToken(data.token)
    return data
  } catch (e) {
    if (e instanceof TypeError && e.message.includes('fetch')) {
      throw new Error('NetworkError when attempting to fetch resource on login. Backend may not be running.')
    }
    throw e
  }
}

export async function fetchEvents(params?: Record<string, string>): Promise<PageResponse<Event>> {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`${API_URL}/events${query}`, {
    headers: getHeaders(true),
  })
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function fetchEvent(id: number): Promise<Event> {
  const res = await fetch(`${API_URL}/events/${id}`, {
    headers: getHeaders(true),
  })
  if (!res.ok) throw new Error('Event not found')
  return res.json()
}

export async function fetchUserPreferences(userId: number): Promise<UserPreferences> {
  const res = await fetch(`${API_URL}/users/${userId}/preferences`, {
    headers: getHeaders(true),
  })
  if (!res.ok) throw new Error(`Failed to fetch preferences (${res.status})`)
  return res.json()
}

export async function saveUserPreferences(userId: number, payload: PreferencesPayload): Promise<UserPreferences> {
  const res = await fetch(`${API_URL}/users/${userId}/preferences`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to save preferences (${res.status})`)
  return res.json()
}

export async function fetchUserNotifications(userId: number): Promise<NotificationItem[]> {
  const res = await fetch(`${API_URL}/users/${userId}/notifications`, {
    headers: getHeaders(true),
  })
  if (!res.ok) throw new Error(`Failed to fetch notifications (${res.status})`)
  return res.json()
}

export async function fetchMatchDetail(matchId: number): Promise<MatchDetail> {
  const res = await fetch(`${API_URL}/matches/${matchId}`, {
    headers: getHeaders(true),
  })
  if (!res.ok) throw new Error(`Failed to fetch match (${res.status})`)
  return res.json()
}

export async function acceptMatch(matchId: number): Promise<MatchDetail> {
  const res = await fetch(`${API_URL}/matches/${matchId}/accept`, {
    method: 'PUT',
    headers: getHeaders(true),
  })
  if (!res.ok) throw new Error(`Failed to accept match (${res.status})`)
  return res.json()
}

export async function rejectMatch(matchId: number): Promise<MatchDetail> {
  const res = await fetch(`${API_URL}/matches/${matchId}/reject`, {
    method: 'PUT',
    headers: getHeaders(true),
  })
  if (!res.ok) throw new Error(`Failed to reject match (${res.status})`)
  return res.json()
}
