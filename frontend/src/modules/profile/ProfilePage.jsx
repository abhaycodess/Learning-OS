import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Brain,
  Camera,
  Check,
  Flame,
  GraduationCap,
  Layers,
  Moon,
  X,
  Save,
  School,
  Sparkles,
  Star,
  Sun,
  Target,
  Trash2,
  User,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useUserProfile } from '../../hooks/useUserProfile.jsx'
import { USER_PROFILE_OPTIONS, validateUserProfile } from '../../shared/userProfile.js'
import ImageCropperModal from '../../components/ImageCropperModal.jsx'

const GOAL_OPTIONS = [
  { value: 'crack-exam', label: 'Crack an exam', icon: Target },
  { value: 'improve-concepts', label: 'Improve concepts', icon: Brain },
  { value: 'learn-skills', label: 'Learn skills', icon: Zap },
  { value: 'stay-consistent', label: 'Stay consistent', icon: Flame },
]

const STUDY_PREFERENCE_OPTIONS = [
  { value: 'videos', label: 'Watching videos', icon: BookOpen },
  { value: 'notes', label: 'Reading notes', icon: Layers },
  { value: 'practice', label: 'Practice questions', icon: Target },
  { value: 'mixed', label: 'Mixed', icon: Sparkles },
]

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const PREFERRED_STUDY_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: Sun },
  { value: 'afternoon', label: 'Afternoon', icon: Sun },
  { value: 'night', label: 'Night', icon: Moon },
]

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Computer Science',
  'Economics',
  'History',
]

const PHOTO_ROAST_LINES = [
  'New profile pic? Character development arc unlocked.',
  'Great choice. Your old photo was giving "forgot password" energy.',
  'This one says "I submit assignments before panic mode". Respect.',
  'Bold update. The algorithm is mildly impressed.',
]

const PHOTO_CHANGE_POPUP_LINES = [
  'Profile updated. Your aura patch notes are live.',
  'Nice. This photo screams "I definitely read the syllabus."',
  'Fresh pic deployed. Confidence build completed.',
  'Look at you. Main character firmware updated.',
]

const PHOTO_REMOVE_POPUP_LINES = [
  'Photo removed. Mystery mode activated.',
  'No photo? Bold. Let imagination do the heavy lifting.',
  'Avatar retired. Identity now in stealth mode.',
  'Minimalism unlocked: zero pixels, maximum suspense.',
]

function SelectionCard({ selected, label, icon: Icon, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-[1px] ${
        selected
          ? 'border-primary bg-primary/5 shadow-[0_10px_24px_rgb(var(--brand-rgb)/0.15)]'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={selected ? 'text-primary' : 'text-neutral-500'} />}
          <p className="font-semibold text-neutral-900">{label}</p>
        </div>
        {selected && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
            <Check size={12} />
          </span>
        )}
      </div>
    </button>
  )
}

function SelectableChip({ selected, label, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary text-white shadow-[0_8px_20px_rgb(var(--brand-rgb)/0.25)]'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
      } ${className}`}
    >
      {label}
    </button>
  )
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false
  return left.every((value, index) => value === right[index])
}

function createDraft(profile, user) {
  return {
    id: profile?.id || user?.id || '',
    name: profile?.name || user?.name || '',
    nickname: profile?.nickname || '',
    role: profile?.role || '',
    goal: profile?.goal || [],
    subjects: profile?.subjects || [],
    studyPreference: profile?.studyPreference || [],
    level: profile?.level || 'beginner',
    dailyGoal: profile?.dailyGoal || '',
    preferredStudyTime: profile?.preferredStudyTime || '',
    painPoints: profile?.painPoints || [],
    remindersEnabled: Boolean(profile?.remindersEnabled),
    streakEnabled: typeof profile?.streakEnabled === 'boolean' ? profile.streakEnabled : true,
    profilePhoto: profile?.profilePhoto || user?.profilePhoto || '',
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { userProfile, getProfile, updateProfile, resetProfile } = useUserProfile()
  const fileInputRef = useRef(null)
  const photoMenuRef = useRef(null)
  const photoPopupTimerRef = useRef(null)
  const lastPhotoPopupIndexRef = useRef(-1)

  const baseProfile = useMemo(() => userProfile || getProfile(), [getProfile, userProfile])
  const [form, setForm] = useState(createDraft(baseProfile, user))
  const [customSubject, setCustomSubject] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingImageSrc, setPendingImageSrc] = useState('')
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false)
  const [photoRoast, setPhotoRoast] = useState('')
  const [photoActionPopup, setPhotoActionPopup] = useState('')

  useEffect(() => {
    setForm(createDraft(baseProfile, user))
  }, [baseProfile, user])

  useEffect(() => {
    if (!isPhotoMenuOpen) return undefined

    const onPointerDown = (event) => {
      if (!photoMenuRef.current?.contains(event.target)) {
        setIsPhotoMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [isPhotoMenuOpen])

  useEffect(() => {
    return () => {
      if (photoPopupTimerRef.current) {
        clearTimeout(photoPopupTimerRef.current)
      }
    }
  }, [])

  const isChanged = useMemo(() => {
    const baseline = createDraft(baseProfile, user)

    return {
      name: baseline.name !== form.name,
      nickname: baseline.nickname !== form.nickname,
      role: baseline.role !== form.role,
      profilePhoto: baseline.profilePhoto !== form.profilePhoto,
      goal: !arraysEqual(baseline.goal, form.goal),
      subjects: !arraysEqual(baseline.subjects, form.subjects),
      studyPreference: !arraysEqual(baseline.studyPreference, form.studyPreference),
      level: baseline.level !== form.level,
      dailyGoal: baseline.dailyGoal !== form.dailyGoal,
      preferredStudyTime: baseline.preferredStudyTime !== form.preferredStudyTime,
      painPoints: !arraysEqual(baseline.painPoints, form.painPoints),
      remindersEnabled: baseline.remindersEnabled !== form.remindersEnabled,
      streakEnabled: baseline.streakEnabled !== form.streakEnabled,
    }
  }, [baseProfile, form, user])

  const hasChanges = Object.values(isChanged).some(Boolean)

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setSuccess('')
  }

  const toggleInArray = (key, value) => {
    setForm((prev) => {
      const exists = prev[key].includes(value)
      return {
        ...prev,
        [key]: exists ? prev[key].filter((entry) => entry !== value) : [...prev[key], value],
      }
    })
    setError('')
    setSuccess('')
  }

  const handlePhotoPick = () => {
    if (!fileInputRef.current) return
    setIsPhotoMenuOpen(false)
    fileInputRef.current.click()
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for your profile picture.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Profile picture must be under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPendingImageSrc(String(reader.result || ''))
      setIsCropperOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoRemove = () => {
    updateField('profilePhoto', '')
    setPhotoRoast('Profile photo removed. Stealth mode activated.')
    showPhotoActionPopup('remove')
    setIsPhotoMenuOpen(false)
  }

  const handlePhotoRoast = () => {
    const next = PHOTO_ROAST_LINES[Math.floor(Math.random() * PHOTO_ROAST_LINES.length)]
    setPhotoRoast(next)
  }

  const handleCropConfirm = (croppedImage) => {
    updateField('profilePhoto', croppedImage)
    showPhotoActionPopup('change')
    setPendingImageSrc('')
    setIsCropperOpen(false)
  }

  const showPhotoActionPopup = (type) => {
    const source = type === 'remove' ? PHOTO_REMOVE_POPUP_LINES : PHOTO_CHANGE_POPUP_LINES
    let nextIndex = Math.floor(Math.random() * source.length)

    if (source.length > 1 && nextIndex === lastPhotoPopupIndexRef.current) {
      nextIndex = (nextIndex + 1) % source.length
    }

    lastPhotoPopupIndexRef.current = nextIndex
    setPhotoActionPopup(source[nextIndex])

    if (photoPopupTimerRef.current) {
      clearTimeout(photoPopupTimerRef.current)
    }

    photoPopupTimerRef.current = setTimeout(() => {
      setPhotoActionPopup('')
      photoPopupTimerRef.current = null
    }, 2300)
  }

  const handleCropCancel = () => {
    setPendingImageSrc('')
    setIsCropperOpen(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const addCustomSubject = () => {
    const normalized = customSubject.trim()
    if (!normalized) return

    const alreadySelected = form.subjects.some((item) => item.toLowerCase() === normalized.toLowerCase())
    if (!alreadySelected) {
      updateField('subjects', [...form.subjects, normalized])
    }
    setCustomSubject('')
  }

  const handleSave = async (event) => {
    event.preventDefault()

    const validationMessage = validateUserProfile(form)
    if (validationMessage) {
      setError(validationMessage)
      setSuccess('')
      return
    }

    const result = await updateProfile(form)
    if (result?.error) {
      setError(result.error)
      setSuccess('')
      return
    }

    setSuccess('Saved. Your profile is now synced across onboarding and dashboard.')
    setError('')
  }

  const sectionClass =
    'rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_12px_30px_rgba(17,22,29,0.05)]'

  const changedHighlight = 'ring-2 ring-amber-300 ring-offset-1'

  return (
    <div className="space-y-5 pb-4">
      <header className={sectionClass}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Account</p>
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
          <h1 className="text-2xl text-neutral-900 md:text-3xl">Profile Settings</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          This is your live learning system. Every change here updates your onboarding profile and dashboard personalization.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-5">
        <section className={sectionClass}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Basic Info</p>
          <div className="flex flex-wrap items-center gap-4">
            <div ref={photoMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsPhotoMenuOpen((prev) => !prev)}
                aria-label="Edit profile photo"
                title="Edit profile photo"
                className={`group relative grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 transition hover:border-[#6352c8]/50 ${
                  isChanged.profilePhoto ? changedHighlight : ''
                }`}
              >
                {form.profilePhoto ? (
                  <img src={form.profilePhoto} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-neutral-500">
                    {(form.nickname.trim() || form.name.trim() || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}

                <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6352c8] shadow">
                    <Camera size={16} />
                  </span>
                </span>
              </button>

              {isPhotoMenuOpen ? (
                <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_16px_40px_rgba(17,22,29,0.18)]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Photo Actions</p>
                    <button
                      type="button"
                      onClick={() => setIsPhotoMenuOpen(false)}
                      aria-label="Close photo menu"
                      title="Close"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={handlePhotoPick}
                      className="inline-flex w-full items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      <Camera size={16} />
                      {form.profilePhoto ? 'Choose new photo' : 'Upload photo'}
                    </button>

                    <button
                      type="button"
                      onClick={handlePhotoRemove}
                      disabled={!form.profilePhoto}
                      className="inline-flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Remove current photo
                    </button>

                    <button
                      type="button"
                      onClick={handlePhotoRoast}
                      className="inline-flex w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      <Sparkles size={16} />
                      Roast my photo choice
                    </button>
                  </div>

                  {photoRoast ? (
                    <p className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
                      {photoRoast}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-sm font-semibold text-neutral-800">Profile Photo</p>
              <p className="mt-1 text-xs text-neutral-500">PNG or JPG, max size 2MB.</p>
              <p className="mt-2 text-xs text-neutral-500">Hover your avatar, click the camera icon, then choose an action.</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-800">Full Name</span>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full rounded-xl border border-neutral-200 bg-white px-10 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#6352c8] focus:ring-2 focus:ring-[#6352c8]/20 ${
                    isChanged.name ? changedHighlight : ''
                  }`}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-800">Nickname</span>
              <input
                value={form.nickname}
                onChange={(event) => updateField('nickname', event.target.value)}
                placeholder="What should we call you?"
                className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#6352c8] focus:ring-2 focus:ring-[#6352c8]/20 ${
                  isChanged.nickname ? changedHighlight : ''
                }`}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SelectionCard
              selected={form.role === 'school'}
              label="School Student"
              icon={School}
              onClick={() => updateField('role', 'school')}
              className={isChanged.role ? changedHighlight : ''}
            />
            <SelectionCard
              selected={form.role === 'college'}
              label="College Student"
              icon={GraduationCap}
              onClick={() => updateField('role', 'college')}
              className={isChanged.role ? changedHighlight : ''}
            />
            <SelectionCard
              selected={form.role === 'selfLearner'}
              label="Self Learner"
              icon={Sparkles}
              onClick={() => updateField('role', 'selfLearner')}
              className={isChanged.role ? changedHighlight : ''}
            />
          </div>
        </section>

        <section className={sectionClass}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Learning Profile</p>

          <p className="mb-2 text-sm font-semibold text-neutral-800">Goals</p>
          <div className="grid gap-3 md:grid-cols-2">
            {GOAL_OPTIONS.map((entry) => (
              <SelectionCard
                key={entry.value}
                selected={form.goal.includes(entry.value)}
                label={entry.label}
                icon={entry.icon}
                onClick={() => toggleInArray('goal', entry.value)}
                className={isChanged.goal ? changedHighlight : ''}
              />
            ))}
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-neutral-800">Subjects</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_OPTIONS.map((subject) => (
              <SelectableChip
                key={subject}
                selected={form.subjects.includes(subject)}
                label={subject}
                onClick={() => toggleInArray('subjects', subject)}
                className={isChanged.subjects ? changedHighlight : ''}
              />
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={customSubject}
              onChange={(event) => setCustomSubject(event.target.value)}
              placeholder="Add custom subject"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#6352c8] focus:ring-2 focus:ring-[#6352c8]/20"
            />
            <button
              type="button"
              onClick={addCustomSubject}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              Add
            </button>
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-neutral-800">Study Preference</p>
          <div className="grid gap-3 md:grid-cols-2">
            {STUDY_PREFERENCE_OPTIONS.map((entry) => (
              <SelectionCard
                key={entry.value}
                selected={form.studyPreference.includes(entry.value)}
                label={entry.label}
                icon={entry.icon}
                onClick={() => toggleInArray('studyPreference', entry.value)}
                className={isChanged.studyPreference ? changedHighlight : ''}
              />
            ))}
          </div>

          <p className="mb-2 mt-5 text-sm font-semibold text-neutral-800">Current Level</p>
          <div className="grid gap-2 md:grid-cols-3">
            {LEVEL_OPTIONS.map((entry) => (
              <SelectionCard
                key={entry.value}
                selected={form.level === entry.value}
                label={entry.label}
                onClick={() => updateField('level', entry.value)}
                className={isChanged.level ? changedHighlight : ''}
              />
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Study System</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-800">Daily Goal</span>
              <input
                value={form.dailyGoal}
                onChange={(event) => updateField('dailyGoal', event.target.value)}
                placeholder="2 hours daily"
                className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#6352c8] focus:ring-2 focus:ring-[#6352c8]/20 ${
                  isChanged.dailyGoal ? changedHighlight : ''
                }`}
              />
            </label>
          </div>

          <p className="mb-2 mt-4 text-sm font-semibold text-neutral-800">Preferred Study Time</p>
          <div className="grid gap-3 md:grid-cols-3">
            {PREFERRED_STUDY_TIME_OPTIONS.map((entry) => (
              <SelectionCard
                key={entry.value}
                selected={form.preferredStudyTime === entry.value}
                label={entry.label}
                icon={entry.icon}
                onClick={() => updateField('preferredStudyTime', entry.value)}
                className={isChanged.preferredStudyTime ? changedHighlight : ''}
              />
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Challenges</p>
          <div className="flex flex-wrap gap-2">
            {USER_PROFILE_OPTIONS.painPoints.map((item) => (
              <SelectableChip
                key={item}
                selected={form.painPoints.includes(item)}
                label={item}
                onClick={() => toggleInArray('painPoints', item)}
                className={isChanged.painPoints ? changedHighlight : ''}
              />
            ))}
          </div>
        </section>

        <section id="settings" className={sectionClass}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Settings</p>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => updateField('remindersEnabled', !form.remindersEnabled)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                form.remindersEnabled ? 'border-[#6352c8] bg-[#6352c8]/5' : 'border-neutral-200 bg-white hover:border-neutral-300'
              } ${isChanged.remindersEnabled ? changedHighlight : ''}`}
            >
              <span>
                <p className="text-sm font-semibold text-neutral-900">Reminders</p>
                <p className="text-xs text-neutral-500">Gentle nudges for your daily target.</p>
              </span>
              <Bell size={16} className={form.remindersEnabled ? 'text-[#6352c8]' : 'text-neutral-500'} />
            </button>

            <button
              type="button"
              onClick={() => updateField('streakEnabled', !form.streakEnabled)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                form.streakEnabled ? 'border-[#6352c8] bg-[#6352c8]/5' : 'border-neutral-200 bg-white hover:border-neutral-300'
              } ${isChanged.streakEnabled ? changedHighlight : ''}`}
            >
              <span>
                <p className="text-sm font-semibold text-neutral-900">Streak Tracking</p>
                <p className="text-xs text-neutral-500">Track consistency and momentum.</p>
              </span>
              <Star size={16} className={form.streakEnabled ? 'text-[#6352c8]' : 'text-neutral-500'} />
            </button>
          </div>
        </section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={async () => {
              const result = await resetProfile()
              if (result?.error) {
                setError(result.error)
                setSuccess('')
                return
              }
              setError('')
              setSuccess('Profile reset to defaults and synced.')
            }}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Reset Profile
          </button>
          <button
            type="submit"
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6352c8] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,82,200,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            Save Profile
          </button>
        </div>
      </form>

      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={pendingImageSrc}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        title="Crop Your Profile Photo"
      />

      {photoActionPopup ? (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center">
          <div className="max-w-md rounded-2xl border border-violet-200 bg-violet-50/95 px-5 py-4 text-center shadow-[0_18px_50px_rgba(76,29,149,0.25)] backdrop-blur-sm">
            <p className="text-sm font-semibold text-violet-800">{photoActionPopup}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
