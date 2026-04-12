/**
 * AI Doubt Solver Controller
 * Handles question answering and explanation
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

async function doubtHandler(req, res) {
  const { question, mode = 'quick', subject, task, userStats } = req.body

  // Validation
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({
      message: 'Question is required',
    })
  }

  // Validate mode
  if (!['quick', 'deep'].includes(mode)) {
    return res.status(400).json({
      message: 'Mode must be "quick" or "deep"',
    })
  }

  try {
    // Build prompt with context
    const prompt = buildPrompt({
      type: 'doubt',
      input: question.trim(),
      context: {
        subject,
        task,
        userStats,
        mode,
      },
    })

    // Call AI with temperature based on mode
    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: mode === 'deep' ? 0.7 : 0.5,
      maxTokens: mode === 'deep' ? 1500 : 800,
    })

    // Return response
    res.json({
      question: question,
      mode: mode,
      explanation: aiResponse.content,
      provider: aiResponse.provider,
    })
  } catch (error) {
    console.error('Doubt handler error:', error.message)
    res.status(500).json({
      message: 'Failed to solve doubt',
      error: error.message,
    })
  }
}

module.exports = {
  doubtHandler,
}
