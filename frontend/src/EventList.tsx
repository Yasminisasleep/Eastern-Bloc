import { useEffect, useState } from 'react'
import { Event, PageResponse, fetchEvents } from './api'

interface Props {
  onSelect: (id: number) => void
}

const CATEGORIES = ['CINEMA', 'CONCERT', 'EXHIBITION', 'THEATRE', 'FESTIVAL']

const CATEGORY_LABELS: Record<string, string> = {
  CINEMA: 'Cinema',
  CONCERT: 'Concert',
  EXHIBITION: 'Exhibition',
  THEATRE: 'Theatre',
  FESTIVAL: 'Festival',
}

const ICONS: Record<string, string> = {
  CINEMA: '🎬',
  CONCERT: '🎵',
  EXHIBITION: '🖼️',
  THEATRE: '🎭',
  FESTIVAL: '🎪',
  DEFAULT: '🎨',
}

const DATE_CHIPS = [
  { label: 'Today', value: 'today' },
  { label: 'This weekend', value: 'weekend' },
  { label: 'This week', value: 'week' },
]

function getCategoryClass(cat: string): string {
  return `cat-${cat.toLowerCase()}`
}

function getIcon(cat: string): string {
  return ICONS[cat] ?? ICONS.DEFAULT
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

  return (
    <div data-cy="events-view">
      <div className="discovery-header">
        <div className="discovery-city-label">What's on</div>
        <div className="discovery-search">
          <span className="discovery-search-icon">🔍</span>
          <input
            data-cy="events-search"
            type="text"
            className="input"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="category-tabs">
        <button
          className={`category-tab${category === '' ? ' active' : ''}`}
          onClick={() => setCategory('')}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`category-tab${category === c ? ' active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Hidden select preserved for Cypress .select() compatibility */}
      <div className="events-category-select-wrapper">
        <select
          data-cy="events-category-filter"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      <div className="date-chips">
        {DATE_CHIPS.map(chip => (
          <button key={chip.value} className="date-chip">{chip.label}</button>
        ))}
      </div>

      {loading && (
        <div className="loading" data-cy="events-loading">
          <div className="spinner" />
          Loading events...
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="empty-state" data-cy="events-empty-state">
          <div className="empty-state-title">No events found</div>
          No events match your filters.
        </div>
      )}

      <div className="events-grid" data-cy="events-grid">
        {events.map(event => (
          <div
            key={event.id}
            className="event-card"
            data-cy="event-card"
            onClick={() => onSelect(event.id)}
          >
            <div className="event-image">{getIcon(event.category)}</div>
            <div className="event-content">
              <div className={`event-category-chip ${getCategoryClass(event.category)}`}>
                {CATEGORY_LABELS[event.category] ?? event.category}
              </div>
              <div className="event-title">{event.title}</div>
              <div className="event-meta">
                {event.venue} · {new Date(event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </div>
              {event.price != null && (
                <div className="event-price">€{event.price.toFixed(2)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
