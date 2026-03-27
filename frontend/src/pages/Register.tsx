import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, setToken, userApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError('')
    setLoading(true)
    try {
      const res = await authApi.register(email, password, firstName)
      setToken(res.token)
      const profile = await userApi.me()
      setUser(profile)
      navigate('/onboarding', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>Create account</h2>

      <form onSubmit={submit}>
        <div className="form-group">
          <label>First name</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Camille" />
        </div>

        <div className="form-group">
          <label>Last name</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Optional" />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Get started'}
          </button>
        </div>
      </form>

      <div className="toggle-form">
        <span>Already have an account? </span>
        <Link to="/login">Log in</Link>
      </div>
    </div>
  )
}
