import { AlertCircle, X } from 'lucide-react'
import Button from './Button'

/**
 * MissedDayBanner - Non-dismissible banner when user missed yesterday
 * Prompts action to prevent repeating the pattern
 */
export default function MissedDayBanner({
  missedYesterday = false,
  onStartClick = () => {},
  taskName = null,
  className = '',
}) {
  if (!missedYesterday) {
    return null
  }

  return (
    <div
      className={`
        border-l-4 border-red-500 bg-red-50 rounded-lg p-4 
        flex items-start justify-between gap-4
        animate-in slide-in-from-top-2 ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3 flex-1">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="font-bold text-red-900">You skipped yesterday.</h3>
          <p className="text-red-800 text-sm mt-1">
            Don't let it happen again. Start now and rebuild your streak.
          </p>
        </div>
      </div>

      <Button
        onClick={onStartClick}
        variant="primary"
        size="sm"
        className="flex-shrink-0"
      >
        Start Now
      </Button>
    </div>
  )
}
