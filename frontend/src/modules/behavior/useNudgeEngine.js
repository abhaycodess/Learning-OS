/**
 * useNudgeEngine - Behavior-Aware Context Nudging
 * 
 * Detects:
 * - User opened page but hasn't acted (pending tasks exist)
 * - Inactivity periods (user idle for X seconds)
 * - Page entry patterns (just navigated to page)
 * 
 * Returns contextual nudge messages to reduce decision friction
 * and push toward immediate action.
 * 
 * Usage:
 * const nudge = useNudgeEngine({
 *   pageOpenTimeMs: 5000,  // User has been on page for 5 seconds
 *   pendingTaskCount: 3,
 *   completedTasksToday: 2,
 *   lastSessionMinutesAgo: 180,
 * })
 * // nudge.hasInactivityNudge === true
 * // nudge.message === "Still planning? Or starting?"
 * // nudge.severity === "soft" | "medium" | "strong"
 */

import { useState, useEffect } from 'react'

/**
 * Nudge message templates based on context
 */
const NUDGE_MESSAGES = {
  // Inactivity nudges - user on page but no action
  inactivityPlanning: {
    message: 'Still planning? Or starting?',
    severity: 'soft',
    cta: 'Start now',
  },
  inactivityPageEntry: {
    message: 'You opened tasks. Now what?',
    severity: 'soft',
    cta: 'Pick one',
  },
  inactivityPending: {
    message: 'One task is pending. You know which one.',
    severity: 'medium',
    cta: 'Do it',
  },

  // Multi-task nudges
  multiTaskParalysis: {
    message: `Too many tasks at once. Pick the smallest one.`,
    severity: 'medium',
    cta: 'Let\'s narrow it down',
  },

  // Session nudges
  noSessionToday: {
    message: 'No session yet today. Consistency > perfection.',
    severity: 'soft',
    cta: 'Start session',
  },
  lastSessionWasLong: {
    message: `You did 45 minutes yesterday. Match it today?`,
    severity: 'soft',
    cta: 'Go',
  },

  // Completion nudges
  allCompleted: {
    message: 'All planned done. Impressive. Rest or add more?',
    severity: 'soft',
    cta: 'View all',
  },
  partialComplete: {
    message: '${remaining} more to go. Finish today?',
    severity: 'soft',
    cta: 'Continue',
  },
}

export function useNudgeEngine({
  pageOpenTimeMs = 0,
  pendingTaskCount = 0,
  completedTasksToday = 0,
  plannedTasksToday = 0,
  lastSessionMinutesAgo = null,
  context = 'dashboard', // 'dashboard', 'tasks', 'focus'
  variant = 'A',
  onEvent,
} = {}) {
  const [nudge, setNudge] = useState(null)
  const [nudgeSeenAt, setNudgeSeenAt] = useState(null)
  const [activeNudgeKey, setActiveNudgeKey] = useState(null)

  const copyByVariant = {
    A: {
      inactivityPlanning: 'Still planning? Or starting?',
      inactivityPageEntry: 'You opened tasks. Now what?',
      inactivityPending: 'One task is pending. You know which one.',
      multiTaskParalysis: 'Too many tasks at once. Pick the smallest one.',
      noSessionToday: 'No session yet today. Consistency > perfection.',
      allCompleted: 'All planned done. Impressive. Rest or add more?',
    },
    B: {
      inactivityPlanning: 'Decision done. Start one task for 10 minutes.',
      inactivityPageEntry: 'Pick one task. Start now. Momentum first.',
      inactivityPending: 'Only one task left. Finish it before you switch.',
      multiTaskParalysis: 'Cut scope: choose one tiny task and close it.',
      noSessionToday: 'No focus block yet. Run one short session now.',
      allCompleted: 'Plan completed. Protect the streak or recover.',
    },
  }

  const variantCopy = copyByVariant[variant] || copyByVariant.A

  useEffect(() => {
    // Nudge logic - fires when user hits inactivity threshold or page entry threshold
    let nudgeToShow = null
    let nudgeKey = null

    // PAGE ENTRY NUDGE (0-3s after opening page)
    if (pageOpenTimeMs > 500 && pageOpenTimeMs < 3000 && pendingTaskCount > 0) {
      nudgeToShow = NUDGE_MESSAGES.inactivityPageEntry
      nudgeKey = 'inactivityPageEntry'
    }

    // INACTIVITY NUDGE (3-8s with no action)
    if (pageOpenTimeMs > 3000 && pageOpenTimeMs < 8000 && pendingTaskCount > 0) {
      if (pendingTaskCount === 1) {
        nudgeToShow = NUDGE_MESSAGES.inactivityPending
        nudgeKey = 'inactivityPending'
      } else if (pendingTaskCount > 3) {
        nudgeToShow = NUDGE_MESSAGES.multiTaskParalysis
        nudgeKey = 'multiTaskParalysis'
      } else {
        nudgeToShow = NUDGE_MESSAGES.inactivityPlanning
        nudgeKey = 'inactivityPlanning'
      }
    }

    // NO SESSION TODAY NUDGE
    if (
      context === 'dashboard' &&
      pageOpenTimeMs > 2000 &&
      pendingTaskCount > 0 &&
      lastSessionMinutesAgo === null
    ) {
      nudgeToShow = NUDGE_MESSAGES.noSessionToday
      nudgeKey = 'noSessionToday'
    }

    // ALL COMPLETED NUDGE
    if (plannedTasksToday > 0 && completedTasksToday === plannedTasksToday) {
      nudgeToShow = NUDGE_MESSAGES.allCompleted
      nudgeKey = 'allCompleted'
    }

    // PARTIAL COMPLETION NUDGE
    if (
      plannedTasksToday > 0 &&
      completedTasksToday > 0 &&
      completedTasksToday < plannedTasksToday
    ) {
      const remaining = plannedTasksToday - completedTasksToday
      nudgeToShow = {
        ...NUDGE_MESSAGES.partialComplete,
        message: NUDGE_MESSAGES.partialComplete.message.replace(
          '${remaining}',
          remaining,
        ),
      }
      nudgeKey = 'partialComplete'
    }

    // Only show nudge once per page entry (unless explicitly dismissed)
    if (nudgeToShow && !nudgeSeenAt) {
      const withVariantCopy = {
        ...nudgeToShow,
        message: variantCopy[nudgeKey] || nudgeToShow.message,
      }

      setNudge(withVariantCopy)
      setNudgeSeenAt(Date.now())
      setActiveNudgeKey(nudgeKey)

      if (onEvent && nudgeKey) {
        onEvent({
          eventType: 'nudge_impression',
          nudgeKey,
          context,
          severity: withVariantCopy.severity,
        })
      }
    }
  }, [pageOpenTimeMs, pendingTaskCount, completedTasksToday, plannedTasksToday, lastSessionMinutesAgo, context, nudgeSeenAt, onEvent, variantCopy])

  const dismissNudge = () => {
    if (onEvent && activeNudgeKey && nudge) {
      onEvent({
        eventType: 'nudge_dismiss',
        nudgeKey: activeNudgeKey,
        context,
        severity: nudge.severity,
      })
    }
    setNudge(null)
  }

  const trackNudgeCta = () => {
    if (onEvent && activeNudgeKey && nudge) {
      onEvent({
        eventType: 'nudge_cta_click',
        nudgeKey: activeNudgeKey,
        context,
        severity: nudge.severity,
      })
    }
  }

  return {
    nudge,
    hasNudge: !!nudge,
    dismissNudge,
    trackNudgeCta,
    nudgeSeenAt,
    variant,
  }
}

export default useNudgeEngine
