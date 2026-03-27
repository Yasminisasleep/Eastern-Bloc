import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import BottomNav from '../components/BottomNav'
import { CATEGORY_STYLES } from '../components/CategoryChip'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user?.bio ?? '')
  const [city, setCity] = useState(user?.city ?? '')
  const [saving, setSaving] = useState(false)

  if (!user) { navigate('/login'); return null }

  const save = async () => {
    setSaving(true)
    try {
      const updated = await userApi.updateMe({ bio, city })
      setUser({ ...user, ...updated })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="app-shell pb-28">
      <header className="border-b border-outline-soft bg-[rgba(11,16,22,0.58)] backdrop-blur-xl">
        <div className="page-wrap flex items-center justify-between px-1 py-6">
          <div>
            <p className="eyebrow">Profile</p>
            <h1 className="mt-2 text-4xl text-on-surface">Your cultural card</h1>
          </div>
          <button onClick={handleLogout} className="secondary-btn px-5 py-3 text-sm">
          Log out
          </button>
        </div>
      </header>

      <main className="page-wrap grid gap-6 px-1 pt-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-[30px] p-6">
          <div className="mb-6 flex items-center gap-4">
            <Avatar user={user} size="lg" />
            <div>
              <p className="text-3xl font-semibold text-on-surface">{user.displayName}</p>
              <p className="mt-1 text-sm text-on-surface-muted">{user.email}</p>
              {user.city && <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-muted">
                <span className="material-symbols-rounded text-[14px]">location_on</span>{user.city}
              </p>}
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface-muted">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} className="input-shell" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface-muted">Outing vibe</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={4} className="input-shell resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="secondary-btn flex-1">
                  Cancel
                </button>
                <button onClick={save} disabled={saving} className="primary-btn flex-1 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="max-w-2xl text-base leading-7 text-on-surface-muted">
                {user.bio || 'Add a short bio so future matches know the kind of outing partner they are meeting.'}
              </p>
              <button onClick={() => setEditing(true)} className="mt-5 secondary-btn">
                <span className="material-symbols-rounded text-[18px]">edit</span> Edit profile
              </button>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[30px] p-6">
            <p className="eyebrow">Interests</p>
            <h2 className="mt-2 text-3xl text-on-surface">What shapes your matches</h2>
            <div className="mt-5 flex flex-wrap gap-2">
            {user.preferredCategories.map(c => {
              const s = CATEGORY_STYLES[c]
              return <span key={c} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${s.bg} ${s.text}`}>{s.label}</span>
            })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
            {user.tasteTags.map(t => (
              <span key={t} className="rounded-full bg-primary-light px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{t}</span>
            ))}
            </div>
            <button onClick={() => navigate('/onboarding')} className="primary-btn mt-6">
              <span className="material-symbols-rounded text-[18px]">tune</span> Update taste
            </button>
          </div>

          <div className="hero-card rounded-[30px] p-6">
            <p className="eyebrow">Status</p>
            <h2 className="mt-2 text-3xl text-on-surface">Ready for better matches</h2>
            <p className="mt-3 text-sm leading-6 text-on-surface-muted">
              The sharper your city, categories, and tags, the less random the suggestions feel.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
