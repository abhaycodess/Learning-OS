import { Clock, Target, CheckCircle } from 'lucide-react'
import Button from './Button'

/**
 * DailyContractCard - Shows today's target and progress
 * States:
 * - NOT STARTED: Show target, prompt to start
 * - IN PROGRESS: Show progress bar, prompt to continue
 * - COMPLETED: Show completion message
 */
export default function DailyContractCard({
  status = 'not-started', // 'not-started' | 'in-progress' | 'completed'
  targetMinutes = 60,
  actualMinutes = 0,
  onStartClick = () => {},
  onContinueClick = () => {},
  taskName = null,
}) {
  const progress = targetMinutes > 0 ? Math.round((actualMinutes / targetMinutes) * 100) : 0
  const remaining = Math.max(0, targetMinutes - actualMinutes)

  // Determine styling based on status
  const statusConfig = {
    'not-started': {
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-900',
      accentColor: 'text-blue-600',
      icon: Target,
      message: `Today's target: ${targetMinutes} min`,
      cta: `Start Now${taskName ? ` — ${taskName}` : ''}`,
      ctaVariant: 'primary',
      onCta: onStartClick,
    },
    'in-progress': {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      accentColor: 'text-blue-600',
      icon: Clock,
      message: `You've done ${actualMinutes} / ${targetMinutes} min`,
      subtitle: `${remaining} min to go`,
      cta: 'Continue',
      ctaVariant: 'primary',
      onCta: onContinueClick,
    },
    'completed': {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-900',
      accentColor: 'text-emerald-600',
      icon: CheckCircle,
      message: 'Target complete. You showed up.',
      cta: null,
      ctaVariant: 'ghost',
    },
  }

  const config = statusConfig[status] || statusConfig['not-started']
  const IconComponent = config.icon

  return (
    <div
      className={`
        border-l-4 rounded-lg p-5 flex items-start justify-between
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <div className="flex items-start gap-3 flex-1">
        <IconComponent className={`${config.accentColor} flex-shrink-0 mt-1`} size={20} />

        <div className="flex-1">
          <h3 className={`${config.textColor} font-semibold text-sm`}>
            {config.message}
          </h3>

          {config.subtitle && (
            <p className={`${config.textColor} opacity-75 text-xs mt-1`}>
              {config.subtitle}
            </p>
          )}

          {/* Progress bar for in-progress state */}
          {status === 'in-progress' && (
            <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {config.cta && (
        <Button
          onClick={config.onCta}
          variant={config.ctaVariant}
          size="sm"
          className="ml-3 flex-shrink-0"
        >
          {config.cta}
        </Button>
      )}
    </div>
  )
}
