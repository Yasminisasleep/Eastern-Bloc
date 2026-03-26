import { FormEvent, useEffect, useMemo, useState } from 'react'
import { PreferencesPayload, fetchUserPreferences, saveUserPreferences } from './api'

interface Props {
  userId: number
  userStorageKey: string
}

const CATEGORIES = ['CINEMA', 'CONCERT', 'EXHIBITION', 'THEATRE', 'FESTIVAL']
const DEFAULT_PREFERENCES: PreferencesPayload = {
  preferredCategories: ['CINEMA', 'THEATRE'],
  interestTags: ['indie', 'comedy'],
  geographicRadiusKm: 15,
}

function getStorageKey(userStorageKey: string): string {
  return `kulto.preferences.${userStorageKey}`
}

export default function Preferences({ userId, userStorageKey }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [tagsInput, setTagsInput] = useState('')
  const [radius, setRadius] = useState(15)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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
      } catch {
        const localValue = localStorage.getItem(storageKey)
        const fallback = localValue ? (JSON.parse(localValue) as PreferencesPayload) : DEFAULT_PREFERENCES
        if (!isMounted) return
        setSelectedCategories(fallback.preferredCategories)
        setTagsInput(fallback.interestTags.join(', '))
        setRadius(fallback.geographicRadiusKm)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPreferences()

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

  if (loading) {
    return <div className="loading">Loading your preferences...</div>
  }

  return (
    <div className="panel-card">
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
                  className={`chip ${active ? 'chip-active' : ''}`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
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
            min={1}
            max={100}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  )
}
