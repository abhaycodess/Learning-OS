const express = require('express')
const { Subject } = require('./subject.model')
const { Task } = require('../tasks/task.model')
const { asyncHandler } = require('../../shared/asyncHandler')
const { validateSubject } = require('../../shared/validation')

const router = express.Router()

function normalizeTopics(topics) {
  if (!Array.isArray(topics)) return []

  return topics
    .filter((topic) => topic && typeof topic === 'object')
    .map((topic) => ({
      id: String(topic.id || '').trim(),
      name: String(topic.name || '').trim(),
      subtopics: Array.isArray(topic.subtopics)
        ? topic.subtopics
            .map((entry) => {
              if (typeof entry === 'string') {
                const trimmed = entry.trim()
                if (!trimmed) return null
                return {
                  id: `legacy-${trimmed.toLowerCase().replace(/\s+/g, '-')}`,
                  name: trimmed,
                  notes: '',
                }
              }

              if (!entry || typeof entry !== 'object') return null
              const id = String(entry.id || '').trim()
              const name = String(entry.name || '').trim()
              if (!id || !name) return null

              return {
                id,
                name,
                notes: typeof entry.notes === 'string' ? entry.notes : '',
              }
            })
            .filter(Boolean)
        : [],
    }))
    .filter((topic) => topic.id && topic.name)
}

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const validation = validateSubject(req.body)
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      })
    }

    const created = await Subject.create({
      ...req.body,
      emoji: typeof req.body.emoji === 'string' ? req.body.emoji : '📘',
      coverImage: typeof req.body.coverImage === 'string' ? req.body.coverImage : '',
      topics: normalizeTopics(req.body.topics),
      userId,
    })
    res.status(201).json(created)
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const subject = await Subject.findOne({ id: req.params.id, userId }).lean()
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    return res.json(subject)
  }),
)

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const payload = {}
    if (typeof req.body.name === 'string') {
      payload.name = req.body.name.trim()
      if (!payload.name) {
        return res.status(400).json({ message: 'Subject name cannot be empty' })
      }
    }

    if (typeof req.body.emoji === 'string') {
      payload.emoji = req.body.emoji.trim() || '📘'
    }

    if (typeof req.body.coverImage === 'string') {
      payload.coverImage = req.body.coverImage
    }

    if (req.body.topics !== undefined) {
      if (!Array.isArray(req.body.topics)) {
        return res.status(400).json({ message: 'Topics must be an array' })
      }

      const invalidTopic = req.body.topics.find(
        (topic) =>
          !topic ||
          typeof topic.id !== 'string' ||
          !topic.id.trim() ||
          typeof topic.name !== 'string' ||
          !topic.name.trim() ||
          (topic.subtopics !== undefined && !Array.isArray(topic.subtopics)),
      )

      if (invalidTopic) {
        return res.status(400).json({ message: 'Each topic must include non-empty id and name' })
      }

      payload.topics = normalizeTopics(req.body.topics)
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided' })
    }

    const updated = await Subject.findOneAndUpdate({ id: req.params.id, userId }, payload, {
      new: true,
    })

    if (!updated) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    return res.json(updated)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const deleted = await Subject.findOneAndDelete({ id: req.params.id, userId })

    if (!deleted) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    const taskDeleteResult = await Task.deleteMany({ userId, subjectId: req.params.id })

    return res.json({
      message: 'Subject deleted',
      id: req.params.id,
      deletedTasks: taskDeleteResult.deletedCount || 0,
    })
  }),
)

module.exports = { subjectRouter: router }
