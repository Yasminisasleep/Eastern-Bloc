import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Discover from './pages/Discover'
import EventDetailPage from './pages/EventDetail'
import MyOutings from './pages/MyOutings'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  if (user) return <Navigate to="/discover" replace />
  return <>{children}</>
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
        <Route path="/outings" element={<ProtectedRoute><MyOutings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? '/discover' : '/login'} replace />} />
      </Routes>
    </>
  )
}
