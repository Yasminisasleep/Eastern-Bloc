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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-md z-40 px-4 pt-4 pb-3 border-b border-surface-high">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[20px] font-bold text-on-surface">
            What's on{city ? ` in ${city}` : ''}
          </h1>
          <div className="flex items-center gap-2">
            <input
              value={city}
              onChange={e => { setCity(e.target.value); setPage(0) }}
              placeholder="City"
              className="text-[13px] border border-outline/30 rounded-btn px-2 py-1 bg-surface-white w-24 text-on-surface focus:outline-none focus:border-primary-mid"
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-muted">search</span>
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(0) }}
            placeholder="Search events..."
            className="w-full bg-surface-low rounded-btn pl-9 pr-3 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-mid"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => { setCategory(c.value); setPage(0) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-[13px] font-medium transition-colors ${
                category === c.value
                  ? 'bg-primary-mid text-on-primary'
                  : 'bg-surface-low text-on-surface-muted hover:bg-surface-high'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <main className="px-4 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-low rounded-card animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-on-surface-muted">
            <span className="material-symbols-rounded text-5xl">event_busy</span>
            <p className="text-[15px]">No events match your filters</p>
            <button onClick={() => { setCategory(''); setQ(''); setPage(0) }}
              className="text-primary-mid text-[14px] font-medium">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-btn bg-surface-low text-[13px] text-on-surface disabled:opacity-40">
                  ← Prev
                </button>
                <span className="px-4 py-2 text-[13px] text-on-surface-muted">{page + 1} / {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-btn bg-surface-low text-[13px] text-on-surface disabled:opacity-40">
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
