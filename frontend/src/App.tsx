import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { setAuthToken } from './api'
import EventList from './EventList'
import EventDetail from './EventDetail'
import Login from './Login'
import Signup from './Signup'
import Landing from './Landing'

function App() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [showSignup, setShowSignup] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const { isAuthenticated, user, token, logout } = useAuth()

  useEffect(() => {
    if (token) {
      setAuthToken(token)
    }
  }, [token])

  const handleLogout = () => {
    logout()
    setSelectedEventId(null)
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
        {selectedEventId ? (
          <EventDetail eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
        ) : (
          <EventList onSelect={setSelectedEventId} />
        )}
      </div>
    </div>
  )
}

export default App
