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
    if (!user) {
      navigate('/login')
      return
    }
    Promise.all([matchesApi.getOutings(), matchesApi.getMatches()])
      .then(([outings, matches]) => {
        setConfirmed(outings)
        setPending(matches.filter(match => match.myAccepted === null))
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  const accept = async (id: number) => {
    const updated = await matchesApi.accept(id)
    if (updated.status === 'CONFIRMED') {
      setPending(current => current.filter(match => match.id !== id))
      setConfirmed(current => [updated, ...current])
    } else {
      setPending(current => current.map(match => match.id === id ? updated : match))
    }
  }

  const reject = async (id: number) => {
    await matchesApi.reject(id)
    setPending(current => current.filter(match => match.id !== id))
  }

  return (
    <div className="app-shell min-h-screen pb-28">
      <header className="border-b border-outline-soft bg-[rgba(11,16,22,0.58)] backdrop-blur-xl">
        <div className="page-wrap px-1 py-6">
          <p className="eyebrow">Outings</p>
          <h1 className="mt-2 text-4xl text-on-surface">Your cultural plans</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-muted">
            Pending matches sit at the top. Confirmed plans stay below so the next step is always obvious.
          </p>
        </div>
      </header>

      <main className="page-wrap grid gap-6 px-1 pt-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          <SectionLabel>Pending matches</SectionLabel>
          {pending.length > 0 ? (
            pending.map(match => (
              <MatchProposalCard key={match.id} match={match} onAccept={() => accept(match.id)} onReject={() => reject(match.id)} />
            ))
          ) : (
            <div className="hero-card rounded-[30px] px-6 py-8">
              <p className="text-2xl text-on-surface">No pending decisions</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-muted">
                Once another compatible user expresses interest in the same event, the proposal shows up here.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionLabel>Confirmed outings</SectionLabel>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(index => <div key={index} className="glass-card h-28 rounded-[28px] animate-pulse" />)}
            </div>
          ) : confirmed.length === 0 && pending.length === 0 ? (
            <EmptyState />
          ) : confirmed.length === 0 ? (
            <div className="glass-card rounded-[30px] px-6 py-8">
              <p className="text-2xl text-on-surface">Nothing confirmed yet</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-muted">Accept a match to turn it into a real outing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {confirmed.map(match => <OutingCard key={match.id} match={match} />)}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

function OutingCard({ match }: { match: Match }) {
  const date = new Date(match.event.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })
  return (
    <div className="glass-card flex items-center gap-4 rounded-[28px] p-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[22px] bg-surface-low">
        {match.event.imageUrl ? (
          <img src={match.event.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-disabled">
            <span className="material-symbols-rounded">image</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold text-on-surface">{match.event.title}</p>
        <p className="mt-1 text-sm text-on-surface-muted">{date} at {match.event.venue}</p>
        <div className="mt-3 flex items-center gap-2">
          <Avatar user={match.matchedUser} size="sm" />
          <span className="text-sm text-on-surface-muted">with {match.matchedUser.displayName}</span>
        </div>
      </div>
    </div>
  )
}

function MatchProposalCard({ match, onAccept, onReject }: { match: Match; onAccept: () => void; onReject: () => void }) {
  const expiresIn = Math.max(0, Math.floor((new Date(match.expiresAt).getTime() - Date.now()) / 3600000))
  const score = Math.round(match.compatibilityScore * 100)

  return (
    <div className="hero-card overflow-hidden rounded-[30px]">
      <div className="flex items-center gap-4 border-b border-outline-soft px-5 py-4">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[18px] bg-surface-low">
          {match.event.imageUrl ? (
            <img src={match.event.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-on-surface-disabled">
              <span className="material-symbols-rounded text-sm">image</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-on-surface">{match.event.title}</p>
          <p className="text-sm text-on-surface-muted">
            {new Date(match.event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} at {match.event.venue}
          </p>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-start gap-4">
          <Avatar user={match.matchedUser} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-on-surface">{match.matchedUser.displayName}</span>
              <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {score}% match
              </span>
            </div>
            {match.matchedUser.bio && (
              <p className="mt-2 text-sm leading-6 text-on-surface-muted">{match.matchedUser.bio}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {match.matchedUser.tasteTags.slice(0, 4).map(tag => (
                <span key={tag} className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onReject} className="secondary-btn flex-1">
            Pass
          </button>
          <button onClick={onAccept} className="primary-btn flex-1">
            Accept
          </button>
        </div>
        <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-disabled">
          Expires in {expiresIn}h
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="hero-card flex flex-col items-center gap-4 rounded-[30px] px-6 py-14 text-center">
      <span className="material-symbols-rounded text-6xl text-primary-mid">event_seat</span>
      <div>
        <p className="text-2xl text-on-surface">No outings yet</p>
        <p className="mt-2 text-sm text-on-surface-muted">Express interest in events to start the matching flow.</p>
      </div>
      <button onClick={() => navigate('/discover')} className="primary-btn">
        Discover events
      </button>
    </div>
  )
}
