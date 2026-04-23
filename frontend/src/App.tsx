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
import { CompassIcon, HeartIcon, UserIcon } from './Icons'

type MainView = 'events' | 'preferences' | 'notifications' | 'match-detail'

function App() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)
  const [showSignup, setShowSignup] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [activeView, setActiveView] = useState<MainView>('events')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('kulto-theme') : null
    if (saved === 'dark' || saved === 'light') return saved
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })
  const { isAuthenticated, user, token, logout } = useAuth()

  const userId = user?.id
  const userStorageKey = user?.email || 'anonymous'

  useEffect(() => {
    if (token) setAuthToken(token)
  }, [token])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('kulto-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

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
    if (!userId) {
      return <div className="empty-state">Loading your profile…</div>
    }
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
            <button
              type="button"
              className="theme-toggle"
              data-cy="theme-toggle"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
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
            <CompassIcon size={22} />
            <span>Discover</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-btn${isOutingsActive ? ' active' : ''}`}
            data-cy="tab-notifications"
            onClick={() => setActiveView('notifications')}
          >
            <HeartIcon size={22} filled={isOutingsActive} />
            <span>Outings</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-btn${isProfileActive ? ' active' : ''}`}
            data-cy="tab-preferences"
            onClick={() => setActiveView('preferences')}
          >
            <UserIcon size={22} />
            <span>Me</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default App
