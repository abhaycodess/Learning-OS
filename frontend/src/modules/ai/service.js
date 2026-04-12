/**
 * AI Study Coach Service
 * Handles all API calls to AI endpoints
 */

import { apiClient } from '../../services/apiClient'

/**
 * Send chat message to study coach
 */
export async function chatWithCoach(message, context = {}) {
  const { conversationId = null, ...restContext } = context

  return apiClient('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      ...restContext,
      ...(conversationId ? { conversationId } : {}),
    }),
  })
}

/**
 * Get proactive AI insights for dashboard
 */
export async function getAIInsights() {
  return apiClient('/ai/insights', {
    method: 'GET',
  })
}

/**
 * Delete an existing chat conversation from backend storage
 */
export async function clearAIConversation(conversationId) {
  return apiClient(`/ai/chat/${conversationId}`, {
    method: 'DELETE',
  })
}

/**
 * Summarize study notes
 */
export async function summarizeNotes(notes, context = {}) {
  return apiClient('/ai/summarize', {
    method: 'POST',
    body: JSON.stringify({
      notes,
      ...context,
    }),
  })
}

/**
 * Get explanation for a doubt/question
 */
export async function solveDoubt(question, mode = 'quick', context = {}) {
  return apiClient('/ai/doubt', {
    method: 'POST',
    body: JSON.stringify({
      question,
      mode,
      ...context,
    }),
  })
}

/**
 * Get task breakdown into steps
 */
export async function breakDownTask(task, context = {}) {
  return apiClient('/ai/task-breakdown', {
    method: 'POST',
    body: JSON.stringify({
      task,
      ...context,
    }),
  })
}

/**
 * Generate a daily study plan
 */
export async function generateDailyPlan(payload = {}) {
  return apiClient('/ai/daily-plan', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Generate a study quiz
 */
export async function generateQuiz(payload = {}) {
  return apiClient('/ai/quiz', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Generate a personalized study reminder
 */
export async function generateStudyReminder(payload = {}) {
  return apiClient('/ai/reminder', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Analyze study notes for quality and improvement
 */
export async function analyzeNotes(notes, context = {}) {
  return apiClient('/ai/note-analyzer', {
    method: 'POST',
    body: JSON.stringify({
      notes,
      ...context,
    }),
  })
}

/**
 * Run one of the advanced AI roadmap tools
 */
export async function runFeatureTool(featureId, payload = {}) {
  return apiClient(`/ai/feature/${featureId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export default {
  chatWithCoach,
  summarizeNotes,
  solveDoubt,
  breakDownTask,
  generateDailyPlan,
  generateQuiz,
  generateStudyReminder,
  analyzeNotes,
  runFeatureTool,
  getAIInsights,
  clearAIConversation,
}
