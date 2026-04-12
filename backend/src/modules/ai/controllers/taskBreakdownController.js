/**
 * AI Task Breakdown Controller
 * Handles task decomposition into actionable steps
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

async function taskBreakdownHandler(req, res) {
  const { task, subject, userStats, mode = 'balanced', availableMinutes } = req.body

  // Validation
  if (!task || typeof task !== 'object') {
    return res.status(400).json({
      message: 'Task object is required',
    })
  }

  if (!task.title || typeof task.title !== 'string') {
    return res.status(400).json({
      message: 'Task title is required',
    })
  }

  try {
    // Build prompt with context
    const prompt = buildPrompt({
      type: 'task_breakdown',
      input: task,
      context: {
        subject,
        userStats,
        mode,
        availableMinutes,
      },
    })

    // Call AI
    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.6,
      maxTokens: 1500,
    })

    // Return response
    res.json({
      taskTitle: task.title,
      breakdown: aiResponse.content,
      provider: aiResponse.provider,
      mode,
    })
  } catch (error) {
    console.error('Task breakdown handler error:', error.message)
    res.status(500).json({
      message: 'Failed to break down task',
      error: error.message,
    })
  }
}

module.exports = {
  taskBreakdownHandler,
}
