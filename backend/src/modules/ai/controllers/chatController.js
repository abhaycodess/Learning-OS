/**
 * AI Chat Controller
 * Handles free-form chat interactions with context
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')
const mongoose = require('mongoose')
const {
  createConversation,
  getConversation,
  appendMessage,
  getRecentMessages,
  deleteConversation,
  CONTEXT_LIMIT,
  sanitizeForPrompt,
} = require('../services/conversationService')

const FALLBACK_CHAT_MESSAGE = 'Something went wrong. Try again.'

function formatConversationContext(messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'No previous messages.'
  }

  return messages
    .map((msg) => {
      const actor = msg.role === 'assistant' ? 'AI' : msg.role === 'system' ? 'System' : 'User'
      return `${actor}: ${msg.content}`
    })
    .join('\n')
}

async function chatHandler(req, res) {
  const { message, subject, task, userStats, conversationId } = req.body
  const userId = req.user?._id || req.user?.id

  if (!userId) {
    return res.status(401).json({ message: 'User context missing from token' })
  }

  // Validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      message: 'Message is required',
    })
  }

  try {
    let conversation = null
    if (conversationId) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversationId' })
      }

      conversation = await getConversation(conversationId, userId)
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }
    } else {
      conversation = await createConversation(userId)
    }

    const recentMessages = await getRecentMessages(conversation._id, CONTEXT_LIMIT)
    const safeMessages = recentMessages.map(sanitizeForPrompt)
    const conversationContext = formatConversationContext(safeMessages)

    const currentPrompt = buildPrompt({
      type: 'chat',
      input: message.trim(),
      context: {
        subject,
        task,
        userStats,
      },
    })

    const prompt = `Previous conversation:\n${conversationContext}\n\nNow respond to:\n${currentPrompt}`

    // Call AI
    const aiClient = getAIClient()
    let aiResponseText = FALLBACK_CHAT_MESSAGE
    let provider = 'fallback'

    try {
      const aiResponse = await aiClient.call({
        prompt,
        temperature: 0.7,
        maxTokens: 1200,
        timeoutMs: 15000,
      })

      aiResponseText = aiResponse.content || FALLBACK_CHAT_MESSAGE
      provider = aiResponse.provider || 'unknown'
    } catch (error) {
      console.error('AI chat call failed:', error.message)
    }

    await appendMessage(conversation._id, {
      role: 'user',
      content: message.trim(),
    })

    await appendMessage(conversation._id, {
      role: 'assistant',
      content: aiResponseText,
    })

    // Return response
    res.json({
      response: aiResponseText,
      aiResponse: aiResponseText,
      provider,
      conversationId: conversation._id,
    })
  } catch (error) {
    console.error('Chat handler error:', error.message)
    res.status(500).json({
      message: 'Failed to process chat',
      response: FALLBACK_CHAT_MESSAGE,
    })
  }
}

module.exports = {
  chatHandler,
  clearConversationHandler: async (req, res) => {
    const userId = req.user?._id || req.user?.id
    const { conversationId } = req.params

    if (!userId) {
      return res.status(401).json({ message: 'User context missing from token' })
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversationId' })
    }

    const deleted = await deleteConversation(conversationId, userId)
    if (!deleted) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    return res.json({ message: 'Conversation cleared' })
  },
}
