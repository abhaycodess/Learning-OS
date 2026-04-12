/**
 * AI Daily Plan Controller
 * Generates a focused study plan for the day
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

async function dailyPlanHandler(req, res) {
  const { tasks = [], subject, userStats, availableMinutes, studyTime } = req.body

  if (!Array.isArray(tasks)) {
    return res.status(400).json({
      message: 'Tasks must be an array',
    })
  }

  try {
    const prompt = buildPrompt({
      type: 'daily_plan',
      input: {
        tasks,
        availableMinutes,
        studyTime,
      },
      context: {
        subject,
        userStats,
      },
    })

    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.45,
      maxTokens: 1200,
    })

    res.json({
      dailyPlan: aiResponse.content,
      provider: aiResponse.provider,
      availableMinutes: availableMinutes || 60,
    })
  } catch (error) {
    console.error('Daily plan handler error:', error.message)
    res.status(500).json({
      message: 'Failed to generate daily plan',
      error: error.message,
    })
  }
}

module.exports = {
  dailyPlanHandler,
}