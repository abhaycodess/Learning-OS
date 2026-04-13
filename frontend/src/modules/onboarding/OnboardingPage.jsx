import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Brain,
  Camera,
  Check,
  Clock3,
  Flame,
  GraduationCap,
  Layers,
  Moon,
  School,
  Sparkles,
  Star,
  Sun,
  Target,
  User,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useUserProfile } from '../../hooks/useUserProfile.jsx'
import ImageCropperModal from '../../components/ImageCropperModal.jsx'

const TOTAL_STEPS = 8

const GOAL_OPTIONS = [
  { value: 'crack-exam', label: 'Crack an exam', icon: Target },
  { value: 'improve-concepts', label: 'Improve concepts', icon: Brain },
  { value: 'learn-skills', label: 'Learn skills', icon: Zap },
  { value: 'stay-consistent', label: 'Stay consistent', icon: Flame },
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

const DAILY_STUDY_OPTIONS = [
  { value: '1-2', label: '1-2 hours' },
  { value: '3-5', label: '3-5 hours' },
  { value: '6+', label: '6+ hours' },
]

const PREFERRED_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: Sun },
  { value: 'afternoon', label: 'Afternoon', icon: Clock3 },
  { value: 'night', label: 'Night', icon: Moon },
]

const PAIN_POINT_OPTIONS = [
  'Procrastination',
  'Distractions',
  'Lack of clarity',
  'Inconsistency',
  'Exam anxiety',
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

function SelectionCard({ selected, label, icon: Icon, onClick, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-[1px] ${
        selected
          ? 'border-[#6352c8] bg-[#6352c8]/5 shadow-[0_10px_24px_rgba(99,82,200,0.15)]'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={selected ? 'text-[#6352c8]' : 'text-neutral-500'} />}
          <p className="font-semibold text-neutral-900">{label}</p>
        </div>
        {selected && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#6352c8] text-white">
            <Check size={12} />
          </span>
        )}
      </div>
      {description && <p className="mt-2 text-sm text-neutral-600">{description}</p>}
    </button>
  )
}

function SelectableChip({ selected, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
        selected
          ? 'border-[#6352c8] bg-[#6352c8] text-white shadow-[0_8px_20px_rgba(99,82,200,0.25)]'
          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
      }`}
    >
      {label}
    </button>
  )
}

function StepIdentity({ form, onChange, onRoleSelect, onPhotoPick, onPhotoChange, fileInputRef, removePhoto }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white/70 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
            {form.profilePhoto ? (
              <img src={form.profilePhoto} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-neutral-500">
                {(form.nickname.trim() || form.name.trim() || 'U').slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-800">Profile Picture (DP)</p>
            <p className="mt-1 text-xs text-neutral-500">PNG or JPG, max size 2MB.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onPhotoPick}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <Camera size={15} />
                {form.profilePhoto ? 'Edit DP' : 'Upload DP'}
              </button>
              {form.profilePhoto && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-neutral-800">Full Name</span>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-neutral-200 bg-white px-10 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#6352c8] focus:ring-2 focus:ring-[#6352c8]/20"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-neutral-800">Nickname (Optional)</span>
          <input
            name="nickname"
            value={form.nickname}
            onChange={onChange}
            placeholder="What should we call you?"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#6352c8] focus:ring-2 focus:ring-[#6352c8]/20"
          />
        </label>
      </section>

      <section>
        <span className="mb-3 block text-sm font-semibold text-neutral-800">You are currently a</span>
        <div className="grid gap-3 md:grid-cols-2">
          <SelectionCard
            selected={form.role === 'school'}
            label="School Student"
            icon={School}
            description="For class-based study planning and board-focused tracking."
            onClick={() => onRoleSelect('school')}
          />
          <SelectionCard
            selected={form.role === 'college'}
            label="College Student"
            icon={GraduationCap}
            description="For semester-level progress and skill-based growth."
            onClick={() => onRoleSelect('college')}
          />
          <SelectionCard
            selected={form.role === 'selfLearner'}
            label="Self Learner"
            icon={Sparkles}
            description="For personal skill-building, career pivots, and independent learning goals."
            onClick={() => onRoleSelect('selfLearner')}
          />
        </div>
      </section>
    </div>
  )
}

function StepGoal({ form, setField }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
        Select one or more goals
      </p>
      <section className="grid gap-3 md:grid-cols-2">
        {GOAL_OPTIONS.map((entry) => {
          const selected = form.goal.includes(entry.value)
          return (
            <SelectionCard
              key={entry.value}
              selected={selected}
              label={entry.label}
              icon={entry.icon}
              onClick={() => {
                if (selected) {
                  setField(
                    'goal',
                    form.goal.filter((item) => item !== entry.value),
                  )
                  return
                }
                setField('goal', [...form.goal, entry.value])
              }}
            />
          )
        })}
      </section>
    </div>
  )
}

function StepSubjects({ form, setField, customSubject, setCustomSubject, addCustomSubject }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SUBJECT_OPTIONS.map((subject) => {
          const selected = form.subjects.includes(subject)
          return (
            <SelectableChip
              key={subject}
              selected={selected}
              label={subject}
              onClick={() => {
                if (selected) {
                  setField(
                    'subjects',
                    form.subjects.filter((item) => item !== subject),
                  )
                  return
                }
                setField('subjects', [...form.subjects, subject])
              }}
            />
          )
        })}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-3">
        <label className="mb-2 block text-sm font-semibold text-neutral-800">Add custom subject</label>
        <div className="flex gap-2">
          <input
            value={customSubject}
            onChange={(event) => setCustomSubject(event.target.value)}
            placeholder="Example: Accountancy"
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
      </div>

      {form.subjects.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Selected</p>
          <div className="flex flex-wrap gap-2">
            {form.subjects.map((subject) => (
              <span
                key={subject}
                className="inline-flex items-center gap-1 rounded-full border border-[#6352c8]/30 bg-[#6352c8]/10 px-3 py-1 text-sm text-[#4c3ca4]"
              >
                {subject}
                <button
                  type="button"
                  onClick={() => setField('subjects', form.subjects.filter((item) => item !== subject))}
                  className="rounded-full px-1 text-xs text-[#4c3ca4] transition hover:bg-[#6352c8]/20"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StepTimeRoutine({ form, setField }) {
  return (
    <div className="space-y-6">
      <section>
        <p className="mb-3 text-sm font-semibold text-neutral-800">Daily study time</p>
        <div className="grid gap-3 md:grid-cols-3">
          {DAILY_STUDY_OPTIONS.map((entry) => (
            <SelectionCard
              key={entry.value}
              selected={form.studyTime === entry.value}
              label={entry.label}
              onClick={() => setField('studyTime', entry.value)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 text-sm font-semibold text-neutral-800">Preferred study time</p>
        <div className="grid gap-3 md:grid-cols-3">
          {PREFERRED_TIME_OPTIONS.map((entry) => (
            <SelectionCard
              key={entry.value}
              selected={form.preferredStudyTime === entry.value}
              label={entry.label}
              icon={entry.icon}
              onClick={() => setField('preferredStudyTime', entry.value)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function StepPainPoints({ form, setField }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PAIN_POINT_OPTIONS.map((item) => {
        const selected = form.painPoints.includes(item)
        return (
          <SelectableChip
            key={item}
            selected={selected}
            label={item}
            onClick={() => {
              if (selected) {
                setField(
                  'painPoints',
                  form.painPoints.filter((entry) => entry !== item),
                )
                return
              }
              setField('painPoints', [...form.painPoints, item])
            }}
          />
        )
      })}
    </div>
  )
}

function StepStudyPreference({ form, setField }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
        Select one or more preferences
      </p>
      <section className="grid gap-3 md:grid-cols-2">
        {STUDY_PREFERENCE_OPTIONS.map((entry) => {
          const selected = form.studyPreference.includes(entry.value)
          return (
            <SelectionCard
              key={entry.value}
              selected={selected}
              label={entry.label}
              icon={entry.icon}
              onClick={() => {
                if (selected) {
                  setField(
                    'studyPreference',
                    form.studyPreference.filter((item) => item !== entry.value),
                  )
                  return
                }
                setField('studyPreference', [...form.studyPreference, entry.value])
              }}
            />
          )
        })}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-neutral-800">Current level</p>
        <div className="grid gap-2 md:grid-cols-3">
          {LEVEL_OPTIONS.map((entry) => (
            <SelectionCard
              key={entry.value}
              selected={form.level === entry.value}
              label={entry.label}
              onClick={() => setField('level', entry.value)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function StepHabitSetup({ form, onChange, setField }) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-neutral-800">Set your daily study goal</span>
        <input
          name="dailyGoal"
          value={form.dailyGoal}
          onChange={onChange}
          placeholder="2 hours daily"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#6352c8] focus:ring-2 focus:ring-[#6352c8]/20"
        />
      </label>

      <button
        type="button"
        onClick={() => setField('remindersEnabled', !form.remindersEnabled)}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
          form.remindersEnabled
            ? 'border-[#6352c8] bg-[#6352c8]/5'
            : 'border-neutral-200 bg-white hover:border-neutral-300'
        }`}
      >
        <span>
          <p className="text-sm font-semibold text-neutral-900">Enable reminders</p>
          <p className="text-xs text-neutral-500">Get gentle nudges to stay on track.</p>
        </span>
        <span
          className={`grid h-9 w-9 place-items-center rounded-full transition ${
            form.remindersEnabled ? 'bg-[#6352c8] text-white' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          <Bell size={16} />
        </span>
      </button>

      <button
        type="button"
        onClick={() => setField('streakEnabled', !form.streakEnabled)}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
          form.streakEnabled
            ? 'border-[#6352c8] bg-[#6352c8]/5'
            : 'border-neutral-200 bg-white hover:border-neutral-300'
        }`}
      >
        <span>
          <p className="text-sm font-semibold text-neutral-900">Enable streak tracking</p>
          <p className="text-xs text-neutral-500">Build consistency with daily streak milestones.</p>
        </span>
        <span
          className={`grid h-9 w-9 place-items-center rounded-full transition ${
            form.streakEnabled ? 'bg-[#6352c8] text-white' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          <Star size={16} />
        </span>
      </button>
    </div>
  )
}

function StepCompletion({ form }) {
  const dailyLabel = DAILY_STUDY_OPTIONS.find((item) => item.value === form.studyTime)?.label
  const preferredLabel = PREFERRED_TIME_OPTIONS.find((item) => item.value === form.preferredStudyTime)?.label
  const goalSummary = GOAL_OPTIONS.filter((item) => form.goal.includes(item.value))
    .map((item) => item.label)
    .join(', ')
  const studyPreferenceSummary = STUDY_PREFERENCE_OPTIONS.filter((item) =>
    form.studyPreference.includes(item.value),
  )
    .map((item) => item.label)
    .join(', ')

  const summaryItems = [
    { label: 'Goal', value: goalSummary || 'Not selected' },
    { label: 'Subjects', value: form.subjects.length > 0 ? form.subjects.join(', ') : 'Not selected' },
    {
      label: 'Routine',
      value: dailyLabel || preferredLabel ? `${dailyLabel || 'No duration'}, ${preferredLabel || 'No preferred time'}` : 'Not selected',
    },
    {
      label: 'Study preference',
      value: studyPreferenceSummary || 'Not selected',
    },
    { label: 'Daily goal', value: form.dailyGoal || 'Not set' },
  ]

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-sm font-semibold text-emerald-800">Your personalized Unlazy workspace is ready</p>
        <p className="mt-1 text-sm text-emerald-700">
          Your preferences are captured and your workspace is configured for focused learning.
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {summaryItems.map((item) => (
          <div key={item.label} className="rounded-xl border border-neutral-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{item.label}</p>
            <p className="mt-1 text-sm text-neutral-800">{item.value}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, completeOnboarding } = useAuth()
  const { userProfile } = useUserProfile()
  const fileInputRef = useRef(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [pendingImageSrc, setPendingImageSrc] = useState('')
  const [isCropperOpen, setIsCropperOpen] = useState(false)

  const [form, setForm] = useState({
    name: userProfile?.name || user?.name || '',
    nickname: userProfile?.nickname || '',
    profilePhoto: userProfile?.profilePhoto || user?.profilePhoto || '',
    role: userProfile?.role || '',
    goal: userProfile?.goal || [],
    subjects: userProfile?.subjects || [],
    studyTime: userProfile?.studyTime || '',
    preferredStudyTime: userProfile?.preferredStudyTime || '',
    painPoints: userProfile?.painPoints || [],
    studyPreference: userProfile?.studyPreference || [],
    level: userProfile?.level || 'beginner',
    dailyGoal: userProfile?.dailyGoal || '',
    remindersEnabled: Boolean(userProfile?.remindersEnabled),
    streakEnabled:
      typeof userProfile?.streakEnabled === 'boolean' ? userProfile.streakEnabled : true,
  })

  const progress = Math.round((step / TOTAL_STEPS) * 100)

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const handlePhotoPick = () => {
    if (!fileInputRef.current) return
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
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = (croppedImage) => {
    setForm((prev) => ({ ...prev, profilePhoto: croppedImage }))
    setPendingImageSrc('')
    setIsCropperOpen(false)
    setError('')
  }

  const handleCropCancel = () => {
    setPendingImageSrc('')
    setIsCropperOpen(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = () => {
    setForm((prev) => ({ ...prev, profilePhoto: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return 'Please enter your full name.'
      if (!form.role) return 'Please choose whether you are in school or college.'
    }

    if (step === 2 && form.goal.length === 0) return 'Please choose at least one primary goal.'
    if (step === 3 && form.subjects.length === 0) return 'Please select at least one subject or focus area.'
    if (step === 4 && (!form.studyTime || !form.preferredStudyTime)) {
      return 'Please choose your daily study duration and preferred study time.'
    }
    if (step === 5 && form.painPoints.length === 0) return 'Please select at least one pain point.'
    if (step === 6 && form.studyPreference.length === 0) {
      return 'Please choose at least one preferred study format.'
    }
    if (step === 7 && !form.dailyGoal.trim()) return 'Please set your daily study goal.'

    return ''
  }

  const goNext = () => {
    const validationMessage = validateStep()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setError('')
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  const goBack = () => {
    setError('')
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const addCustomSubject = () => {
    const normalized = customSubject.trim()
    if (!normalized) return

    const alreadySelected = form.subjects.some((item) => item.toLowerCase() === normalized.toLowerCase())
    if (!alreadySelected) {
      setField('subjects', [...form.subjects, normalized])
    }
    setCustomSubject('')
  }

  const completeFlow = async () => {
    setLoading(true)

    const result = await completeOnboarding({
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      profilePhoto: form.profilePhoto,
      role: form.role,
      goal: form.goal,
      subjects: form.subjects,
      studyTime: form.studyTime,
      preferredStudyTime: form.preferredStudyTime,
      painPoints: form.painPoints,
      studyPreference: form.studyPreference,
      level: form.level,
      dailyGoal: form.dailyGoal.trim(),
      remindersEnabled: form.remindersEnabled,
      streakEnabled: form.streakEnabled,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  const stepTitleMap = {
    1: 'Identity Setup',
    2: 'Primary Goal',
    3: 'Subjects and Focus',
    4: 'Time and Routine',
    5: 'Current Challenges',
    6: 'Study Preference',
    7: 'Habit Setup',
    8: 'Ready to Launch',
  }

  const stepDescriptionMap = {
    1: 'Make yourself comfortable. We will keep this simple and easy to move through.',
    2: 'Let us find your direction, one calm choice at a time.',
    3: 'Pick the areas that matter most and we will organize the rest gently.',
    4: 'Build a routine that feels steady, realistic, and kind to your day.',
    5: 'Name the rough spots so we can make the journey feel lighter.',
    6: 'Choose the study style that helps you settle in and focus better.',
    7: 'Set habits that are easy to keep and easy to feel good about.',
    8: 'Everything is ready. You can begin with a clear, comfortable starting point.',
  }

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <StepIdentity
          form={form}
          onChange={onChange}
          onRoleSelect={(role) => setField('role', role)}
          onPhotoPick={handlePhotoPick}
          onPhotoChange={handlePhotoChange}
          fileInputRef={fileInputRef}
          removePhoto={removePhoto}
        />
      )
    }

    if (step === 2) return <StepGoal form={form} setField={setField} />
    if (step === 3) {
      return (
        <StepSubjects
          form={form}
          setField={setField}
          customSubject={customSubject}
          setCustomSubject={setCustomSubject}
          addCustomSubject={addCustomSubject}
        />
      )
    }
    if (step === 4) return <StepTimeRoutine form={form} setField={setField} />
    if (step === 5) return <StepPainPoints form={form} setField={setField} />
    if (step === 6) return <StepStudyPreference form={form} setField={setField} />
    if (step === 7) return <StepHabitSetup form={form} onChange={onChange} setField={setField} />
    return <StepCompletion form={form} />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(99,82,200,0.14),transparent_40%),linear-gradient(180deg,#f8f9ff_0%,#eef2f9_100%)] px-4 py-8 md:px-6">
      <div className="absolute left-[-80px] top-[-70px] h-72 w-72 rounded-full bg-[#6352c8]/20 blur-3xl" />
      <div className="absolute bottom-[-80px] right-[-70px] h-72 w-72 rounded-full bg-[#2e9d73]/16 blur-3xl" />

      <div className="relative mx-auto max-w-4xl rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_30px_120px_rgba(17,22,29,0.14)] backdrop-blur md:p-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#6352c8]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5542bb]">
              <Sparkles size={14} />
              Step {step} of {TOTAL_STEPS}
            </p>
            <h1 className="mt-3 text-3xl text-neutral-900 md:text-4xl">{stepTitleMap[step]}</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600 md:text-base">
              {stepDescriptionMap[step]}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-[#6352c8] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          <div key={step} className="animate-fade-up">
            {renderStepContent()}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
            <p className="text-sm text-neutral-500">You can revise all these details later from profile settings.</p>
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}

              {step < TOTAL_STEPS && (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6352c8] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,82,200,0.35)] transition hover:brightness-105"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              )}

              {step === TOTAL_STEPS && (
                <button
                  type="button"
                  onClick={completeFlow}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6352c8] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,82,200,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Preparing...' : 'Go to Dashboard'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={pendingImageSrc}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        title="Crop Your Profile Picture"
      />
    </div>
  )
}
