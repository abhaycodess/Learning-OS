const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../users/user.model')
const { asyncHandler } = require('../../shared/asyncHandler')
const { requireAuth } = require('../../shared/authMiddleware')

const router = express.Router()

const GOAL_OPTIONS = new Set(['crack-exam', 'improve-concepts', 'learn-skills', 'stay-consistent'])
const STUDY_PREFERENCE_OPTIONS = new Set(['videos', 'notes', 'practice', 'mixed'])
const LEVEL_OPTIONS = new Set(['beginner', 'intermediate', 'advanced'])
const PREFERRED_STUDY_TIME_OPTIONS = new Set(['morning', 'afternoon', 'night'])
const PAIN_POINT_OPTIONS = new Set([
  'Procrastination',
  'Distractions',
  'Lack of clarity',
  'Inconsistency',
  'Exam anxiety',
])

function toCleanArray(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map((entry) => String(entry || '').trim()).filter(Boolean))]
}

function toUserPayload(userDoc) {
  const user = typeof userDoc.toObject === 'function' ? userDoc.toObject() : userDoc
  const profile = user.profile || {}

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    onboardingCompleted: Boolean(user.onboardingCompleted),
    profile: {
      id: user._id,
      name: user.name,
      nickname: profile.nickname || '',
      role: profile.role || '',
      goal: Array.isArray(profile.goal) ? profile.goal : [],
      subjects: Array.isArray(profile.subjects) ? profile.subjects : [],
      studyPreference: Array.isArray(profile.studyPreference) ? profile.studyPreference : [],
      level: profile.level || 'beginner',
      dailyGoal: profile.dailyGoal || '',
      preferredStudyTime: profile.preferredStudyTime || '',
      painPoints: Array.isArray(profile.painPoints) ? profile.painPoints : [],
      remindersEnabled: Boolean(profile.remindersEnabled),
      streakEnabled: profile.streakEnabled !== false,
      profilePhoto: profile.profilePhoto || '',
      createdAt: profile.createdAt || user.createdAt,
      updatedAt: profile.updatedAt || user.updatedAt,
    },
  }
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

// POST /api/auth/signup
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      })
    }

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({
        message: 'Email already in use',
      })
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      onboardingCompleted: false,
      profile: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: toUserPayload(user),
    })
  })
)

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      })
    }

    // Find user and get password
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password)
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    // Generate token
    const token = generateToken(user._id)

    // Return user data and token
    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: toUserPayload(user),
    })
  })
)

// POST /api/auth/logout (optional - handled by frontend)
router.post('/logout', requireAuth, (req, res) => {
  res.status(200).json({
    message: 'Logged out successfully',
  })
})

// GET /api/auth/user (protected - needs token verification)
router.get(
  '/user',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      user: toUserPayload(user),
    })
  })
)

// GET /api/auth/profile
router.get(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ profile: toUserPayload(user).profile })
  })
)

// PUT /api/auth/profile
router.put(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const body = req.body || {}
    const existingProfile = user.profile || {}

    const nextName = typeof body.name === 'string' ? body.name.trim() : user.name
    if (!nextName) {
      return res.status(400).json({ message: 'Name is required.' })
    }

    const nextRole = typeof body.role === 'string' ? body.role.trim() : existingProfile.role
    if (nextRole && !['school', 'college', 'selfLearner'].includes(nextRole)) {
      return res.status(400).json({ message: 'Invalid role selected.' })
    }

    const nextGoals = body.goal !== undefined ? toCleanArray(body.goal) : existingProfile.goal || []
    if (!nextGoals.every((item) => GOAL_OPTIONS.has(item))) {
      return res.status(400).json({ message: 'Invalid goal selection.' })
    }

    const nextStudyPreference =
      body.studyPreference !== undefined ? toCleanArray(body.studyPreference) : existingProfile.studyPreference || []
    if (!nextStudyPreference.every((item) => STUDY_PREFERENCE_OPTIONS.has(item))) {
      return res.status(400).json({ message: 'Invalid study preference selection.' })
    }

    const nextLevel = typeof body.level === 'string' ? body.level.trim() : existingProfile.level || 'beginner'
    if (!LEVEL_OPTIONS.has(nextLevel)) {
      return res.status(400).json({ message: 'Invalid learning level selected.' })
    }

    const nextPreferredStudyTime =
      typeof body.preferredStudyTime === 'string'
        ? body.preferredStudyTime.trim()
        : existingProfile.preferredStudyTime || ''

    if (nextPreferredStudyTime && !PREFERRED_STUDY_TIME_OPTIONS.has(nextPreferredStudyTime)) {
      return res.status(400).json({ message: 'Invalid preferred study time selected.' })
    }

    const nextPainPoints =
      body.painPoints !== undefined ? toCleanArray(body.painPoints) : existingProfile.painPoints || []
    if (!nextPainPoints.every((item) => PAIN_POINT_OPTIONS.has(item))) {
      return res.status(400).json({ message: 'Invalid pain point selection.' })
    }

    if (!user.profile) {
      user.profile = {}
    }

    user.name = nextName
    user.profile.nickname = typeof body.nickname === 'string' ? body.nickname.trim() : existingProfile.nickname || ''
    user.profile.role = nextRole || ''
    user.profile.goal = nextGoals
    user.profile.subjects = body.subjects !== undefined ? toCleanArray(body.subjects) : existingProfile.subjects || []
    user.profile.studyPreference = nextStudyPreference
    user.profile.level = nextLevel
    user.profile.dailyGoal =
      typeof body.dailyGoal === 'string' ? body.dailyGoal.trim() : existingProfile.dailyGoal || ''
    user.profile.preferredStudyTime = nextPreferredStudyTime
    user.profile.painPoints = nextPainPoints
    user.profile.remindersEnabled =
      body.remindersEnabled !== undefined ? Boolean(body.remindersEnabled) : Boolean(existingProfile.remindersEnabled)
    user.profile.streakEnabled =
      body.streakEnabled !== undefined ? Boolean(body.streakEnabled) : existingProfile.streakEnabled !== false
    user.profile.profilePhoto =
      typeof body.profilePhoto === 'string' ? body.profilePhoto : existingProfile.profilePhoto || ''

    if (!user.profile.createdAt) {
      user.profile.createdAt = new Date()
    }
    user.profile.updatedAt = new Date()

    if (body.markOnboardingComplete === true) {
      user.onboardingCompleted = true
    }

    await user.save()

    res.status(200).json({
      message: 'Profile updated successfully',
      user: toUserPayload(user),
      profile: toUserPayload(user).profile,
    })
  })
)

module.exports = { authRouter: router }
