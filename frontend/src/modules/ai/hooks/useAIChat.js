/**
 * useAIChat Hook
 * Manages chat state, message history, and sending messages to AI coach
 */

import { useState, useRef, useCallback } from 'react'
import { chatWithCoach, clearAIConversation } from '../service'
import { useToast } from '../../../hooks/useToast'

const CONVERSATION_STORAGE_KEY = 'learning_os_ai_conversation_id'

function readStoredConversationId() {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem(CONVERSATION_STORAGE_KEY)
  } catch {
    return null
  }
}

function persistConversationId(value) {
  if (typeof window === 'undefined') return

  try {
    if (value) {
      localStorage.setItem(CONVERSATION_STORAGE_KEY, value)
    } else {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY)
    }
  } catch {
    // Ignore localStorage failures in restricted browser contexts.
  }
}

export function useAIChat(initialContext = {}) {
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(() => readStoredConversationId())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }, [])

  /**
   * Send a message to the AI coach
   */
  const sendMessage = useCallback(
    async (userMessage, customContext = {}) => {
      if (!userMessage?.trim()) {
        toast({ message: 'Please enter a message', tone: 'warning' })
        return
      }

      try {
        setError(null)
        setIsLoading(true)

        // Add user message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
          },
        ])

        // Call API
        const context = { ...initialContext, ...customContext, conversationId }
        const response = await chatWithCoach(userMessage, context)

        if (response?.conversationId) {
          setConversationId(response.conversationId)
          persistConversationId(response.conversationId)
        }

        // Add AI response to chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: response.aiResponse || response.response || 'Something went wrong. Try again.',
            provider: response.provider,
            timestamp: new Date(),
          },
        ])

        scrollToBottom()
      } catch (err) {
        const errorMsg = err.message || 'Failed to get response from study coach'
        setError(errorMsg)
        toast({ message: errorMsg, tone: 'error' })

        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'system',
            content: `Error: ${errorMsg}`,
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [initialContext, toast, scrollToBottom, conversationId],
  )

  /**
   * Clear chat history
   */
  const clearChat = useCallback(async () => {
    try {
      if (conversationId) {
        await clearAIConversation(conversationId)
      }
      setMessages([])
      setError(null)
      setConversationId(null)
      persistConversationId(null)
      toast({ message: 'Chat cleared', tone: 'success' })
    } catch (err) {
      const errorMsg = err.message || 'Failed to clear chat'
      setError(errorMsg)
      toast({ message: errorMsg, tone: 'error' })
    }
  }, [conversationId, toast])

  const newChat = useCallback(() => {
    setMessages([])
    setError(null)
    setConversationId(null)
    persistConversationId(null)
  }, [])

  /**
   * Remove a specific message
   */
  const removeMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
  }, [])

  /**
   * Update context for subsequent messages
   */
  const updateContext = useCallback((newContext) => {
    // This will be used by callers to update the context
    // We return a function that allows updating
    return newContext
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    newChat,
    removeMessage,
    updateContext,
    conversationId,
    messagesEndRef,
  }
}
