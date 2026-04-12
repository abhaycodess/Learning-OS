import { useEffect, useState } from 'react'
import { X, Zap, Check, AlertCircle, Clock } from 'lucide-react'
import { behaviorService } from '../services/behaviorService'
import Button from './Button'
import Card from './Card'

export const DailySummaryModal = ({ isOpen, dateKey = null, onClose }) => {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) {
      setSummary(null)
      setError(null)
      return
    }

    const fetchSummary = async () => {
      try {
        setIsLoading(true)
        const data = await behaviorService.getDailySummary(dateKey)
        setSummary(data)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load summary')
        setSummary(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [isOpen, dateKey])

  if (!isOpen) return null

  // Determine verdict styling based on type
  const verdictConfig = {
    completed: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
      borderColor: 'border-green-200',
      icon: Check,
      accentColor: 'text-green-600',
    },
    grace: {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-900',
      borderColor: 'border-amber-200',
      icon: Zap,
      accentColor: 'text-amber-600',
    },
    missed: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-900',
      borderColor: 'border-red-200',
      icon: AlertCircle,
      accentColor: 'text-red-600',
    },
    partial: {
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-900',
      borderColor: 'border-slate-200',
      icon: Clock,
      accentColor: 'text-slate-600',
    },
  }

  const config = summary ? verdictConfig[summary.verdictType] || verdictConfig.partial : verdictConfig.partial
  const VerdictIcon = config.icon

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Close summary"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Loading state */}
        {isLoading && (
          <div className="p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">Loading summary...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Unable to load summary</h3>
            <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        )}

        {/* Summary content */}
        {summary && !isLoading && (
          <div className="p-8">
            {/* Verdict section */}
            <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-6 mb-8`}>
              <div className="flex items-start gap-4">
                <VerdictIcon className={`w-8 h-8 ${config.accentColor} flex-shrink-0 mt-1`} />
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold ${config.textColor} mb-2`}>
                    {summary.verdictType === 'completed' && 'Great work!'}
                    {summary.verdictType === 'grace' && 'Grace day used'}
                    {summary.verdictType === 'missed' && 'Day missed'}
                    {summary.verdictType === 'partial' && 'Progress made'}
                  </h3>
                  <p className={`${config.textColor} text-lg leading-relaxed`}>{summary.verdict}</p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Planned</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {summary.plannedMinutes}
                  <span className="text-sm ml-1">min</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Completed</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {summary.actualMinutes}
                  <span className="text-sm ml-1">min</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Sessions</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {summary.sessionsCount}
                </div>
              </div>
            </div>

            {/* Grace day indicator */}
            {summary.graceDayUsed && (
              <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Grace day used:</strong> Your streak is protected. You have one more grace day available next week.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={onClose} className="flex-1">
                Keep the streak
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
