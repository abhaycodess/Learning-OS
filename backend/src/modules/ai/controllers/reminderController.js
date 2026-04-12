/**
 * AI Reminder Controller
 * Generates short, actionable study reminders based on user momentum.
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

async function reminderHandler(req, res) {
  const {
    status,
    targetMinutes,
    actualMinutes,
    streakCount,
    weekActiveDays,
    avgSessionMinutes,
    weakAreas,
    topSubjects,
    subject,
    task,
  } = req.body || {}

  try {
    const prompt = buildPrompt({
      type: 'reminder',
      input: {
        status,
        targetMinutes,
        actualMinutes,
        streakCount,
        weekActiveDays,
        avgSessionMinutes,
        weakAreas,
        topSubjects,
      },
      context: {
        subject,
        task,
      },
    })

    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.4,
      maxTokens: 180,
    })

    res.json({
      reminder: aiResponse.content,
      provider: aiResponse.provider,
    })
  } catch (error) {
    console.error('Reminder handler error:', error.message)
    res.status(500).json({
      message: 'Failed to generate reminder',
      error: error.message,
    })
  }
}

module.exports = {
  reminderHandler,
}