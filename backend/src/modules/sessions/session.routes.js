const express = require('express')
const { Session } = require('./session.model')
const { asyncHandler } = require('../../shared/asyncHandler')
const { validateSession, validateSessionReflection } = require('../../shared/validation')
const { logSessionImpact } = require('../behavior/behavior.service')
const { getAIClient } = require('../ai/services/aiClient')
const { buildPrompt } = require('../ai/services/promptBuilder')

const router = express.Router()

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const validation = validateSession(req.body)
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Invalid session payload',
        errors: validation.errors,
      })
    }

    const created = await Session.create({
      ...req.body,
      userId,
    })
    res.status(201).json(created)
  }),
)

router.patch(
  '/:id/reflection',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const validation = validateSessionReflection(req.body)
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Invalid reflection payload',
        errors: validation.errors,
      })
    }

    const updated = await Session.findOneAndUpdate(
      { userId, id: req.params.id },
      {
        $set: {
          reflection: {
            focusScore: req.body.focusScore,
            completionNote: req.body.completionNote || '',
            distractions: req.body.distractions || [],
            completedAt: req.body.completedAt ? new Date(req.body.completedAt) : new Date(),
          },
        },
      },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ message: 'Session not found' })
    }

    // Log session impact in behavior system
    try {
      await logSessionImpact(userId, updated.durationSec)
    } catch (error) {
      console.error('Error logging session impact:', error)
      // Don't fail the request if behavior logging fails
    }

    let finalSession = updated

    try {
      const summaryPrompt = buildPrompt({
        type: 'session_summary',
        input: {
          taskTitle: updated.taskTitle,
          subjectName: updated.subjectName,
          durationMinutes: Math.max(0, Math.round((updated.durationSec || 0) / 60)),
          focusScore: updated.reflection?.focusScore,
          completionNote: updated.reflection?.completionNote || '',
          distractions: updated.reflection?.distractions || [],
          lapCount: updated.lapCount || 0,
        },
      })

      const aiClient = getAIClient()
      const aiResponse = await aiClient.call({
        prompt: summaryPrompt,
        temperature: 0.35,
        maxTokens: 300,
      })

      finalSession = await Session.findOneAndUpdate(
        { userId, id: req.params.id },
        {
          $set: {
            summary: aiResponse.content,
          },
        },
        { new: true },
      )
    } catch (error) {
      console.error('Session summary generation failed:', error.message)
    }

    res.json(finalSession)
  }),
)

module.exports = { sessionRouter: router }
