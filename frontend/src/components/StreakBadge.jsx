import { Flame } from 'lucide-react'

/**
 * StreakBadge - Displays current streak count
 * Shows a prominent badge with flame icon
 */
export default function StreakBadge({ count = 0, className = '' }) {
  if (count === 0) {
    return null
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 
        bg-gradient-to-r from-orange-400 to-red-500 
        rounded-full text-white font-bold text-sm 
        shadow-md ${className}
      `}
    >
      <Flame size={16} className="animate-pulse" />
      <span>{count} day streak</span>
    </div>
  )
}
