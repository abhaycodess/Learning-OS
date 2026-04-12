/**
 * useWeeklySummaryEngine - Honest Progress & Consistency Reporting
 * 
 * Calculates week-over-week metrics:
 * - Tasks planned vs completed
 * - Total focus time
 * - Consistency score (days with sessions)
 * - Session quality (average focus rating)
 * 
 * Tone: Honest, slightly sarcastic, motivating
 * - Not sugarcoating numbers
 * - Acknowledging effort
 * - Suggesting concrete improvements
 * 
 * Returns:
 * {
 *   plannedCount: 10,
 *   completedCount: 4,
 *   completionRate: 0.40,
 *   totalFocusMinutes: 180,
 *   consistencyScore: 0.57, // 4 days out of 7 with sessions
 *   averageFocusRating: 3.6,
 *   verdict: string (honest assessment),
 *   suggestion: string (concrete improvement),
 * }
 * 
 * Usage:
 * const summary = useWeeklySummaryEngine({
 *   tasks: [...],
 *   sessions: [...],
 *   reflections: [...],
 *   weekStartDate: new Date(),
 * })
 */

import { useMemo } from 'react'

/**
 * Check if date is within current week
 */
function isThisWeek(date, weekStartDate = new Date()) {
  const startOfWeek = new Date(weekStartDate)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // Sunday

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6) // Saturday
  endOfWeek.setHours(23, 59, 59, 999)

  const checkDate = new Date(date)
  return checkDate >= startOfWeek && checkDate <= endOfWeek
}

/**
 * Generate honest verdict based on metrics
 */
function generateVerdict(completionRate, consistencyScore, avgFocusRating) {
  if (completionRate >= 0.8 && consistencyScore >= 0.8) {
    return "You're actually doing the work. Not many people do."
  }
  if (completionRate >= 0.6 && consistencyScore >= 0.7) {
    return 'Solid week. Consistency is building.'
  }
  if (completionRate >= 0.5) {
    return "You're halfway there. That's respectable."
  }
  if (completionRate >= 0.3) {
    return "You planned big. You did some. It's a start."
  }
  if (consistencyScore > 0) {
    return "You showed up some days. That's more than most."
  }
  return "Plan nothing, do nothing. Change one of those."
}

/**
 * Generate concrete improvement suggestion
 */
function generateSuggestion(
  completionRate,
  consistencyScore,
  plannedCount,
  completedCount,
) {
  if (completionRate < 0.3) {
    return `You planned ${plannedCount} but did ${completedCount}. Plan 5 next week. Do 3. Build from there.`
  }
  if (consistencyScore < 0.5) {
    return `Add your sessions to calendar. Show up 5 days next week. Same time.`
  }
  if (completionRate >= 0.8) {
    return `You're crushing it. Push harder or go deeper. More quality, not just quantity.`
  }
  return `You're close. Next week: ${Math.ceil(plannedCount * 0.7)} tasks. You can do ${Math.ceil(plannedCount * 0.6)}.`
}

export function useWeeklySummaryEngine({
  tasks = [],
  sessions = [],
  reflections = {},
  weekStartDate = new Date(),
} = {}) {
  const summary = useMemo(() => {
    // Filter tasks from this week
    const weekTasks = tasks.filter((t) => isThisWeek(t.createdAt || t.dueDate, weekStartDate))
    const plannedCount = weekTasks.length
    const completedCount = weekTasks.filter((t) => t.completed).length
    const completionRate = plannedCount > 0 ? completedCount / plannedCount : 0

    // Filter sessions from this week
    const weekSessions = sessions.filter((s) => isThisWeek(s.startedAt, weekStartDate))
    const totalFocusSeconds = weekSessions.reduce(
      (sum, session) => sum + (session.durationSec || 0),
      0,
    )
    const totalFocusMinutes = Math.round(totalFocusSeconds / 60)

    // Consistency score: how many unique days had focus sessions
    const sessionDaysSet = new Set(
      weekSessions.map((s) => new Date(s.startedAt).toDateString()),
    )
    const consistencyScore = sessionDaysSet.size / 7

    // Average focus rating from reflections
    const sessionFocusRatings = weekSessions
      .map((s) => reflections[s.id]?.focusScore)
      .filter((rating) => rating !== undefined)

    const averageFocusRating =
      sessionFocusRatings.length > 0
        ? (sessionFocusRatings.reduce((a, b) => a + b, 0) / sessionFocusRatings.length).toFixed(1)
        : null

    // Generate verdict and suggestion
    const verdict = generateVerdict(completionRate, consistencyScore, averageFocusRating || 3)
    const suggestion = generateSuggestion(
      completionRate,
      consistencyScore,
      plannedCount,
      completedCount,
    )

    return {
      // Raw metrics
      plannedCount,
      completedCount,
      completionRate: parseFloat((completionRate * 100).toFixed(1)),
      totalFocusMinutes,
      sessionCount: weekSessions.length,
      consistencyScore: parseFloat((consistencyScore * 100).toFixed(0)),
      consistencyDays: sessionDaysSet.size,
      averageFocusRating,

      // Messaging
      verdict,
      suggestion,

      // Derived insights
      isOnTrack: completionRate >= 0.5 && consistencyScore >= 0.4,
      needsMotivation: completionRate < 0.3 || consistencyScore < 0.3,
      isConsistent:
        consistencyScore >= 0.7,
      focusQualityGood: averageFocusRating && averageFocusRating >= 4,

      // Data availability
      hasData: plannedCount > 0 || weekSessions.length > 0,
    }
  }, [tasks, sessions, reflections, weekStartDate])

  return summary
}

export default useWeeklySummaryEngine
