import { useEffect, useMemo, useState } from 'react'
import { Event, PageResponse, fetchEvents } from './api'
import { SearchIcon, EventCover, SparklesIcon, CalendarIcon, MapPinIcon, XIcon } from './Icons'

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

const DATE_CHIPS = [
  { label: 'Today', value: 'today' },
  { label: 'This weekend', value: 'weekend' },
  { label: 'This week', value: 'week' },
]

function getDateRange(chip: string): { from: string; to: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  if (chip === 'today') {
    return { from: start.toISOString().slice(0, 19), to: end.toISOString().slice(0, 19) }
  }
  if (chip === 'weekend') {
    const day = start.getDay()
    const daysToSat = day === 0 ? 6 : (6 - day)
    const sat = new Date(start); sat.setDate(start.getDate() + daysToSat)
    const sun = new Date(sat); sun.setDate(sat.getDate() + 1)
    const sunEnd = new Date(sun); sunEnd.setHours(23, 59, 59)
    return { from: sat.toISOString().slice(0, 19), to: sunEnd.toISOString().slice(0, 19) }
  }
  const weekEnd = new Date(end); weekEnd.setDate(end.getDate() + 7)
  return { from: start.toISOString().slice(0, 19), to: weekEnd.toISOString().slice(0, 19) }
}

const getCategoryClass = (cat: string) => `cat-${cat.toLowerCase()}`

function formatDay(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function formatFullDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function EventList({ onSelect }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [dateChip, setDateChip] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (category) params.category = category
    if (search) params.q = search
    if (dateChip) {
      const range = getDateRange(dateChip)
      params.from = range.from
      params.to = range.to
    }

    fetchEvents(params)
      .then((page: PageResponse<Event>) => setEvents(page.content))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [category, search, dateChip])

  const hasFilters = !!(category || search || dateChip)
  const featured = events[0]
  const rest = useMemo(() => events.slice(1), [events])

  return (
    <div className="discovery-page" data-cy="events-view">
      {/* subtle gradient background */}
      <div className="discovery-bg" aria-hidden>
        <span className="discovery-bg-blob blob-d" />
        <span className="discovery-bg-blob blob-e" />
      </div>

      <header className="discovery-header">
        <div className="discovery-eyebrow">
          <SparklesIcon size={12} /> <span>Live in Paris</span>
        </div>
        <h1 className="discovery-title">
          Discover <span className="discovery-title-accent">cultural Paris</span>
        </h1>
        <p className="discovery-subtitle">
          {loading
            ? 'Loading the scene…'
            : `${events.length} event${events.length === 1 ? '' : 's'} worth sharing, handpicked for you`}
        </p>

        <div className="discovery-search">
          <span className="discovery-search-icon"><SearchIcon size={18} /></span>
          <input
            data-cy="events-search"
            type="text"
            className="input discovery-search-input"
            placeholder="Search events, venues, artists…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="discovery-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="filter-bar">
        <div className="filter-group">
          <button
            className={`category-tab${category === '' ? ' active' : ''}`}
            onClick={() => setCategory('')}
          >All</button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`category-tab${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >{CATEGORY_LABELS[c]}</button>
          ))}
        </div>

        <div className="filter-sep" aria-hidden />

        <div className="filter-group filter-group-dates">
          {DATE_CHIPS.map(chip => (
            <button
              key={chip.value}
              className={`date-chip${dateChip === chip.value ? ' active' : ''}`}
              onClick={() => setDateChip(dateChip === chip.value ? '' : chip.value)}
            >{chip.label}</button>
          ))}
        </div>

        {hasFilters && (
          <button
            type="button"
            className="filter-clear"
            onClick={() => { setCategory(''); setSearch(''); setDateChip('') }}
          >
            <XIcon size={13} /> Clear
          </button>
        )}
      </div>

      {/* Hidden select for Cypress compatibility */}
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

      {loading && (
        <div className="events-grid events-grid-skeleton" data-cy="events-loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="event-card event-card-skeleton">
              <div className="event-image skeleton-shimmer" />
              <div className="event-content">
                <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: 14 }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: '85%', height: 18, marginTop: 10 }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: 12, marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="empty-state" data-cy="events-empty-state">
          <div className="empty-state-icon"><SearchIcon size={28} /></div>
          <div className="empty-state-title">Nothing matches yet</div>
          <div className="empty-state-text">Try clearing your filters or searching for something else.</div>
          {hasFilters && (
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => { setCategory(''); setSearch(''); setDateChip('') }}
              style={{ width: 'auto', marginTop: 12 }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!loading && featured && (
        <article
          className="event-featured"
          data-cy="event-card"
          onClick={() => onSelect(featured.id)}
        >
          <EventCover
            className="event-featured-image"
            imageUrl={featured.imageUrl}
            category={featured.category}
            iconSize={64}
          />
          <div className="event-featured-body">
            <div className="event-featured-top">
              <span className="event-featured-badge"><SparklesIcon size={12} /> Featured</span>
              <span className={`event-category-chip ${getCategoryClass(featured.category)}`}>
                {CATEGORY_LABELS[featured.category] ?? featured.category}
              </span>
            </div>
            <h2 className="event-featured-title">{featured.title}</h2>
            <div className="event-featured-meta">
              <span><CalendarIcon size={14} /> {formatFullDate(featured.date)}</span>
              {featured.venue && <span><MapPinIcon size={14} /> {featured.venue}</span>}
            </div>
            {featured.description && (
              <p className="event-featured-desc">{featured.description}</p>
            )}
            <div className="event-featured-cta">
              <span className="btn-primary btn-sm" style={{ width: 'auto', padding: '0 20px' }}>View details →</span>
              {featured.price != null && (
                <span className="event-featured-price">from €{featured.price.toFixed(2)}</span>
              )}
            </div>
          </div>
        </article>
      )}

      {!loading && rest.length > 0 && (
        <div className="events-grid" data-cy="events-grid">
          {rest.map(event => (
            <article
              key={event.id}
              className="event-card"
              data-cy="event-card"
              onClick={() => onSelect(event.id)}
            >
              <div className="event-image-wrap">
                <EventCover
                  className="event-image"
                  imageUrl={event.imageUrl}
                  category={event.category}
                  iconSize={44}
                />
                <div className="event-date-badge">
                  <div className="event-date-badge-day">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="event-date-badge-month">
                    {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="event-content">
                <div className={`event-category-chip ${getCategoryClass(event.category)}`}>
                  {CATEGORY_LABELS[event.category] ?? event.category}
                </div>
                <div className="event-title">{event.title}</div>
                <div className="event-meta">
                  <MapPinIcon size={12} /> {event.venue || 'Paris'} · {formatDay(event.date)}
                </div>
                {event.price != null && (
                  <div className="event-price">€{event.price.toFixed(2)}</div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
