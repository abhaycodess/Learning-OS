import { useEffect, useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import SectionHeading from '../../components/SectionHeading.jsx'
import { useLearningStore } from '../../hooks/useLearningStore.jsx'
import { useWeeklySummaryEngine } from '../behavior/index.js'
import { analyticsService } from '../../services/analyticsService.js'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-ui border border-neutral-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-semibold text-neutral-800">{label}</p>
      <p className="mt-1 text-neutral-600">{payload[0].value} min</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { state } = useLearningStore()
  const [advancedSummary, setAdvancedSummary] = useState(null)
  const [weakAreas, setWeakAreas] = useState(null)

  const bySubject = useMemo(() => {
    const map = new Map()

    state.sessions.forEach((session) => {
      const subject = state.subjects.find((entry) => entry.id === session.subjectId)
      const name = subject?.name || 'Unknown'
      map.set(name, (map.get(name) || 0) + Math.round(session.durationSec / 60))
    })

    return Array.from(map.entries())
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
  }, [state.sessions, state.subjects])

  const trend = useMemo(() => {
    const map = new Map()

    state.sessions.forEach((session) => {
      map.set(session.dateKey, (map.get(session.dateKey) || 0) + Math.round(session.durationSec / 60))
    })

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([day, minutes]) => ({ day: day.slice(5), minutes }))
  }, [state.sessions])

  const totalMinutes = state.sessions.reduce(
    (sum, session) => sum + Math.round(session.durationSec / 60),
    0,
  )

  const peakDay = [...trend].sort((a, b) => b.minutes - a.minutes)[0]

  const averageSessionMinutes =
    state.sessions.length === 0 ? 0 : Math.round(totalMinutes / state.sessions.length)

  const activeDays = trend.filter((entry) => entry.minutes > 0).length

  const hasSessions = state.sessions.length > 0

  // Calculate metrics for weekly summary
  const plannedTasks = state.tasks.length
  const completedTasks = state.tasks.filter((t) => t.completed).length
  const totalFocusSeconds = state.sessions.reduce((sum, session) => sum + (session.durationSec || 0), 0)
  
  // Get reflections from sessionStorage
  const reflections = JSON.parse(sessionStorage.getItem('sessionReflections') || '[]')
  const avgFocusScore = reflections.length > 0
    ? Math.round(reflections.reduce((sum, r) => sum + (r.focusScore || 0), 0) / reflections.length)
    : 0

  // Initialize weekly summary engine
  const weeklySummary = useWeeklySummaryEngine({
    plannedCount: plannedTasks,
    completedCount: completedTasks,
    totalFocusSeconds: totalFocusSeconds,
    consistencyDays: activeDays,
    avgFocusScore: avgFocusScore,
  })

  useEffect(() => {
    let active = true

    async function loadExperimentSummary() {
      try {
        const advanced = await analyticsService.getAdvancedAnalytics()

        if (active) {
          setAdvancedSummary(advanced)
        }
      } catch {
        if (active) {
          setAdvancedSummary(null)
        }
      }
    }

    async function loadWeakAreas() {
      try {
        const response = await analyticsService.getWeakAreas()

        if (active) {
          setWeakAreas(response)
        }
      } catch {
        if (active) {
          setWeakAreas(null)
        }
      }
    }

    loadExperimentSummary()
    loadWeakAreas()

    return () => {
      active = false
    }
  }, [])

  if (!hasSessions) {
    return (
      <div className="analytics-page space-y-s2">
        <SectionHeading title="Analytics" />
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Start sessions to see insights. Your trends, streaks, and performance signals will appear here."
        />
      </div>
    )
  }

  return (
    <div className="analytics-page space-y-s2">
      <SectionHeading
        title="Analytics"
      />

      {/* Weekly Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-[#6352c8]/10 to-[#8b7fcf]/5 border-[#6352c8]/20">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#5a4db0] font-semibold">Weekly Verdict</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">{weeklySummary.verdict}</p>
            <p className="mt-1 text-sm text-neutral-600">{weeklySummary.completionRate}% completion rate</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#5a4db0] font-semibold mb-2">Insight</p>
            <p className="text-sm leading-6 text-neutral-700">{weeklySummary.suggestion}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#6352c8]/10">
            {weeklySummary.insights && weeklySummary.insights.map((insight, idx) => (
              <div key={idx}>
                <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">{insight.label}</p>
                <p className="mt-1 font-semibold text-neutral-900">{insight.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Phase 6 Insights</p>
            <h3 className="mt-1 text-xl font-semibold text-neutral-900">Advanced Study Analytics</h3>
          </div>
          <p className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            {advancedSummary?.totalSessions || 0} sessions analyzed
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-neutral-500">Current Streak</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900">{advancedSummary?.currentStreakDays || 0} days</p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-neutral-500">Longest Streak</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900">{advancedSummary?.longestStreakDays || 0} days</p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-neutral-500">Avg Focus Score</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900">{advancedSummary?.averageFocusScore || 0}/5</p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-neutral-500">Best Study Hour</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900">
              {typeof advancedSummary?.bestStudyHour === 'number'
                ? `${String(advancedSummary.bestStudyHour).padStart(2, '0')}:00`
                : '--'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Weak Area Radar</p>
            <h3 className="mt-1 text-xl font-semibold text-neutral-900">Top Subjects Needing Attention</h3>
          </div>
          <p className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
            {weakAreas?.weakAreas?.length || 0} flagged
          </p>
        </div>

        {weakAreas?.weakAreas?.length ? (
          <div className="mt-4 space-y-3">
            {weakAreas.weakAreas.map((entry) => (
              <div key={entry.subject} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{entry.subject}</h4>
                    <p className="mt-1 text-sm text-neutral-600">{entry.reason}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                      entry.severity === 'high'
                        ? 'bg-red-100 text-red-700'
                        : entry.severity === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {entry.severity}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-neutral-500">
                  <div>
                    <p className="uppercase tracking-[0.08em]">Sessions</p>
                    <p className="mt-1 font-semibold text-neutral-900">{entry.sessions}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.08em]">Completion</p>
                    <p className="mt-1 font-semibold text-neutral-900">{entry.completionRate}%</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.08em]">Focus</p>
                    <p className="mt-1 font-semibold text-neutral-900">{entry.averageFocusScore}/5</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm text-neutral-600">
              Not enough session history yet. Complete a few more focus sessions and Nexis will flag weak areas here.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card tone="soft" className="p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Total tracked</p>
          <p className="kpi-number mt-s2 text-neutral-900">{totalMinutes}m</p>
        </Card>
        <Card tone="soft" className="p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Peak day</p>
          <p className="kpi-number mt-s2 text-brand-700">{peakDay?.day || '--'}</p>
        </Card>
        <Card tone="soft" className="p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Sessions logged</p>
          <p className="kpi-number mt-s2 text-neutral-900">{state.sessions.length}</p>
        </Card>
        <Card tone="soft" className="p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Avg session</p>
          <p className="kpi-number mt-s2 text-brand-700">{averageSessionMinutes}m</p>
        </Card>
        <Card tone="soft" className="p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Active days (7d)</p>
          <p className="kpi-number mt-s2 text-neutral-900">{activeDays}</p>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="subtle-grid p-4">
          <h3 className="text-xl text-neutral-900">Time per Subject</h3>
          <div className="mt-s2 h-[260px]">
            {hasSessions ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySubject}>
                  <XAxis dataKey="name" stroke="#627084" />
                  <YAxis stroke="#627084" />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(40,100,220,0.08)' }} />
                  <Bar dataKey="minutes" fill="#2864dc" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[18px] border border-dashed border-neutral-200 bg-white/50">
                <p className="text-sm text-neutral-500">Complete focus sessions to unlock this chart.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="subtle-grid p-4">
          <h3 className="text-xl text-neutral-900">Daily Trend (7 days)</h3>
          <div className="mt-s2 h-[260px]">
            {hasSessions ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="day" stroke="#627084" />
                  <YAxis stroke="#627084" />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#1f8f59"
                    strokeWidth={3}
                    dot={{ r: 2.5, fill: '#1f8f59' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[18px] border border-dashed border-neutral-200 bg-white/50">
                <p className="text-sm text-neutral-500">Start a focus block to build your weekly trend.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
