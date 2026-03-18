const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

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

export async function fetchEvents(params?: Record<string, string>): Promise<PageResponse<Event>> {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`${API_URL}/events${query}`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function fetchEvent(id: number): Promise<Event> {
  const res = await fetch(`${API_URL}/events/${id}`)
  if (!res.ok) throw new Error('Event not found')
  return res.json()
}
