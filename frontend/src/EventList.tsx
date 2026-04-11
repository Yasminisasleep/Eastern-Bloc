import { useEffect, useState } from 'react'
import { Event, PageResponse, fetchEvents } from './api'

interface Props {
  onSelect: (id: number) => void
}

const CATEGORIES = ['CINEMA', 'CONCERT', 'EXHIBITION', 'THEATRE', 'FESTIVAL']
const ICONS = {
  CINEMA: '🎬',
  CONCERT: '🎵',
  EXHIBITION: '🖼️',
  THEATRE: '🎭',
  FESTIVAL: '🎪',
  DEFAULT: '🎨',
}

export default function EventList({ onSelect }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (category) params.category = category
    if (search) params.q = search

    fetchEvents(params)
      .then((page: PageResponse<Event>) => setEvents(page.content))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [category, search])

  const getIcon = (cat: string): string => {
    return ICONS[cat as keyof typeof ICONS] || ICONS.DEFAULT
  }

  return (
    <div className="events-header" data-cy="events-view">
      <h2>Upcoming Events</h2>
      
      <div className="filters">
        <input
          data-cy="events-search"
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select data-cy="events-category-filter" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="loading" data-cy="events-loading">
          <div className="spinner" />
          Loading events...
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="empty-state" data-cy="events-empty-state">No events found. Check back soon!</div>
      )}

      <div className="events-grid" data-cy="events-grid">
        {events.map(event => (
          <div
            key={event.id}
            className="event-card"
            data-cy="event-card"
            onClick={() => onSelect(event.id)}
          >
            <div className="event-image">
              {getIcon(event.category)}
            </div>
            <div className="event-content">
              <div className="event-category">
                {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
              </div>
              <h3 className="event-title">{event.title}</h3>
              <div className="event-meta">
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span>📍 {event.city}</span>
              </div>
              {event.price && <div className="event-price">${event.price.toFixed(2)}</div>}
              {event.description && (
                <p className="event-description">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
