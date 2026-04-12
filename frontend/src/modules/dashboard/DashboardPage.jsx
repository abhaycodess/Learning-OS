import { Activity, CirclePlay, Clock3, Flame, Sparkles, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HeroBanner from '../../components/HeroBanner.jsx'
import ProgressCard from '../../components/ProgressCard.jsx'
import SkeletonBlock from '../../components/SkeletonBlock.jsx'
import RightPanelStats from '../../components/RightPanelStats.jsx'
import DailyContractCard from '../../components/DailyContractCard.jsx'
import StreakBadge from '../../components/StreakBadge.jsx'
import MissedDayBanner from '../../components/MissedDayBanner.jsx'
import { DailySummaryModal } from '../../components/DailySummaryModal.jsx'
import { useLearningStore } from '../../hooks/useLearningStore.jsx'
import { useToast } from '../../hooks/useToast.jsx'
import { useUserProfile } from '../../hooks/useUserProfile.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNudgeEngine, useNudgeExperiment, useSmartGreetingEngine, useStartNowEngine } from '../behavior/index.js'
import { getAIInsights } from '../ai/service'

const AI_INSIGHTS_CACHE_KEY = 'learning_os_ai_insights_cache_v1'

const GOAL_LABELS = {
  'crack-exam': 'Crack an exam',
  'improve-concepts': 'Improve concepts',
  'learn-skills': 'Learn skills',
  'stay-consistent': 'Stay consistent',
}

const STUDY_TIME_LABELS = {
  morning: 'Morning sessions',
  afternoon: 'Afternoon sessions',
  night: 'Night sessions',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { state, todaysTasks, completedToday, behavior } = useLearningStore()
  const { toasts } = useToast()
  const { userProfile } = useUserProfile()
  const { variant, trackNudgeEvent } = useNudgeExperiment()

  // Track page open time for nudge engine
  const [pageOpenedAt] = useState(Date.now())
  const [pageOpenTime, setPageOpenTime] = useState(0)
  const [momentumIndex, setMomentumIndex] = useState(0)
  const [timeLabel, setTimeLabel] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showGreetingCard, setShowGreetingCard] = useState(false)
  const [aiInsights, setAiInsights] = useState([])
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false)
  const [aiInsightsError, setAiInsightsError] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setPageOpenTime(Date.now() - pageOpenedAt)
    }, 500)
    return () => clearInterval(timer)
  }, [pageOpenedAt])

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setMomentumIndex((prev) => (prev + 1) % 4)
    }, 4500)

    const clock = window.setInterval(() => {
      setTimeLabel(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 30000)

    return () => {
      window.clearInterval(rotation)
      window.clearInterval(clock)
    }
  }, [])

  useEffect(() => {
    if (showGreetingCard) return undefined

    if ((toasts || []).length === 0) {
      const timer = window.setTimeout(() => {
        setShowGreetingCard(true)
      }, 180)
      return () => window.clearTimeout(timer)
    }

    return undefined
  }, [toasts, showGreetingCard])

  useEffect(() => {
    let cancelled = false

    async function loadInsights() {
      setAiInsightsError('')

      if (typeof window !== 'undefined') {
        try {
          const cached = window.sessionStorage.getItem(AI_INSIGHTS_CACHE_KEY)
          if (cached) {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed?.insights) && parsed.insights.length > 0) {
              setAiInsights(parsed.insights.slice(0, 3))
              return
            }
          }
        } catch {
          // Ignore session cache parse errors and fetch fresh data.
        }
      }

      setAiInsightsLoading(true)
      try {
        const payload = await getAIInsights()
        const insights = Array.isArray(payload?.insights) ? payload.insights.slice(0, 3) : []

        if (cancelled) return

        setAiInsights(insights)

        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem(
              AI_INSIGHTS_CACHE_KEY,
              JSON.stringify({ insights }),
            )
          } catch {
            // Ignore sessionStorage write failures.
          }
        }
      } catch (error) {
        if (cancelled) return
        setAiInsightsError(error.message || 'Failed to load AI insights')
      } finally {
        if (!cancelled) {
          setAiInsightsLoading(false)
        }
      }
    }

    loadInsights()

    return () => {
      cancelled = true
    }
  }, [])

  // Auto-show summary modal if yesterday was missed or grace day used
  useEffect(() => {
    if (behavior.loaded && (behavior.missedYesterday || behavior.graceDayUsedYesterday)) {
      // Show summary modal automatically after a short delay
      const timer = setTimeout(() => {
        setShowSummaryModal(true)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [behavior.loaded, behavior.missedYesterday, behavior.graceDayUsedYesterday])

  // Calculate metrics for behavior engine
  const pendingTodayTasks = todaysTasks.filter((t) => !t.completed)
  const plannedAllTasks = state.tasks.filter((t) => !t.completed)

  // Helper: calculate minutes since last session
  const calculateMinutesSinceLastSession = () => {
    if (state.sessions && state.sessions.length > 0) {
      const lastSession = state.sessions[state.sessions.length - 1]
      const minutesSince = (Date.now() - new Date(lastSession.startedAt)) / (1000 * 60)
      return minutesSince
    }
    return null
  }

  const minutesSinceLastSession = calculateMinutesSinceLastSession()
  const lastSessionDurationMinutes =
    state.sessions && state.sessions.length > 0
      ? Math.round(state.sessions[state.sessions.length - 1].durationSec / 60)
      : null

  // Initialize behavior engines
  const { nudge, dismissNudge, trackNudgeCta } = useNudgeEngine({
    pageOpenTimeMs: pageOpenTime,
    pendingTaskCount: pendingTodayTasks.length,
    completedTasksToday: completedToday,
    plannedTasksToday: todaysTasks.length,
    context: 'dashboard',
    variant,
    onEvent: trackNudgeEvent,
  })

  const greeting = useSmartGreetingEngine({
    firstName: user?.name?.split(' ')[0] || 'there',
    lastSessionMinutesAgo: minutesSinceLastSession,
    lastSessionDurationMinutes,
    userGoal: userProfile?.goal?.[0],
  })

  const startNow = useStartNowEngine({
    tasks: pendingTodayTasks.length > 0 ? pendingTodayTasks : plannedAllTasks,
    subjects: state.subjects || [],
    sessions: state.sessions || [],
  })

  const completionRate =
    todaysTasks.length === 0 ? 0 : Math.round((completedToday / todaysTasks.length) * 100)

  const momentumMessages = [
    'Momentum starts with one focused move.',
    'Small sessions compound into serious progress.',
    'Consistency beats intensity every week.',
    'Protect your focus window. It is your edge.',
  ]

  const uniqueSessionDays = [...new Set((state.sessions || []).map((session) => session.dateKey))].sort((a, b) => b.localeCompare(a))
  let streakDays = 0
  if (uniqueSessionDays.length > 0) {
    const cursor = new Date()
    while (true) {
      const key = cursor.toISOString().slice(0, 10)
      if (!uniqueSessionDays.includes(key)) break
      streakDays += 1
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  // Calculate subject progress
  const subjectsWithProgress = state.subjects.slice(0, 4).map((subject) => {
    const subjectTasks = state.tasks.filter((task) => task.subjectId === subject.id)
    const completed = subjectTasks.filter((task) => task.completed).length
    const progress = subjectTasks.length === 0 ? 0 : Math.round((completed / subjectTasks.length) * 100)
    return { ...subject, progress, taskCount: subjectTasks.length }
  })

  const goalSummary =
    userProfile?.goal?.length > 0
      ? userProfile.goal.map((goal) => GOAL_LABELS[goal] || goal).join(', ')
      : 'Define your learning goals in Profile'

  const routineSummary = userProfile?.preferredStudyTime
    ? STUDY_TIME_LABELS[userProfile.preferredStudyTime] || 'Your preferred study block'
    : 'Set your preferred study time in Profile'

  const pendingTodayCount = Math.max(0, todaysTasks.length - completedToday)
  const todayFocusMinutes = behavior.loaded
    ? behavior.actualMinutes
    : Math.round(
      (state.sessions || [])
        .filter((session) => session.dateKey === new Date().toISOString().slice(0, 10))
        .reduce((sum, session) => sum + (session.durationSec || 0), 0) / 60,
    )

  const nextTaskTitle = (todaysTasks.find((task) => !task.completed)?.title || todaysTasks[0]?.title || '').trim()
  const nextActionLabel = nextTaskTitle ? `Start: ${nextTaskTitle}` : 'Start Focus Session'
  const nextActionLink = todaysTasks.find((task) => !task.completed)?.id
    ? `/focus?task=${todaysTasks.find((task) => !task.completed).id}`
    : '/focus'

  const dailyTargetMinutes = Math.max(0, behavior.targetMinutes || 0)
  const dailyProgressPercent = dailyTargetMinutes > 0
    ? Math.min(100, Math.round((todayFocusMinutes / dailyTargetMinutes) * 100))
    : 0
  const subjectAverageProgress = subjectsWithProgress.length > 0
    ? Math.round(subjectsWithProgress.reduce((sum, item) => sum + item.progress, 0) / subjectsWithProgress.length)
    : 0
  const tasksToClear = Math.max(0, pendingTodayCount)

  if (!state.bootstrapped) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-24" />
        <div className="grid gap-3 md:grid-cols-3">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        <SkeletonBlock className="h-56" />
        <div className="grid gap-3 md:grid-cols-2">
          <SkeletonBlock className="h-56" />
          <SkeletonBlock className="h-56" />
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-grid xl:[grid-template-columns:minmax(0,1fr)_328px]">
      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Smart Greeting Section */}
        <div
          className="dashboard-greeting-wrap pt-2 transition-all duration-300"
          style={{
            opacity: showGreetingCard ? 1 : 0,
            transform: showGreetingCard ? 'translateY(0)' : 'translateY(8px)',
            pointerEvents: showGreetingCard ? 'auto' : 'none',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{greeting.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{greeting.message}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome back'}
              </p>
            </div>
          </div>

          <div className="dashboard-vital-strip mt-4">
            <div className="dashboard-vital-main">
              <span className="dashboard-vital-dot" aria-hidden="true" />
              <Activity size={14} />
              <p>{momentumMessages[momentumIndex]}</p>
            </div>
            <div className="dashboard-vital-meta" aria-label="Dashboard live stats">
              <span>
                <Clock3 size={13} /> {timeLabel}
              </span>
              <span>
                <Flame size={13} /> {behavior.loaded ? behavior.streakCount : streakDays}d streak
              </span>
              <span>
                <Sparkles size={13} /> {completionRate}% today
              </span>
            </div>
          </div>
        </div>

        {/* Missed Day Warning Banner */}
        {behavior.missedYesterday && (
          <MissedDayBanner
            missedYesterday={true}
            onStartClick={() => {
              const firstTask = todaysTasks[0] || state.tasks[0]
              if (firstTask) {
                navigate(`/focus?task=${firstTask.id}`)
              }
            }}
            taskName={todaysTasks[0]?.title}
          />
        )}

        {/* Daily Contract Card */}
        {behavior.loaded && (
          <DailyContractCard
            status={behavior.status}
            targetMinutes={behavior.targetMinutes}
            actualMinutes={behavior.actualMinutes}
            taskName={todaysTasks[0]?.title}
            onStartClick={() => {
              const firstTask = todaysTasks[0] || state.tasks[0]
              if (firstTask) {
                navigate(`/focus?task=${firstTask.id}`)
              }
            }}
            onContinueClick={() => {
              navigate('/focus')
            }}
          />
        )}

        {/* Nudge Banner */}
        {nudge && (
          <div className="nudge-appear animate-in slide-in-from-top-2 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start justify-between dashboard-float-card">
            <div>
              <p className="text-blue-900 font-medium text-lg">{nudge.message}</p>
              <button
                onClick={() => {
                  trackNudgeCta()
                  navigate(startNow.actionUrl)
                }}
                className="mt-3 inline-flex items-center justify-center rounded-lg border border-blue-700 bg-blue-700 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-800"
                style={{
                  backgroundColor: '#1d4ed8',
                  borderColor: '#1d4ed8',
                  color: '#ffffff',
                  opacity: 1,
                }}
              >
                {nudge.cta}
              </button>
            </div>
            <button
              onClick={dismissNudge}
              className="text-blue-400 hover:text-blue-600 flex-shrink-0 mt-1"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Start Now Action Card */}
        {startNow.selectedTask && (
          <div className="dashboard-start-card bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
            <p className="text-lg mb-4">{startNow.message}</p>
            <Link
              to={startNow.actionUrl}
              className="hover-lift inline-flex items-center justify-center rounded-ui bg-white px-6 py-3 text-sm font-semibold text-purple-700 shadow-[0_10px_24px_rgba(17,22,29,0.2)] transition-all duration-200 hover:bg-gray-100 hover:scale-105 active:scale-95"
            >
              ⚡ {startNow.cta}
            </Link>
          </div>
        )}

        {/* Hero Banner */}
        <HeroBanner
          eyebrow="Today at a glance"
          title="Your Execution Board"
          subtitle={pendingTodayCount > 0 ? 'Prioritize one pending task and complete one focused block now.' : 'Great progress. Protect momentum with a short focus block.'}
          metrics={[
            { label: 'Closed Today', value: `${completedToday}/${todaysTasks.length || 0} tasks` },
            { label: 'Open Queue', value: `${pendingTodayCount} task${pendingTodayCount === 1 ? '' : 's'}` },
            { label: 'Deep Work', value: `${todayFocusMinutes} min` },
            { label: 'Consistency Run', value: `${behavior.loaded ? behavior.streakCount : streakDays} days` },
          ]}
          action={
            <Link
              to={nextActionLink}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-medium text-primary transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              {nextActionLabel} <CirclePlay size={18} />
            </Link>
          }
        />

        <div className="rounded-[24px] border border-neutral-200 bg-white p-4 shadow-[0_12px_30px_rgba(17,22,29,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Mission Control</p>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-indigo-700">
              {dailyProgressPercent}% daily execution
            </span>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-primary/20 bg-[linear-gradient(135deg,#ffffff_0%,#f4f9f7_55%,#edf9f3_100%)] px-3 py-3 dashboard-lift-tile gradient-soft-shift">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Velocity Pulse</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">{todayFocusMinutes} / {dailyTargetMinutes || 0} min focused</p>
              <div className="mt-2 h-2 rounded-full bg-neutral-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-600">{completedToday} closed • {pendingTodayCount} in queue</p>
            </div>

            <div className="rounded-xl border border-emerald-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#f3fbf7_55%,#ebf8f1_100%)] px-3 py-3 dashboard-lift-tile gradient-soft-shift">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Strategy Fit</p>
              <p className="mt-1 text-sm text-neutral-800">{goalSummary}</p>
              <p className="mt-2 text-xs font-medium text-emerald-700">Routine: {routineSummary}</p>
              <p className="mt-1 text-xs text-neutral-600">Subject momentum: {subjectAverageProgress}% avg</p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-[linear-gradient(135deg,#ffffff_0%,#f4f9f7_55%,#edf9f3_100%)] px-3 py-3 dashboard-lift-tile gradient-soft-shift">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next Milestone</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {tasksToClear > 0 ? `${tasksToClear} task${tasksToClear === 1 ? '' : 's'} to close today` : 'Daily task target complete'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={nextActionLink}
                  className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-light"
                >
                  Focus now
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
                >
                  Tune profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-neutral-200 bg-white p-4 shadow-[0_12px_30px_rgba(17,22,29,0.05)]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-lg font-medium text-stone-900">AI Insights</h3>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-700">
              Proactive
            </span>
          </div>

          {aiInsightsLoading && (
            <p className="mt-3 text-sm text-neutral-600">Loading insights...</p>
          )}

          {!aiInsightsLoading && aiInsightsError && (
            <p className="mt-3 text-sm text-red-700">{aiInsightsError}</p>
          )}

          {!aiInsightsLoading && !aiInsightsError && aiInsights.length === 0 && (
            <p className="mt-3 text-sm text-neutral-600">No insights yet. Keep studying and check back soon.</p>
          )}

          {!aiInsightsLoading && aiInsights.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {aiInsights.map((insight, index) => (
                <article
                  key={insight.id || `insight-${index}`}
                  className="rounded-xl border border-blue-100 bg-[linear-gradient(140deg,#ffffff_0%,#eef6ff_100%)] p-3"
                >
                  <p className="text-sm font-semibold text-neutral-900">{insight.title || `Insight ${index + 1}`}</p>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-700">{insight.explanation || 'Actionable study guidance generated for you.'}</p>
                  {(insight.actionLabel || insight.action) && (
                    <button
                      type="button"
                      onClick={() => navigate('/study-coach')}
                      className="mt-3 inline-flex items-center rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      {insight.actionLabel || insight.action}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Subject Progress Grid */}
        <div>
          <h3 className="mb-3 font-heading text-lg font-medium text-stone-900">Your Subjects</h3>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {subjectsWithProgress.map((subject, index) => (
              <div key={subject.id} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
                <ProgressCard
                  subject={subject.name}
                  progress={subject.progress}
                  taskCount={subject.taskCount}
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Panel - Scrolls together with main column */}
      <div className="hidden xl:block">
        <RightPanelStats />
      </div>

      {/* Daily Summary Modal */}
      <DailySummaryModal
        isOpen={showSummaryModal}
        dateKey={null} // null defaults to yesterday in the component
        onClose={() => setShowSummaryModal(false)}
      />
    </div>
  )
}
