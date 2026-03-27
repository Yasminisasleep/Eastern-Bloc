import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, Category } from '../api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'CINEMA', label: 'Cinema', emoji: '🎬' },
  { value: 'CONCERT', label: 'Concert', emoji: '🎵' },
  { value: 'EXHIBITION', label: 'Exhibition', emoji: '🖼' },
  { value: 'THEATRE', label: 'Theatre', emoji: '🎭' },
  { value: 'FESTIVAL', label: 'Festival', emoji: '🎪' },
]

export default function Onboarding() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1
  const [bio, setBio] = useState(user?.bio ?? '')

  // Step 2
  const [selectedCats, setSelectedCats] = useState<Category[]>(user?.preferredCategories ?? [])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(user?.tasteTags ?? [])

  // Step 3
  const [city, setCity] = useState(user?.city ?? '')

  const [saving, setSaving] = useState(false)

  const toggleCat = (c: Category) =>
    setSelectedCats(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags(s => [...s, t])
    setTagInput('')
  }

  const removeTag = (t: string) => setTags(s => s.filter(x => x !== t))

  const finish = async () => {
    setSaving(true)
    try {
      const updated = await userApi.updateMe({
        bio,
        preferredCategories: selectedCats,
        tasteTags: tags,
        city,
      })
      setUser({ ...user!, ...updated })
      navigate('/discover', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-surface-high">
        {step > 1
          ? <button onClick={() => setStep(s => s - 1)} className="text-on-surface-muted">
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
          : <div />
        }
        <span className="text-[13px] text-on-surface-muted">{step} of 3</span>
        <button onClick={() => navigate('/discover')} className="text-[13px] text-on-surface-muted">Skip</button>
      </header>

      <div className="flex-1 px-6 pt-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-[22px] font-bold">Tell us about you</h2>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-surface-low flex items-center justify-center text-on-surface-muted cursor-pointer hover:bg-surface-high">
                <span className="material-symbols-rounded text-4xl">add_a_photo</span>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wide text-on-surface-muted mb-1 block">Your outing vibe (optional)</label>
              <textarea
                value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                placeholder="I love discovering films outside the mainstream..."
                className="w-full bg-surface-low rounded-btn px-3 py-2.5 text-[14px] text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary-mid"
              />
              <p className="text-right text-[11px] text-on-surface-disabled mt-0.5">{bio.length} / 300</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-[22px] font-bold">What are you into?</h2>
            <p className="text-[13px] text-on-surface-muted">Pick at least 3 categories to start matching</p>

            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => toggleCat(c.value)}
                  className={`p-4 rounded-card text-left transition-all border-2 ${
                    selectedCats.includes(c.value)
                      ? 'border-primary-mid bg-primary-light'
                      : 'border-transparent bg-surface-low hover:bg-surface-high'
                  }`}
                >
                  <span className="text-2xl block mb-1">{c.emoji}</span>
                  <span className="text-[14px] font-medium text-on-surface">{c.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[12px] font-medium uppercase tracking-wide text-on-surface-muted mb-1 block">Taste tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="sci-fi, jazz, arthouse..."
                  className="flex-1 bg-surface-low rounded-btn px-3 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-mid"
                />
                <button onClick={addTag} className="px-3 py-2.5 bg-primary-mid text-on-primary rounded-btn text-[13px] font-medium">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-primary-light text-primary text-[12px] font-medium">
                    {t}
                    <button onClick={() => removeTag(t)}><span className="material-symbols-rounded text-[14px]">close</span></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-[22px] font-bold">Where are you based?</h2>
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wide text-on-surface-muted mb-1 block">City</label>
              <input
                value={city} onChange={e => setCity(e.target.value)}
                placeholder="Paris"
                className="w-full bg-surface-low rounded-btn px-3 py-3 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-mid"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-6 pb-8 pt-4">
        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 2 && selectedCats.length < 3}
            className="w-full py-3.5 rounded-btn bg-primary-mid text-on-primary font-semibold text-[15px] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            Continue <span className="material-symbols-rounded">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving}
            className="w-full py-3.5 rounded-btn bg-primary-mid text-on-primary font-semibold text-[15px] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Get started →'}
          </button>
        )}
      </div>
    </div>
  )
}
