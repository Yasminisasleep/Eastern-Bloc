import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { setAuthToken } from './api'
import EventList from './EventList'
import EventDetail from './EventDetail'
import Login from './Login'
import Signup from './Signup'
import Landing from './Landing'
import Preferences from './Preferences'
import Notifications from './Notifications'
import MatchDetail from './MatchDetail'

type MainView = 'events' | 'preferences' | 'notifications' | 'match-detail'

function App() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)
  const [showSignup, setShowSignup] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [activeView, setActiveView] = useState<MainView>('events')
  const { isAuthenticated, user, token, logout } = useAuth()

  const userId = 1
  const userStorageKey = user?.email || 'anonymous'

  useEffect(() => {
    if (token) setAuthToken(token)
  }, [token])

  const handleLogout = () => {
    logout()
    setSelectedEventId(null)
    setSelectedMatchId(null)
    setActiveView('events')
  }

  const openMatchDetail = (matchId: number) => {
    setSelectedMatchId(matchId)
    setActiveView('match-detail')
  }

  const renderContent = () => {
    if (activeView === 'preferences') {
      return <Preferences userId={userId} userStorageKey={userStorageKey} />
    }
    if (activeView === 'notifications') {
      return (
        <Notifications
          userId={userId}
          userStorageKey={userStorageKey}
          onOpenMatch={openMatchDetail}
        />
      )
    }
    if (activeView === 'match-detail') {
      if (!selectedMatchId) {
        return <div className="empty-state" data-cy="match-empty-state">No match selected yet.</div>
      }
      return (
        <MatchDetail
          matchId={selectedMatchId}
          userStorageKey={userStorageKey}
          onBack={() => setActiveView('notifications')}
        />
      )
    }
    return selectedEventId ? (
      <EventDetail eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
    ) : (
      <EventList onSelect={setSelectedEventId} />
    )
  }

  if (!isAuthenticated) {
    if (showSignup) {
      return <Signup onToggleForm={() => { setShowSignup(false); setShowLogin(true) }} />
    }
    if (showLogin) {
      return <Login onToggleForm={() => { setShowLogin(false); setShowSignup(true) }} />
    }
    return <Landing onLogin={() => setShowLogin(true)} onSignup={() => setShowSignup(true)} />
  }

  const isEventsActive = activeView === 'events'
  const isOutingsActive = activeView === 'notifications' || activeView === 'match-detail'
  const isProfileActive = activeView === 'preferences'

  return (
    <div data-cy="authenticated-app">
      <div className="app-shell">
        <div className="top-bar">
          <span className="top-bar-logo">kulto</span>
          <div className="top-bar-actions">
            {user && (
              <span className="top-bar-user" data-cy="user-name">{user.displayName}</span>
            )}
            <button className="btn-logout" data-cy="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="screen">
          {renderContent()}
        </div>

        <nav className="bottom-nav" data-cy="app-tabs">
          <button
            type="button"
            className={`bottom-nav-btn${isEventsActive ? ' active' : ''}`}
            data-cy="tab-events"
            onClick={() => { setActiveView('events'); setSelectedEventId(null) }}
          >
            <span className="bottom-nav-icon">🎭</span>
            Discover
          </button>
          <button
            type="button"
            className={`bottom-nav-btn${isOutingsActive ? ' active' : ''}`}
            data-cy="tab-notifications"
            onClick={() => setActiveView('notifications')}
          >
            <span className="bottom-nav-icon">♥</span>
            Outings
          </button>
          <button
            type="button"
            className={`bottom-nav-btn${isProfileActive ? ' active' : ''}`}
            data-cy="tab-preferences"
            onClick={() => setActiveView('preferences')}
          >
            <span className="bottom-nav-icon">👤</span>
            Me
          </button>
        </nav>
      </div>
    </div>
  )
}

export default App
