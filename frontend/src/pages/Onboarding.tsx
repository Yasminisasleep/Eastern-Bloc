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
    <div className="app-shell flex min-h-screen flex-col">
      <header className="border-b border-outline-soft bg-[rgba(11,16,22,0.58)] backdrop-blur-xl">
        <div className="page-wrap flex items-center justify-between px-1 py-4">
        {step > 1
          ? <button onClick={() => setStep(s => s - 1)} className="secondary-btn px-4 py-2 text-sm">
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
          : <div />
        }
        <span className="text-sm font-semibold text-on-surface-muted">{step} of 3</span>
        <button onClick={() => navigate('/discover')} className="secondary-btn px-4 py-2 text-sm">Skip</button>
        </div>
      </header>

      <div className="page-wrap flex-1 px-1 py-6">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="hero-card rounded-[32px] p-6 md:p-8">
            <p className="eyebrow">Onboarding</p>
            <h1 className="mt-3 text-4xl leading-tight text-on-surface md:text-5xl">
              Tune your profile for better cultural chemistry.
            </h1>
            <p className="mt-4 text-sm leading-7 text-on-surface-muted">
              A short bio, a few categories, and some tags are enough to make the app feel intentional instead of random.
            </p>
            <div className="mt-8 flex gap-2">
              {[1, 2, 3].map(index => (
                <div key={index} className={`h-2 flex-1 rounded-full ${index <= step ? 'bg-primary-mid' : 'bg-[rgba(255,255,255,0.08)]'}`} />
              ))}
            </div>
          </aside>

          <section className="glass-card rounded-[32px] p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-4xl text-on-surface">Tell us about you</h2>
            <p className="text-sm text-on-surface-muted">A quick vibe check helps your profile feel human.</p>
            <div className="flex justify-center">
              <div className="glass-card flex h-28 w-28 items-center justify-center rounded-full text-on-surface-muted">
                <span className="material-symbols-rounded text-4xl">add_a_photo</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface-muted">Your outing vibe</label>
              <textarea
                value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                placeholder="I love discovering films outside the mainstream..."
                className="input-shell min-h-[150px] resize-none"
              />
              <p className="mt-2 text-right text-xs text-on-surface-disabled">{bio.length} / 300</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-4xl text-on-surface">What are you into?</h2>
            <p className="text-sm text-on-surface-muted">Pick at least 3 categories to make the matching less random.</p>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => toggleCat(c.value)}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    selectedCats.includes(c.value)
                      ? 'border-primary-mid bg-primary-light shadow-[0_12px_28px_rgba(241,180,76,0.18)]'
                      : 'border-outline-soft bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  <span className="text-2xl block mb-1">{c.emoji}</span>
                  <span className="text-sm font-semibold text-on-surface">{c.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface-muted">Taste tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="sci-fi, jazz, arthouse..."
                  className="input-shell flex-1"
                />
                <button onClick={addTag} className="primary-btn whitespace-nowrap px-5">Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
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
            <h2 className="text-4xl text-on-surface">Where are you based?</h2>
            <p className="text-sm text-on-surface-muted">We use your city to surface events that are actually reachable.</p>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface-muted">City</label>
              <input
                value={city} onChange={e => setCity(e.target.value)}
                placeholder="Paris"
                className="input-shell"
              />
            </div>
          </div>
        )}
          </section>
        </div>
      </div>

      <div className="page-wrap px-1 pb-10 pt-2">
        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 2 && selectedCats.length < 3}
            className="primary-btn w-full disabled:opacity-40"
          >
            Continue <span className="material-symbols-rounded">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving}
            className="primary-btn w-full disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Get started →'}
          </button>
        )}
      </div>
    </div>
  )
}
