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
  }, [id])

  const toggleInterest = async () => {
    if (!user) { navigate('/login', { state: { from: `/events/${id}` } }); return }
    if (!event) return
    setInterestLoading(true)
    try {
      if (event.currentUserInterested) {
        await eventsApi.removeInterest(event.id)
        setEvent(e => e ? { ...e, currentUserInterested: false, wantToGoCount: e.wantToGoCount - 1 } : e)
      } else {
        await eventsApi.expressInterest(event.id)
        setEvent(e => e ? { ...e, currentUserInterested: true, wantToGoCount: e.wantToGoCount + 1 } : e)
      }
    } finally {
      setInterestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 animate-pulse">
        <div className="w-full aspect-video bg-surface-low" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-surface-low rounded w-1/4" />
          <div className="h-7 bg-surface-low rounded w-3/4" />
          <div className="h-4 bg-surface-low rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!event) return null

  const date = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const time = new Date(event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <header className="sticky top-0 flex items-center justify-between px-4 py-3 bg-surface/80 backdrop-blur-md z-40 border-b border-surface-high">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-low">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        {event.externalLink && (
          <a href={event.externalLink} target="_blank" rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-low">
            <span className="material-symbols-rounded">share</span>
          </a>
        )}
      </header>

      {/* Image */}
      <div className="w-full aspect-video bg-surface-low overflow-hidden">
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-on-surface-disabled">
              <span className="material-symbols-rounded text-6xl">image</span>
            </div>
        }
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Meta */}
        <div>
          <CategoryChip category={event.category} />
          <h1 className="text-[24px] font-bold text-on-surface mt-2 leading-tight">{event.title}</h1>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[14px] text-on-surface-muted">
            <span className="material-symbols-rounded text-[18px]">calendar_today</span>
            <span>{date} at {time}</span>
          </div>
          <div className="flex items-center gap-2 text-[14px] text-on-surface-muted">
            <span className="material-symbols-rounded text-[18px]">location_on</span>
            <span>{event.venue}, {event.city}</span>
          </div>
          {event.price != null && (
            <div className="flex items-center gap-2 text-[14px] text-on-surface-muted">
              <span className="material-symbols-rounded text-[18px]">euro</span>
              <span>{event.price === 0 ? 'Free' : `€${event.price.toFixed(2)}`}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-surface-high" />

        {/* Description */}
        {event.description && (
          <div>
            <h2 className="font-semibold text-[16px] mb-1.5">About</h2>
            <p className="text-[14px] text-on-surface-muted leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div>
            <h2 className="font-semibold text-[16px] mb-2">Tags</h2>
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map(t => (
                <span key={t} className="px-2.5 py-0.5 rounded-pill bg-primary-light text-primary text-[11px] font-medium uppercase tracking-wide">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social proof */}
        {event.wantToGoCount > 0 && (
          <p className="text-[13px] text-on-surface-muted">
            {event.wantToGoCount} {event.wantToGoCount === 1 ? 'person wants' : 'people want'} to go
          </p>
        )}
      </div>

      {/* CTA — fixed bottom */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-gradient-to-t from-background via-background/95 to-transparent pt-4">
        <button
          onClick={toggleInterest}
          disabled={interestLoading}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-btn text-[15px] font-semibold transition-all ${
            event.currentUserInterested
              ? 'bg-primary-mid text-on-primary'
              : 'border-2 border-primary-mid text-primary-mid hover:bg-primary-light'
          } disabled:opacity-60`}
        >
          <span className={`material-symbols-rounded ${event.currentUserInterested ? 'filled' : ''}`}>favorite</span>
          {event.currentUserInterested ? "You want to go — finding a match" : "I want to go"}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
