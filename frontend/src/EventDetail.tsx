import { useEffect, useState } from 'react'
import { Event, fetchEvent } from './api'

interface Props {
  eventId: number
  onBack: () => void
}

const ICONS: Record<string, string> = {
  CINEMA: '🎬',
  CONCERT: '🎵',
  EXHIBITION: '🖼️',
  THEATRE: '🎭',
  FESTIVAL: '🎪',
  DEFAULT: '🎨',
}

const CATEGORY_LABELS: Record<string, string> = {
  CINEMA: 'Cinema',
  CONCERT: 'Concert',
  EXHIBITION: 'Exhibition',
  THEATRE: 'Theatre',
  FESTIVAL: 'Festival',
}

function getCategoryClass(cat: string): string {
  return `cat-${cat.toLowerCase()}`
}

export default function EventDetail({ eventId, onBack }: Props) {
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState(false)
  const [wantToGo, setWantToGo] = useState(false)

  useEffect(() => {
    fetchEvent(eventId)
      .then(setEvent)
      .catch(() => setError(true))
  }, [eventId])

  if (error) return <div className="empty-state" data-cy="event-detail-error">Event not found.</div>
  if (!event) return (
    <div className="loading" data-cy="event-detail-loading">
      <div className="spinner" />
      Loading event...
    </div>
  )

  const icon = ICONS[event.category] ?? ICONS.DEFAULT
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category

  return (
    <div className="event-detail" data-cy="event-detail-view">
      <div className="event-detail-nav">
        <button className="event-detail-back-btn back-button" data-cy="event-detail-back" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="event-detail-image">{icon}</div>

      <div className="event-detail-body">
        <div className={`event-category-chip ${getCategoryClass(event.category)}`}>
          {categoryLabel}
        </div>

        <h1 className="event-detail-title" data-cy="event-detail-title">{event.title}</h1>

        <div className="event-detail-info-row">
          📅 {new Date(event.date).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="event-detail-info-row">
          📍 {event.venue}{event.city ? `, ${event.city}` : ''}
        </div>
        {event.price != null && (
          <div className="event-detail-info-row">💶 €{event.price.toFixed(2)}</div>
        )}

        <div className="event-detail-divider" />

        {event.description && (
          <>
            <div className="event-detail-section-title">About</div>
            <p className="event-detail-description">{event.description}</p>
            <div className="event-detail-divider" />
          </>
        )}

        {event.tags && event.tags.length > 0 && (
          <>
            <div className="event-detail-section-title">Tags</div>
            <div className="tags">
              {event.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div className="event-detail-divider" />
          </>
        )}

        <div className="event-detail-social-proof">3 people want to go</div>

        <div className="event-detail-cta">
          <button
            className={`btn-want-to-go${wantToGo ? ' active' : ''}`}
            onClick={() => setWantToGo(v => !v)}
          >
            {wantToGo ? '♥ You want to go — waiting for a match' : '♥ I want to go'}
          </button>

          {event.externalLink && (
            <button
              className="btn-ghost"
              data-cy="event-detail-ticket-link"
              onClick={() => window.open(event.externalLink || '', '_blank')}
            >
              View on official site ↗
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
