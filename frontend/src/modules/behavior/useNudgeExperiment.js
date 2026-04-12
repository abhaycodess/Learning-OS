import { useMemo } from 'react'
import { analyticsService } from '../../services/analyticsService.js'

const EXPERIMENT_KEY = 'nudge_copy_v1'
const STORAGE_KEY = 'learningos.nudge.variant'

function getOrCreateVariant() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing === 'A' || existing === 'B') return existing

  const assigned = Math.random() < 0.5 ? 'A' : 'B'
  localStorage.setItem(STORAGE_KEY, assigned)
  return assigned
}

export function useNudgeExperiment() {
  const variant = useMemo(() => getOrCreateVariant(), [])

  const trackNudgeEvent = async ({ eventType, nudgeKey, context, severity, metadata = {} }) => {
    try {
      await analyticsService.trackEvent({
        eventType,
        experimentKey: EXPERIMENT_KEY,
        variant,
        nudgeKey,
        context,
        severity,
        metadata,
      })
    } catch {
      // Keep UX smooth even if analytics tracking fails.
    }
  }

  return {
    experimentKey: EXPERIMENT_KEY,
    variant,
    trackNudgeEvent,
  }
}

export default useNudgeExperiment
