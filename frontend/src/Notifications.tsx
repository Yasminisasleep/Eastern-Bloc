import { useEffect, useMemo, useState } from 'react'
import { NotificationItem, fetchUserNotifications } from './api'

interface Props {
  userId: number
  userStorageKey: string
  onOpenMatch: (matchId: number) => void
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 9001,
    status: 'UNREAD',
    createdAt: new Date().toISOString(),
    message: 'We found a strong match for your theatre interests.',
    match: {
      id: 501,
      status: 'PENDING',
      compatibilityScore: 0.78,
      matchedUserName: 'Camille D.',
      event: {
        id: 120,
        title: 'Contemporary Theatre Night',
        category: 'THEATRE',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        city: 'Paris',
        venue: 'Le Petit Chatelet',
      },
    },
  },
  {
    id: 9002,
    status: 'READ',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    message: 'A cinema fan with similar tags is available this weekend.',
    match: {
      id: 502,
      status: 'PENDING',
      compatibilityScore: 0.63,
      matchedUserName: 'Nora M.',
      event: {
        id: 121,
        title: 'Indie Film Marathon',
        category: 'CINEMA',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
        city: 'Paris',
        venue: 'Studio Lumiere',
      },
    },
  },
]

function getStorageKey(userStorageKey: string): string {
  return `kulto.notifications.${userStorageKey}`
}

export default function Notifications({ userId, userStorageKey, onOpenMatch }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const storageKey = useMemo(() => getStorageKey(userStorageKey), [userStorageKey])

  useEffect(() => {
    let isMounted = true

    async function loadNotifications() {
      setLoading(true)
      try {
        const data = await fetchUserNotifications(userId)
        if (!isMounted) return
        setNotifications(data)
        localStorage.setItem(storageKey, JSON.stringify(data))
      } catch {
        const localValue = localStorage.getItem(storageKey)
        const fallback = localValue ? (JSON.parse(localValue) as NotificationItem[]) : MOCK_NOTIFICATIONS
        if (!isMounted) return
        setNotifications(fallback)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadNotifications()

    return () => {
      isMounted = false
    }
  }, [storageKey, userId])

  const unreadCount = notifications.filter(item => item.status === 'UNREAD').length

  const markAsRead = (notificationId: number) => {
    setNotifications(current => {
      const updated = current.map(item =>
        item.id === notificationId ? { ...item, status: 'READ' as const } : item,
      )
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }

  if (loading) return <div className="loading">Loading notifications...</div>

  return (
    <div className="panel-card">
      <div className="panel-title-row">
        <h2 className="panel-title">Match Notifications</h2>
        <span className="badge-count">{unreadCount} unread</span>
      </div>

      {notifications.length === 0 && (
        <div className="empty-state">No notifications yet. Save your preferences to get suggestions.</div>
      )}

      <div className="notifications-list">
        {notifications.map(notification => (
          <article
            key={notification.id}
            className={`notification-card ${notification.status === 'UNREAD' ? 'notification-unread' : ''}`}
          >
            <div className="notification-content">
              <p className="notification-message">{notification.message}</p>
              <p className="notification-meta">
                Match score: {Math.round(notification.match.compatibilityScore * 100)}% • {notification.match.event.city} •{' '}
                {new Date(notification.match.event.date).toLocaleDateString()}
              </p>
              <p className="notification-target">
                Suggested partner: {notification.match.matchedUserName} for {notification.match.event.title}
              </p>
            </div>
            <div className="notification-actions">
              <button
                type="button"
                onClick={() => {
                  markAsRead(notification.id)
                  onOpenMatch(notification.match.id)
                }}
              >
                Open match
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
