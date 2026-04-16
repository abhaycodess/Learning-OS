/**
 * TaskBreakdownModal Component
 * Shows AI-generated task breakdown in a modal with enhanced theming
 */

import { X, Loader, Zap } from 'lucide-react'
import { breakDownTask } from '../ai/service'
import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

export function TaskBreakdownModal({ task, subject, onClose }) {
  const [breakdown, setBreakdown] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('balanced')
  const [availableMinutes, setAvailableMinutes] = useState(60)

  useEffect(() => {
    if (!task) return

    const fetchBreakdown = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const context = subject
          ? {
              subject: {
                title: subject.title || subject.name,
                description: subject.description,
              },
            }
          : {}

        const result = await breakDownTask(task, {
          ...context,
          mode,
          availableMinutes,
        })
        setBreakdown(result.breakdown)
      } catch (err) {
        setError(err.message || 'Failed to break down task')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBreakdown()
  }, [task, subject, mode, availableMinutes])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200/30 dark:border-slate-800/30">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-violet-100/60 dark:bg-violet-900/30">
              <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Task Breakdown
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {task?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200/60 dark:border-slate-800/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 mb-2">Breakdown Controls</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { id: 'quick', label: 'Quick' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'deep', label: 'Deep' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMode(option.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors',
                    mode === option.id
                      ? 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="availableMinutes" className="text-xs text-slate-500">Available Minutes</label>
              <input
                id="availableMinutes"
                type="number"
                min="15"
                max="360"
                step="5"
                value={availableMinutes}
                onChange={(e) => setAvailableMinutes(Math.max(15, Number(e.target.value || 15)))}
                className="w-24 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-6 h-6 text-violet-500 dark:text-violet-400 animate-spin mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">Building your {mode} breakdown...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100/40 dark:bg-red-900/20 border border-red-300/40 dark:border-red-800/40 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <div className="flex gap-2">
                <span className="text-lg">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          ) : breakdown ? (
            <FormattedBreakdown content={breakdown} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * Format breakdown content with proper styling and visual hierarchy
 */
function FormattedBreakdown({ content }) {
  if (!content) return null

  const lines = content.split('\n').filter((line) => line.trim() !== '')

  return (
    <div className="text-slate-700 dark:text-slate-300 text-sm space-y-3">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        // Numbered list items (main steps)
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/)
          if (match) {
            return (
              <div key={idx} className="flex gap-3 group">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-violet-500 dark:bg-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                    {match[1]}
                  </div>
                </div>
                <p className="flex-1 pt-0.5">{match[2]}</p>
              </div>
            )
          }
        }

        // Bullet points (sub-items)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex gap-3 ml-9">
              <span className="flex-shrink-0 text-violet-500 dark:text-violet-400 font-bold">◦</span>
              <p className="flex-1">{trimmed.slice(2)}</p>
            </div>
          )
        }

        // Section heading (ends with colon)
        if (trimmed.endsWith(':') && trimmed.split(' ').length <= 5) {
          return (
            <p key={idx} className="font-semibold text-slate-900 dark:text-white mt-4 mb-2 text-base flex items-center gap-2">
              <span className="w-1 h-4 bg-violet-500 rounded" />
              {trimmed}
            </p>
          )
        }

        // Regular text
        return <p key={idx} className="leading-relaxed">{trimmed}</p>
      })}
    </div>
  )
}
