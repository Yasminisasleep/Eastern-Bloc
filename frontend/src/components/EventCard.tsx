import { Link } from 'react-router-dom'
import type { Event } from '../api'
import CategoryChip from './CategoryChip'

export default function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <Link to={`/events/${event.id}`} className="glass-card group block overflow-hidden rounded-card transition duration-200 hover:-translate-y-1 hover:shadow-float">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-high">
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          : <div className="flex h-full w-full items-center justify-center text-on-surface-disabled">
              <span className="material-symbols-rounded text-4xl">image</span>
            </div>
        }
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(11,16,22,0.82)] to-transparent" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <CategoryChip category={event.category} />
          {event.price != null && (
            <span className="text-[12px] font-semibold text-on-surface-muted">
              {event.price === 0 ? 'Free' : `€${event.price.toFixed(2)}`}
            </span>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight text-on-surface line-clamp-2">{event.title}</p>
          <p className="mt-2 text-sm text-on-surface-muted">{event.venue}</p>
          <p className="text-sm text-on-surface-muted">{date}</p>
        </div>
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-on-surface-disabled">
          <span>{event.city}</span>
          <span>{event.wantToGoCount} interested</span>
        </div>
      </div>
    </Link>
  )
}
