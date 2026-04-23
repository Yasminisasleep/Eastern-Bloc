import { useEffect, useState } from 'react'
import { Event, PageResponse, fetchEvents } from './api'

interface Props {
  onLogin: () => void
  onSignup: () => void
}

const ICONS: Record<string, string> = {
  CINEMA: '🎬', CONCERT: '🎵', EXHIBITION: '🖼️', THEATRE: '🎭', FESTIVAL: '🎪', DEFAULT: '🎨',
}

const FALLBACK_EVENTS: Event[] = [
  {
    id: -1,
    title: 'Open Air Cinema Night',
    description: '',
    category: 'CINEMA',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    venue: 'Studio Lumiere',
    city: 'Paris',
    imageUrl: null,
    price: 12,
    externalLink: null,
    tags: ['indie', 'screening'],
    source: 'fallback',
    status: 'ACTIVE',
  },
  {
    id: -2,
    title: 'Contemporary Theatre Session',
    description: '',
    category: 'THEATRE',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    venue: 'Le Petit Chatelet',
    city: 'Paris',
    imageUrl: null,
    price: 18,
    externalLink: null,
    tags: ['stage'],
    source: 'fallback',
    status: 'ACTIVE',
  },
  {
    id: -3,
    title: 'Modern Art Walkthrough',
    description: '',
    category: 'EXHIBITION',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    venue: 'Musee Urbain',
    city: 'Paris',
    imageUrl: null,
    price: 0,
    externalLink: null,
    tags: ['art'],
    source: 'fallback',
    status: 'ACTIVE',
  },
]

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
      const mergedEvents = [
        ...(theatre as PageResponse<Event>).content,
        ...(cinema as PageResponse<Event>).content,
        ...(exhibition as PageResponse<Event>).content,
      ]
      setEvents(mergedEvents.length > 0 ? mergedEvents : FALLBACK_EVENTS)
      setLoading(false)
    })
  }, [])

  return (
    <div className="landing-page" data-cy="landing-page">
      <div className="landing-shell">
        <header className="landing-header">
          <span className="landing-logo">kulto</span>
          <div className="landing-auth-buttons">
            <button className="btn-secondary btn-sm" data-cy="open-login" onClick={onLogin}>Log in</button>
            <button className="btn-primary btn-sm" data-cy="open-signup" onClick={onSignup}>Sign up</button>
          </div>
        </header>

        <section className="landing-hero">
          <div className="landing-hero-card">
            <span className="landing-eyebrow">Editorial Selection</span>
            <p className="landing-editorial-line">Paris Cultural Week</p>
            <h2>Discover Cultural Events Near You</h2>
            <p className="landing-hero-lede">
              Browse cinema, theatre, concerts, and exhibitions, then prepare your next outing with people who share your vibe.
            </p>
            <div className="landing-hero-actions">
              <button className="btn-primary" data-cy="footer-signup" onClick={onSignup}>
                Get started
              </button>
              <button className="btn-secondary" type="button" onClick={onLogin}>
                I already have an account
              </button>
            </div>
            <div className="landing-hero-stats" aria-label="Kulto highlights">
              <div className="landing-stat">
                <strong>3 curated flows</strong>
                <span>cinema, theatre, exhibition</span>
              </div>
              <div className="landing-stat">
                <strong>Live ingestion</strong>
                <span>real-time partner feeds</span>
              </div>
              <div className="landing-stat">
                <strong>Secure by default</strong>
                <span>JWT authenticated sessions</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-events-section" aria-live="polite">
          <div className="landing-events-head">
            <h3>Featured this week</h3>
            <p>A curated snapshot from cinema, theatre, and exhibition categories.</p>
          </div>
          {loading ? (
            <div className="loading" data-cy="landing-loading">
              <div className="spinner" />
              <p>Curating events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state" data-cy="landing-empty-state">No events yet. Check back soon!</div>
          ) : (
            <div className="landing-events-grid">
              {events.map(event => (
                <article key={event.id} className="landing-event-card" data-cy="landing-event-card">
                  <div className="landing-event-image" aria-hidden="true">{ICONS[event.category] ?? ICONS.DEFAULT}</div>
                  <div className="landing-event-content">
                    <span className="landing-event-category">{event.category.toLowerCase()}</span>
                    <h4>{event.title}</h4>
                    <p className="landing-event-meta">
                      {new Date(event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} · {event.city}
                    </p>
                    <p className="landing-event-venue">{event.venue}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="landing-cta-section">
          <p>Join Kulto to unlock personalized cultural matching.</p>
          <button className="btn-primary" onClick={onSignup}>Create account</button>
        </section>
      </div>
    </div>
  )
}
