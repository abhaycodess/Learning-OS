/**
 * AI Note Analyzer Controller
 * Reviews notes and returns strengths, gaps, and actionable improvements.
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

async function noteAnalyzerHandler(req, res) {
  const { notes, subject, task, userStats } = req.body || {}

  if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
    return res.status(400).json({ message: 'Notes content is required' })
  }

  try {
    const prompt = buildPrompt({
      type: 'note_analyzer',
      input: notes.trim(),
      context: {
        subject,
        task,
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
      analysis: aiResponse.content,
      provider: aiResponse.provider,
      originalLength: notes.length,
    })
  } catch (error) {
    console.error('Note analyzer handler error:', error.message)
    res.status(500).json({
      message: 'Failed to analyze notes',
      error: error.message,
    })
  }
}

module.exports = {
  noteAnalyzerHandler,
}