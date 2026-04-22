import { useEffect, useMemo, useState } from 'react'
import { MatchDetail as MatchDetailModel, acceptMatch, fetchMatchDetail, rejectMatch } from './api'

interface Props {
  matchId: number
  userStorageKey: string
  onBack: () => void
}

const ICONS: Record<string, string> = { CINEMA: '🎬', CONCERT: '🎵', EXHIBITION: '🖼️', THEATRE: '🎭', FESTIVAL: '🎪', DEFAULT: '🎨' }
const CATEGORY_LABELS: Record<string, string> = { CINEMA: 'Cinema', CONCERT: 'Concert', EXHIBITION: 'Exhibition', THEATRE: 'Theatre', FESTIVAL: 'Festival' }
const STATUS_LABELS: Record<string, string> = { PENDING: 'Pending', ACCEPTED: 'Waiting for other', REJECTED: 'Rejected', CONFIRMED: 'Confirmed', CANCELLED: 'Cancelled' }

function getStorageKey(k: string, id: number) { return `kulto.match.${k}.${id}` }
function getInitials(name: string) { return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2) }

export default function MatchDetail({ matchId, userStorageKey, onBack }: Props) {
  const [match, setMatch] = useState<MatchDetailModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const storageKey = useMemo(() => getStorageKey(userStorageKey, matchId), [matchId, userStorageKey])

  useEffect(() => {
    let mounted = true
    setLoading(true); setError('')
    fetchMatchDetail(matchId)
      .then(d => { if (mounted) { setMatch(d); localStorage.setItem(storageKey, JSON.stringify(d)) } })
      .catch(err => { if (mounted) { setMatch(null); setError(err instanceof Error ? err.message : 'Failed to load match') } })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [matchId, storageKey])

  const onAccept = async () => {
    setUpdating(true); setError('')
    try { const u = await acceptMatch(matchId); setMatch(u); localStorage.setItem(storageKey, JSON.stringify(u)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to accept match') }
    finally { setUpdating(false) }
  }

  const onReject = async () => {
    setUpdating(true); setError('')
    try { const u = await rejectMatch(matchId); setMatch(u); localStorage.setItem(storageKey, JSON.stringify(u)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to reject match') }
    finally { setUpdating(false) }
  }

  if (loading) return <div className="loading" data-cy="match-detail-loading"><div className="spinner" />Loading match...</div>
  if (!match) return <div className="empty-state" data-cy="match-detail-not-found">{error || 'Match not found.'}</div>

  const isPending = match.status === 'PENDING'
  const score = Math.round(match.compatibilityScore * 100)

  return (
    <div data-cy="match-detail-view">
      <div className="event-detail-nav">
        <button className="event-detail-back-btn back-button" data-cy="match-detail-back" onClick={onBack}>← Back</button>
        <span style={{ fontSize: '16px', fontWeight: 600 }}>Match</span>
        <span style={{ width: '48px' }} />
      </div>

      <div className="match-proposal">
        <div className="match-proposal-heading">You have a match!</div>
        <div className="match-proposal-subheading">For an event you wanted to go to</div>

        {!isPending && (
          <div className="match-status-row">
            <span className={`status-pill status-${match.status.toLowerCase()}`}>{STATUS_LABELS[match.status] ?? match.status}</span>
            <span className="score-pill">{score}% match</span>
          </div>
        )}

        <div className="match-event-compact">
          <div className="match-event-compact-image">{ICONS[match.event.category] ?? ICONS.DEFAULT}</div>
          <div className="match-event-compact-info">
            <div className="match-event-compact-meta">{CATEGORY_LABELS[match.event.category] ?? match.event.category} · {new Date(match.event.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div className="match-event-compact-title">{match.event.title}</div>
            <div className="match-event-compact-meta">{match.event.venue}</div>
          </div>
        </div>

        <div className="match-meets-label">meets</div>

        <div className="match-user-card">
          <div className="match-user-header">
            <div className="match-avatar">{getInitials(match.matchedUserName)}</div>
            <div>
              <div className="match-user-name">{match.matchedUserName}</div>
              {match.matchedUserCity && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{match.matchedUserCity}</div>}
            </div>
          </div>
          {match.matchedUserTags && match.matchedUserTags.length > 0 && (
            <div className="match-user-tags">{match.matchedUserTags.map(t => <span key={t} className="tag">{t}</span>)}</div>
          )}
          {match.matchedUserBio && <div className="match-user-bio">"{match.matchedUserBio}"</div>}
          <div className="match-score-badge">{score}% ★ taste match</div>
        </div>

        {match.status === 'ACCEPTED' && (
          <div className="match-contact-box" data-cy="match-contact-box">
            <div className="match-contact-title">You accepted — waiting for {match.matchedUserName}</div>
            <div className="match-contact-hint">Contact details will appear once they accept too.</div>
          </div>
        )}

        {match.status === 'CONFIRMED' && (
          <div className="match-contact-box" data-cy="match-contact-box">
            <div className="match-contact-title">You're both going!</div>
            {match.matchedUserContactLink ? (
              <div className="match-contact-link">
                Contact <strong>{match.matchedUserName}</strong> at: <span className="match-contact-value">{match.matchedUserContactLink}</span>
              </div>
            ) : (
              <div className="match-contact-hint">
                {match.matchedUserName} hasn't set a contact link yet — look for them at the event!
              </div>
            )}
          </div>
        )}

        {error && <div className="error-message" data-cy="match-detail-error">{error}</div>}

        <div className="match-actions">
          <button type="button" className="btn-secondary" data-cy="match-reject" onClick={onReject} disabled={updating || match.status === 'REJECTED' || match.status === 'CANCELLED'}>
            {updating ? 'Updating...' : '✕ Pass'}
          </button>
          <button type="button" className="btn-primary" data-cy="match-accept" onClick={onAccept} disabled={updating || match.status === 'ACCEPTED' || match.status === 'CONFIRMED'}>
            {updating ? 'Updating...' : '✓ Accept'}
          </button>
        </div>
        {isPending && <div className="match-expiry">Match expires in 47h 59m</div>}
      </div>
    </div>
  )
}
