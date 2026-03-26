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
  firstName: string
  lastName: string
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

export async function signup(email: string, firstName: string, lastName: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, firstName, lastName, password }),
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
