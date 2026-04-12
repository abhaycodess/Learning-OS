/**
 * AI Summarize Controller
 * Handles note summarization
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

async function summarizeHandler(req, res) {
  const { notes, subject, task, userStats } = req.body

  // Validation
  if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
    return res.status(400).json({
      message: 'Notes content is required',
    })
  }

  try {
    // Build prompt with context
    const prompt = buildPrompt({
      type: 'summarize',
      input: notes.trim(),
      context: {
        subject,
        task,
        userStats,
      },
    })

    // Call AI
    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.5,
      maxTokens: 1000,
    })

    // Return response
    res.json({
      originalLength: notes.length,
      summary: aiResponse.content,
      provider: aiResponse.provider,
    })
  } catch (error) {
    console.error('Summarize handler error:', error.message)
    res.status(500).json({
      message: 'Failed to summarize notes',
      error: error.message,
    })
  }
}

module.exports = {
  summarizeHandler,
}
