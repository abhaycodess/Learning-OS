/**
 * Honest Empty States - Behavioral Communication
 * 
 * Instead of:
 * "No tasks yet"
 * 
 * Use:
 * "Nothing here. That's the problem."
 * "You planned nothing. So nothing will happen."
 * 
 * These states acknowledge reality while gently pushing toward action.
 * Each includes a contextual CTA.
 */

import React from 'react'

// Empty state messages by context
const EMPTY_STATES = {
  // Tasks Page
  tasksEmpty: {
    title: "Nothing here. That's the problem.",
    subtitle: 'You planned 0 tasks. 0 tasks will get done.',
    cta: 'Create first task',
    icon: '📝',
    href: '/tasks/create',
  },

  tasksNoneToday: {
    title: 'No tasks for today.',
    subtitle: 'Plan something, or nothing happens.',
    cta: 'Plan today',
    icon: '📅',
    href: '/tasks/plan',
  },

  tasksAllComplete: {
    title: 'Everything done.',
    subtitle: 'You actually finished what you planned. Rare.',
    cta: 'Add more tasks',
    icon: '✅',
    context: 'celebration',
  },

  // Focus Page
  focusNoTask: {
    title: 'No task selected.',
    subtitle: 'Pick something or start a quick 25-min session.',
    cta: 'Select task',
    icon: '⚡',
    href: '/tasks',
  },

  focusNoSessions: {
    title: 'No sessions yet.',
    subtitle: 'First session is always the hardest.',
    cta: 'Start now',
    icon: '🎯',
    href: '/focus?quickStart=true',
  },

  // Subjects Page
  subjectsEmpty: {
    title: 'No subjects added.',
    subtitle: 'Without subjects, learning is just wandering.',
    cta: 'Add first subject',
    icon: '📚',
    href: '/subjects/create',
  },

  // Analytics/Progress
  noProgress: {
    title: `No data yet.`,
    subtitle: 'Start a session and we will have stories to tell.',
    cta: 'Begin focus session',
    icon: '📊',
    href: '/focus?quickStart=true',
  },

  noSessionsThisWeek: {
    title: 'No sessions this week.',
    subtitle: 'Consistency beats intensity. Session by session.',
    cta: 'Log a session',
    icon: '📈',
    href: '/focus?quickStart=true',
  },

  // Landing/First Time
  onboardingStart: {
    title: 'Welcome.',
    subtitle: 'Answer 8 questions. Build better learning habits.',
    cta: 'Start',
    icon: '🚀',
  },
}

/**
 * EmptyState Component - Reusable across all pages
 *
 * Usage:
 * <EmptyState state="tasksEmpty" />
 * <EmptyState {...customEmptyState} />
 */
export function EmptyState({
  title,
  subtitle,
  cta,
  icon = '○',
  href,
  onClick,
  context = 'neutral',
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-16 px-6 text-center
        min-h-[400px] rounded-lg
        ${
          context === 'celebration'
            ? 'bg-gradient-to-br from-purple-50 to-pink-50'
            : 'bg-gray-50'
        }
      `}
    >
      <div className={`text-5xl mb-4 ${context === 'celebration' ? 'animate-bounce' : ''}`}>
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mb-6">{subtitle}</p>

      {href && (
        <a href={href} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          {cta}
        </a>
      )}

      {onClick && (
        <button
          onClick={onClick}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          {cta}
        </button>
      )}
    </div>
  )
}

/**
 * Hook to pick appropriate empty state based on context
 */
export function useEmptyState(pageType, data = {}) {
  switch (pageType) {
    case 'tasks':
      if (data.userPlannedCount === 0) {
        return EMPTY_STATES.tasksEmpty
      }
      if (data.todayCount === 0) {
        return EMPTY_STATES.tasksNoneToday
      }
      if(data.allCompleted) {
        return EMPTY_STATES.tasksAllComplete
      }
      break

    case 'focus':
      if (!data.selectedTask) {
        return EMPTY_STATES.focusNoTask
      }
      if (data.sessionCount === 0) {
        return EMPTY_STATES.focusNoSessions
      }
      break

    case 'subjects':
      if (data.subjectCount === 0) {
        return EMPTY_STATES.subjectsEmpty
      }
      break

    case 'analytics':
      if (data.sessionCount === 0) {
        return EMPTY_STATES.noProgress
      }
      if (data.weekSessionCount === 0) {
        return EMPTY_STATES.noSessionsThisWeek
      }
      break

    case 'onboarding':
      return EMPTY_STATES.onboardingStart

    default:
      return null
  }
}

export default EmptyState
