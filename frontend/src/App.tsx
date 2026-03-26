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
    if (token) {
      setAuthToken(token)
    }
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
        return <div className="empty-state">No match selected yet.</div>
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

  return (
    <div>
      <header>
        <div className="header-container">
          <h1>Kulto</h1>
          <nav>
            {user && (
              <div className="nav-user">
                <div className="app-tabs">
                  <button type="button" className={activeView === 'events' ? 'tab-btn tab-active' : 'tab-btn'} onClick={() => setActiveView('events')}>
                    Events
                  </button>
                  <button type="button" className={activeView === 'preferences' ? 'tab-btn tab-active' : 'tab-btn'} onClick={() => setActiveView('preferences')}>
                    Preferences
                  </button>
                  <button type="button" className={activeView === 'notifications' || activeView === 'match-detail' ? 'tab-btn tab-active' : 'tab-btn'} onClick={() => setActiveView('notifications')}>
                    Notifications
                  </button>
                </div>
                <div className="user-info">
                  <div className="user-name">{user.firstName} {user.lastName}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                <button className="logout" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="main-container">
        {renderContent()}
      </div>
    </div>
  )
}

export default App
