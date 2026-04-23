import { useState } from 'react'
import { login } from './api'
import { useAuth } from './AuthContext'

interface Props {
  onToggleForm: () => void
}

export default function Login({ onToggleForm }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await login(email, password)
      authLogin(response.token, response.id, response.email, response.displayName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page auth-page">
      <div className="auth-aura auth-aura-top" aria-hidden="true" />
      <div className="auth-aura auth-aura-bottom" aria-hidden="true" />
      <div className="form-card auth-card" data-cy="login-form">
        <p className="auth-kicker">Cultural outings made social</p>
        <div className="form-logo">kulto</div>
        <div className="form-heading">Welcome back</div>
        <p className="form-subheading">Log in and keep discovering your next cultural plan.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              data-cy="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrap">
              <input
                id="login-password"
                data-cy="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="password-toggle"
              >
                {showPassword ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          {error && <div className="error-message" data-cy="login-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" data-cy="login-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </div>
        </form>

        <div className="form-link-row">
          Don't have an account?{' '}
          <button type="button" className="form-link form-link-btn" data-cy="switch-to-signup" onClick={onToggleForm}>
            Create one
          </button>
        </div>
      </div>
    </div>
  )
}
