const express = require('express')
const { Session } = require('../sessions/session.model')
const { Subject } = require('../subjects/subject.model')
const { AnalyticsEvent } = require('./analytics-event.model')
const { asyncHandler } = require('../../shared/asyncHandler')

const router = express.Router()

router.post(
  '/events',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const { eventType, experimentKey, variant, nudgeKey, context, severity, occurredAt, metadata } = req.body || {}

    if (!eventType || !variant || !nudgeKey) {
      return res.status(400).json({ message: 'eventType, variant, and nudgeKey are required' })
    }

    const created = await AnalyticsEvent.create({
      userId,
      eventType,
      experimentKey: experimentKey || 'nudge_copy_v1',
      variant,
      nudgeKey,
      context: context || 'dashboard',
      severity: severity || 'soft',
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      metadata: metadata || {},
    })

    res.status(201).json({ id: created._id, ok: true })
  }),
)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const [sessions, subjects] = await Promise.all([
      Session.find({ userId }).lean(),
      Subject.find({ userId }).lean(),
    ])

    const subjectById = new Map(subjects.map((subject) => [subject.id, subject.name]))

    const bySubject = sessions.reduce((acc, session) => {
      const name = subjectById.get(session.subjectId) || 'Unknown'
      acc[name] = (acc[name] || 0) + session.durationSec
      return acc
    }, {})

    const byDay = sessions.reduce((acc, session) => {
      acc[session.dateKey] = (acc[session.dateKey] || 0) + session.durationSec
      return acc
    }, {})

    res.json({ bySubject, byDay })
  }),
)

router.get(
  '/experiments/nudges',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const rows = await AnalyticsEvent.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { variant: '$variant', eventType: '$eventType' },
          count: { $sum: 1 },
        },
      },
    ])

    const summaryByVariant = {
      A: { impressions: 0, dismisses: 0, ctaClicks: 0 },
      B: { impressions: 0, dismisses: 0, ctaClicks: 0 },
    }

    rows.forEach((row) => {
      const variant = row._id.variant
      const eventType = row._id.eventType
      if (!summaryByVariant[variant]) return
      if (eventType === 'nudge_impression') summaryByVariant[variant].impressions = row.count
      if (eventType === 'nudge_dismiss') summaryByVariant[variant].dismisses = row.count
      if (eventType === 'nudge_cta_click') summaryByVariant[variant].ctaClicks = row.count
    })

    const computeRates = (entry) => {
      const impressions = entry.impressions || 0
      return {
        ...entry,
        ctaRate: impressions === 0 ? 0 : Number(((entry.ctaClicks / impressions) * 100).toFixed(1)),
        dismissRate: impressions === 0 ? 0 : Number(((entry.dismisses / impressions) * 100).toFixed(1)),
      }
    }

    const variantA = computeRates(summaryByVariant.A)
    const variantB = computeRates(summaryByVariant.B)

    res.json({
      experimentKey: 'nudge_copy_v1',
      variants: {
        A: variantA,
        B: variantB,
      },
      winnerByCtaRate:
        variantA.ctaRate === variantB.ctaRate ? 'tie' : variantA.ctaRate > variantB.ctaRate ? 'A' : 'B',
    })
  }),
)

router.get(
  '/advanced',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const sessions = await Session.find({ userId }).sort({ endedAt: -1 }).lean()

    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0,
        longestStreakDays: 0,
        currentStreakDays: 0,
        averageFocusScore: 0,
        bestStudyHour: null,
        weeklyMinutesTrend: [],
      })
    }

    const dateKeys = [...new Set(sessions.map((session) => session.dateKey))].sort()

    let longestStreakDays = 0
    let runningStreak = 0
    let previousDate = null
    for (const key of dateKeys) {
      const currentDate = new Date(`${key}T00:00:00.000Z`)
      if (!previousDate) {
        runningStreak = 1
      } else {
        const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
        runningStreak = diffDays === 1 ? runningStreak + 1 : 1
      }
      if (runningStreak > longestStreakDays) longestStreakDays = runningStreak
      previousDate = currentDate
    }

    let currentStreakDays = 0
    const today = new Date()
    const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    while (true) {
      const key = cursor.toISOString().slice(0, 10)
      if (!dateKeys.includes(key)) break
      currentStreakDays += 1
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }

    const sessionsWithReflection = sessions.filter(
      (session) => typeof session.reflection?.focusScore === 'number',
    )
    const averageFocusScore =
      sessionsWithReflection.length === 0
        ? 0
        : Number(
            (
              sessionsWithReflection.reduce((sum, session) => sum + session.reflection.focusScore, 0) /
              sessionsWithReflection.length
            ).toFixed(1),
          )

    const hoursMap = sessions.reduce((acc, session) => {
      const hour = new Date(session.startedAt).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    const bestStudyHour = Object.entries(hoursMap)
      .map(([hour, count]) => ({ hour: Number(hour), count }))
      .sort((a, b) => b.count - a.count)[0]?.hour ?? null

    const weeklyMinutesMap = sessions.reduce((acc, session) => {
      const weekKey = session.dateKey.slice(0, 7)
      acc[weekKey] = (acc[weekKey] || 0) + Math.round((session.durationSec || 0) / 60)
      return acc
    }, {})

    const weeklyMinutesTrend = Object.entries(weeklyMinutesMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([week, minutes]) => ({ week, minutes }))

    res.json({
      totalSessions: sessions.length,
      longestStreakDays,
      currentStreakDays,
      averageFocusScore,
      bestStudyHour,
      weeklyMinutesTrend,
    })
  }),
)

router.get(
  '/weak-areas',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const [sessions, subjects] = await Promise.all([
      Session.find({ userId }).sort({ endedAt: -1 }).lean(),
      Subject.find({ userId }).lean(),
    ])

    if (sessions.length < 5) {
      return res.json({
        totalSessions: sessions.length,
        weakAreas: [],
      })
    }

    const subjectById = new Map(
      subjects.map((subject) => [subject.id, subject.title || subject.name || 'Unknown']),
    )

    const bySubject = new Map()

    sessions.forEach((session) => {
      const name = session.subjectName || subjectById.get(session.subjectId) || 'Unknown'
      const current = bySubject.get(name) || {
        subject: name,
        sessions: 0,
        completedSessions: 0,
        totalFocusScore: 0,
        focusScoreCount: 0,
        distractionCount: 0,
      }

      current.sessions += 1
      if (session.taskCompleted) current.completedSessions += 1

      const focusScore = session.reflection?.focusScore
      if (typeof focusScore === 'number') {
        current.totalFocusScore += focusScore
        current.focusScoreCount += 1
      }

      if (Array.isArray(session.reflection?.distractions)) {
        current.distractionCount += session.reflection.distractions.length
      }

      bySubject.set(name, current)
    })

    const weakAreas = Array.from(bySubject.values())
      .map((entry) => {
        const completionRate = entry.sessions === 0 ? 0 : entry.completedSessions / entry.sessions
        const averageFocus =
          entry.focusScoreCount === 0 ? 0 : entry.totalFocusScore / entry.focusScoreCount
        const distractionRate = entry.sessions === 0 ? 0 : Math.min(1, entry.distractionCount / entry.sessions)

        const weaknessScore = Number(
          (
            (1 - completionRate) * 0.4 +
            (1 - averageFocus / 5) * 0.4 +
            distractionRate * 0.2
          ).toFixed(2),
        )

        const severity = weaknessScore >= 0.7 ? 'high' : weaknessScore >= 0.5 ? 'medium' : 'low'

        return {
          subject: entry.subject,
          weaknessScore,
          severity,
          sessions: entry.sessions,
          completionRate: Number((completionRate * 100).toFixed(1)),
          averageFocusScore: Number(averageFocus.toFixed(1)),
          distractionCount: entry.distractionCount,
          reason: `${Number((completionRate * 100).toFixed(1))}% completed, avg focus ${Number(
            averageFocus.toFixed(1),
          )}/5, ${entry.distractionCount} distraction${entry.distractionCount === 1 ? '' : 's'}`,
        }
      })
      .filter((entry) => entry.sessions >= 2 && entry.weaknessScore >= 0.35)
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 3)

    res.json({
      totalSessions: sessions.length,
      weakAreas,
    })
  }),
)

module.exports = { analyticsRouter: router }
