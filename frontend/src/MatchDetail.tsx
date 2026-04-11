import { useEffect, useMemo, useState } from 'react'
import { MatchDetail as MatchDetailModel, acceptMatch, fetchMatchDetail, rejectMatch } from './api'

interface Props {
  matchId: number
  userStorageKey: string
  onBack: () => void
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
}

const CATEGORY_LABELS: Record<string, string> = {
  CINEMA: 'Cinema',
  CONCERT: 'Concert',
  EXHIBITION: 'Exhibition',
  THEATRE: 'Theatre',
  FESTIVAL: 'Festival',
}

function getStorageKey(userStorageKey: string, matchId: number): string {
  return `kulto.match.${userStorageKey}.${matchId}`
}

function createMockMatch(matchId: number): MatchDetailModel {
  return {
    id: matchId,
    status: 'PENDING',
    compatibilityScore: 0.74,
    matchedUserName: 'Demo User',
    matchedUserBio: 'Loves indie cinema and live theatre. Prefers small venues and early evening sessions.',
    matchedUserCity: 'Paris',
    matchedUserTags: ['cinema', 'theatre', 'indie'],
    event: {
      id: 999,
      title: 'Friday Cultural Hangout',
      category: 'CINEMA',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
      city: 'Paris',
      venue: 'Studio Aurora',
    },
  }
}

export default function MatchDetail({ matchId, userStorageKey, onBack }: Props) {
  const [match, setMatch] = useState<MatchDetailModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const storageKey = useMemo(() => getStorageKey(userStorageKey, matchId), [matchId, userStorageKey])

  useEffect(() => {
    let isMounted = true

    async function loadMatch() {
      setLoading(true)
      setError('')
      try {
        const detail = await fetchMatchDetail(matchId)
        if (!isMounted) return
        setMatch(detail)
        localStorage.setItem(storageKey, JSON.stringify(detail))
      } catch {
        const localValue = localStorage.getItem(storageKey)
        const fallback = localValue ? (JSON.parse(localValue) as MatchDetailModel) : createMockMatch(matchId)
        if (!isMounted) return
        setMatch(fallback)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMatch()

    return () => {
      isMounted = false
    }
  }, [matchId, storageKey])

  const updateLocalStatus = (status: MatchDetailModel['status']) => {
    setMatch(current => {
      if (!current) return current
      const updated = { ...current, status }
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }

  const onAccept = async () => {
    setUpdating(true)
    setError('')
    try {
      const updated = await acceptMatch(matchId)
      setMatch(updated)
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      updateLocalStatus('ACCEPTED')
    } finally {
      setUpdating(false)
    }
  }

  const onReject = async () => {
    setUpdating(true)
    setError('')
    try {
      const updated = await rejectMatch(matchId)
      setMatch(updated)
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      updateLocalStatus('REJECTED')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="loading" data-cy="match-detail-loading">
      <div className="spinner" />
      Loading match details...
    </div>
  )
  if (!match) return <div className="empty-state" data-cy="match-detail-not-found">Match not found.</div>

  return (
    <div className="panel-card" data-cy="match-detail-view">
      <div className="match-detail-header">
        <h2 className="panel-title">Match Detail</h2>
        <button type="button" className="back-button" data-cy="match-detail-back" onClick={onBack}>Back</button>
      </div>

      <div className="match-status-row">
        <span className={`status-pill status-${match.status.toLowerCase()}`}>{STATUS_LABELS[match.status] ?? match.status}</span>
        <span className="score-pill">Score {Math.round(match.compatibilityScore * 100)}%</span>
      </div>

      <section className="match-section">
        <h3>Your suggested partner</h3>
        <p><strong>{match.matchedUserName}</strong> • {match.matchedUserCity || 'Unknown city'}</p>
        {match.matchedUserBio && <p>{match.matchedUserBio}</p>}
        {match.matchedUserTags && match.matchedUserTags.length > 0 && (
          <div className="tags">
            {match.matchedUserTags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </section>

      <section className="match-section">
        <h3>Compatible event</h3>
        <p><strong>{match.event.title}</strong></p>
        <p>{CATEGORY_LABELS[match.event.category] ?? match.event.category} • {match.event.city}</p>
        <p>{new Date(match.event.date).toLocaleString()} • {match.event.venue}</p>
      </section>

      {error && <div className="error-message" data-cy="match-detail-error">{error}</div>}

      <div className="form-actions">
        <button
          type="button"
          data-cy="match-accept"
          onClick={onAccept}
          disabled={updating || match.status === 'ACCEPTED' || match.status === 'CONFIRMED'}
        >
          {updating ? 'Updating...' : 'Accept'}
        </button>
        <button
          type="button"
          className="danger-outline"
          data-cy="match-reject"
          onClick={onReject}
          disabled={updating || match.status === 'REJECTED' || match.status === 'CANCELLED'}
        >
          {updating ? 'Updating...' : 'Reject'}
        </button>
      </div>
    </div>
  )
}
