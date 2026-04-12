/**
 * AI Routes
 * Endpoints for AI Study Coach features
 */

const express = require('express')
const { asyncHandler } = require('../../shared/asyncHandler')
const { chatHandler, clearConversationHandler } = require('./controllers/chatController')
const { summarizeHandler } = require('./controllers/summarizeController')
const { doubtHandler } = require('./controllers/doubtController')
const { taskBreakdownHandler } = require('./controllers/taskBreakdownController')
const { dailyPlanHandler } = require('./controllers/dailyPlanController')
const { quizHandler } = require('./controllers/quizController')
const { reminderHandler } = require('./controllers/reminderController')
const { noteAnalyzerHandler } = require('./controllers/noteAnalyzerController')
const { featureToolHandler } = require('./controllers/featureToolsController')
const { insightHandler } = require('./controllers/insightController')

const router = express.Router()

/**
 * POST /api/ai/chat
 * Free-form chat interaction with study coach
 *
 * Body:
 * - message: string (required)
 * - subject?: { title, description }
 * - task?: { title, description }
 * - userStats?: { streak, weakAreas, todayProgress }
 */
router.post('/chat', asyncHandler(chatHandler))
router.delete('/chat/:conversationId', asyncHandler(clearConversationHandler))

/**
 * POST /api/ai/summarize
 * Summarize study notes
 *
 * Body:
 * - notes: string (required, the notes to summarize)
 * - subject?: { title, description }
 * - task?: { title, description }
 * - userStats?: { streak, weakAreas, todayProgress }
 */
router.post('/summarize', asyncHandler(summarizeHandler))

/**
 * POST /api/ai/doubt
 * Solve a doubt / answer a question
 *
 * Body:
 * - question: string (required)
 * - mode?: 'quick' | 'deep' (default: 'quick')
 * - subject?: { title, description }
 * - task?: { title, description }
 * - userStats?: { streak, weakAreas, todayProgress }
 */
router.post('/doubt', asyncHandler(doubtHandler))

/**
 * POST /api/ai/task-breakdown
 * Break down a task into steps
 *
 * Body:
 * - task: { title: string, description?: string } (required)
 * - subject?: { title, description }
 * - userStats?: { streak, weakAreas, todayProgress }
 */
router.post('/task-breakdown', asyncHandler(taskBreakdownHandler))

/**
 * POST /api/ai/quiz
 * Generate a study quiz from the current subject or focus area
 */
router.post('/quiz', asyncHandler(quizHandler))

/**
 * POST /api/ai/daily-plan
 * Generate a practical study plan for today
 */
router.post('/daily-plan', asyncHandler(dailyPlanHandler))

/**
 * POST /api/ai/reminder
 * Generate a short personalized study reminder
 */
router.post('/reminder', asyncHandler(reminderHandler))

/**
 * POST /api/ai/note-analyzer
 * Analyze notes to identify strengths, gaps, and improvements
 */
router.post('/note-analyzer', asyncHandler(noteAnalyzerHandler))

/**
 * POST /api/ai/feature/:featureId
 * Advanced roadmap features (10 implemented tools)
 */
router.post('/feature/:featureId', asyncHandler(featureToolHandler))

/**
 * GET /api/ai/insights
 * Proactive AI-generated study suggestions based on behavior and activity signals
 */
router.get('/insights', asyncHandler(insightHandler))

module.exports = { aiRouter: router }
