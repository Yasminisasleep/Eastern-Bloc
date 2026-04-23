import { useEffect, useState } from 'react'
import { Event, PageResponse, fetchEvents } from './api'
import {
  EventCover,
  HeartIcon,
  SparklesIcon,
  UserIcon,
  ArrowRightIcon,
  CheckIcon,
  CalendarIcon,
} from './Icons'
import { ThemeToggle, Theme } from './theme'

interface Props {
  onLogin: () => void
  onSignup: () => void
  theme: Theme
  onToggleTheme: () => void
}

const SAMPLE_TAGS = ['Indie film', 'Jazz', 'Contemporary art', 'Techno', 'Theatre', 'Classical']

export default function Landing({ onLogin, onSignup, theme, onToggleTheme }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchEvents({ size: '8' })
      .then(page => setEvents((page as PageResponse<Event>).content))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const heroEvent = events[0]

  return (
    <div className="landing-page" data-cy="landing-page">
      {/* animated background blobs */}
      <div className="landing-bg">
        <span className="landing-bg-blob blob-a" />
        <span className="landing-bg-blob blob-b" />
        <span className="landing-bg-blob blob-c" />
      </div>

      <header className="landing-header">
        <span className="landing-logo">kulto</span>
        <nav className="landing-nav">
          <a href="#how">How it works</a>
          <a href="#events">Events</a>
        </nav>
        <div className="landing-auth-buttons">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button className="btn-ghost btn-sm" data-cy="open-login" onClick={onLogin}>Log in</button>
          <button className="btn-primary btn-sm" data-cy="open-signup" onClick={onSignup}>Sign up</button>
        </div>
      </header>

      <main className="landing-main">
        {/* ── HERO ─────────────────────────────────── */}
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-hero-eyebrow">
              <SparklesIcon size={13} />
              <span>Culture, together</span>
            </div>
            <h1>
              Never go to a<br />
              <span className="landing-hero-accent">concert alone</span><br />
              again.
            </h1>
            <p>
              Kulto matches you with someone who loves the same films, shows and exhibitions —
              so every outing has a plus‑one who truly gets it.
            </p>
            <div className="landing-hero-actions">
              <button className="btn-primary landing-btn-cta" data-cy="footer-signup" onClick={onSignup}>
                <span>Get started — it's free</span>
                <ArrowRightIcon size={18} />
              </button>
              <button className="btn-ghost" onClick={onLogin}>I already have an account</button>
            </div>
            <ul className="landing-hero-checks">
              <li><CheckIcon size={14} /> Real events, live data</li>
              <li><CheckIcon size={14} /> Match on actual taste</li>
              <li><CheckIcon size={14} /> Free to join</li>
            </ul>
          </div>

          <div className="landing-hero-visual">
            {/* floating chips around the card */}
            <div className="landing-chip-float chip-1">
              <SparklesIcon size={14} /> <span>92% match</span>
            </div>
            <div className="landing-chip-float chip-2">
              <HeartIcon size={14} /> <span>You're going!</span>
            </div>
            <div className="landing-chip-float chip-3">
              <CalendarIcon size={14} /> <span>This Saturday</span>
            </div>

            {/* main hero card */}
            {heroEvent ? (
              <div className="landing-hero-card">
                <EventCover
                  className="landing-hero-card-image"
                  imageUrl={heroEvent.imageUrl}
                  category={heroEvent.category}
                  iconSize={48}
                />
                <div className="landing-hero-card-body">
                  <div className={`event-category-chip cat-${heroEvent.category.toLowerCase()}`}>
                    {heroEvent.category.toLowerCase()}
                  </div>
                  <div className="landing-hero-card-title">{heroEvent.title}</div>
                  <div className="landing-hero-card-meta">
                    {new Date(heroEvent.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {heroEvent.venue ? ` · ${heroEvent.venue}` : ''}
                  </div>
                  <div className="landing-hero-card-footer">
                    <div className="landing-avatars">
                      <span className="landing-avatar a1">C</span>
                      <span className="landing-avatar a2">M</span>
                      <span className="landing-avatar a3">+</span>
                    </div>
                    <span className="landing-avatar-label">3 people want to go</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="landing-hero-card landing-hero-card-skeleton" />
            )}
          </div>
        </section>

        {/* ── TAG MARQUEE ──────────────────────────── */}
        <section className="landing-marquee">
          <div className="landing-marquee-track">
            {[...SAMPLE_TAGS, ...SAMPLE_TAGS, ...SAMPLE_TAGS].map((tag, i) => (
              <span key={i} className="landing-marquee-tag">{tag}</span>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────── */}
        <section className="landing-steps" id="how">
          <div className="landing-section-title-block">
            <div className="landing-section-kicker">How it works</div>
            <h2>Three steps to your next outing.</h2>
          </div>

          <div className="landing-steps-grid">
            <div className="landing-step">
              <div className="landing-step-number">01</div>
              <div className="landing-step-icon"><HeartIcon size={20} /></div>
              <h4>Pick what you love</h4>
              <p>Browse real events in Paris and mark the ones you'd like to go to.</p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">02</div>
              <div className="landing-step-icon"><SparklesIcon size={20} /></div>
              <h4>We find your match</h4>
              <p>We pair you with someone who shares your taste and wants the same outing.</p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">03</div>
              <div className="landing-step-icon"><UserIcon size={20} /></div>
              <h4>Meet in real life</h4>
              <p>Both say yes, share a contact, and enjoy the event together.</p>
            </div>
          </div>
        </section>

        {/* ── EVENTS ───────────────────────────────── */}
        <section className="landing-events-section" id="events">
          <div className="landing-section-heading">
            <div>
              <div className="landing-section-kicker">Live right now</div>
              <h2>Happening in Paris</h2>
            </div>
            <button className="btn-ghost btn-sm" onClick={onSignup}>
              <span>See all</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          {loading ? (
            <div className="loading" data-cy="landing-loading"><div className="spinner" /></div>
          ) : events.length === 0 ? (
            <div className="empty-state" data-cy="landing-empty-state">No events yet. Check back soon!</div>
          ) : (
            <div className="landing-events-grid">
              {events.slice(0, 6).map(event => (
                <article key={event.id} className="landing-event-card" data-cy="landing-event-card">
                  <EventCover
                    className="landing-event-image"
                    imageUrl={event.imageUrl}
                    category={event.category}
                    iconSize={32}
                  />
                  <div className="landing-event-content">
                    <div className={`event-category-chip cat-${event.category.toLowerCase()}`}>
                      {event.category.toLowerCase()}
                    </div>
                    <h4>{event.title}</h4>
                    <p className="landing-event-meta">
                      {new Date(event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                      {event.venue ? ` · ${event.venue}` : ''}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── FINAL CTA ────────────────────────────── */}
        <section className="landing-final-cta">
          <div className="landing-final-cta-card">
            <div className="landing-final-cta-glow" />
            <div className="landing-final-cta-eyebrow">
              <SparklesIcon size={13} /> <span>Join the movement</span>
            </div>
            <h3>Ready for your<br />next outing?</h3>
            <p>Join Kulto today and get matched for your first event in minutes.</p>
            <button className="btn-primary landing-btn-cta" onClick={onSignup}>
              <span>Create my free account</span>
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="landing-logo">kulto</div>
          <span>© 2026 · Made in Paris with ♥</span>
        </footer>
      </main>
    </div>
  )
}
