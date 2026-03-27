import { Link } from 'react-router-dom'
import type { Event } from '../api'
import CategoryChip from './CategoryChip'

export default function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <Link to={`/events/${event.id}`} className="block bg-surface-white rounded-card shadow-card overflow-hidden hover:shadow-float transition-shadow">
      <div className="aspect-video bg-surface-high overflow-hidden">
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-on-surface-disabled">
              <span className="material-symbols-rounded text-4xl">image</span>
            </div>
        }
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <CategoryChip category={event.category} />
          {event.price != null && (
            <span className="text-[12px] font-medium text-on-surface-muted">
              {event.price === 0 ? 'Free' : `€${event.price.toFixed(2)}`}
            </span>
          )}
        </div>
        <p className="font-semibold text-[15px] text-on-surface leading-tight line-clamp-2">{event.title}</p>
        <p className="text-[13px] text-on-surface-muted mt-0.5">{event.venue} · {date}</p>
      </div>
    </Link>
  )
}
