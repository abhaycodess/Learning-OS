const ROLE_OPTIONS = ['school', 'college']
const GOAL_OPTIONS = ['crack-exam', 'improve-concepts', 'learn-skills', 'stay-consistent']
const STUDY_PREFERENCE_OPTIONS = ['videos', 'notes', 'practice', 'mixed']
const LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced']
const PREFERRED_STUDY_TIME_OPTIONS = ['morning', 'afternoon', 'night']
const PAIN_POINT_OPTIONS = [
  'Procrastination',
  'Distractions',
  'Lack of clarity',
  'Inconsistency',
  'Exam anxiety',
]

function toCleanArray(value) {
  if (!Array.isArray(value)) return []

  const unique = new Set()
  value.forEach((entry) => {
    if (typeof entry !== 'string') return
    const trimmed = entry.trim()
    if (!trimmed) return
    unique.add(trimmed)
  })

  return [...unique]
}

function pickEnum(value, allowed, fallback = '') {
  if (typeof value !== 'string') return fallback
  return allowed.includes(value) ? value : fallback
}

export function createDefaultUserProfile(user = null) {
  const now = new Date().toISOString()

  return {
    id: user?.id || '',
    name: user?.name || '',
    nickname: '',
    role: '',
    goal: [],
    subjects: [],
    studyPreference: [],
    level: 'beginner',
    dailyGoal: '',
    preferredStudyTime: '',
    painPoints: [],
    remindersEnabled: false,
    streakEnabled: true,
    profilePhoto: user?.profilePhoto || '',
    createdAt: now,
    updatedAt: now,
  }
}

export function normalizeUserProfile(input = {}, base = null) {
  const seed = base || createDefaultUserProfile()
  const merged = { ...seed, ...input }

  return {
    id: merged.id || seed.id || '',
    name: typeof merged.name === 'string' ? merged.name.trim() : seed.name,
    nickname: typeof merged.nickname === 'string' ? merged.nickname.trim() : seed.nickname,
    role: pickEnum(merged.role, ROLE_OPTIONS, ''),
    goal: toCleanArray(merged.goal).filter((item) => GOAL_OPTIONS.includes(item)),
    subjects: toCleanArray(merged.subjects),
    studyPreference: toCleanArray(merged.studyPreference).filter((item) =>
      STUDY_PREFERENCE_OPTIONS.includes(item),
    ),
    level: pickEnum(merged.level, LEVEL_OPTIONS, 'beginner'),
    dailyGoal: typeof merged.dailyGoal === 'string' ? merged.dailyGoal.trim() : seed.dailyGoal,
    preferredStudyTime: pickEnum(merged.preferredStudyTime, PREFERRED_STUDY_TIME_OPTIONS, ''),
    painPoints: toCleanArray(merged.painPoints).filter((item) => PAIN_POINT_OPTIONS.includes(item)),
    remindersEnabled: Boolean(merged.remindersEnabled),
    streakEnabled: Boolean(merged.streakEnabled),
    profilePhoto: typeof merged.profilePhoto === 'string' ? merged.profilePhoto : seed.profilePhoto,
    createdAt: merged.createdAt || seed.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function validateUserProfile(profile) {
  if (!profile.name || profile.name.trim().length === 0) {
    return 'Please enter your full name.'
  }

  if (profile.role && !ROLE_OPTIONS.includes(profile.role)) {
    return 'Please choose a valid academic role.'
  }

  if (profile.level && !LEVEL_OPTIONS.includes(profile.level)) {
    return 'Please choose a valid learning level.'
  }

  if (profile.preferredStudyTime && !PREFERRED_STUDY_TIME_OPTIONS.includes(profile.preferredStudyTime)) {
    return 'Please choose a valid preferred study time.'
  }

  return ''
}

export const USER_PROFILE_OPTIONS = {
  roles: ROLE_OPTIONS,
  goals: GOAL_OPTIONS,
  studyPreferences: STUDY_PREFERENCE_OPTIONS,
  levels: LEVEL_OPTIONS,
  preferredStudyTimes: PREFERRED_STUDY_TIME_OPTIONS,
  painPoints: PAIN_POINT_OPTIONS,
}
