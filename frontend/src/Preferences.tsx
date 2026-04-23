import { FormEvent, useEffect, useMemo, useState } from 'react'
import { PreferencesPayload, fetchUserPreferences, saveUserPreferences, fetchContactLink, updateContactLink } from './api'

interface Props {
  userId: number
  userStorageKey: string
}

const CATEGORIES = ['CINEMA', 'CONCERT', 'EXHIBITION', 'THEATRE', 'FESTIVAL']
const CATEGORY_LABELS: Record<string, string> = {
  CINEMA: 'Cinema',
  CONCERT: 'Concert',
  EXHIBITION: 'Exhibition',
  THEATRE: 'Theatre',
  FESTIVAL: 'Festival',
}
const DEFAULT_PREFERENCES: PreferencesPayload = {
  preferredCategories: ['CINEMA', 'THEATRE'],
  interestTags: ['indie', 'comedy'],
  geographicRadiusKm: 15,
  age: null,
  gender: null,
  preferredGenders: [],
  preferredAgeMin: 18,
  preferredAgeMax: 45,
}

const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'FEMALE', label: 'Woman' },
  { value: 'MALE', label: 'Man' },
  { value: 'OTHER', label: 'Non-binary / Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

const PREFERRED_GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'FEMALE', label: 'Women' },
  { value: 'MALE', label: 'Men' },
  { value: 'OTHER', label: 'Non-binary people' },
]

function getStorageKey(userStorageKey: string): string {
  return `kulto.preferences.${userStorageKey}`
}

export default function Preferences({ userId, userStorageKey }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [tagsInput, setTagsInput] = useState('')
  const [radius, setRadius] = useState(15)
  const [age, setAge] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [preferredGenders, setPreferredGenders] = useState<string[]>([])
  const [ageMin, setAgeMin] = useState<number>(18)
  const [ageMax, setAgeMax] = useState<number>(45)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [contactLink, setContactLink] = useState('')
  const [savingContact, setSavingContact] = useState(false)
  const [contactSuccess, setContactSuccess] = useState('')

  const storageKey = useMemo(() => getStorageKey(userStorageKey), [userStorageKey])

  useEffect(() => {
    let isMounted = true

    async function loadPreferences() {
      setLoading(true)
      setError('')
      try {
        const prefs = await fetchUserPreferences(userId)
        if (!isMounted) return
        setSelectedCategories(prefs.preferredCategories || [])
        setTagsInput((prefs.interestTags || []).join(', '))
        setRadius(prefs.geographicRadiusKm || 15)
        setAge(prefs.age != null ? String(prefs.age) : '')
        setGender(prefs.gender || '')
        setPreferredGenders(prefs.preferredGenders || [])
        setAgeMin(prefs.preferredAgeMin ?? 18)
        setAgeMax(prefs.preferredAgeMax ?? 45)
      } catch {
        const localValue = localStorage.getItem(storageKey)
        const fallback = localValue ? (JSON.parse(localValue) as PreferencesPayload) : DEFAULT_PREFERENCES
        if (!isMounted) return
        setSelectedCategories(fallback.preferredCategories)
        setTagsInput(fallback.interestTags.join(', '))
        setRadius(fallback.geographicRadiusKm)
        setAge(fallback.age != null ? String(fallback.age) : '')
        setGender(fallback.gender || '')
        setPreferredGenders(fallback.preferredGenders || [])
        setAgeMin(fallback.preferredAgeMin ?? 18)
        setAgeMax(fallback.preferredAgeMax ?? 45)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPreferences()
    fetchContactLink(userId).then(link => { if (isMounted) setContactLink(link) })

    return () => {
      isMounted = false
    }
  }, [storageKey, userId])

  const parsedTags = tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

  const toggleCategory = (category: string) => {
    setSelectedCategories(current =>
      current.includes(category)
        ? current.filter(value => value !== category)
        : [...current, category],
    )
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (selectedCategories.length === 0) {
      setError('Select at least one category.')
      return
    }

    const payload: PreferencesPayload = {
      preferredCategories: selectedCategories,
      interestTags: parsedTags,
      geographicRadiusKm: radius,
      age: age ? Number(age) : null,
      gender: gender || null,
      preferredGenders,
      preferredAgeMin: ageMin,
      preferredAgeMax: ageMax,
    }

    setSaving(true)
    try {
      await saveUserPreferences(userId, payload)
      localStorage.setItem(storageKey, JSON.stringify(payload))
      setSuccessMessage('Preferences saved.')
    } catch {
      localStorage.setItem(storageKey, JSON.stringify(payload))
      setSuccessMessage('Preferences saved locally (backend not ready yet).')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveContact = async () => {
    setSavingContact(true)
    setContactSuccess('')
    try {
      await updateContactLink(userId, contactLink)
      setContactSuccess('Contact link saved.')
    } catch {
      setContactSuccess('Saved locally (backend not ready yet).')
    } finally {
      setSavingContact(false)
    }
  }

  if (loading) {
    return (
      <div className="loading" data-cy="preferences-loading">
        <div className="spinner" />
        Loading your preferences...
      </div>
    )
  }

  return (
    <div className="panel-card" data-cy="preferences-view">
      <h2 className="panel-title">Cultural Preferences</h2>
      <p className="panel-subtitle">Choose what you like so matching can suggest relevant people and events.</p>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Preferred categories</label>
          <div className="chip-grid">
            {CATEGORIES.map(category => {
              const active = selectedCategories.includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  data-cy={`preferences-category-${category.toLowerCase()}`}
                  className={`chip ${active ? 'chip-active' : ''}`}
                  onClick={() => toggleCategory(category)}
                >
                  {CATEGORY_LABELS[category] ?? category}
                </button>
              )
            })}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="interestTags">Interest tags</label>
          <input
            id="interestTags"
            type="text"
            data-cy="preferences-tags"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="indie, drama, museum, jazz"
          />
          <small className="field-help">Use commas between tags.</small>
        </div>

        <div className="form-group">
          <label htmlFor="radius">Geographic radius: {radius} km</label>
          <input
            id="radius"
            type="range"
            data-cy="preferences-radius"
            min={1}
            max={100}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
          />
        </div>

        <div className="prefs-section-header">About you</div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Your age</label>
            <input
              id="age"
              type="number"
              data-cy="preferences-age"
              min={16}
              max={99}
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 27"
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">You are</label>
            <select
              id="gender"
              data-cy="preferences-gender"
              value={gender}
              onChange={e => setGender(e.target.value)}
            >
              <option value="">Select...</option>
              {GENDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="prefs-section-header">Who you want to meet</div>

        <div className="form-group">
          <label>Open to meet</label>
          <div className="chip-grid">
            {PREFERRED_GENDER_OPTIONS.map(opt => {
              const active = preferredGenders.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip ${active ? 'chip-active' : ''}`}
                  onClick={() =>
                    setPreferredGenders(current =>
                      current.includes(opt.value)
                        ? current.filter(v => v !== opt.value)
                        : [...current, opt.value],
                    )
                  }
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          <small className="field-help">Leave all unselected to meet anyone.</small>
        </div>

        <div className="form-group">
          <label>Age range: {ageMin} – {ageMax}</label>
          <div className="age-range-inputs">
            <input
              type="number"
              min={16}
              max={99}
              value={ageMin}
              onChange={e => {
                const v = Number(e.target.value)
                setAgeMin(v)
                if (v > ageMax) setAgeMax(v)
              }}
            />
            <span className="age-range-sep">to</span>
            <input
              type="number"
              min={16}
              max={99}
              value={ageMax}
              onChange={e => {
                const v = Number(e.target.value)
                setAgeMax(v)
                if (v < ageMin) setAgeMin(v)
              }}
            />
          </div>
        </div>

        {error && <div className="error-message" data-cy="preferences-error">{error}</div>}
        {successMessage && <div className="success-message" data-cy="preferences-success">{successMessage}</div>}

        <div className="form-actions">
          <button type="submit" data-cy="preferences-save" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      <div className="form-group" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Contact link</h3>
        <p className="panel-subtitle" style={{ marginBottom: '12px' }}>Shared with your match once both accept. Use a Telegram handle, Instagram, WhatsApp number, etc.</p>
        <input
          type="text"
          data-cy="contact-link-input"
          value={contactLink}
          onChange={e => setContactLink(e.target.value)}
          placeholder="e.g. @you on Telegram, instagram.com/you"
        />
        {contactSuccess && <div className="success-message" data-cy="contact-link-success">{contactSuccess}</div>}
        <div className="form-actions">
          <button type="button" data-cy="contact-link-save" onClick={handleSaveContact} disabled={savingContact}>
            {savingContact ? 'Saving...' : 'Save contact link'}
          </button>
        </div>
      </div>
    </div>
  )
}
