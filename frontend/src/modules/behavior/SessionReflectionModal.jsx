/**
 * SessionReflectionModal - Post-Session Feedback Capture
 * 
 * Appears after user ends a focus session.
 * Captures:
 * - What they completed (optional note)
 * - Focus rating (1-5 scale)
 * - Distractions encountered
 * 
 * Stores in session for behavior analytics:
 * - completionNote (text)
 * - focusScore (1-5)
 * - distractions (array)
 * - sessionSatisfaction
 * 
 * This data feeds into Weekly Summary and behavioral patterns.
 * 
 * Usage:
 * <SessionReflectionModal 
 *   isOpen={sessionEnded}
 *   session={lastSession}
 *   onSubmit={handleReflectionSubmit}
 *   onDismiss={handleModalClose}
 * />
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useToast } from '../../hooks/useToast.jsx'

const FOCUS_RATING_OPTIONS = [
  { value: 1, label: 'Terrible', emoji: '😤' },
  { value: 2, label: 'Poor', emoji: '😕' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '😊' },
  { value: 5, label: 'Excellent', emoji: '🔥' },
]

const DISTRACTION_OPTIONS = [
  'Phone notifications',
  'Social media',
  'External noise',
  'Mental wandering',
  'Hunger/fatigue',
  'None - great focus',
]

export function SessionReflectionModal({ isOpen, session, onSubmit, onDismiss }) {
  const { warning } = useToast()
  const [focusRating, setFocusRating] = useState(null)
  const [completionNote, setCompletionNote] = useState('')
  const [distractions, setDistractions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleDistraction = (distraction) => {
    setDistractions((prev) =>
      prev.includes(distraction)
        ? prev.filter((d) => d !== distraction)
        : [...prev, distraction],
    )
  }

  const handleSubmit = async () => {
    if (!focusRating) {
      warning('Focus rating required', 'Rate your focus level before saving reflection.')
      return
    }

    setIsSubmitting(true)

    try {
      const reflectionData = {
        focusScore: focusRating,
        completionNote: completionNote.trim(),
        distractions,
        completedAt: new Date().toISOString(),
      }

      await onSubmit(reflectionData)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !session) return null

  const rawDurationSec = Number(session.durationSec ?? session.sessionDuration ?? 0)
  const sessionDurationMinutes = Math.max(0, Math.round(rawDurationSec / 60))

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">How was that?</h2>
          <p className="text-sm text-gray-600">
            {session.taskTitle || 'Session'} • {sessionDurationMinutes} minutes
          </p>
        </div>

        {/* Focus Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your focus level
          </label>
          <div className="grid grid-cols-5 gap-2">
            {FOCUS_RATING_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFocusRating(option.value)}
                className={`p-3 rounded-lg transition-all text-center ${
                  focusRating === option.value
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <div className="text-xl mb-1">{option.emoji}</div>
                <div className="text-xs font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Completion Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What did you complete? (optional)
          </label>
          <textarea
            value={completionNote}
            onChange={(e) => setCompletionNote(e.target.value)}
            placeholder="e.g., Finished chapter 3, solved 10 problems..."
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows={3}
          />
        </div>

        {/* Distractions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Anything distracting you?
          </label>
          <div className="space-y-2">
            {DISTRACTION_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={distractions.includes(option)}
                  onChange={() => toggleDistraction(option)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !focusRating}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : focusRating
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save reflection'}
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') {
    return modal
  }

  return createPortal(modal, document.body)
}

export default SessionReflectionModal
