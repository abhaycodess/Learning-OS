import { getGuestData, saveGuestData, updateGuestProgress } from './guestStorage.js'

export function startGuestSession(title, subjectName, durationMin) {
  const data = getGuestData()

  const taskId = crypto.randomUUID()
  const task = {
    id: taskId,
    title: title || 'Quick Focus Sprint',
    subjectId: 'guest-subject', // Mock subject
    subjectName: subjectName || 'General',
    type: 'Study',
    completed: false,
    dueDate: new Date().toISOString()
  }

  data.tasks.unshift(task)

  const session = {
    taskId,
    startedAt: Date.now(),
    source: 'quick-focus',
    plannedDurationSec: durationMin * 60,
    isPaused: false,
    accumulatedSec: 0,
    laps: []
  }

  data.activeSession = session
  saveGuestData(data)

  return { task, session }
}

export function pauseGuestSession() {
  const data = getGuestData()
  if (!data.activeSession || data.activeSession.isPaused) return

  const increment = Math.max(0, Math.round((Date.now() - data.activeSession.startedAt) / 1000))
  data.activeSession.isPaused = true
  data.activeSession.pausedAt = Date.now()
  data.activeSession.accumulatedSec += increment

  saveGuestData(data)
}

export function resumeGuestSession() {
  const data = getGuestData()
  if (!data.activeSession || !data.activeSession.isPaused) return

  data.activeSession.isPaused = false
  data.activeSession.pausedAt = null
  data.activeSession.startedAt = Date.now()

  saveGuestData(data)
}

export function stopGuestSession() {
  const data = getGuestData()
  if (!data.activeSession) return null

  const now = Date.now()
  const runningSec = data.activeSession.isPaused
    ? 0
    : Math.max(0, Math.round((now - data.activeSession.startedAt) / 1000))
  const durationSec = (data.activeSession.accumulatedSec || 0) + runningSec

  const taskIndex = data.tasks.findIndex(t => t.id === data.activeSession.taskId)
  if (taskIndex !== -1) {
    data.tasks[taskIndex].completed = true
  }

  const completedSession = {
    id: crypto.randomUUID(),
    taskId: data.activeSession.taskId,
    taskTitle: taskIndex !== -1 ? data.tasks[taskIndex].title : 'Quick Focus',
    subjectName: taskIndex !== -1 ? data.tasks[taskIndex].subjectName : 'General',
    durationSec,
    dateKey: new Date().toISOString().slice(0, 10),
    startedAt: new Date(data.activeSession.startedAt).toISOString(),
    endedAt: new Date(now).toISOString()
  }

  data.sessions.unshift(completedSession)
  data.activeSession = null

  saveGuestData(data)
  updateGuestProgress(durationSec)

  return completedSession
}

export function clearGuestSession() {
  const data = getGuestData()
  data.activeSession = null
  saveGuestData(data)
}

export function getGuestElapsed(session) {
  if (!session) return 0
  const base = Number(session.accumulatedSec || 0)
  if (session.isPaused) return base
  return base + Math.max(0, Math.round((Date.now() - session.startedAt) / 1000))
}
