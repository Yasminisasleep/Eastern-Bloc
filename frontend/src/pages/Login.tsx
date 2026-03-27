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
    <div className="auth-shell app-shell">
      <div className="auth-grid">
        <section className="hero-card rounded-[32px] p-8 md:p-10">
          <p className="eyebrow">Culture First</p>
          <h1 className="mt-4 text-5xl leading-tight text-balance text-on-surface md:text-6xl">
            Find people worth meeting around things worth leaving home for.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-on-surface-muted">
            Kulto matches your taste in cinema, concerts, theatre, exhibitions, and festivals with real events happening nearby.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="stat-pill">
              <span className="material-symbols-rounded text-[18px]">theaters</span>
              Real-world outings
            </span>
            <span className="stat-pill">
              <span className="material-symbols-rounded text-[18px]">favorite</span>
              Shared taste, not swipes
            </span>
            <span className="stat-pill">
              <span className="material-symbols-rounded text-[18px]">near_me</span>
              City-based discovery
            </span>
          </div>
        </section>

        <section className="glass-card rounded-[32px] p-7 md:p-8">
          <p className="eyebrow">Welcome Back</p>
          <h2 className="mt-3 text-4xl text-on-surface">Log in</h2>
          <p className="mt-2 text-sm text-on-surface-muted">Pick up where your next cultural plan left off.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface-muted">Email</label>
              <input
                className="input-shell"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface-muted">Password</label>
              <div className="relative">
                <input
                  className="input-shell pr-20"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-on-surface-muted transition hover:text-on-surface"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-2xl border border-[rgba(184,93,85,0.35)] bg-[rgba(184,93,85,0.12)] px-4 py-3 text-sm text-[#ffd3cf]">
                {error}
              </p>
            )}

            <button className="primary-btn w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Enter Kulto'}
            </button>
          </form>

          <div className="mt-6 text-sm text-on-surface-muted">
            No account yet?{' '}
            <Link className="font-semibold text-primary-mid transition hover:text-white" to="/register">
              Create one
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
