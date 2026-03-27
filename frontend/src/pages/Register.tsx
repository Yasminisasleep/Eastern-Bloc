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
    <div className="auth-shell app-shell">
      <div className="auth-grid">
        <section className="hero-card rounded-[32px] p-8 md:p-10">
          <p className="eyebrow">Join the Scene</p>
          <h1 className="mt-4 text-5xl leading-tight text-balance text-on-surface md:text-6xl">
            Build a profile around your taste, not your selfies.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-on-surface-muted">
            Set your vibe, pick the cultural worlds you care about, and start getting matched around events that already exist.
          </p>
          <div className="mt-8 space-y-3 text-sm text-on-surface-muted">
            <div className="glass-card rounded-[22px] px-4 py-3">Tell people what kind of outing energy you bring.</div>
            <div className="glass-card rounded-[22px] px-4 py-3">Choose categories and tags that shape better matches.</div>
            <div className="glass-card rounded-[22px] px-4 py-3">Discover events nearby and express interest with one tap.</div>
          </div>
        </section>

        <section className="glass-card rounded-[32px] p-7 md:p-8">
          <p className="eyebrow">Create Account</p>
          <h2 className="mt-3 text-4xl text-on-surface">Start your profile</h2>
          <p className="mt-2 text-sm text-on-surface-muted">You can refine your taste and city in onboarding right after this.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface-muted">First name</label>
                <input className="input-shell" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Camille" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface-muted">Last name</label>
                <input className="input-shell" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Optional" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface-muted">Email</label>
              <input className="input-shell" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface-muted">Password</label>
              <input className="input-shell" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimum 8 characters" />
            </div>

            {error && (
              <p className="rounded-2xl border border-[rgba(184,93,85,0.35)] bg-[rgba(184,93,85,0.12)] px-4 py-3 text-sm text-[#ffd3cf]">
                {error}
              </p>
            )}

            <button className="primary-btn w-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create my account'}
            </button>
          </form>

          <div className="mt-6 text-sm text-on-surface-muted">
            Already have an account?{' '}
            <Link className="font-semibold text-primary-mid transition hover:text-white" to="/login">
              Log in
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
