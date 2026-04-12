const User = require('../../users/user.model')
const { DailyLog } = require('../../behavior/dailylog.model')
const { Task } = require('../../tasks/task.model')
const { AnalyticsEvent } = require('../../analytics/analytics-event.model')
const { getAIClient } = require('./aiClient')
const { InsightCache } = require('../models/InsightCache')

const INSIGHT_CACHE_TTL_MS = 6 * 60 * 60 * 1000

function normalizeInsights(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    return []
  }

  try {
    const parsed = JSON.parse(rawContent)
    const rows = Array.isArray(parsed) ? parsed : parsed.insights

    if (Array.isArray(rows)) {
      return rows
        .map((item, index) => ({
          id: `insight-${index + 1}`,
          title: String(item.title || item.insight || `Insight ${index + 1}`).trim(),
          explanation: String(item.explanation || item.step || item.action || '').trim(),
          actionLabel: String(item.actionLabel || item.action || 'Apply now').trim(),
        }))
        .filter((item) => item.title)
        .slice(0, 3)
    }
  } catch {
    // Intentionally ignore parse errors and fallback to line parsing.
  }

  const lines = rawContent
    .split('\n')
    .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean)

  return lines.slice(0, 3).map((line, index) => ({
    id: `insight-${index + 1}`,
    title: `Insight ${index + 1}`,
    explanation: line,
    actionLabel: 'Apply now',
  }))
}

function buildInsightPrompt(data) {
  return `You are an intelligent study coach.
Analyze this data and give 3 actionable insights.

Data:
${JSON.stringify(data, null, 2)}

Rules:
- Focus on practical behavior and study planning improvements.
- Keep each item short and concrete.
- If there is not enough data, still provide helpful generic coaching actions.

Return JSON only with this shape:
{
  "insights": [
    {
      "title": "Short insight title",
      "explanation": "What this means",
      "actionLabel": "Single actionable step"
    }
  ]
}`
}

async function collectInsightSignals(userId) {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)

  const [user, dailyLogs, tasks, analytics] = await Promise.all([
    User.findById(userId).select('behavior').lean(),
    DailyLog.find({ userId })
      .sort({ dateKey: -1 })
      .limit(7)
      .lean(),
    Task.find({ userId })
      .select('title dueDate completed type')
      .sort({ dueDate: 1 })
      .limit(30)
      .lean(),
    AnalyticsEvent.find({ userId, occurredAt: { $gte: sevenDaysAgo } })
      .select('eventType occurredAt')
      .sort({ occurredAt: -1 })
      .limit(40)
      .lean(),
  ])

  const today = now.toISOString().slice(0, 10)
  const pendingTasks = tasks.filter((task) => !task.completed)
  const overdueTasks = pendingTasks.filter((task) => task.dueDate && new Date(task.dueDate).toISOString().slice(0, 10) < today)
  const recentMissedDays = dailyLogs.filter((log) => !log.started && !log.graceDayUsed).length
  const avgDailyFocusMinutes =
    dailyLogs.length > 0
      ? Math.round(dailyLogs.reduce((sum, log) => sum + (log.actualMinutes || 0), 0) / dailyLogs.length)
      : 0

  return {
    behavior: user?.behavior || {},
    dailyLogs: dailyLogs.map((log) => ({
      dateKey: log.dateKey,
      plannedMinutes: log.plannedMinutes || 0,
      actualMinutes: log.actualMinutes || 0,
      started: Boolean(log.started),
      completed: Boolean(log.completed),
      graceDayUsed: Boolean(log.graceDayUsed),
    })),
    taskSummary: {
      pendingCount: pendingTasks.length,
      overdueCount: overdueTasks.length,
      topPending: pendingTasks.slice(0, 5).map((task) => ({
        title: task.title,
        dueDate: task.dueDate,
        type: task.type,
      })),
    },
    analyticsSummary: {
      recentEvents: analytics.length,
      eventBreakdown: analytics.reduce((acc, item) => {
        acc[item.eventType] = (acc[item.eventType] || 0) + 1
        return acc
      }, {}),
    },
    quickFlags: {
      missedStreakRisk: recentMissedDays >= 2,
      lowFocusRisk: avgDailyFocusMinutes > 0 && avgDailyFocusMinutes < 30,
      overloadedTasksRisk: pendingTasks.length >= 8 || overdueTasks.length >= 3,
    },
  }
}

async function generateInsights(userId) {
  const cacheCutoff = new Date(Date.now() - INSIGHT_CACHE_TTL_MS)
  const cached = await InsightCache.findOne({ userId, generatedAt: { $gte: cacheCutoff } }).lean()

  if (cached?.insights?.length) {
    return cached.insights.slice(0, 3)
  }

  const data = await collectInsightSignals(userId)
  const prompt = buildInsightPrompt(data)
  const aiClient = getAIClient()

  try {
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.4,
      maxTokens: 600,
      timeoutMs: 15000,
    })

    const insights = normalizeInsights(aiResponse.content)

    if (insights.length > 0) {
      await InsightCache.findOneAndUpdate(
        { userId },
        {
          $set: {
            insights: insights.slice(0, 3).map((item) => ({
              title: item.title,
              explanation: item.explanation,
              actionLabel: item.actionLabel,
            })),
            generatedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      )

      return insights
    }
  } catch (error) {
    console.error('Insight generation failed:', error.message)
  }

  const fallback = []

  if (data.quickFlags.missedStreakRisk) {
    fallback.push({
      id: 'insight-1',
      title: 'Rebuild your streak gradually',
      explanation: 'You missed multiple recent days. A lighter comeback block is more sustainable than forcing long sessions.',
      actionLabel: 'Start with a 20-minute comeback session',
    })
  }

  if (data.quickFlags.lowFocusRisk) {
    fallback.push({
      id: 'insight-2',
      title: 'Reduce daily target for consistency',
      explanation: 'Recent focus minutes are below target. Lowering your daily bar improves completion momentum.',
      actionLabel: 'Set a smaller target for the next 3 days',
    })
  }

  if (data.quickFlags.overloadedTasksRisk) {
    fallback.push({
      id: 'insight-3',
      title: 'Prioritize your backlog',
      explanation: 'You have too many pending or overdue tasks. Prioritization prevents context switching and missed deadlines.',
      actionLabel: 'Pick top 3 tasks and defer the rest',
    })
  }

  if (fallback.length === 0) {
    fallback.push(
      {
        id: 'insight-1',
        title: 'Protect a daily focus window',
        explanation: 'A fixed study window each day improves predictability and reduces decision fatigue.',
        actionLabel: 'Block one non-negotiable focus slot today',
      },
      {
        id: 'insight-2',
        title: 'Finish one high-value task first',
        explanation: 'Starting with the highest-impact task creates momentum for the rest of your day.',
        actionLabel: 'Complete one priority task before lower-value work',
      },
    )
  }

  const finalInsights = fallback.slice(0, 3)

  await InsightCache.findOneAndUpdate(
    { userId },
    {
      $set: {
        insights: finalInsights.map((item) => ({
          title: item.title,
          explanation: item.explanation,
          actionLabel: item.actionLabel,
        })),
        generatedAt: new Date(),
      },
    },
    { upsert: true, new: true },
  )

  return finalInsights
}

module.exports = {
  generateInsights,
}