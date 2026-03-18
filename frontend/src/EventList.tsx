import { useEffect, useState } from 'react'
import { Event, PageResponse, fetchEvents } from './api'

interface Props {
  onSelect: (id: number) => void
}

const CATEGORIES = ['CINEMA', 'CONCERT', 'EXHIBITION', 'THEATRE', 'FESTIVAL']

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
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px', flex: 1, minWidth: '200px' }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '8px' }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && events.length === 0 && <p>No events found.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {events.map(event => (
          <div
            key={event.id}
            onClick={() => onSelect(event.id)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
            }}
          >
            <h3 style={{ margin: '0 0 8px' }}>{event.title}</h3>
            <p style={{ margin: '0 0 4px', color: '#666', fontSize: '14px' }}>
              {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
              {new Date(event.date).toLocaleDateString()} at {event.venue}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>{event.city}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
