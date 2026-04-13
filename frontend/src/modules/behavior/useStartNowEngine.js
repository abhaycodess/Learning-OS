/**
 * useStartNowEngine - Intelligent Task Selection for Immediate Action
 * 
 * Automatically picks the "best" task based on:
 * 1. Completion status (incomplete tasks only)
 * 2. Due date proximity (closest due first)
 * 3. Subject recency (most recently worked subject)
 * 4. Task priority/type
 * 
 * If no task exists:
 * - Offers quick task creation (5-min form)
 * - Pre-fetches best subject
 * 
 * Returns:
 * - selectedTask: the recommended task object
 * - actionUrl: direct link to focus page with task
 * - shouldCreateTask: boolean if no task exists
 * - createTaskSuggestion: prefilled form data
 * 
 * Usage:
 * const startNow = useStartNowEngine({
 *   tasks: [...],
 *   subjects: [...],
 *   userProfile: {...},
 * })
 * // startNow.selectedTask
 * // startNow.actionUrl === '/focus?taskId=...'
 * // startNow.message === "Let's focus on Math revision"
 */

import { useMemo } from 'react'

/**
 * Score a task for prioritization
 */
function scoreTask(task, subjectRecencyMap) {
  let score = 0

  // Due date priority (closer = higher score)
  const dueDate = new Date(task.dueDate).getTime()
  const now = Date.now()
  const daysUntilDue = Math.max(0, (dueDate - now) / (1000 * 60 * 60 * 24))

  if (daysUntilDue === 0) {
    score += 100 // Due today - highest priority
  } else if (daysUntilDue <= 1) {
    score += 80 // Due tomorrow
  } else if (daysUntilDue <= 3) {
    score += 60 // Due within 3 days
  } else if (daysUntilDue <= 7) {
    score += 40 // Due this week
  } else {
    score += Math.max(5, 30 - daysUntilDue) // Later tasks get lower score
  }

  // Subject recency bonus (if user worked on this subject recently)
  if (subjectRecencyMap && subjectRecencyMap[task.subjectId]) {
    const minutesSinceLastWork = subjectRecencyMap[task.subjectId]
    if (minutesSinceLastWork < 60) {
      score += 20 // Worked on it recently - stay in flow
    } else if (minutesSinceLastWork < 24 * 60) {
      score += 10
    }
  }

  // Task type bonus
  if (task.type === 'Revision') {
    score += 5 // Prioritize revision slightly
  }

  return score
}

/**
 * Build subject recency map from recent sessions
 */
function buildSubjectRecencyMap(sessions) {
  const map = {}
  const now = Date.now()

  // Sort by most recent first
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 10) // Look at last 10 sessions

  recentSessions.forEach((session) => {
    if (!map[session.subjectId]) {
      const minutesSince =
        (now - new Date(session.startedAt).getTime()) / (1000 * 60)
      map[session.subjectId] = minutesSince
    }
  })

  return map
}

export function useStartNowEngine({
  tasks = [],
  subjects = [],
  sessions = [],
  userProfile: _userProfile = {},
}) {
  const selectedTask = useMemo(() => {
    // Filter to only incomplete tasks
    const incompleteTasks = tasks.filter((t) => !t.completed)

    if (incompleteTasks.length === 0) {
      return null
    }

    // Build subject recency map
    const recencyMap = buildSubjectRecencyMap(sessions)

    // Score all tasks
    const scoredTasks = incompleteTasks.map((task) => ({
      task,
      score: scoreTask(task, recencyMap),
    }))

    // Sort by score descending
    scoredTasks.sort((a, b) => b.score - a.score)

    return scoredTasks[0]?.task || null
  }, [tasks, sessions])

  // Build action URL for focus page
  const actionUrl = selectedTask
    ? `/focus?taskId=${selectedTask.id}`
    : '/focus?quickStart=true'

  // If no task, prepare quick task creation suggestion
  const shouldCreateTask = !selectedTask && tasks.length === 0
  const createTaskSuggestion = useMemo(() => {
    if (!shouldCreateTask) return null

    // Pick most-used subject or first subject
    const bestSubject = subjects.length > 0 ? subjects[0] : null

    return {
      title: 'Quick Task',
      subjectId: bestSubject?.id || '',
      subjectName: bestSubject?.name || '',
      type: 'Study',
      dueDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      plannedDurationMinutes: 25,
    }
  }, [shouldCreateTask, subjects])

  // Contextual message
  const selectedSubject = selectedTask
    ? subjects.find((s) => s.id === selectedTask.subjectId)
    : null

  const message = selectedTask
    ? `Let's focus on ${selectedSubject?.name || 'this task'}`
    : "No tasks yet. Let's create one."

  return {
    selectedTask,
    selectedSubject,
    actionUrl,
    message,
    shouldCreateTask,
    createTaskSuggestion,
    cta: selectedTask ? 'Start Focus' : 'Create Task',
  }
}

export default useStartNowEngine
