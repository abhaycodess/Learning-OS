import React from 'react'
import { cn } from '../../../utils/cn'

function normalizeText(text) {
  return text.replace(/\\_/g, '_').replace(/\\`/g, '`').replace(/\\\*/g, '*')
}

function renderInlineMarkdown(text) {
  const normalized = normalizeText(text)
  const segments = normalized.split(/(\*\*[^*]+\*\*)/g)

  return segments.map((segment, index) => {
    const isBold = segment.startsWith('**') && segment.endsWith('**') && segment.length > 4

    if (isBold) {
      return <strong key={index}>{segment.slice(2, -2)}</strong>
    }

    return <span key={index}>{segment}</span>
  })
}

function FormattedQuiz({ content }) {
  if (!content) return null

  const lines = content.split('\n').filter((line) => line.trim() !== '')

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex gap-2">
              <span className="flex-shrink-0 font-bold opacity-75">•</span>
              <p className="flex-1">{renderInlineMarkdown(trimmed.slice(2))}</p>
            </div>
          )
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/)
          return (
            <div key={idx} className="flex gap-2">
              <span className="flex-shrink-0 font-bold opacity-75">{match[1]}.</span>
              <p className="flex-1">{renderInlineMarkdown(match[2])}</p>
            </div>
          )
        }

        if (/^\*\*.+\*\*:?$/.test(trimmed) || (trimmed.endsWith(':') && trimmed.split(' ').length <= 5)) {
          const headingText = trimmed.replace(/^\*\*/, '').replace(/\*\*:$/, ':').replace(/\*\*$/, '')
          return (
            <p key={idx} className="font-semibold mt-2 mb-1 text-[var(--text-main)]">
              {renderInlineMarkdown(headingText)}
            </p>
          )
        }

        return <p key={idx}>{renderInlineMarkdown(trimmed)}</p>
      })}
    </div>
  )
}

function QuizPanel({ quiz }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--line)] bg-[var(--bg-surface-alt)] p-4',
        'text-[var(--text-main)]',
      )}
    >
      <FormattedQuiz content={quiz} />
    </div>
  )
}

export { QuizPanel }