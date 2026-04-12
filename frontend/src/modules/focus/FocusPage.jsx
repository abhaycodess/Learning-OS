import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpenText,
  ChevronRight,
  Clock3,
  Flame,
  Flag,
  ListChecks,
  Pause,
  Play,
  Maximize2,
  Minimize2,
  SkipForward,
  Sparkles,
  Target,
} from 'lucide-react'
import Button from '../../components/Button.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { useLearningStore } from '../../hooks/useLearningStore.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { formatClock } from '../../utils/time.js'
import SessionReflectionModal from '../behavior/SessionReflectionModal.jsx'

const UI_SETTINGS_KEY = 'settingsUIByUser'
const LOCAL_SETTINGS_FALLBACK_USER = '__local__'

const QUOTES = [
  'Discipline > Motivation. Always was.',
  'You opened this app. Don\'t waste it.',
  'One session won\'t kill you. Probably.',
  'Focus now, scroll later.',
]

function readFocusSoundPreference(userId) {
  if (typeof window === 'undefined') return false

  try {
    const raw = window.localStorage.getItem(UI_SETTINGS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const storageUserKey = userId || LOCAL_SETTINGS_FALLBACK_USER
    const fallbackValue = parsed?.[LOCAL_SETTINGS_FALLBACK_USER]?.focusSound
    return Boolean(parsed?.[storageUserKey]?.focusSound ?? fallbackValue)
  } catch {
    return false
  }
}

async function playFocusCue(type = 'start') {
  if (typeof window === 'undefined') return

  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  const context = new AudioContextClass()
  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return
    }
  }

  const now = context.currentTime

  const sequence =
    type === 'end'
      ? [
          { freq: 740, duration: 0.11 },
          { freq: 620, duration: 0.14 },
        ]
      : [
          { freq: 580, duration: 0.08 },
          { freq: 720, duration: 0.11 },
        ]

  let cursor = now
  sequence.forEach((tone) => {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(tone.freq, cursor)

    gainNode.gain.setValueAtTime(0.0001, cursor)
    gainNode.gain.exponentialRampToValueAtTime(0.16, cursor + 0.015)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, cursor + tone.duration)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start(cursor)
    oscillator.stop(cursor + tone.duration)

    cursor += tone.duration + 0.02
  })

  const stopAfterMs = Math.round((cursor - now + 0.03) * 1000)
  window.setTimeout(() => {
    context.close().catch(() => {
      // Ignore close errors from interrupted audio contexts.
    })
  }, stopAfterMs)
}

function CircularProgress({ progress = 0, active = false }) {
  const radius = 170
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(progress, 100))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <svg
      viewBox="0 0 400 400"
      className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r={radius} stroke="rgba(16,185,129,0.12)" strokeWidth="12" fill="none" />
      <circle
        cx="200"
        cy="200"
        r={radius}
        stroke={active ? 'rgb(16,185,129)' : 'rgba(16,185,129,0.45)'}
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  )
}

export default function FocusPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const {
    activeTask,
    state,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearActiveSession,
    toggleTask,
    focusSeconds,
    addLap,
    addTask,
    addSubject,
    saveSessionReflection,
  } = useLearningStore()
  const [elapsed, setElapsed] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [isRippling, setIsRippling] = useState(false)
  const [showReflectionModal, setShowReflectionModal] = useState(false)
  const [lastSessionData, setLastSessionData] = useState(null)
  const [sessionMinutesInput, setSessionMinutesInput] = useState('25')
  const [isFullscreenFocus, setIsFullscreenFocus] = useState(false)
  const [focusSoundEnabled, setFocusSoundEnabled] = useState(false)
  const focusRootRef = useRef(null)
  const userId = user?.id || ''

  useEffect(() => {
    setFocusSoundEnabled(readFocusSoundPreference(userId))

    const handleStorage = () => {
      setFocusSoundEnabled(readFocusSoundPreference(userId))
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [userId])

  const pendingTasks = useMemo(
    () => state.tasks.filter((task) => !task.completed),
    [state.tasks],
  )

  const enterFullscreenFocus = async () => {
    if (!focusRootRef.current?.requestFullscreen) return
    try {
      await focusRootRef.current.requestFullscreen()
      setIsFullscreenFocus(true)
    } catch {
      setIsFullscreenFocus(false)
    }
  }

  const exitFullscreenFocus = async () => {
    if (!document.fullscreenElement) {
      setIsFullscreenFocus(false)
      return
    }
    try {
      await document.exitFullscreen()
    } finally {
      setIsFullscreenFocus(false)
    }
  }
  const [selectedTaskId, setSelectedTaskId] = useState('')

  function getSessionElapsed(session) {
    if (!session) return 0
    const base = Number(session.accumulatedSec || 0)
    if (session.isPaused) return base
    return base + Math.max(0, Math.round((Date.now() - session.startedAt) / 1000))
  }

  useEffect(() => {
    if (!state.activeSession) {
      setElapsed(0)
      return undefined
    }

    setElapsed(getSessionElapsed(state.activeSession))

    if (state.activeSession.isPaused) {
      return undefined
    }

    const handle = setInterval(() => {
      setElapsed(getSessionElapsed(state.activeSession))
    }, 1000)

    return () => clearInterval(handle)
  }, [state.activeSession])

  useEffect(() => {
    const handle = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, 4500)

    return () => clearInterval(handle)
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreenFocus(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (state.activeSession?.taskId) {
      setSelectedTaskId(state.activeSession.taskId)
      return
    }

    if (selectedTaskId && pendingTasks.some((task) => task.id === selectedTaskId)) {
      return
    }

    setSelectedTaskId(pendingTasks[0]?.id || '')
  }, [state.activeSession, selectedTaskId, pendingTasks])

  const currentTask =
    activeTask || pendingTasks.find((task) => task.id === selectedTaskId) || pendingTasks[0] || null

  const plannedMinutes = useMemo(() => {
    const parsed = Number(sessionMinutesInput)
    if (!Number.isFinite(parsed)) return 25
    return Math.min(180, Math.max(5, Math.round(parsed)))
  }, [sessionMinutesInput])

  useEffect(() => {
    const routeTaskId = location.state?.selectedTaskId
    if (!routeTaskId) return

    const taskExists = pendingTasks.some((task) => task.id === routeTaskId)
    if (!taskExists) return

    setSelectedTaskId(routeTaskId)

    if (state.activeSession) {
      clearActiveSession()
    }

    if (sessionMinutesInput !== '25') {
      setSessionMinutesInput('25')
    }

    navigate('/focus', { replace: true })
  }, [
    location.state,
    navigate,
    pendingTasks,
    stopSession,
    clearActiveSession,
    state.activeSession,
    sessionMinutesInput,
  ])

  const targetDurationSec = state.activeSession?.plannedDurationSec || plannedMinutes * 60
  const remainingSec = Math.max(0, targetDurationSec - elapsed)

  const completionPercent = Math.min(100, Math.round((elapsed / Math.max(1, targetDurationSec)) * 100))
  const subjectName = state.subjects.find((subject) => subject.id === currentTask?.subjectId)?.name || 'Study'
  const laps = state.activeSession?.laps || []

  const leftPanelProgress = {
    subject: currentTask ? 100 : 0,
    setup: currentTask ? (state.activeSession ? 100 : 70) : 0,
    execution: state.activeSession ? (state.activeSession.isPaused ? 65 : 40) : 0,
  }

  function triggerTimerRipple() {
    setIsRippling(false)
    requestAnimationFrame(() => {
      setIsRippling(true)
    })

    window.setTimeout(() => {
      setIsRippling(false)
    }, 650)
  }

  async function startQuickFocus() {
    const quickTaskId = crypto.randomUUID()
    let firstSubjectId = state.subjects[0]?.id || ''

    if (!firstSubjectId) {
      firstSubjectId = crypto.randomUUID()
      await addSubject({
        id: firstSubjectId,
        name: 'General Focus',
        topics: [
          {
            id: crypto.randomUUID(),
            name: 'Quick Sprints',
            subtopics: ['25-minute blocks', 'Consistency streak'],
          },
        ],
      })
    }

    await addTask({
      id: quickTaskId,
      title: `Quick Focus Sprint (${plannedMinutes} min)`,
      subjectId: firstSubjectId,
      type: 'Study',
      dueDate: new Date().toISOString(),
    })

    setSelectedTaskId(quickTaskId)
    startSession(quickTaskId, { source: 'quick-focus', plannedDurationSec: plannedMinutes * 60 })

    if (focusSoundEnabled) {
      playFocusCue('start')
    }
  }

  async function toggleFocus() {
    if (!currentTask) {
      await startQuickFocus()
      return
    }

    if (state.activeSession) {
      if (state.activeSession.isPaused) {
        resumeSession()
      } else {
        pauseSession()
      }
      return
    }

    startSession(currentTask.id, { source: 'manual', plannedDurationSec: plannedMinutes * 60 })

    if (focusSoundEnabled) {
      playFocusCue('start')
    }
  }

  async function handleEndBlock() {
    if (!currentTask) return

    if (state.activeSession) {
      // Store session data for reflection
      setLastSessionData({
        taskId: currentTask.id,
        taskTitle: currentTask.title,
        subjectName: subjectName,
        sessionDuration: elapsed,
        focusBreakdown: laps,
      })
      // Show reflection modal instead of immediately stopping
      setShowReflectionModal(true)
    }
  }

  async function handleReflectionSubmit(reflectionData) {
    const sessionReflection = {
      ...lastSessionData,
      ...reflectionData,
      completedAt: new Date().toISOString(),
    }
    
    // Store in sessionStorage for analytics page to access
    const reflections = JSON.parse(sessionStorage.getItem('sessionReflections') || '[]')
    reflections.push(sessionReflection)
    sessionStorage.setItem('sessionReflections', JSON.stringify(reflections))

    setShowReflectionModal(false)

    // End session first to obtain persisted session id.
    let endedSessionId = null
    if (state.activeSession) {
      endedSessionId = await stopSession()
    }

    // Persist reflection to backend when possible.
    if (endedSessionId) {
      const savedSession = await saveSessionReflection(endedSessionId, reflectionData)

      if (savedSession?.summary) {
        const reflections = JSON.parse(sessionStorage.getItem('sessionReflections') || '[]')
        if (reflections.length > 0) {
          reflections[reflections.length - 1] = {
            ...reflections[reflections.length - 1],
            summary: savedSession.summary,
          }
          sessionStorage.setItem('sessionReflections', JSON.stringify(reflections))
        }
      }
    }

    if (focusSoundEnabled) {
      playFocusCue('end')
    }

    if (!currentTask.completed) {
      await toggleTask(currentTask.id)
    }
  }

  function handleAddLap() {
    if (!state.activeSession || state.activeSession.isPaused) return
    addLap()
  }

  if (!currentTask && !state.activeSession) {
    return (
      <div className="focus-page-full-bleed relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(107,90,230,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(31,143,89,0.1),transparent_24%),linear-gradient(180deg,#f7f8fc_0%,#eef2f8_100%)] px-4 py-4 md:px-6 md:py-6">
        <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(17,22,29,0.05)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-32px)] max-w-4xl items-center justify-center">
          <EmptyState
            icon={Target}
            title="No task selected"
            description="Go to Tasks and pick one. The focus engine is ready when you are."
            ctaLabel="Go to Tasks and pick one"
            onCta={() => navigate('/tasks', { state: { fromFocus: true } })}
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={focusRootRef} className="focus-page-full-bleed relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(107,90,230,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(31,143,89,0.1),transparent_24%),linear-gradient(180deg,#f7f8fc_0%,#eef2f8_100%)] px-4 py-4 md:px-6 md:py-6">
      <div className="absolute left-[-90px] top-[-60px] h-72 w-72 rounded-full bg-[#6b5ae6]/12 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-70px] h-80 w-80 rounded-full bg-success/10 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(17,22,29,0.05)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative z-10 flex min-h-[calc(100vh-32px)] w-full flex-col md:px-2">
        {isFullscreenFocus && (
          <section className="relative flex min-h-[calc(100vh-32px)] flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={exitFullscreenFocus}
              className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/85 px-4 py-2 text-sm font-semibold text-neutral-600"
            >
              <Minimize2 size={16} />
              Exit Fullscreen
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Focus Mode</p>
            <h1 className="mx-auto mt-3 max-w-3xl text-3xl text-neutral-900 md:text-5xl">
              {currentTask ? currentTask.title : 'No task selected'}
            </h1>
            <p className="mt-4 text-[5rem] leading-none text-[#6b5ae6] md:text-[8rem]">{formatClock(elapsed)}</p>
            <p className="mt-3 text-lg text-neutral-500">Remaining {formatClock(remainingSec)}</p>
            <p className="mx-auto mt-8 max-w-2xl text-xl text-neutral-700 md:text-2xl">{QUOTES[quoteIndex]}</p>
          </section>
        )}

        {!isFullscreenFocus && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/70 pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            title="Go back"
            className="hover-lift inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 text-sm text-neutral-600 shadow-sm">
            <Clock3 size={16} className="text-[#6b5ae6]" />
            Focus Session
          </div>

          <div
            role="status"
            aria-label="7 day streak"
            title="7 day streak"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm"
          >
            <Flame size={16} className="text-[#e57c1f]" />
          </div>
        </header>
        )}

        {!isFullscreenFocus && (
        <div className="mt-5 grid flex-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
          <aside className="surface-soft flex flex-col justify-between p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                <Target size={13} />
                Current Task
              </p>
              <h2 className="mt-2 text-2xl text-neutral-900">
                {currentTask ? currentTask.title : 'Start before you\'re ready.'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {currentTask
                  ? 'Stay on one objective, keep distractions out, and use this session to build momentum.'
                  : 'No plan? Good. Pick one task and begin anyway.'}
              </p>

              {!currentTask && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/tasks" state={{ fromFocus: true }}>
                    <Button className="px-4 py-2.5 text-sm">
                      <span className="inline-flex items-center gap-2">
                        + Select Task
                      </span>
                    </Button>
                  </Link>
                  <Button variant="ghost" className="px-4 py-2.5 text-sm" onClick={startQuickFocus}>
                    Start Quick Focus ({plannedMinutes} min)
                  </Button>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div className="rounded-[20px] bg-white p-3 shadow-sm">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    <BookOpenText size={12} />
                    Subject
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {subjectName}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-neutral-200">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${leftPanelProgress.subject}%` }} />
                  </div>
                </div>
                <div className="rounded-[20px] bg-white p-3 shadow-sm">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    <ListChecks size={12} />
                    Session Type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">{currentTask?.type || 'Focus'}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-neutral-200">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${leftPanelProgress.setup}%` }} />
                  </div>
                </div>
                <div className="rounded-[20px] bg-white p-3 shadow-sm">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    <Sparkles size={12} />
                    State
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {state.activeSession ? (state.activeSession.isPaused ? 'Paused' : 'Running') : 'Ready to begin'}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-neutral-200">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${leftPanelProgress.execution}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-[linear-gradient(135deg,#efeaff,#f6f3ff)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b5ae6]">
                Session Goal
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                Complete one meaningful study block without switching tasks.
              </p>
            </div>
          </aside>

          <section className="surface-soft relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden p-5 text-center">
            <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_50%_20%,rgba(107,90,230,0.08),transparent_24%),radial-gradient(circle_at_80%_70%,rgba(31,143,89,0.06),transparent_18%)]" />
            <div className="relative z-10 w-full max-w-3xl">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    state.activeSession ? (state.activeSession.isPaused ? 'bg-amber-500' : 'bg-success') : 'bg-[#6b5ae6]'
                  }`}
                />
                {state.activeSession
                  ? state.activeSession.isPaused
                    ? 'Session paused'
                    : 'Session running'
                  : 'Session idle'}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Your focus begins here
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl text-neutral-900 md:text-6xl">
                {currentTask ? currentTask.title : 'Start before you\'re ready.'}
              </h1>

              <div className="mx-auto mt-6 flex max-w-[760px] items-center justify-center gap-3">
                <span className="rounded-full border border-neutral-200 bg-white/85 px-4 py-2 text-sm text-neutral-600 shadow-sm">
                  Deep work block
                </span>
                <span className="rounded-full border border-neutral-200 bg-white/85 px-4 py-2 text-sm text-neutral-600 shadow-sm">
                  No notifications
                </span>
                <span className="rounded-full border border-neutral-200 bg-white/85 px-4 py-2 text-sm text-neutral-600 shadow-sm">
                  {currentTask?.type || 'Focus'}
                </span>
                <label className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm text-neutral-600 shadow-sm">
                  <span className="text-neutral-500">Duration</span>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={sessionMinutesInput}
                    onChange={(event) => setSessionMinutesInput(event.target.value)}
                    disabled={Boolean(state.activeSession)}
                    className="w-14 rounded-md border border-neutral-200 bg-white px-2 py-1 text-center text-neutral-800 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <span className="text-neutral-500">min</span>
                </label>
              </div>

              <button
                type="button"
                onClick={triggerTimerRipple}
                className={`timer relative mx-auto mt-8 flex h-[350px] w-[350px] items-center justify-center rounded-full border border-white/70 bg-white/50 shadow-[0_24px_80px_rgba(17,22,29,0.12)] md:h-[410px] md:w-[410px] ${state.activeSession ? '' : 'animate-breathe'}`}
              >
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_60%)]" />
                <CircularProgress progress={completionPercent} active={state.activeSession} />
                {isRippling && <span className="pointer-events-none absolute inset-10 rounded-full border border-primary/40 animate-timer-ripple" />}
                <div className="absolute inset-6 rounded-full border border-primary/10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),rgba(255,255,255,0.9)_60%)]" />
                <div className="absolute inset-10 rounded-full border border-neutral-200/80" />
                <div className="relative z-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    Timer
                  </p>
                  <p className="mt-2 text-[4.5rem] leading-none text-primary md:text-[5.5rem]">
                    {formatClock(elapsed)}
                  </p>
                  <p className="mt-3 text-sm text-neutral-500">
                    Remaining: {formatClock(remainingSec)}
                  </p>
                </div>
              </button>

              <p className="mx-auto mt-5 max-w-xl text-sm font-medium text-neutral-700">
                {QUOTES[quoteIndex]}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button className="min-w-[220px] px-6 py-3.5 text-base shadow-[0_16px_36px_rgba(99,82,200,0.35)]" onClick={toggleFocus}>
                  <span className="inline-flex items-center gap-2">
                    {state.activeSession && !state.activeSession.isPaused ? <Pause size={16} /> : <Play size={16} />}
                    {state.activeSession
                      ? state.activeSession.isPaused
                        ? 'Resume Session'
                        : 'Pause Session'
                      : 'Start Session'}
                  </span>
                </Button>
                <Link to="/tasks" state={{ fromFocus: true }}>
                  <Button variant="ghost" className="px-5 py-3 text-base">
                    <span className="inline-flex items-center gap-2">
                      Switch Task
                      <ChevronRight size={16} />
                    </span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleAddLap}
                  disabled={!state.activeSession || state.activeSession.isPaused}
                  className="px-5 py-3 text-base"
                >
                  <span className="inline-flex items-center gap-2">
                    <Flag size={16} />
                    Lap
                  </span>
                </Button>
                <Button variant="ghost" onClick={enterFullscreenFocus} className="px-5 py-3 text-base">
                  <span className="inline-flex items-center gap-2">
                    <Maximize2 size={16} />
                    Fullscreen
                  </span>
                </Button>
                <button
                  type="button"
                  onClick={handleEndBlock}
                  disabled={!currentTask}
                  className="inline-flex items-center gap-2 px-2 py-2 text-sm font-semibold text-neutral-500 transition hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SkipForward size={16} />
                  End Block
                </button>
              </div>
            </div>
          </section>

          <aside className="surface-soft flex flex-col gap-4 p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Session Stats
              </p>
              <div className="mt-3 space-y-3">
                <div className="rounded-[20px] bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Elapsed
                  </p>
                  <p className="mt-1 text-2xl text-neutral-900">{formatClock(elapsed)}</p>
                </div>
                <div className="rounded-[20px] bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Focus Today
                  </p>
                  <p className="mt-1 text-2xl text-neutral-900">{formatClock(focusSeconds)}</p>
                </div>
                <div className="rounded-[20px] bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Completed
                  </p>
                  <p className="mt-1 text-2xl text-neutral-900">
                    {state.tasks.filter((task) => task.completed).length}
                  </p>
                </div>
                <div className="rounded-[20px] bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Sessions Logged
                  </p>
                  <p className="mt-1 text-2xl text-neutral-900">{state.sessions.length}</p>
                </div>
                <div className="rounded-[20px] bg-white p-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Laps
                  </p>
                  {laps.length === 0 ? (
                    <p className="mt-1 text-sm text-neutral-500">No laps yet. Hit Lap during a running session.</p>
                  ) : (
                    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
                      {laps.slice().reverse().map((lap) => (
                        <li key={lap.lapIndex} className="flex items-center justify-between rounded-lg border border-neutral-200 px-2 py-1.5 text-xs">
                          <span className="font-semibold text-neutral-700">Lap {lap.lapIndex}</span>
                          <span className="text-neutral-600">{formatClock(lap.deltaSec)}</span>
                          <span className="text-neutral-500">@ {formatClock(lap.lapSec)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-neutral-500">Your future stats will live here.</p>
              </div>
            </div>

            <div className="rounded-[24px] border-2 border-dashed border-[#6b5ae6]/35 bg-[linear-gradient(135deg,#6b5ae6,#8a72f2)] p-4 text-white shadow-[0_20px_50px_rgba(107,90,230,0.22)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                Task Queue
              </p>
              <p className="mt-2 text-sm leading-6 text-white/90">
                Choose one pending task and run a distraction-free block.
              </p>
              <div className="mt-3 space-y-2">
                {pendingTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/40 bg-white/10 p-3">
                    <p className="text-sm text-white/85">No pending tasks left. Great work.</p>
                    <Link to="/tasks" state={{ fromFocus: true }} className="mt-2 inline-block">
                      <Button variant="ghost" className="border border-white/40 bg-white/10 text-white hover:bg-white/20">
                        Add Task
                      </Button>
                    </Link>
                  </div>
                )}
                {pendingTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    disabled={!!state.activeSession}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedTaskId === task.id
                        ? 'bg-white text-[#4e3ec1]'
                        : 'bg-white/15 text-white hover:bg-white/25'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
        )}
      </div>

      {/* Reflection Modal */}
      {showReflectionModal && (
        <SessionReflectionModal
          isOpen={showReflectionModal}
          session={lastSessionData}
          onSubmit={handleReflectionSubmit}
          onDismiss={() => setShowReflectionModal(false)}
        />
      )}
    </div>
  )
}
