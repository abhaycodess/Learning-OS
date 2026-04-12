const { Conversation } = require('../models/Conversation')
const { getAIClient } = require('./aiClient')

const MAX_STORED_MESSAGES = 20
const CONTEXT_LIMIT = 5
const SUMMARY_TRIGGER_COUNT = 15
const SUMMARY_BATCH_COUNT = 10
const MAX_MESSAGE_LENGTH = 300

function sanitizeMessageContent(content) {
  return String(content || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH)
}

function summarizeBatchFallback(messages) {
  const text = messages.map((item) => `${item.role}: ${item.content}`).join(' ')
  return text.slice(0, 500)
}

async function generateBatchSummary(messages) {
  const aiClient = getAIClient()
  const lines = messages
    .map((item) => `${item.role === 'assistant' ? 'AI' : 'User'}: ${item.content}`)
    .join('\n')

  const prompt = `Summarize this study conversation in at most 100 words.
Focus on key questions, guidance, and next actions.

Conversation:
${lines}`

  try {
    const response = await aiClient.call({
      prompt,
      temperature: 0.3,
      maxTokens: 180,
      timeoutMs: 10000,
    })

    return sanitizeMessageContent(response.content)
  } catch (error) {
    console.error('Conversation summary generation failed:', error.message)
    return sanitizeMessageContent(summarizeBatchFallback(messages))
  }
}

async function compactConversation(conversation) {
  if (!conversation) return null

  let messages = Array.isArray(conversation.messages) ? conversation.messages : []

  if (messages.length > SUMMARY_TRIGGER_COUNT) {
    const batch = messages.slice(0, SUMMARY_BATCH_COUNT)
    const summary = await generateBatchSummary(batch)

    const summaryMessage = {
      role: 'system',
      content: sanitizeMessageContent(`Summary of previous conversation: ${summary}`),
    }

    messages = [summaryMessage, ...messages.slice(-10)]
    conversation.lastSummary = summaryMessage.content
  }

  if (messages.length > MAX_STORED_MESSAGES) {
    messages = messages.slice(-MAX_STORED_MESSAGES)
  }

  conversation.messages = messages
  await conversation.save()
  return conversation
}

async function createConversation(userId) {
  return Conversation.create({
    userId,
    messages: [],
    lastSummary: '',
  })
}

async function getConversation(conversationId, userId) {
  return Conversation.findOne({
    _id: conversationId,
    userId,
  })
}

async function appendMessage(conversationId, message) {
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) return null

  const role = ['user', 'assistant', 'system'].includes(message.role) ? message.role : 'user'
  const content = sanitizeMessageContent(message.content)

  if (!content) {
    return conversation
  }

  conversation.messages.push({ role, content })
  return compactConversation(conversation)
}

async function getRecentMessages(conversationId, limit = CONTEXT_LIMIT) {
  const safeLimit = Math.min(Math.max(Number(limit) || CONTEXT_LIMIT, 1), CONTEXT_LIMIT)

  const conversation = await Conversation.findById(conversationId)
    .select('messages lastSummary')
    .lean()

  if (!conversation?.messages?.length) {
    return []
  }

  const latest = conversation.messages.slice(-safeLimit)

  if (conversation.lastSummary) {
    const hasSummaryInSlice = latest.some((msg) => msg.role === 'system' && msg.content === conversation.lastSummary)
    if (!hasSummaryInSlice) {
      return [{ role: 'system', content: conversation.lastSummary }, ...latest]
    }
  }

  return latest
}

async function deleteConversation(conversationId, userId) {
  return Conversation.findOneAndDelete({
    _id: conversationId,
    userId,
  })
}

function sanitizeForPrompt(message) {
  return {
    role: message.role,
    content: sanitizeMessageContent(message.content),
  }
}

module.exports = {
  MAX_STORED_MESSAGES,
  CONTEXT_LIMIT,
  createConversation,
  getConversation,
  appendMessage,
  getRecentMessages,
  deleteConversation,
  sanitizeForPrompt,
}