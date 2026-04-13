import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { learningService } from '../services/learningService.js'
import { behaviorService } from '../services/behaviorService.js'
import { useAuth } from './useAuth.jsx'

const LearningContext = createContext(null)

const emptyLearningData = {
  tasks: [],
  subjects: [],
  sessions: [],
}

const initialState = {
  ...emptyLearningData,
  activeSession: null,
  bootstrapped: false,
  behavior: {
    status: 'not-started', // 'not-started' | 'in-progress' | 'completed'
    targetMinutes: 60,
    actualMinutes: 0,
    missedYesterday: false,
    graceDayUsedYesterday: false,
    graceDayAvailable: true,
    streakCount: 0,
    loaded: false,
  },
}

function normalizeSubtopics(subtopics = []) {
  if (!Array.isArray(subtopics)) return []

  return subtopics
    .map((entry) => {
      if (typeof entry === 'string') {
        const trimmed = entry.trim()
        if (!trimmed) return null
        return {
          id: `legacy-${trimmed.toLowerCase().replace(/\s+/g, '-')}`,
          name: trimmed,
          notes: '',
        }
      }

      if (!entry || typeof entry !== 'object') return null
      const name = String(entry.name || '').trim()
      if (!name) return null

      return {
        id: String(entry.id || crypto.randomUUID()),
        name,
        notes: typeof entry.notes === 'string' ? entry.notes : '',
      }
    })
    .filter(Boolean)
}

function normalizeTopics(topics = []) {
  if (!Array.isArray(topics)) return []

  return topics
    .map((topic) => {
      if (!topic || typeof topic !== 'object') return null
      const name = String(topic.name || '').trim()
      if (!name) return null

      return {
        ...topic,
        id: String(topic.id || crypto.randomUUID()),
        name,
        subtopics: normalizeSubtopics(topic.subtopics || []),
      }
    })
    .filter(Boolean)
}

function normalizeSubject(subject = {}) {
  return {
    ...subject,
    id: String(subject.id || crypto.randomUUID()),
    name: String(subject.name || '').trim(),
    emoji: typeof subject.emoji === 'string' && subject.emoji.trim() ? subject.emoji : '📘',
    coverImage: typeof subject.coverImage === 'string' ? subject.coverImage : '',
    topics: normalizeTopics(subject.topics || []),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'snapshotLoaded':
      return {
        ...state,
        ...action.payload,
        bootstrapped: true,
      }
    case 'addTask':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
      }
    case 'toggleTask':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload ? { ...task, completed: !task.completed } : task,
        ),
      }
    case 'removeTask':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }
    case 'startSession':
      {
        const nextSession =
          typeof action.payload === 'string'
            ? {
                taskId: action.payload,
                startedAt: Date.now(),
                source: 'manual',
                plannedDurationSec: 25 * 60,
              }
            : {
                taskId: action.payload.taskId,
                startedAt: action.payload.startedAt || Date.now(),
                source: action.payload.source || 'manual',
                plannedDurationSec: action.payload.plannedDurationSec || 25 * 60,
                isPaused: false,
                accumulatedSec: 0,
                laps: [],
              }

        const normalized = {
          ...nextSession,
          isPaused: Boolean(nextSession.isPaused),
          accumulatedSec: Number(nextSession.accumulatedSec || 0),
          laps: Array.isArray(nextSession.laps) ? nextSession.laps : [],
        }

      return {
        ...state,
        activeSession: normalized,
      }
      }
    case 'pauseSession':
      {
        if (!state.activeSession || state.activeSession.isPaused) return state

        const increment = Math.max(0, Math.round((Date.now() - state.activeSession.startedAt) / 1000))

        return {
          ...state,
          activeSession: {
            ...state.activeSession,
            isPaused: true,
            pausedAt: Date.now(),
            accumulatedSec: (state.activeSession.accumulatedSec || 0) + increment,
          },
        }
      }
    case 'resumeSession':
      {
        if (!state.activeSession || !state.activeSession.isPaused) return state

        return {
          ...state,
          activeSession: {
            ...state.activeSession,
            isPaused: false,
            pausedAt: null,
            startedAt: Date.now(),
          },
        }
      }
    case 'addLap':
      {
        if (!state.activeSession || state.activeSession.isPaused) return state

        const elapsedSec =
          (state.activeSession.accumulatedSec || 0) +
          Math.max(0, Math.round((Date.now() - state.activeSession.startedAt) / 1000))

        const previousLap = state.activeSession.laps?.[state.activeSession.laps.length - 1]
        const previousLapSec = previousLap?.lapSec || 0
        const lapIndex = (state.activeSession.laps?.length || 0) + 1

        const lap = {
          lapIndex,
          lapSec: elapsedSec,
          deltaSec: elapsedSec - previousLapSec,
          recordedAt: new Date().toISOString(),
        }

        return {
          ...state,
          activeSession: {
            ...state.activeSession,
            laps: [...(state.activeSession.laps || []), lap],
          },
        }
      }
    case 'stopSession':
      return {
        ...state,
        activeSession: null,
        sessions: [action.payload, ...state.sessions],
      }
    case 'clearActiveSession':
      return {
        ...state,
        activeSession: null,
      }
    case 'saveSessionReflection':
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.payload.sessionId
            ? {
                ...session,
                reflection: action.payload.reflection,
                ...(action.payload.summary ? { summary: action.payload.summary } : {}),
              }
            : session,
        ),
      }
    case 'addSubject':
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      }
    case 'addSubjects':
      return {
        ...state,
        subjects: [...state.subjects, ...action.payload],
      }
    case 'updateSubject':
      return {
        ...state,
        subjects: state.subjects.map((subject) =>
          subject.id === action.payload.id
            ? {
                ...subject,
                ...action.payload,
              }
            : subject,
        ),
      }
    case 'removeSubject':
      return {
        ...state,
        subjects: state.subjects.filter((subject) => subject.id !== action.payload),
        tasks: state.tasks.filter((task) => task.subjectId !== action.payload),
      }
    case 'restoreSubjectWithTasks':
      return {
        ...state,
        subjects: [...state.subjects, action.payload.subject],
        tasks: [...state.tasks, ...action.payload.tasks],
      }
    case 'behaviorDataLoaded':
      return {
        ...state,
        behavior: {
          ...state.behavior,
          ...action.payload,
          loaded: true,
        },
      }
    case 'updateBehaviorStatus':
      return {
        ...state,
        behavior: {
          ...state.behavior,
          ...action.payload,
        },
      }
    default:
      return state
  }
}

function toSnapshotPayload(payload) {
  return {
    tasks: payload.tasks || emptyLearningData.tasks,
    subjects: Array.isArray(payload.subjects)
      ? payload.subjects.map((subject) => normalizeSubject(subject)).filter((subject) => subject.name)
      : emptyLearningData.subjects,
    sessions: payload.sessions || [],
  }
}

export function LearningProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  // The store hydrates from API first and transparently falls back to local seed data.
  useEffect(() => {
    let cancelled = false

    async function loadSnapshot() {
      try {
        const payload = await learningService.getSnapshot()
        if (!cancelled) {
          dispatch({ type: 'snapshotLoaded', payload: toSnapshotPayload(payload) })
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: 'snapshotLoaded', payload: emptyLearningData })
        }
      }

      // Load behavior data
      try {
        const behaviorData = await behaviorService.getTodayStatus()
        if (!cancelled) {
          dispatch({
            type: 'behaviorDataLoaded',
            payload: {
              status: behaviorData.status,
              targetMinutes: behaviorData.targetMinutes,
              actualMinutes: behaviorData.dailyLog?.actualMinutes || 0,
              missedYesterday: behaviorData.missedYesterday,
              graceDayUsedYesterday: behaviorData.graceDayUsedYesterday,
              graceDayAvailable: behaviorData.graceDayAvailable,
              streakCount: behaviorData.behavior?.streakCount || 0,
            },
          })
        }
      } catch {
        if (!cancelled) {
          dispatch({
            type: 'behaviorDataLoaded',
            payload: {
              status: 'not-started',
              targetMinutes: 60,
              actualMinutes: 0,
              missedYesterday: false,
              graceDayUsedYesterday: false,
              graceDayAvailable: true,
              streakCount: 0,
              loaded: true,
            },
          })
        }
      }
    }

    if (isAuthenticated) {
      loadSnapshot()
    } else {
      // If not authenticated, initialize with empty data without API call
      dispatch({ type: 'snapshotLoaded', payload: emptyLearningData })
    }

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const api = useMemo(
    () => ({
      addTask: async (task) => {
        const payload = {
          ...task,
          id: task.id || crypto.randomUUID(),
          completed: false,
        }
        dispatch({ type: 'addTask', payload })

        try {
          await learningService.createTask(payload)
        } catch {
          // Keep optimistic state even if API is unavailable.
        }
      },
      addSubject: async (subject) => {
        const payload = normalizeSubject(subject)

        dispatch({ type: 'addSubject', payload })

        try {
          await learningService.createSubject(payload)
        } catch {
          // Keep optimistic state even if API is unavailable.
        }
      },
      addSubjects: async (subjects) => {
        if (!Array.isArray(subjects) || subjects.length === 0) return

        const payload = subjects
          .map((subject) => normalizeSubject(subject))
          .filter((subject) => subject.name)

        dispatch({ type: 'addSubjects', payload })

        await Promise.allSettled(payload.map((subject) => learningService.createSubject(subject)))
      },
      updateSubject: async (subjectId, updates) => {
        const existingSubject = state.subjects.find((entry) => entry.id === subjectId)
        if (!existingSubject) return

        const payload = normalizeSubject({ ...existingSubject, ...updates })

        dispatch({ type: 'updateSubject', payload })

        try {
          await learningService.updateSubject(subjectId, {
            ...updates,
            ...(updates.topics !== undefined ? { topics: normalizeTopics(updates.topics) } : {}),
          })
        } catch (updateError) {
          dispatch({ type: 'updateSubject', payload: existingSubject })
          throw updateError
        }
      },
      deleteSubject: async (subjectId) => {
        const existingSubject = state.subjects.find((entry) => entry.id === subjectId)
        if (!existingSubject) return

        const existingTasks = state.tasks.filter((entry) => entry.subjectId === subjectId)

        dispatch({ type: 'removeSubject', payload: subjectId })

        try {
          await learningService.deleteSubject(subjectId)
        } catch (deleteError) {
          dispatch({
            type: 'restoreSubjectWithTasks',
            payload: {
              subject: existingSubject,
              tasks: existingTasks,
            },
          })
          throw deleteError
        }
      },
      toggleTask: async (taskId) => {
        dispatch({ type: 'toggleTask', payload: taskId })

        const task = state.tasks.find((entry) => entry.id === taskId)
        if (!task) return

        try {
          await learningService.updateTask(taskId, { completed: !task.completed })
        } catch {
          // No-op for now. A retry queue can be plugged in later.
        }
      },
      deleteTask: async (taskId) => {
        const existingTask = state.tasks.find((entry) => entry.id === taskId)
        if (!existingTask) return

        dispatch({ type: 'removeTask', payload: taskId })

        try {
          await learningService.deleteTask(taskId)
        } catch (deleteError) {
          dispatch({ type: 'addTask', payload: existingTask })
          throw deleteError
        }
      },
      startSession: (taskId, meta = {}) => {
        dispatch({
          type: 'startSession',
          payload: {
            taskId,
            startedAt: Date.now(),
            source: meta.source || 'manual',
            plannedDurationSec: meta.plannedDurationSec || 25 * 60,
            isPaused: false,
            accumulatedSec: 0,
          },
        })
      },
      pauseSession: () => {
        dispatch({ type: 'pauseSession' })
      },
      resumeSession: () => {
        dispatch({ type: 'resumeSession' })
      },
      addLap: () => {
        dispatch({ type: 'addLap' })
      },
      stopSession: async () => {
        if (!state.activeSession) return

        const now = Date.now()
        const runningSec = state.activeSession.isPaused
          ? 0
          : Math.max(0, Math.round((now - state.activeSession.startedAt) / 1000))
        const durationSec = (state.activeSession.accumulatedSec || 0) + runningSec
        const task = state.tasks.find((entry) => entry.id === state.activeSession.taskId)
        const subject = state.subjects.find((entry) => entry.id === task?.subjectId)
        const payload = {
          id: crypto.randomUUID(),
          taskId: state.activeSession.taskId,
          subjectId: task?.subjectId,
          taskTitle: task?.title || 'Unknown task',
          taskType: task?.type || 'Study',
          taskCompleted: Boolean(task?.completed),
          subjectName: subject?.name || 'General',
          source: state.activeSession.source || 'manual',
          plannedDurationSec: state.activeSession.plannedDurationSec || 25 * 60,
          lapCount: state.activeSession.laps?.length || 0,
          laps: state.activeSession.laps || [],
          durationSec,
          dateKey: new Date().toISOString().slice(0, 10),
          startedAt: new Date(state.activeSession.startedAt).toISOString(),
          endedAt: new Date(now).toISOString(),
        }

        dispatch({ type: 'stopSession', payload })

        try {
          const created = await learningService.createSession(payload)
          return created?.id || payload.id
        } catch {
          // Keep local session logs for uninterrupted focus tracking.
          return payload.id
        }
      },
      clearActiveSession: () => {
        dispatch({ type: 'clearActiveSession' })
      },
      saveSessionReflection: async (sessionId, reflection) => {
        try {
          const response = await learningService.updateSessionReflection(sessionId, reflection)

          dispatch({
            type: 'saveSessionReflection',
            payload: {
              sessionId,
              reflection,
              summary: response?.summary || '',
            },
          })

          return response
        } catch {
          dispatch({
            type: 'saveSessionReflection',
            payload: {
              sessionId,
              reflection,
            },
          })

          // Keep local reflection data if API is unavailable.
          return null
        }
      },
      setDailyContract: async (dailyTargetMinutes) => {
        try {
          await behaviorService.setDailyContract(dailyTargetMinutes)
          dispatch({
            type: 'updateBehaviorStatus',
            payload: {
              targetMinutes: dailyTargetMinutes,
            },
          })
        } catch {
          // Keep local state if API is unavailable.
        }
      },
      refreshBehaviorStatus: async () => {
        try {
          const behaviorData = await behaviorService.getTodayStatus()
          dispatch({
            type: 'behaviorDataLoaded',
            payload: {
              status: behaviorData.status,
              targetMinutes: behaviorData.targetMinutes,
              actualMinutes: behaviorData.dailyLog?.actualMinutes || 0,
              missedYesterday: behaviorData.missedYesterday,
              streakCount: behaviorData.behavior?.streakCount || 0,
            },
          })
        } catch {
          // Keep local state if API is unavailable.
        }
      },
    }),
    [state.activeSession, state.subjects, state.tasks],
  )

  const selectors = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const todaysTasks = state.tasks.filter((task) =>
      task.dueDate?.slice(0, 10) === todayKey,
    )

    return {
      todaysTasks,
      completedToday: todaysTasks.filter((task) => task.completed).length,
      focusSeconds:
        state.sessions
          .filter((session) => session.dateKey === todayKey)
          .reduce((sum, session) => sum + session.durationSec, 0) +
        (state.activeSession
          ? (state.activeSession.accumulatedSec || 0) +
            (state.activeSession.isPaused
              ? 0
              : Math.max(0, Math.round((Date.now() - state.activeSession.startedAt) / 1000)))
          : 0),
      activeTask: state.tasks.find((task) => task.id === state.activeSession?.taskId) || null,
    }
  }, [state])

  const value = useMemo(
    () => ({
      state,
      behavior: state.behavior,
      ...api,
      ...selectors,
    }),
    [state, api, selectors],
  )

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}

export function useLearningStore() {
  const context = useContext(LearningContext)

  if (!context) {
    throw new Error('useLearningStore must be used inside LearningProvider')
  }

  return context
}
