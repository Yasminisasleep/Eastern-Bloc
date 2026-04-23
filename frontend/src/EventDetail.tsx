import { useEffect, useState } from 'react'
import { Event, fetchEvent, fetchEventInterest, addEventInterest, removeEventInterest } from './api'
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  EuroIcon,
  HeartIcon,
  ExternalLinkIcon,
  EventCover,
} from './Icons'

interface Props {
  eventId: number
  onBack: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  CINEMA: 'Cinema',
  CONCERT: 'Concert',
  EXHIBITION: 'Exhibition',
  THEATRE: 'Theatre',
  FESTIVAL: 'Festival',
}

const getCategoryClass = (cat: string) => `cat-${cat.toLowerCase()}`

export default function EventDetail({ eventId, onBack }: Props) {
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState(false)
  const [wantToGo, setWantToGo] = useState(false)
  const [interestCount, setInterestCount] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEvent(eventId).then(setEvent).catch(() => setError(true))
    fetchEventInterest(eventId)
      .then(s => { setWantToGo(s.interested); setInterestCount(s.count) })
      .catch(() => {})
  }, [eventId])

  const toggleInterest = async () => {
    if (saving) return
    setSaving(true)
    try {
      const result = wantToGo
        ? await removeEventInterest(eventId)
        : await addEventInterest(eventId)
      setWantToGo(result.interested)
      setInterestCount(result.count)
    } catch (e) {
      console.warn('interest toggle failed', e)
    } finally {
      setSaving(false)
    }
  }

  if (error) return <div className="empty-state" data-cy="event-detail-error">Event not found.</div>
  if (!event) return (
    <div className="loading" data-cy="event-detail-loading">
      <div className="spinner" />
      Loading event…
    </div>
  )

  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category

  return (
    <div className="event-detail" data-cy="event-detail-view">
      <div className="event-detail-nav">
        <button className="icon-btn back-button" data-cy="event-detail-back" onClick={onBack} aria-label="Back">
          <ArrowLeftIcon size={22} />
        </button>
      </div>

      <EventCover
        className="event-detail-image"
        imageUrl={event.imageUrl}
        category={event.category}
        iconSize={72}
      />

      <div className="event-detail-body">
        <div className={`event-category-chip ${getCategoryClass(event.category)}`}>
          {categoryLabel}
        </div>

        <h1 className="event-detail-title" data-cy="event-detail-title">{event.title}</h1>

        <div className="event-detail-info-row">
          <CalendarIcon size={18} />
          <span>{new Date(event.date).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="event-detail-info-row">
          <MapPinIcon size={18} />
          <span>{event.venue}{event.city ? `, ${event.city}` : ''}</span>
        </div>
        {event.price != null && (
          <div className="event-detail-info-row">
            <EuroIcon size={18} />
            <span>€{event.price.toFixed(2)}</span>
          </div>
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

        <div className="event-detail-social-proof">
          {interestCount === 0
            ? 'Be the first one to say you want to go'
            : `${interestCount} ${interestCount === 1 ? 'person wants' : 'people want'} to go`}
        </div>

        <div className="event-detail-cta">
          <button
            className={`btn-want-to-go${wantToGo ? ' active' : ''}`}
            onClick={toggleInterest}
            disabled={saving}
          >
            <HeartIcon size={20} filled={wantToGo} />
            <span>{wantToGo ? 'You want to go — finding your match' : 'I want to go'}</span>
          </button>

          {event.externalLink && (
            <button
              className="btn-ghost"
              data-cy="event-detail-ticket-link"
              onClick={() => window.open(event.externalLink || '', '_blank')}
            >
              <ExternalLinkIcon size={16} />
              <span style={{ marginLeft: 6 }}>View on official site</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
