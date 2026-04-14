import { useEffect, useMemo, useState } from 'react'
import { NotificationItem, fetchUserNotifications } from './api'

interface Props {
  userId: number
  userStorageKey: string
  onOpenMatch: (matchId: number) => void
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 9001, status: 'UNREAD', createdAt: new Date().toISOString(), message: 'We found a strong match for your theatre interests.', match: { id: 501, status: 'PENDING', compatibilityScore: 0.78, matchedUserName: 'Camille D.', event: { id: 120, title: 'Contemporary Theatre Night', category: 'THEATRE', date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), city: 'Paris', venue: 'Le Petit Chatelet' } } },
  { id: 9002, status: 'READ', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), message: 'A cinema fan with similar tags is available this weekend.', match: { id: 502, status: 'PENDING', compatibilityScore: 0.63, matchedUserName: 'Nora M.', event: { id: 121, title: 'Indie Film Marathon', category: 'CINEMA', date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), city: 'Paris', venue: 'Studio Lumiere' } } },
]

const ICONS: Record<string, string> = {
  CINEMA: '🎬', CONCERT: '🎵', EXHIBITION: '🖼️', THEATRE: '🎭', FESTIVAL: '🎪', DEFAULT: '🎨',
}

function getStorageKey(k: string) { return `kulto.notifications.${k}` }

export default function Notifications({ userId, userStorageKey, onOpenMatch }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const storageKey = useMemo(() => getStorageKey(userStorageKey), [userStorageKey])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchUserNotifications(userId)
      .then(data => { if (mounted) { setNotifications(data); localStorage.setItem(storageKey, JSON.stringify(data)) } })
      .catch(() => {
        const local = localStorage.getItem(storageKey)
        if (mounted) setNotifications(local ? JSON.parse(local) : MOCK_NOTIFICATIONS)
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

  if (loading) return <div className="loading" data-cy="notifications-loading"><div className="spinner" />Loading outings...</div>

  return (
    <div data-cy="notifications-view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 16px 0' }}>
        <div className="screen-title" style={{ padding: 0 }}>My Outings</div>
        {unreadCount > 0 && <span className="badge-count" data-cy="notifications-unread-count">{unreadCount} new</span>}
      </div>

      {notifications.length === 0 && (
        <div className="empty-state" data-cy="notifications-empty-state">
          <div className="empty-state-title">No outings yet</div>
          Express interest in events to get matched
        </div>
      )}

      {notifications.length > 0 && (
        <>
          <div className="outings-section-label">Waiting for a match</div>
          <div data-cy="notifications-list">
            {notifications.map(n => (
              <article key={n.id} data-cy="notification-card" className="outing-card" onClick={() => { markAsRead(n.id); onOpenMatch(n.match.id) }}>
                <div className="outing-thumbnail">{ICONS[n.match.event.category] ?? ICONS.DEFAULT}</div>
                <div className="outing-info">
                  <div className="outing-title">{n.match.event.title}</div>
                  <div className="outing-meta">{new Date(n.match.event.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })} · {n.match.event.venue}</div>
                  <div className="outing-pending-label">Finding your match…</div>
                  <button type="button" data-cy={`open-match-${n.match.id}`} className="btn-ghost btn-sm" style={{ marginTop: '6px', paddingLeft: 0 }}
                    onClick={e => { e.stopPropagation(); markAsRead(n.id); onOpenMatch(n.match.id) }}>
                    View match →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
