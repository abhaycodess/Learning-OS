import { apiClient } from './apiClient'

export const behaviorService = {
  /**
   * Set daily contract (target minutes per day)
   */
  setDailyContract: (dailyTargetMinutes) =>
    apiClient('/behavior/daily-contract', {
      method: 'POST',
      body: JSON.stringify({ dailyTargetMinutes }),
    }),

  /**
   * Log session impact when a session ends
   */
  logSessionImpact: (durationSec) =>
    apiClient('/behavior/log-session-impact', {
      method: 'POST',
      body: JSON.stringify({ durationSec }),
    }),

  /**
   * Evaluate today's daily log and update behavior stats
   */
  evaluateDailyLog: (dateKey = null) =>
    apiClient('/behavior/evaluate', {
      method: 'POST',
      body: JSON.stringify(dateKey ? { dateKey } : {}),
    }),

  /**
   * Get today's behavior status
   */
  getTodayStatus: () => apiClient('/behavior/today'),

  /**
   * Get streak status
   */
  getStreakStatus: () => apiClient('/behavior/streak'),

  /**
   * Get end-of-day summary (defaults to yesterday)
   */
  getDailySummary: (dateKey = null) =>
    apiClient(`/behavior/summary${dateKey ? `?dateKey=${dateKey}` : ''}`),
}
