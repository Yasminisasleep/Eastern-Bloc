import { useEffect, useState } from 'react'
import { Event, fetchEvent } from './api'

interface Props {
  eventId: number
  onBack: () => void
}

export default function EventDetail({ eventId, onBack }: Props) {
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchEvent(eventId)
      .then(setEvent)
      .catch(() => setError(true))
  }, [eventId])

  if (error) return <p>Event not found.</p>
  if (!event) return <p>Loading...</p>

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '16px', padding: '8px 16px', cursor: 'pointer' }}>
        Back
      </button>

      <h2>{event.title}</h2>
      <p style={{ color: '#666' }}>
        {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
      </p>

      <p>{event.description}</p>

      <table style={{ borderCollapse: 'collapse', marginTop: '16px' }}>
        <tbody>
          <tr><td style={{ padding: '4px 16px 4px 0', fontWeight: 'bold' }}>Date</td><td>{new Date(event.date).toLocaleString()}</td></tr>
          <tr><td style={{ padding: '4px 16px 4px 0', fontWeight: 'bold' }}>Venue</td><td>{event.venue}</td></tr>
          <tr><td style={{ padding: '4px 16px 4px 0', fontWeight: 'bold' }}>City</td><td>{event.city}</td></tr>
          {event.price && <tr><td style={{ padding: '4px 16px 4px 0', fontWeight: 'bold' }}>Price</td><td>{event.price}EUR</td></tr>}
        </tbody>
      </table>

      {event.tags && event.tags.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {event.tags.map(tag => (
            <span key={tag} style={{ background: '#eee', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {event.externalLink && (
        <p style={{ marginTop: '16px' }}>
          <a href={event.externalLink} target="_blank" rel="noreferrer">More info</a>
        </p>
      )}
    </div>
  )
}
