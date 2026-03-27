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
    <div className="min-h-screen bg-background pb-20">
      <header className="px-4 pt-6 pb-4 border-b border-surface-high flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-on-surface">Me</h1>
        <button onClick={handleLogout} className="text-[13px] text-on-surface-muted hover:text-on-surface">
          Log out
        </button>
      </header>

      <main className="px-4 pt-6 space-y-6">
        {/* Profile card */}
        <div className="bg-surface-white rounded-card shadow-card p-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar user={user} size="lg" />
            <div>
              <p className="font-bold text-[18px] text-on-surface">{user.displayName}</p>
              <p className="text-[13px] text-on-surface-muted">{user.email}</p>
              {user.city && <p className="text-[13px] text-on-surface-muted flex items-center gap-1 mt-0.5">
                <span className="material-symbols-rounded text-[14px]">location_on</span>{user.city}
              </p>}
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wide text-on-surface-muted mb-1 block">City</label>
                <input value={city} onChange={e => setCity(e.target.value)}
                  className="w-full bg-surface-low rounded-btn px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary-mid" />
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wide text-on-surface-muted mb-1 block">Outing vibe</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={2}
                  className="w-full bg-surface-low rounded-btn px-3 py-2 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-primary-mid" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-btn border border-surface-high text-[13px] text-on-surface-muted">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-btn bg-primary-mid text-on-primary text-[13px] font-semibold disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {user.bio && <p className="text-[14px] text-on-surface-muted mb-3">{user.bio}</p>}
              <button onClick={() => setEditing(true)}
                className="text-[13px] text-primary-mid font-medium flex items-center gap-1">
                <span className="material-symbols-rounded text-[16px]">edit</span> Edit profile
              </button>
            </>
          )}
        </div>

        {/* Taste */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-on-surface-muted mb-2">My interests</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {user.preferredCategories.map(c => {
              const s = CATEGORY_STYLES[c]
              return <span key={c} className={`px-2.5 py-0.5 rounded-pill text-[11px] font-medium uppercase tracking-wide ${s.bg} ${s.text}`}>{s.label}</span>
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.tasteTags.map(t => (
              <span key={t} className="px-2.5 py-0.5 rounded-pill bg-primary-light text-primary text-[11px] font-medium uppercase tracking-wide">{t}</span>
            ))}
          </div>
          <button onClick={() => navigate('/onboarding')} className="text-[13px] text-primary-mid font-medium mt-3 flex items-center gap-1">
            <span className="material-symbols-rounded text-[16px]">edit</span> Edit taste
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
