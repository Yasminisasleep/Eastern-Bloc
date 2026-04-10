import { useEffect, useState } from 'react'
import { Event, fetchEvent } from './api'

interface Props {
  eventId: number
  onBack: () => void
}

const ICONS = {
  CINEMA: '🎬',
  CONCERT: '🎵',
  EXHIBITION: '🖼️',
  THEATRE: '🎭',
  FESTIVAL: '🎪',
  DEFAULT: '🎨',
}

export default function EventDetail({ eventId, onBack }: Props) {
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchEvent(eventId)
      .then(setEvent)
      .catch(() => setError(true))
  }, [eventId])

  if (error) return <div className="empty-state" data-cy="event-detail-error">Event not found.</div>
  if (!event) return <div className="loading" data-cy="event-detail-loading">🎭 Loading event...</div>

  const getIcon = (cat: string): string => {
    return ICONS[cat as keyof typeof ICONS] || ICONS.DEFAULT
  }

  return (
    <div className="event-detail" data-cy="event-detail-view">
      <div className="event-detail-header">
        <div>
          <h2 className="event-detail-title" data-cy="event-detail-title">{event.title}</h2>
          <div className="event-category">
            {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
          </div>
        </div>
        <button className="back-button" data-cy="event-detail-back" onClick={onBack}>← Back</button>
      </div>

      <div className="event-detail-content">
        <div className="event-detail-main">
          <h3>Description</h3>
          <p>{event.description || 'No description available.'}</p>

          <div className="event-details-info">
            <div className="info-row">
              <span className="info-label">📅 Date</span>
              <span>{new Date(event.date).toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📍 Venue</span>
              <span>{event.venue}</span>
            </div>
            <div className="info-row">
              <span className="info-label">🏙️ City</span>
              <span>{event.city}</span>
            </div>
            {event.price && (
              <div className="info-row">
                <span className="info-label">💰 Price</span>
                <span>${event.price.toFixed(2)}</span>
              </div>
            )}
          </div>

          {event.externalLink && (
            <button data-cy="event-detail-ticket-link" onClick={() => window.open(event.externalLink || '', '_blank')}>
              Get Tickets
            </button>
          )}
        </div>

        <div>
          <h3>Event Info</h3>
          <div style={{ fontSize: '4em', textAlign: 'center', margin: '30px 0' }}>
            {getIcon(event.category)}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div>
              <h3>Tags</h3>
              <div className="tags">
                {event.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {event.source && (
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid rgba(212, 175, 55, 0.2)' }}>
              <p style={{ color: '#b8956a', fontSize: '0.9em' }}>
                Source: <strong>{event.source}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
