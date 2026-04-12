import { useEffect, useMemo, useState } from 'react'
import { Clock3, Flame, Sparkles, TrendingUp } from 'lucide-react'
import { useLearningStore } from '../hooks/useLearningStore.jsx'
import { generateStudyReminder } from '../modules/ai/service.js'
import nexisAvatar from '../assets/nexis-avatar.svg'

const WEEK_TARGET_MINUTES = 600

function formatDateLabel(value) {
  return value.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatClockLabel(value) {
  return value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function resolveGreeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const WeeklyStats = () => {
  const { state } = useLearningStore()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const todayKey = useMemo(() => now.toISOString().slice(0, 10), [now])

  const activeSessionLiveSeconds = useMemo(() => {
    if (!state.activeSession) return 0
    if (state.activeSession.isPaused) return state.activeSession.accumulatedSec || 0

    return (
      (state.activeSession.accumulatedSec || 0) +
      Math.max(0, Math.round((now.getTime() - state.activeSession.startedAt) / 1000))
    )
  }, [now, state.activeSession])

  const weeklyData = useMemo(() => {
    const dates = []
    const monday = new Date(now)
    const dayIndex = (now.getDay() + 6) % 7
    monday.setDate(now.getDate() - dayIndex)
    monday.setHours(0, 0, 0, 0)

    for (let offset = 0; offset < 7; offset += 1) {
      const entryDate = new Date(monday)
      entryDate.setDate(monday.getDate() + offset)

      dates.push({
        key: entryDate.toISOString().slice(0, 10),
        day: entryDate.toLocaleDateString([], { weekday: 'short' }).slice(0, 1),
        minutes: 0,
      })
    }

    const minutesByDate = new Map(dates.map((entry) => [entry.key, 0]))

    state.sessions.forEach((session) => {
      const key = session.dateKey
      if (!minutesByDate.has(key)) return

      const nextMinutes = (minutesByDate.get(key) || 0) + Math.round((session.durationSec || 0) / 60)
      minutesByDate.set(key, nextMinutes)
    })

    if (state.activeSession && minutesByDate.has(todayKey)) {
      const runningMinutes = Math.round(activeSessionLiveSeconds / 60)
      minutesByDate.set(todayKey, (minutesByDate.get(todayKey) || 0) + runningMinutes)
    }

    return dates.map((entry) => ({
      ...entry,
      minutes: minutesByDate.get(entry.key) || 0,
    }))
  }, [activeSessionLiveSeconds, now, state.activeSession, state.sessions, todayKey])

  const weeklyMinutes = weeklyData.reduce((sum, item) => sum + item.minutes, 0)
  const maxMinutes = Math.max(30, ...weeklyData.map((item) => item.minutes))
  const completionPercent = Math.min(100, Math.round((weeklyMinutes / WEEK_TARGET_MINUTES) * 100))
  const remainingMinutes = Math.max(0, WEEK_TARGET_MINUTES - weeklyMinutes)
  const greeting = resolveGreeting(now.getHours())
  const chartHeight = 52

  return (
    <div className="animate-fade-up stat-card-premium rounded-2xl border border-stone-200 p-5 bg-[linear-gradient(135deg,#ffffff_0%,#f6f7ff_42%,#f3f9ff_100%)]">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#5f6eea]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5560c8]">
        <TrendingUp size={12} />
        Live Weekly Momentum
      </div>
      <h3 className="font-heading text-lg font-medium text-stone-900">{greeting}</h3>
      <p className="mb-3 text-xs text-stone-500">{formatDateLabel(now)} • {formatClockLabel(now)}</p>

      {/* Circular progress ring */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            style={{ stroke: 'var(--line)' }}
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            style={{ stroke: 'var(--brand)' }}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(completionPercent / 100) * 314} 314`}
            strokeLinecap="round"
            className="progress-ring transition-all duration-700"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <p className="font-heading text-xl font-medium text-stone-900">{completionPercent}%</p>
          <p className="text-xs text-stone-500">of weekly goal</p>
        </div>
      </div>

      <div className="mb-3 rounded-xl border border-stone-200 bg-white/70 px-3 py-2 text-center">
        <p className="text-sm font-semibold text-stone-800">{weeklyMinutes} / {WEEK_TARGET_MINUTES} min</p>
        <p className="text-xs text-stone-500">
          {remainingMinutes > 0 ? `${remainingMinutes} min remaining this week` : 'Weekly target achieved'}
        </p>
      </div>

      {weeklyMinutes === 0 ? (
        <p className="mb-3 text-center text-xs font-medium text-stone-500">
          Start one focus session to activate your live weekly progress.
        </p>
      ) : null}

      {/* Mini bar chart */}
      <div className="flex items-end justify-between gap-2" style={{ minHeight: `${chartHeight + 20}px` }}>
        {weeklyData.map((data, i) => (
          <div key={data.key} className="flex flex-col items-center gap-2">
            <div
              className="w-6 rounded-t-md bg-gradient-to-t from-primary to-primary-light transition-all duration-500 hover:scale-y-105"
              style={{
                height: `${Math.max(3, Math.round((data.minutes / maxMinutes) * chartHeight))}px`,
                animation: `fadeUp 420ms ease ${i * 60}ms both`,
              }}
              title={`${data.minutes} min`}
            />
            <p className="text-xs font-medium text-stone-600">{data.day}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const QuickStats = () => {
  const { state, behavior } = useLearningStore()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const todayKey = now.toISOString().slice(0, 10)

  const activeSessionLiveSeconds = useMemo(() => {
    if (!state.activeSession) return 0
    if (state.activeSession.isPaused) return state.activeSession.accumulatedSec || 0

    return (
      (state.activeSession.accumulatedSec || 0) +
      Math.max(0, Math.round((now.getTime() - state.activeSession.startedAt) / 1000))
    )
  }, [now, state.activeSession])

  const todayMinutes = useMemo(() => {
    const completedMinutes = state.sessions
      .filter((session) => session.dateKey === todayKey)
      .reduce((sum, session) => sum + Math.round((session.durationSec || 0) / 60), 0)

    return completedMinutes + Math.round(activeSessionLiveSeconds / 60)
  }, [activeSessionLiveSeconds, state.sessions, todayKey])

  const weekActiveDays = useMemo(() => {
    const monday = new Date(now)
    const dayIndex = (now.getDay() + 6) % 7
    monday.setDate(now.getDate() - dayIndex)
    monday.setHours(0, 0, 0, 0)

    const weekKeys = new Set()
    for (let offset = 0; offset < 7; offset += 1) {
      const entryDate = new Date(monday)
      entryDate.setDate(monday.getDate() + offset)
      weekKeys.add(entryDate.toISOString().slice(0, 10))
    }

    const minutesByDate = new Map()
    state.sessions.forEach((session) => {
      if (!weekKeys.has(session.dateKey)) return
      minutesByDate.set(
        session.dateKey,
        (minutesByDate.get(session.dateKey) || 0) + Math.round((session.durationSec || 0) / 60),
      )
    })

    if (state.activeSession && weekKeys.has(todayKey)) {
      minutesByDate.set(todayKey, (minutesByDate.get(todayKey) || 0) + Math.round(activeSessionLiveSeconds / 60))
    }

    return Array.from(minutesByDate.values()).filter((minutes) => minutes > 0).length
  }, [activeSessionLiveSeconds, now, state.activeSession, state.sessions, todayKey])

  const avgSessionMinutes = useMemo(() => {
    const durationList = state.sessions.map((session) => session.durationSec || 0)
    if (state.activeSession && activeSessionLiveSeconds > 0) {
      durationList.push(activeSessionLiveSeconds)
    }

    if (durationList.length === 0) return 0

    const totalSeconds = durationList.reduce((sum, value) => sum + value, 0)
    return Math.round(totalSeconds / durationList.length / 60)
  }, [activeSessionLiveSeconds, state.activeSession, state.sessions])

  const computedStreak = useMemo(() => {
    const activeDates = new Set(
      state.sessions
        .filter((session) => (session.durationSec || 0) > 0)
        .map((session) => session.dateKey),
    )

    if (activeSessionLiveSeconds > 0) {
      activeDates.add(todayKey)
    }

    let streak = 0
    const cursor = new Date(now)
    cursor.setHours(0, 0, 0, 0)

    while (activeDates.has(cursor.toISOString().slice(0, 10))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    return streak
  }, [activeSessionLiveSeconds, now, state.sessions, todayKey])

  const streakDays = Math.max(behavior?.streakCount || 0, computedStreak)

  const quickStats = [
    {
      label: 'Deep Work Today',
      value: `${todayMinutes} min`,
      icon: Clock3,
      tone: 'text-primary',
      card: 'bg-[linear-gradient(135deg,#ffffff_0%,#f4f9f7_50%,#edf9f3_100%)] border-primary/20',
    },
    {
      label: 'Active Days',
      value: `${weekActiveDays} day${weekActiveDays === 1 ? '' : 's'}`,
      icon: TrendingUp,
      tone: 'text-emerald-700',
      card: 'bg-[linear-gradient(135deg,#ffffff_0%,#f3fbf7_50%,#ecf8f1_100%)] border-emerald-200/70',
    },
    {
      label: 'Session Mean',
      value: `${avgSessionMinutes} min`,
      icon: Sparkles,
      tone: 'text-primary',
      card: 'bg-[linear-gradient(135deg,#ffffff_0%,#f4f9f7_50%,#edf9f3_100%)] border-primary/20',
    },
    {
      label: 'Consistency Run',
      value: `${streakDays} day${streakDays === 1 ? '' : 's'}`,
      icon: Flame,
      tone: 'text-amber-700',
      card: 'bg-[linear-gradient(135deg,#ffffff_0%,#fffbf3_50%,#fff6e7_100%)] border-amber-200/70',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {quickStats.map((entry, index) => {
        const Icon = entry.icon
        return (
          <div
            key={entry.label}
            className={`stat-chip-card rounded-xl border p-4 ${entry.card}`}
            style={{ animation: `fadeUp 420ms ease ${80 + index * 60}ms both` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-stone-500">{entry.label}</p>
              <Icon size={14} className={entry.tone} />
            </div>
            <p className={`mt-2 font-heading text-2xl font-medium ${entry.tone}`}>{entry.value}</p>
          </div>
        )
      })}
    </div>
  )
}

const StudyCoachCard = ({ reminderContext }) => {
  const [reminder, setReminder] = useState('Loading your study reminder...')
  const [isLoading, setIsLoading] = useState(false)

  const loadReminder = async () => {
    setIsLoading(true)
    try {
      const result = await generateStudyReminder(reminderContext)
      setReminder(result?.reminder || 'Take one meaningful step now and keep your momentum alive.')
    } catch {
      setReminder('Start a focused 20-minute block now. Small consistency beats perfect plans.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReminder()
    // Intentionally run once on mount; user can refresh manually for new copy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="coach-card animate-fade-up rounded-xl border border-sky-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#f4f9ff_55%,#edf6ff_100%)] p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-lg font-semibold text-sky-700 overflow-hidden">
          <img src={nexisAvatar} alt="Nexis avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h4 className="font-heading text-sm font-medium text-stone-900">Nexis Reminder Coach</h4>
          <p className="mt-2 text-xs leading-relaxed text-stone-700">
            {reminder}
          </p>
          <button
            type="button"
            onClick={loadReminder}
            disabled={isLoading}
            className="mt-3 text-xs font-medium text-sky-700 hover:text-sky-800 disabled:opacity-60"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Advice →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const MentorCard = () => {
  return (
    <div className="coach-card animate-fade-up rounded-xl border border-primary/20 bg-[linear-gradient(135deg,#ffffff_0%,#f4f9f7_55%,#edf9f3_100%)] p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          👤
        </div>
        <div className="flex-1">
          <h4 className="font-heading text-sm font-medium text-stone-900">Your Mentor</h4>
          <p className="mt-2 text-xs leading-relaxed text-stone-700">
            Alex Kumar is available for a session to review your assignments.
          </p>
          <button className="mt-3 text-xs font-medium text-primary hover:text-primary-light">
            Schedule →
          </button>
        </div>
      </div>
    </div>
  )
}

const RightPanelStats = () => {
  const { state, behavior } = useLearningStore()

  const reminderContext = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const todayMinutes = state.sessions
      .filter((session) => session.dateKey === todayKey)
      .reduce((sum, session) => sum + Math.round((session.durationSec || 0) / 60), 0)

    const weeklyDateKeys = new Set()
    const base = new Date()
    for (let offset = 0; offset < 7; offset += 1) {
      const d = new Date(base)
      d.setDate(base.getDate() - offset)
      weeklyDateKeys.add(d.toISOString().slice(0, 10))
    }

    const activeWeekDays = new Set(
      state.sessions
        .filter((session) => weeklyDateKeys.has(session.dateKey) && (session.durationSec || 0) > 0)
        .map((session) => session.dateKey),
    )

    const avgSessionMinutes =
      state.sessions.length === 0
        ? 0
        : Math.round(
            state.sessions.reduce((sum, session) => sum + (session.durationSec || 0), 0) /
              state.sessions.length /
              60,
          )

    const subjectMinutes = new Map()
    state.sessions.forEach((session) => {
      const key = session.subjectName || 'General'
      subjectMinutes.set(key, (subjectMinutes.get(key) || 0) + Math.round((session.durationSec || 0) / 60))
    })

    const topSubjects = Array.from(subjectMinutes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    return {
      status: behavior?.status || 'not-started',
      targetMinutes: behavior?.targetMinutes || 60,
      actualMinutes: todayMinutes,
      streakCount: behavior?.streakCount || 0,
      weekActiveDays: activeWeekDays.size,
      avgSessionMinutes,
      weakAreas: [],
      topSubjects,
    }
  }, [state.sessions, behavior])

  return (
    <div className="space-y-4">
      <WeeklyStats />
      <QuickStats />
      <StudyCoachCard reminderContext={reminderContext} />
      <MentorCard />
    </div>
  )
}

export default RightPanelStats
