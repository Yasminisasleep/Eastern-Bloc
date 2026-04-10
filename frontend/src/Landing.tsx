import { useEffect, useState } from 'react'
import { Event, PageResponse, fetchEvents } from './api'

interface Props {
  onLogin: () => void
  onSignup: () => void
}

const ICONS = {
  CINEMA: '🎬',
  CONCERT: '🎵',
  EXHIBITION: '🖼️',
  THEATRE: '🎭',
  FESTIVAL: '🎪',
  DEFAULT: '🎨',
}

export default function Landing({ onLogin, onSignup }: Props) {
  const [theaterEvents, setTheaterEvents] = useState<Event[]>([])
  const [cinemaEvents, setCinemaEvents] = useState<Event[]>([])
  const [museumEvents, setMuseumEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    
    Promise.all([
      fetchEvents({ category: 'THEATRE', size: '6' }).catch(() => ({ content: [] })),
      fetchEvents({ category: 'CINEMA', size: '6' }).catch(() => ({ content: [] })),
      fetchEvents({ category: 'EXHIBITION', size: '6' }).catch(() => ({ content: [] })),
    ]).then(([theater, cinema, museum]) => {
      setTheaterEvents((theater as PageResponse<Event>).content || [])
      setCinemaEvents((cinema as PageResponse<Event>).content || [])
      setMuseumEvents((museum as PageResponse<Event>).content || [])
      setLoading(false)
    })
  }, [])

  const getIcon = (cat: string): string => {
    return ICONS[cat as keyof typeof ICONS] || ICONS.DEFAULT
  }

  const EventCard = ({ event }: { event: Event }) => (
    <div className="landing-event-card" data-cy="landing-event-card">
      <div className="landing-event-image">
        {getIcon(event.category)}
      </div>
      <div className="landing-event-content">
        <h4>{event.title}</h4>
        <p className="landing-event-meta">
          {new Date(event.date).toLocaleDateString()}
        </p>
        <p className="landing-event-venue">{event.venue}</p>
      </div>
    </div>
  )

  return (
    <div className="landing-page" data-cy="landing-page">
      <header className="landing-header">
        <div className="landing-header-container">
          <h1>🎭 Kulto</h1>
          <div className="landing-auth-buttons">
            <button className="auth-btn login-btn" data-cy="open-login" onClick={onLogin}>Login</button>
            <button className="auth-btn signup-btn" data-cy="open-signup" onClick={onSignup}>Sign Up</button>
          </div>
        </div>
        <div className="landing-hero">
          <h2>Discover Cultural Events Near You</h2>
          <p>Explore theater, cinema, museums, and more</p>
        </div>
      </header>

      <div className="landing-container">
        {loading ? (
          <div className="loading" data-cy="landing-loading">🎭 Loading events...</div>
        ) : (
          <>
            {/* Theater Section */}
            {theaterEvents.length > 0 && (
              <section className="landing-section">
                <div className="section-header">
                  <h2>🎭 Theater</h2>
                  <p>Experience the magic of live theater</p>
                </div>
                <div className="landing-events-grid">
                  {theaterEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Cinema Section */}
            {cinemaEvents.length > 0 && (
              <section className="landing-section">
                <div className="section-header">
                  <h2>🎬 Cinema</h2>
                  <p>Catch the latest films on the big screen</p>
                </div>
                <div className="landing-events-grid">
                  {cinemaEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Museums Section */}
            {museumEvents.length > 0 && (
              <section className="landing-section">
                <div className="section-header">
                  <h2>🖼️ Museums & Exhibitions</h2>
                  <p>Discover art and cultural exhibitions</p>
                </div>
                <div className="landing-events-grid">
                  {museumEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {theaterEvents.length === 0 && cinemaEvents.length === 0 && museumEvents.length === 0 && (
              <div className="empty-state" data-cy="landing-empty-state">
                <p>No events available yet. Sign up to be notified when new events are added!</p>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="landing-footer">
        <p>Join Kulto to personalize your cultural experience</p>
        <button className="footer-signup-btn" data-cy="footer-signup" onClick={onSignup}>Get Started</button>
      </footer>
    </div>
  )
}
