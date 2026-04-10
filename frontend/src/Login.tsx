import { useState } from 'react'
import { login } from './api'
import { useAuth } from './AuthContext'

interface Props {
  onToggleForm: () => void
}

export default function Login({ onToggleForm }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(email, password)
      authLogin(response.token, response.email, response.firstName, response.lastName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container" data-cy="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            data-cy="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            data-cy="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <div className="error-message" data-cy="login-error">{error}</div>}

        <div className="form-actions">
          <button type="submit" data-cy="login-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>

      <div className="toggle-form">
        Don't have an account? <a data-cy="switch-to-signup" onClick={onToggleForm}>Sign up</a>
      </div>
    </div>
  )
}
