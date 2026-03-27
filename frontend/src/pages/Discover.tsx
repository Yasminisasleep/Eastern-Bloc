import { useEffect, useState } from 'react'
import { eventsApi, Event, Category } from '../api'
import { useAuth } from '../context/AuthContext'
import EventCard from '../components/EventCard'
import BottomNav from '../components/BottomNav'

const CATEGORIES: { value: Category | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'CINEMA', label: 'Cinema' },
  { value: 'CONCERT', label: 'Concert' },
  { value: 'EXHIBITION', label: 'Exhib' },
  { value: 'THEATRE', label: 'Theatre' },
  { value: 'FESTIVAL', label: 'Festival' },
]

export default function Discover() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [category, setCategory] = useState<Category | ''>('')
  const [city, setCity] = useState(user?.city ?? '')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(0)

  useEffect(() => {
    setLoading(true)
    eventsApi.list({ category: category || undefined, city: city || undefined, q: q || undefined, page })
      .then(r => { setEvents(r.content); setTotalPages(r.totalPages) })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [category, city, q, page])

  return (
    <div className="app-shell pb-28">
      <header className="sticky top-0 z-40 border-b border-outline-soft bg-[rgba(11,16,22,0.74)] backdrop-blur-xl">
        <div className="page-wrap px-1 py-5">
          <div className="hero-card rounded-[30px] px-5 py-5 md:px-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Discover</p>
                <h1 className="mt-3 text-4xl leading-tight text-on-surface md:text-5xl">
                  What is on{city ? ` in ${city}` : ' near you'}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-muted md:text-base">
                  Browse cultural events, narrow by category, and mark the ones you would actually leave the house for.
                </p>
              </div>

              <div className="glass-card rounded-[22px] px-4 py-3 text-sm text-on-surface-muted">
                <p className="font-semibold text-on-surface">{user?.displayName ?? 'Guest mode'}</p>
                <p>{city || 'Add a city to sharpen results'}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px]">
              <div className="relative">
                <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-muted">search</span>
                <input
                  value={q}
                  onChange={e => { setQ(e.target.value); setPage(0) }}
                  placeholder="Search events, venues, or vibes..."
                  className="input-shell pl-12"
                />
              </div>
              <input
                value={city}
                onChange={e => { setCity(e.target.value); setPage(0) }}
                placeholder="Your city"
                className="input-shell"
              />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => { setCategory(c.value); setPage(0) }}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                category === c.value
                  ? 'bg-primary-mid text-on-primary shadow-[0_10px_24px_rgba(241,180,76,0.24)]'
                  : 'bg-[rgba(255,255,255,0.04)] text-on-surface-muted hover:bg-[rgba(255,255,255,0.08)]'
              }`}
            >
              {c.label}
            </button>
          ))}
            </div>
          </div>
        </div>
      </header>

      <main className="page-wrap px-1 pt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card aspect-[4/5] rounded-card animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="hero-card flex flex-col items-center gap-4 rounded-[30px] px-6 py-16 text-center text-on-surface-muted">
            <span className="material-symbols-rounded text-6xl text-primary-mid">event_busy</span>
            <div>
              <p className="text-2xl text-on-surface">No events match your filters</p>
              <p className="mt-2 text-sm">Try a broader city search or remove a category.</p>
            </div>
            <button onClick={() => { setCategory(''); setQ(''); setPage(0) }} className="secondary-btn">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-on-surface-muted">{events.length} events on this page</p>
              <p className="text-sm text-on-surface-disabled">Page {page + 1} of {totalPages}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-3">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="secondary-btn disabled:opacity-40">
                  ← Prev
                </button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="primary-btn disabled:opacity-40">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
