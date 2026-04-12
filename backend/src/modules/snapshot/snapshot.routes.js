const express = require('express')
const { Task } = require('../tasks/task.model')
const { Subject } = require('../subjects/subject.model')
const { Session } = require('../sessions/session.model')
const { asyncHandler } = require('../../shared/asyncHandler')

const router = express.Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const [tasks, subjects, sessions] = await Promise.all([
      Task.find({ userId }).sort({ dueDate: -1 }).limit(120).lean(),
      Subject.find({ userId }).lean(),
      Session.find({ userId }).sort({ endedAt: -1 }).limit(240).lean(),
    ])

    res.json({
      tasks,
      subjects,
      sessions,
    })
  }),
)

module.exports = { snapshotRouter: router }
