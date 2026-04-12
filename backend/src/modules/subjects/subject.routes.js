const express = require('express')
const { Subject } = require('./subject.model')
const { asyncHandler } = require('../../shared/asyncHandler')

const router = express.Router()

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const created = await Subject.create({
      ...req.body,
      userId,
    })
    res.status(201).json(created)
  }),
)

module.exports = { subjectRouter: router }
