import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsApi, Event } from '../api'
import { useAuth } from '../context/AuthContext'
import CategoryChip from '../components/CategoryChip'
import BottomNav from '../components/BottomNav'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [interestLoading, setInterestLoading] = useState(false)

  useEffect(() => {
    eventsApi.get(Number(id))
      .then(setEvent)
      .catch(() => navigate('/discover'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const toggleInterest = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }
    if (!event) return
    setInterestLoading(true)
    try {
      if (event.currentUserInterested) {
        await eventsApi.removeInterest(event.id)
        setEvent(current => current ? { ...current, currentUserInterested: false, wantToGoCount: Math.max(0, current.wantToGoCount - 1) } : current)
      } else {
        await eventsApi.expressInterest(event.id)
        setEvent(current => current ? { ...current, currentUserInterested: true, wantToGoCount: current.wantToGoCount + 1 } : current)
      }
    } finally {
      setInterestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="app-shell min-h-screen pb-24">
        <div className="page-wrap px-1 pt-6 animate-pulse">
          <div className="glass-card aspect-[16/9] rounded-[34px]" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-1/4 rounded bg-surface-low" />
            <div className="h-9 w-2/3 rounded bg-surface-low" />
            <div className="h-4 w-1/2 rounded bg-surface-low" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) return null

  const date = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const time = new Date(event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="app-shell min-h-screen pb-28">
      <header className="sticky top-0 z-40 border-b border-outline-soft bg-[rgba(11,16,22,0.74)] backdrop-blur-xl">
        <div className="page-wrap flex items-center justify-between px-1 py-4">
          <button onClick={() => navigate(-1)} className="secondary-btn p-3">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          {event.externalLink ? (
            <a href={event.externalLink} target="_blank" rel="noreferrer" className="secondary-btn p-3">
              <span className="material-symbols-rounded">open_in_new</span>
            </a>
          ) : (
            <div />
          )}
        </div>
      </header>

      <main className="page-wrap px-1 pt-6">
        <div className="glass-card overflow-hidden rounded-[34px]">
          <div className="relative aspect-[16/9] overflow-hidden bg-surface-low">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-on-surface-disabled">
                <span className="material-symbols-rounded text-6xl">image</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgba(11,16,22,0.84)] to-transparent" />
          </div>

          <div className="space-y-6 px-5 py-6 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <CategoryChip category={event.category} />
                <h1 className="mt-3 text-4xl leading-tight text-on-surface md:text-5xl">{event.title}</h1>
              </div>
              <div className="glass-card rounded-[22px] px-4 py-3 text-right text-sm text-on-surface-muted">
                <p className="font-semibold text-on-surface">{event.wantToGoCount} interested</p>
                <p>{event.currentUserInterested ? 'You are in the pool' : 'Matching open'}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="glass-card rounded-[24px] p-4">
                    <div className="flex items-center gap-2 text-sm text-on-surface-muted">
                      <span className="material-symbols-rounded text-[18px]">calendar_today</span>
                      <span>Date</span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-on-surface">{date}</p>
                    <p className="text-sm text-on-surface-muted">{time}</p>
                  </div>

                  <div className="glass-card rounded-[24px] p-4">
                    <div className="flex items-center gap-2 text-sm text-on-surface-muted">
                      <span className="material-symbols-rounded text-[18px]">location_on</span>
                      <span>Venue</span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-on-surface">{event.venue}</p>
                    <p className="text-sm text-on-surface-muted">{event.city}</p>
                  </div>
                </div>

                {event.price != null && (
                  <div className="glass-card rounded-[24px] p-4">
                    <div className="flex items-center gap-2 text-sm text-on-surface-muted">
                      <span className="material-symbols-rounded text-[18px]">euro</span>
                      <span>Price</span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-on-surface">
                      {event.price === 0 ? 'Free' : `€${event.price.toFixed(2)}`}
                    </p>
                  </div>
                )}

                {event.description && (
                  <div>
                    <h2 className="text-3xl text-on-surface">About</h2>
                    <p className="mt-3 text-base leading-7 text-on-surface-muted">{event.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {event.tags?.length > 0 && (
                  <div className="glass-card rounded-[28px] p-5">
                    <h2 className="text-3xl text-on-surface">Tags</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {event.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-primary-light px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="hero-card rounded-[28px] p-5">
                  <p className="eyebrow">Why tap interested</p>
                  <p className="mt-3 text-base leading-7 text-on-surface-muted">
                    Showing interest adds you to the matching pool for this event. If someone with overlapping taste is also in, Kulto can propose the outing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 bg-gradient-to-t from-background via-background/95 to-transparent px-2 pt-6">
        <button
          onClick={toggleInterest}
          disabled={interestLoading}
          className={`w-full ${event.currentUserInterested ? 'primary-btn' : 'secondary-btn border-primary-mid text-primary-mid'} disabled:opacity-60`}
        >
          <span className="material-symbols-rounded">favorite</span>
          {event.currentUserInterested ? 'You are in the matching pool' : 'I want to go'}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
