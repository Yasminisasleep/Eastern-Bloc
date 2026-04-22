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

    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters long'); return }
    if (!/[A-Z]/.test(password)) { setError('Password must include at least one uppercase letter'); return }
    if (!/\d/.test(password)) { setError('Password must include at least one digit'); return }
    if (!dateOfBirth) { setError('Date of birth is required'); return }
    if (!city.trim()) { setError('City is required'); return }

    setLoading(true)
    try {
      const response = await signup({ email, displayName, password, dateOfBirth, city })
      login(response.token, response.id, response.email, response.displayName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-card" data-cy="signup-form">
        <div className="form-logo">kulto</div>
        <div className="form-heading">Create your account</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input id="signup-email" data-cy="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="signup-display-name">Display Name</label>
            <input id="signup-display-name" data-cy="signup-display-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Camille Durand" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="signup-city">City</label>
              <input id="signup-city" data-cy="signup-city" type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Paris" required />
            </div>
            <div className="form-group">
              <label htmlFor="signup-dob">Date of Birth</label>
              <input id="signup-dob" data-cy="signup-date-of-birth" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" data-cy="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input id="signup-confirm" data-cy="signup-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && <div className="error-message" data-cy="signup-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" data-cy="signup-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Get started'}
            </button>
          </div>
        </form>

        <div className="form-link-row">
          Already have an account?{' '}
          <a className="form-link" data-cy="switch-to-login" onClick={onToggleForm}>Log in</a>
        </div>
      </div>
    </div>
  )
}
