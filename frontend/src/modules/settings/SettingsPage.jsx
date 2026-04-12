import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bell,
  BookOpenCheck,
  Globe,
  LayoutGrid,
  Moon,
  Palette,
  Save,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Timer,
  Trash2,
  UserRound,
  Volume2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useUserProfile } from '../../hooks/useUserProfile.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'

const UI_SETTINGS_KEY = 'settingsUIByUser'
const LOCAL_SETTINGS_FALLBACK_USER = '__local__'

function persistFocusSoundSetting(userId, focusSound) {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(UI_SETTINGS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const storageUserKey = userId || LOCAL_SETTINGS_FALLBACK_USER
    parsed[storageUserKey] = {
      ...(parsed[storageUserKey] || {}),
      focusSound,
    }
    window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(parsed))
  } catch {
    // Best effort local persistence.
  }
}

function createInitialSettings(userId, userProfile, fallbackAccent = 'violet') {
  const remindersEnabled = Boolean(userProfile?.remindersEnabled)
  const streakEnabled = typeof userProfile?.streakEnabled === 'boolean' ? userProfile.streakEnabled : true

  let cached = {}
  if (typeof window !== 'undefined' && userId) {
    try {
      const raw = window.localStorage.getItem(UI_SETTINGS_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      cached = parsed[userId] || {}
    } catch {
      cached = {}
    }
  }

  return {
    remindersEnabled,
    streakEnabled,
    emailNotifications: cached.emailNotifications ?? true,
    pushNotifications: cached.pushNotifications ?? true,
    weeklySummary: cached.weeklySummary ?? true,
    focusSound: cached.focusSound ?? false,
    autoStartBreakTimer: cached.autoStartBreakTimer ?? true,
    profileVisibility: cached.profileVisibility ?? 'private',
    progressSharing: cached.progressSharing ?? false,
    uiDensity: cached.uiDensity ?? 'comfortable',
    startPage: cached.startPage ?? 'home',
    accentMode: cached.accentMode ?? fallbackAccent,
    language: cached.language ?? 'English',
    timezone: cached.timezone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'),
  }
}

function ToggleRow({ label, description, icon: Icon, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`setting-choice flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        checked ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white hover:border-neutral-300'
      } ${checked ? 'is-selected' : ''}`}
    >
      <span className="flex items-start gap-3">
        <span className={`mt-0.5 ${checked ? 'text-primary' : 'text-neutral-500'}`}>
          <Icon size={16} />
        </span>
        <span>
          <p className="setting-choice-title text-sm font-semibold text-neutral-900">{label}</p>
          <p className="setting-choice-copy text-xs text-neutral-500">{description}</p>
        </span>
      </span>
      <span
        className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition ${
          checked ? 'bg-primary' : 'bg-neutral-300'
        }`}
        aria-hidden="true"
      >
        <span className={`h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </span>
    </button>
  )
}

function SelectCard({ title, description, selected, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`setting-choice rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-primary bg-primary/5 shadow-[0_8px_20px_rgb(var(--brand-rgb)/0.16)]'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      } ${selected ? 'is-selected' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className={selected ? 'text-primary' : 'text-neutral-500'} />
        <p className="setting-choice-title text-sm font-semibold text-neutral-900">{title}</p>
      </div>
      <p className="setting-choice-copy mt-1 text-xs text-neutral-500">{description}</p>
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { userProfile, getProfile, updateProfile } = useUserProfile()
  const { mode, setMode, accent, setAccent } = useTheme()

  const profile = useMemo(() => userProfile || getProfile(), [getProfile, userProfile])
  const userId = user?.id || profile?.id || ''

  const [settings, setSettings] = useState(() => createInitialSettings(userId, profile, accent))
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    setSettings(createInitialSettings(userId, profile, accent))
  }, [userId, profile])

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const nextSettings = { ...prev, [key]: value }

      if (key === 'focusSound') {
        persistFocusSoundSetting(userId, Boolean(value))
      }

      return nextSettings
    })
    setStatus({ type: '', message: '' })
  }

  const toggleExclusiveSetting = (key, value, defaultValue) => {
    const nextValue = settings[key] === value ? defaultValue : value
    updateSetting(key, nextValue)

    if (key === 'accentMode') {
      setAccent(nextValue)
    }
  }

  const updateAccent = (value) => {
    toggleExclusiveSetting('accentMode', value, 'violet')
  }

  const saveLocalSettings = () => {
    if (!userId || typeof window === 'undefined') return

    const {
      emailNotifications,
      pushNotifications,
      weeklySummary,
      focusSound,
      autoStartBreakTimer,
      profileVisibility,
      progressSharing,
      uiDensity,
      startPage,
      accentMode,
      language,
      timezone,
    } = settings

    const payload = {
      emailNotifications,
      pushNotifications,
      weeklySummary,
      focusSound,
      autoStartBreakTimer,
      profileVisibility,
      progressSharing,
      uiDensity,
      startPage,
      accentMode,
      language,
      timezone,
    }

    try {
      const raw = window.localStorage.getItem(UI_SETTINGS_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      parsed[userId] = payload
      window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(parsed))
    } catch {
      // Keep non-critical settings local where possible.
    }
  }

  const handleSave = async () => {
    const result = await updateProfile({
      remindersEnabled: settings.remindersEnabled,
      streakEnabled: settings.streakEnabled,
    })

    if (result?.error) {
      setStatus({ type: 'error', message: result.error })
      return
    }

    saveLocalSettings()
    setStatus({
      type: 'success',
      message: 'Settings saved. Core preferences are synced and advanced preferences are stored locally.',
    })
  }

  const handleResetLocal = () => {
    if (userId && typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(UI_SETTINGS_KEY)
        const parsed = raw ? JSON.parse(raw) : {}
        delete parsed[userId]
        window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(parsed))
      } catch {
        // Best effort local reset.
      }
    }

    setMode('light')
    setAccent('violet')
    setSettings(createInitialSettings(userId, profile, 'violet'))
    setStatus({ type: 'success', message: 'Advanced local preferences reset to defaults.' })
  }

  const sectionClass =
    'rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_12px_30px_rgba(17,22,29,0.05)]'

  return (
    <div className="settings-page mx-auto w-full max-w-[1120px] space-y-5 pb-4">
      <header className={sectionClass}>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            title="Go back"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl text-neutral-900 md:text-3xl">Settings</h1>
        </div>
      </header>

      <section className={sectionClass}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Notifications</p>
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleRow
            label="Daily reminders"
            description="Gentle nudges for your daily study target."
            icon={Bell}
            checked={settings.remindersEnabled}
            onChange={() => updateSetting('remindersEnabled', !settings.remindersEnabled)}
          />
          <ToggleRow
            label="Streak tracking"
            description="Keep streak counters and consistency prompts active."
            icon={Star}
            checked={settings.streakEnabled}
            onChange={() => updateSetting('streakEnabled', !settings.streakEnabled)}
          />
          <ToggleRow
            label="Email updates"
            description="Weekly highlights and account activity via email."
            icon={BookOpenCheck}
            checked={settings.emailNotifications}
            onChange={() => updateSetting('emailNotifications', !settings.emailNotifications)}
          />
          <ToggleRow
            label="Push notifications"
            description="Mobile and browser notifications for key reminders."
            icon={Smartphone}
            checked={settings.pushNotifications}
            onChange={() => updateSetting('pushNotifications', !settings.pushNotifications)}
          />
        </div>
      </section>

      <section className={sectionClass}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Focus Experience</p>
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleRow
            label="Weekly summary"
            description="Show weekly reflection and momentum summary cards."
            icon={Sparkles}
            checked={settings.weeklySummary}
            onChange={() => updateSetting('weeklySummary', !settings.weeklySummary)}
          />
          <ToggleRow
            label="Focus sound cues"
            description="Play subtle sound cues when focus blocks start or end."
            icon={Volume2}
            checked={settings.focusSound}
            onChange={() => updateSetting('focusSound', !settings.focusSound)}
          />
          <ToggleRow
            label="Auto-start break timer"
            description="Start break countdown automatically after focus completion."
            icon={Timer}
            checked={settings.autoStartBreakTimer}
            onChange={() => updateSetting('autoStartBreakTimer', !settings.autoStartBreakTimer)}
          />
        </div>
      </section>

      <section className={sectionClass}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Privacy</p>
        <div className="grid gap-3 md:grid-cols-2">
          <SelectCard
            title="Private profile"
            description="Only you can view your profile and progress details."
            icon={Shield}
            selected={settings.profileVisibility === 'private'}
            onClick={() => toggleExclusiveSetting('profileVisibility', 'private', 'private')}
          />
          <SelectCard
            title="Public profile"
            description="Allow profile visibility for collaborative features."
            icon={UserRound}
            selected={settings.profileVisibility === 'public'}
            onClick={() => toggleExclusiveSetting('profileVisibility', 'public', 'private')}
          />
        </div>

        <div className="mt-3">
          <ToggleRow
            label="Share progress snapshots"
            description="Allow selected dashboards and achievements to be shared."
            icon={Globe}
            checked={settings.progressSharing}
            onChange={() => updateSetting('progressSharing', !settings.progressSharing)}
          />
        </div>
      </section>

      <section className={sectionClass}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Appearance</p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <SelectCard
            title="Comfortable density"
            description="Larger spacing and easier scanning."
            icon={LayoutGrid}
            selected={settings.uiDensity === 'comfortable'}
            onClick={() => toggleExclusiveSetting('uiDensity', 'comfortable', 'comfortable')}
          />
          <SelectCard
            title="Compact density"
            description="Show more information per screen."
            icon={LayoutGrid}
            selected={settings.uiDensity === 'compact'}
            onClick={() => toggleExclusiveSetting('uiDensity', 'compact', 'comfortable')}
          />
          <SelectCard
            title="Violet accent"
            description="Use the current branded accent style."
            icon={Palette}
            selected={settings.accentMode === 'violet'}
            onClick={() => updateAccent('violet')}
          />
          <SelectCard
            title="Emerald accent"
            description="Alternative accent for focus-oriented UI."
            icon={Palette}
            selected={settings.accentMode === 'emerald'}
            onClick={() => updateAccent('emerald')}
          />
          <SelectCard
            title="Light mode"
            description="Bright workspace with high readability."
            icon={Sun}
            selected={mode === 'light'}
            onClick={() => setMode('light')}
          />
          <SelectCard
            title="Dark mode"
            description="Low-glare interface tuned for contrast and focus."
            icon={Moon}
            selected={mode === 'dark'}
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          />
        </div>
      </section>

      <section className={sectionClass}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Regional and Defaults</p>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Language</p>
            <select
              value={settings.language}
              onChange={(event) => updateSetting('language', event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
            </select>
          </label>

          <label className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Timezone</p>
            <input
              value={settings.timezone}
              onChange={(event) => updateSetting('timezone', event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Asia/Kolkata"
            />
          </label>

          <label className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Default landing page</p>
            <select
              value={settings.startPage}
              onChange={(event) => updateSetting('startPage', event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="home">Home</option>
              <option value="dashboard">Dashboard</option>
              <option value="focus">Focus</option>
              <option value="dark">Dark mode preview</option>
            </select>
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Danger Zone</p>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">Reset local advanced settings</p>
          <p className="mt-1 text-xs text-red-600">
            This clears device-level preferences like UI density and local notification preferences. Synced profile data remains safe.
          </p>
          <button
            type="button"
            onClick={handleResetLocal}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <Trash2 size={16} />
            Reset Local Preferences
          </button>
        </div>
      </section>

      {status.message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            status.type === 'error'
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          Back to Profile
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgb(var(--brand-rgb)/0.35)] transition hover:bg-primary-light"
        >
          <Save size={16} />
          Save Settings
        </button>
      </div>
    </div>
  )
}
