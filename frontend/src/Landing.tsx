import { useEffect, useState } from 'react'
import { Event, PageResponse, fetchEvents } from './api'

interface Props {
  onLogin: () => void
  onSignup: () => void
}

const ICONS: Record<string, string> = {
  CINEMA: '🎬', CONCERT: '🎵', EXHIBITION: '🖼️', THEATRE: '🎭', FESTIVAL: '🎪', DEFAULT: '🎨',
}

export default function Landing({ onLogin, onSignup }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchEvents({ category: 'THEATRE', size: '2' }).catch(() => ({ content: [] as Event[] })),
      fetchEvents({ category: 'CINEMA', size: '2' }).catch(() => ({ content: [] as Event[] })),
      fetchEvents({ category: 'EXHIBITION', size: '2' }).catch(() => ({ content: [] as Event[] })),
    ]).then(([theatre, cinema, exhibition]) => {
      setEvents([
        ...(theatre as PageResponse<Event>).content,
        ...(cinema as PageResponse<Event>).content,
        ...(exhibition as PageResponse<Event>).content,
      ])
      setLoading(false)
    })
  }, [])

  return (
    <div className="landing-page" data-cy="landing-page">
      <header className="landing-header">
        <span className="landing-logo">kulto</span>
        <div className="landing-auth-buttons">
          <button className="btn-secondary btn-sm" data-cy="open-login" onClick={onLogin}>Log in</button>
          <button className="btn-primary btn-sm" data-cy="open-signup" onClick={onSignup}>Sign up</button>
        </div>
      </header>

      <div className="landing-hero">
        <h2>Discover Cultural Events Near You</h2>
        <p>Browse cinema, theatre, concerts, and exhibitions — then get matched with someone to go with.</p>
        <button className="btn-primary" data-cy="footer-signup" onClick={onSignup} style={{ maxWidth: '240px' }}>
          Get started
        </button>
      </div>

      <div className="landing-events-section">
        {loading ? (
          <div className="loading" data-cy="landing-loading"><div className="spinner" /></div>
        ) : events.length === 0 ? (
          <div className="empty-state" data-cy="landing-empty-state">No events yet. Check back soon!</div>
        ) : (
          <div className="landing-events-grid">
            {events.map(event => (
              <div key={event.id} className="landing-event-card" data-cy="landing-event-card">
                <div className="landing-event-image">{ICONS[event.category] ?? ICONS.DEFAULT}</div>
                <div className="landing-event-content">
                  <h4>{event.title}</h4>
                  <p className="landing-event-meta">{new Date(event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</p>
                  <p className="landing-event-venue">{event.venue}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="landing-cta-section">
        <p>Join Kulto to get matched for your next outing</p>
        <button className="btn-primary" onClick={onSignup} style={{ maxWidth: '240px' }}>Create account</button>
      </div>
    </div>
  )
}
