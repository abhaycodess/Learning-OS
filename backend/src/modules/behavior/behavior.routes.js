const express = require('express')
const { asyncHandler } = require('../../shared/asyncHandler')
const {
  setDailyContract,
  logSessionImpact,
  evaluateDailyLog,
  getTodayBehaviorStatus,
  getStreakStatus,
  getDailySummary,
} = require('./behavior.service')

const router = express.Router()

/**
 * POST /api/behavior/daily-contract
 * Set user's daily target minutes
 */
router.post(
  '/daily-contract',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing' })
    }

    const { dailyTargetMinutes } = req.body

    if (typeof dailyTargetMinutes !== 'number' || dailyTargetMinutes <= 0) {
      return res.status(400).json({
        message: 'Invalid dailyTargetMinutes - must be a positive number',
      })
    }

    const user = await setDailyContract(userId, dailyTargetMinutes)
    res.json({ message: 'Daily contract updated', behavior: user.behavior })
  })
)

/**
 * POST /api/behavior/log-session-impact
 * Log session impact when a session ends
 */
router.post(
  '/log-session-impact',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing' })
    }

    const { durationSec } = req.body

    if (typeof durationSec !== 'number' || durationSec < 0) {
      return res.status(400).json({
        message: 'Invalid durationSec - must be a non-negative number',
      })
    }

    const dailyLog = await logSessionImpact(userId, durationSec)
    res.json({
      message: 'Session impact logged',
      dailyLog,
    })
  })
)

/**
 * POST /api/behavior/evaluate
 * Evaluate today's daily log and update behavior stats
 */
router.post(
  '/evaluate',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing' })
    }

    const { dateKey } = req.body // optional, defaults to today

    const result = await evaluateDailyLog(userId, dateKey)
    res.json({
      message: 'Daily log evaluated',
      dailyLog: result.dailyLog,
      behavior: result.user.behavior,
    })
  })
)

/**
 * GET /api/behavior/today
 * Get today's behavior status and daily log
 */
router.get(
  '/today',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing' })
    }

    const result = await getTodayBehaviorStatus(userId)
    res.json(result)
  })
)

/**
 * GET /api/behavior/streak
 * Get user's streak status
 */
router.get(
  '/streak',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing' })
    }

    const streakStatus = await getStreakStatus(userId)
    res.json(streakStatus)
  })
)

/**
 * GET /api/behavior/summary?dateKey=YYYY-MM-DD
 * Returns summary for end-of-day review (defaults to yesterday)
 */
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing' })
    }

    const summary = await getDailySummary(userId, req.query?.dateKey || null)
    res.json(summary)
  }),
)

module.exports = { router: router, routerName: 'behavior' }
