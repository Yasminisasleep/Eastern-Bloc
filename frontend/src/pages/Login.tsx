import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi, setToken, userApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from ?? '/discover'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      setToken(res.token)
      const profile = await userApi.me()
      setUser(profile)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>Welcome back</h2>

      <form onSubmit={submit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPw(s => !s)}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', boxShadow: 'none', padding: '4px', fontSize: '0.8em' }}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Log in'}
          </button>
        </div>
      </form>

      <div className="toggle-form">
        <span>Don't have an account? </span>
        <Link to="/register">Create one</Link>
      </div>
    </div>
  )
}
