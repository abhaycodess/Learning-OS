// Utility to manage guest data in localStorage

export const GUEST_STORAGE_KEY = 'unlazy_guest_data'

const DEFAULT_GUEST_DATA = {
  tasks: [],
  subjects: [],
  sessions: [],
  activeSession: null,
  progress: {
    totalStudySeconds: 0,
    streakDays: 0,
    lastActiveDate: null,
  }
}

export function getGuestData() {
  try {
    const data = localStorage.getItem(GUEST_STORAGE_KEY)
    if (!data) return DEFAULT_GUEST_DATA
    return { ...DEFAULT_GUEST_DATA, ...JSON.parse(data) }
  } catch (e) {
    console.error("Error reading guest data", e)
    return DEFAULT_GUEST_DATA
  }
}

export function saveGuestData(data) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error("Error saving guest data", e)
  }
}

export function updateGuestProgress(sessionSeconds) {
  const data = getGuestData()
  const today = new Date().toISOString().slice(0, 10)

  data.progress.totalStudySeconds += sessionSeconds

  if (data.progress.lastActiveDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    if (data.progress.lastActiveDate === yesterdayStr) {
      data.progress.streakDays += 1
    } else if (data.progress.lastActiveDate !== today) {
      data.progress.streakDays = 1
    }

    data.progress.lastActiveDate = today
  }

  saveGuestData(data)
}

export function getGuestMostStudiedSubject() {
  const data = getGuestData()
  const subjectTime = {}

  data.sessions.forEach(session => {
    const subjectName = session.subjectName || 'General'
    subjectTime[subjectName] = (subjectTime[subjectName] || 0) + session.durationSec
  })

  let mostStudied = 'None'
  let maxTime = 0

  for (const [subject, time] of Object.entries(subjectTime)) {
    if (time > maxTime) {
      mostStudied = subject
      maxTime = time
    }
  }

  return mostStudied
}
