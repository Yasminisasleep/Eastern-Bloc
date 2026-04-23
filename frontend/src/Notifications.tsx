import { useEffect, useMemo, useState } from 'react'
import { NotificationItem, fetchUserNotifications } from './api'
import { CategoryIcon, ArrowRightIcon } from './Icons'

interface Props {
  userId: number
  userStorageKey: string
  onOpenMatch: (matchId: number) => void
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 9001, status: 'UNREAD', createdAt: new Date().toISOString(), message: 'We found a strong match for your theatre interests.', match: { id: 501, status: 'PENDING', compatibilityScore: 0.78, matchedUserName: 'Camille D.', event: { id: 120, title: 'Contemporary Theatre Night', category: 'THEATRE', date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), city: 'Paris', venue: 'Le Petit Chatelet' } } },
  { id: 9002, status: 'READ', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), message: 'A cinema fan with similar tags is available this weekend.', match: { id: 502, status: 'PENDING', compatibilityScore: 0.63, matchedUserName: 'Nora M.', event: { id: 121, title: 'Indie Film Marathon', category: 'CINEMA', date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), city: 'Paris', venue: 'Studio Lumiere' } } },
]

const getStorageKey = (k: string) => `kulto.notifications.${k}`

function dedupeByMatch(items: NotificationItem[]): NotificationItem[] {
  const byMatch = new Map<number, NotificationItem>()
  for (const n of items) {
    const existing = byMatch.get(n.match.id)
    if (!existing || new Date(n.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      byMatch.set(n.match.id, n)
    }
  }
  return Array.from(byMatch.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export default function Notifications({ userId, userStorageKey, onOpenMatch }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const storageKey = useMemo(() => getStorageKey(userStorageKey), [userStorageKey])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchUserNotifications(userId)
      .then(data => { if (mounted) { const deduped = dedupeByMatch(data); setNotifications(deduped); localStorage.setItem(storageKey, JSON.stringify(deduped)) } })
      .catch(() => {
        const local = localStorage.getItem(storageKey)
        if (mounted) setNotifications(local ? dedupeByMatch(JSON.parse(local)) : MOCK_NOTIFICATIONS)
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [storageKey, userId])

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length

  const markAsRead = (id: number) => {
    setNotifications(cur => {
      const updated = cur.map(n => n.id === id ? { ...n, status: 'READ' as const } : n)
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }

  if (loading) return <div className="loading" data-cy="notifications-loading"><div className="spinner" />Loading outings…</div>

  return (
    <div data-cy="notifications-view">
      <div className="screen-header-row">
        <h1 className="screen-title">My Outings</h1>
        {unreadCount > 0 && <span className="badge-count" data-cy="notifications-unread-count">{unreadCount} new</span>}
      </div>

      {notifications.length === 0 && (
        <div className="empty-state" data-cy="notifications-empty-state">
          <div className="empty-state-title">No outings yet</div>
          Express interest in events to get matched.
        </div>
      )}

      {notifications.length > 0 && (
        <>
          <div className="outings-section-label">Waiting for a match</div>
          <div data-cy="notifications-list">
            {notifications.map(n => (
              <article
                key={n.id}
                data-cy="notification-card"
                className="outing-card"
                onClick={() => { markAsRead(n.id); onOpenMatch(n.match.id) }}
              >
                <div className={`outing-thumbnail cat-${n.match.event.category.toLowerCase()}`}>
                  <CategoryIcon category={n.match.event.category} size={24} />
                </div>
                <div className="outing-info">
                  <div className="outing-title">{n.match.event.title}</div>
                  <div className="outing-meta">{new Date(n.match.event.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })} · {n.match.event.venue}</div>
                  <div className="outing-pending-label">Finding your match…</div>
                </div>
                <button
                  type="button"
                  data-cy={`open-match-${n.match.id}`}
                  className="icon-btn"
                  aria-label="View match"
                  onClick={e => { e.stopPropagation(); markAsRead(n.id); onOpenMatch(n.match.id) }}
                >
                  <ArrowRightIcon size={18} />
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
