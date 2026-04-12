const express = require('express')
const { Task } = require('./task.model')
const { asyncHandler } = require('../../shared/asyncHandler')
const { validateTask } = require('../../shared/validation')

const router = express.Router()

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    // Validate request body
    const validation = validateTask(req.body)
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      })
    }

    const created = await Task.create({
      ...req.body,
      userId,
    })
    res.status(201).json(created)
  }),
)

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    // Validate payload (only validate fields that are being updated)
    const validation = validateTask({ ...req.body, id: req.params.id, title: req.body.title || 'tmp', subjectId: req.body.subjectId || 'tmp', dueDate: req.body.dueDate || new Date() })
    if (!validation.valid && req.body.title || req.body.subjectId || req.body.dueDate) {
      // Only fail validation if trying to update core fields with bad data
      const coreValidation = {
        errors: validation.errors.filter(
          (e) => e.includes('title') || e.includes('subjectId') || e.includes('dueDate'),
        ),
      }
      if (coreValidation.errors.length > 0) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: coreValidation.errors,
        })
      }
    }

    const task = await Task.findOneAndUpdate(
      { id: req.params.id, userId },
      req.body,
      {
        new: true,
      },
    )

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json(task)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    const deleted = await Task.findOneAndDelete({ id: req.params.id, userId })

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' })
    }

    return res.json({ message: 'Task deleted', id: req.params.id })
  }),
)

module.exports = { taskRouter: router }
