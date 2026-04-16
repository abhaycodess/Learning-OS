/**
 * AIChatPanel Component
 * Displays chat messages and input for AI study coach with enhanced theming
 */

import React, { useEffect } from 'react'
import { Mic, Send, Square, Volume2 } from 'lucide-react'
import { cn } from '../../../utils/cn'
import nexisAvatar from '../../../assets/nexis-avatar.svg'

function AIChatPanel({ messages, isLoading, onSendMessage, messagesEndRef, quickPrompts = [] }) {
  const [input, setInput] = React.useState('')
  const [isListening, setIsListening] = React.useState(false)
  const [speechSupported, setSpeechSupported] = React.useState(false)
  const recognitionRef = React.useRef(null)

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messagesEndRef])

  useEffect(() => {
    const hasSpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)

    setSpeechSupported(Boolean(hasSpeechRecognition))

    if (!hasSpeechRecognition) return

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionClass()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')

      setInput(transcript.trim())
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
    }
  }

  const speakLatestAIResponse = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const latestAI = [...messages].reverse().find((message) => message.role === 'assistant')
    if (!latestAI?.content) return

    window.speechSynthesis.cancel()
    const utterance = new window.SpeechSynthesisUtterance(latestAI.content)
    utterance.rate = 0.95
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="flex h-full flex-col bg-transparent overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mb-4 inline-flex items-center justify-center">
                <img src={nexisAvatar} alt="Nexis avatar" className="w-16 h-16 rounded-2xl object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
                Hey there! I'm Nexis
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Ask me anything about your subjects, get explanations, summarize notes, or break down tasks into steps. I am here to help you excel.
              </p>

              {quickPrompts.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mx-auto">
                  {quickPrompts.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => onSendMessage(prompt)}
                      className="text-sm px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-left leading-snug"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-end gap-3 pb-2 animate-fadeIn">
            <img src={nexisAvatar} alt="Nexis avatar" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Nexis</p>
              <div className="flex gap-2 px-4 py-3 rounded-full shadow-sm bg-[var(--bg-surface-alt)]">
                <div className="w-2 h-2 rounded-full animate-bounce bg-[var(--text-muted)]" />
                <div
                  className="w-2 h-2 rounded-full animate-bounce bg-[var(--text-muted)]"
                  style={{ animationDelay: '0.15s' }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-bounce bg-[var(--text-muted)]"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 z-10 pt-4 pb-6 px-4 bg-transparent backdrop-blur-md">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... (Shift+Enter for new line)"
            className={cn(
              'flex-1 resize-none px-5 py-3.5 rounded-full border border-neutral-200/60 bg-white/70 shadow-sm backdrop-blur-sm transition-all duration-200',
              'text-neutral-800',
              'placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-transparent',
              'max-h-24 font-sans text-sm'
            )}
            rows="3"
            disabled={isLoading}
          />
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={cn(
                'px-3 py-3 rounded-full border transition-all duration-200 self-end h-fit',
                isListening
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : 'border-[var(--line)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]',
              )}
              title={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={speakLatestAIResponse}
            className="px-3 py-3 rounded-full border border-[var(--line)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all duration-200 self-end h-fit"
            title="Read last Nexis reply"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={cn(
              'px-4 py-3 rounded-full shadow-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2',
              'self-end h-fit',
              isLoading || !input.trim()
                ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-primary hover:bg-primary-light text-white active:scale-95'
            )}
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual message bubble with enhanced styling
 */
function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="mx-auto max-w-sm animate-fadeIn">
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-4 py-3 border border-red-200/60">
          ⚠️ {message.content}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2 animate-fadeIn', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0">
          <img src={nexisAvatar} alt="Nexis avatar" className="w-8 h-8 rounded-lg object-cover" />
        </div>
      )}
      <div className={cn('max-w-[82%] lg:max-w-[70%]')}>
        {!isUser && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Nexis</p>
        )}
        <div
          className={cn(
            'px-4 py-3 rounded-full shadow-sm leading-relaxed text-sm',
            isUser ? 'bg-gradient-to-br from-[#6352c8] to-[#8b5cf6] text-white rounded-2xl rounded-tr-sm shadow-md' : 'bg-white border border-neutral-100 text-neutral-800 rounded-2xl rounded-tl-sm shadow-[0_4px_20px_rgba(17,22,29,0.03)]'
          )}
        >
          <FormattedContent content={message.content} isUser={isUser} />
        </div>
      </div>

    </div>
  )
}

/**
 * Format AI response content with support for bullets and formatting
 */
function formatInlineText(text) {
  return text
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\_/g, '_')
}

function renderInlineMarkdown(text) {
  const normalized = formatInlineText(text)
  const segments = normalized.split(/(\*\*[^*]+\*\*)/g)

  return segments.map((segment, index) => {
    const isBold = segment.startsWith('**') && segment.endsWith('**') && segment.length > 4

    if (isBold) {
      return <strong key={index}>{segment.slice(2, -2)}</strong>
    }

    return <span key={index}>{segment}</span>
  })
}

function FormattedContent({ content, isUser }) {
  if (!content) return null

  // Split by line breaks
  const lines = content.split('\n').filter((line) => line.trim() !== '')

  return (
    <div className={cn('space-y-2', isUser && 'text-white/95')}>
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex gap-2">
              <span className="flex-shrink-0 font-bold opacity-75">•</span>
              <p className="flex-1">{renderInlineMarkdown(trimmed.slice(2))}</p>
            </div>
          )
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/)
          return (
            <div key={idx} className="flex gap-2">
              <span className="flex-shrink-0 font-bold opacity-75">{match[1]}.</span>
              <p className="flex-1">{renderInlineMarkdown(match[2])}</p>
            </div>
          )
        }

        // Section heading (bold markdown heading or plain heading)
        if (/^\*\*.+\*\*:?$/.test(trimmed) || (trimmed.endsWith(':') && trimmed.split(' ').length <= 5)) {
          const headingText = trimmed.replace(/^\*\*/, '').replace(/\*\*:$/, ':').replace(/\*\*$/, '')
          return (
            <p key={idx} className={cn('font-semibold mt-2 mb-1', isUser ? 'text-white' : 'text-[var(--text-main)]')}>
              {renderInlineMarkdown(headingText)}
            </p>
          )
        }

        // Regular text
        return <p key={idx}>{renderInlineMarkdown(trimmed)}</p>
      })}
    </div>
  )
}

export { AIChatPanel, MessageBubble }
