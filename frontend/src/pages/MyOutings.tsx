import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchesApi, Match } from '../api'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import BottomNav from '../components/BottomNav'

export default function MyOutings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState<Match[]>([])
  const [pending, setPending] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([matchesApi.getOutings(), matchesApi.getMatches()])
      .then(([outings, matches]) => {
        setConfirmed(outings)
        setPending(matches.filter(m => m.myAccepted === null))
      })
      .finally(() => setLoading(false))
  }, [user])

  const accept = async (id: number) => {
    const updated = await matchesApi.accept(id)
    if (updated.status === 'CONFIRMED') {
      setPending(p => p.filter(m => m.id !== id))
      setConfirmed(c => [updated, ...c])
    } else {
      setPending(p => p.map(m => m.id === id ? updated : m))
    }
  }

  const reject = async (id: number) => {
    await matchesApi.reject(id)
    setPending(p => p.filter(m => m.id !== id))
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-4 pt-6 pb-4 border-b border-surface-high">
        <h1 className="text-[20px] font-bold text-on-surface">My Outings</h1>
      </header>

      <main className="px-4 pt-4 space-y-6">
        {/* Pending matches */}
        {pending.length > 0 && (
          <section>
            <SectionLabel>New match{pending.length > 1 ? 'es' : ''}</SectionLabel>
            <div className="space-y-3">
              {pending.map(m => (
                <MatchProposalCard key={m.id} match={m} onAccept={() => accept(m.id)} onReject={() => reject(m.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Confirmed outings */}
        <section>
          <SectionLabel>Upcoming</SectionLabel>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-20 bg-surface-low rounded-card animate-pulse" />)}
            </div>
          ) : confirmed.length === 0 && pending.length === 0 ? (
            <EmptyState />
          ) : confirmed.length === 0 ? null : (
            <div className="space-y-3">
              {confirmed.map(m => <OutingCard key={m.id} match={m} />)}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-wide text-on-surface-muted mb-2">{children}</p>
}

function OutingCard({ match }: { match: Match }) {
  const date = new Date(match.event.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })
  return (
    <div className="flex gap-3 bg-surface-white rounded-card shadow-card p-3 items-center">
      <div className="w-14 h-14 rounded-[8px] bg-surface-low overflow-hidden flex-shrink-0">
        {match.event.imageUrl
          ? <img src={match.event.imageUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-on-surface-disabled">
              <span className="material-symbols-rounded">image</span>
            </div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] text-on-surface truncate">{match.event.title}</p>
        <p className="text-[12px] text-on-surface-muted">{date} · {match.event.venue}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Avatar user={match.matchedUser} size="sm" />
          <span className="text-[12px] text-on-surface-muted">with {match.matchedUser.displayName}</span>
        </div>
      </div>
    </div>
  )
}

function MatchProposalCard({ match, onAccept, onReject }: { match: Match; onAccept: () => void; onReject: () => void }) {
  const expiresIn = Math.max(0, Math.floor((new Date(match.expiresAt).getTime() - Date.now()) / 3600000))
  const score = Math.round(match.compatibilityScore * 100)

  return (
    <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
      {/* Event row */}
      <div className="flex gap-3 p-3 border-b border-surface-high items-center">
        <div className="w-12 h-12 rounded-[8px] bg-surface-low overflow-hidden flex-shrink-0">
          {match.event.imageUrl
            ? <img src={match.event.imageUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-on-surface-disabled">
                <span className="material-symbols-rounded text-sm">image</span>
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px] text-on-surface truncate">{match.event.title}</p>
          <p className="text-[11px] text-on-surface-muted">
            {new Date(match.event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} · {match.event.venue}
          </p>
        </div>
      </div>

      {/* Profile row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Avatar user={match.matchedUser} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px]">{match.matchedUser.displayName}</span>
            <span className="text-[11px] font-semibold text-primary bg-primary-light px-1.5 py-0.5 rounded-pill">{score}% match</span>
          </div>
          {match.matchedUser.bio && (
            <p className="text-[12px] text-on-surface-muted line-clamp-1">{match.matchedUser.bio}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            {match.matchedUser.tasteTags.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-pill bg-primary-light text-primary uppercase tracking-wide font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-3 pb-3">
        <button onClick={onReject}
          className="flex-1 py-2 rounded-btn border border-surface-high text-on-surface-muted text-[13px] font-medium hover:bg-surface-low">
          Pass
        </button>
        <button onClick={onAccept}
          className="flex-1 py-2 rounded-btn bg-primary-mid text-on-primary text-[13px] font-semibold hover:bg-primary">
          Accept ✓
        </button>
      </div>
      <p className="text-center text-[11px] text-on-surface-disabled pb-2">Expires in {expiresIn}h</p>
    </div>
  )
}

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center py-12 gap-3 text-on-surface-muted">
      <span className="material-symbols-rounded text-5xl">event_seat</span>
      <p className="font-semibold text-[16px] text-on-surface">No outings yet</p>
      <p className="text-[13px] text-center">Express interest in events to get matched</p>
      <button onClick={() => navigate('/discover')}
        className="mt-2 px-4 py-2 rounded-btn bg-primary-mid text-on-primary text-[13px] font-semibold">
        Discover events
      </button>
    </div>
  )
}
