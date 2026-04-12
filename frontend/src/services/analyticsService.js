import { apiClient } from './apiClient.js'

export const analyticsService = {
  trackEvent: (payload) =>
    apiClient('/analytics/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getNudgeExperimentSummary: () => apiClient('/analytics/experiments/nudges'),
  getAdvancedAnalytics: () => apiClient('/analytics/advanced'),
  getWeakAreas: () => apiClient('/analytics/weak-areas'),
}
