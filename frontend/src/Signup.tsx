import { useState } from 'react'
import { signup } from './api'
import { useAuth } from './AuthContext'

interface Props {
  onToggleForm: () => void
}

export default function Signup({ onToggleForm }: Props) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [city, setCity] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must include at least one uppercase letter')
      return
    }

    if (!/\d/.test(password)) {
      setError('Password must include at least one digit')
      return
    }

    if (!dateOfBirth) {
      setError('Date of birth is required')
      return
    }

    if (!city.trim()) {
      setError('City is required')
      return
    }

    setLoading(true)

    try {
      const response = await signup({
        email,
        displayName,
        password,
        dateOfBirth,
        city,
      })
      login(response.token, response.email, response.displayName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
    <div className="form-container" data-cy="signup-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            data-cy="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Display Name</label>
          <input
            data-cy="signup-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              data-cy="signup-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Paris"
              required
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              data-cy="signup-date-of-birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            data-cy="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            data-cy="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <div className="error-message" data-cy="signup-error">{error}</div>}

        <div className="form-actions">
          <button type="submit" data-cy="signup-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <div className="toggle-form">
        Already have an account? <a data-cy="switch-to-login" onClick={onToggleForm}>Login</a>
      </div>
    </div>
    </div>
  )
}
