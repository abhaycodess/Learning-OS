/**
 * AI Quiz Controller
 * Generates a study quiz for the current subject or focus area
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

async function quizHandler(req, res) {
  const { subject, userStats, count = 5, difficulty = 'beginner', focus = '' } = req.body

  if (subject && typeof subject !== 'object') {
    return res.status(400).json({
      message: 'Subject must be an object when provided',
    })
  }

  try {
    const prompt = buildPrompt({
      type: 'quiz',
      input: {
        count,
        difficulty,
        focus,
      },
      context: {
        subject,
        userStats,
      },
    })

    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.5,
      maxTokens: 1400,
    })

    res.json({
      quiz: aiResponse.content,
      provider: aiResponse.provider,
      count,
      difficulty,
    })
  } catch (error) {
    console.error('Quiz handler error:', error.message)
    res.status(500).json({
      message: 'Failed to generate quiz',
      error: error.message,
    })
  }
}

module.exports = {
  quizHandler,
}