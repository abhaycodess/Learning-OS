import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '../utils/cn.js'

const ToastContext = createContext(null)

const TOAST_LIFETIME_MS = 4800

const toneStyles = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-300/70 bg-emerald-50/95 text-emerald-950',
    progressClassName: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-300/70 bg-red-50/95 text-red-950',
    progressClassName: 'bg-red-500',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-amber-300/70 bg-amber-50/95 text-amber-950',
    progressClassName: 'bg-amber-500',
  },
  info: {
    icon: Info,
    className: 'border-sky-300/70 bg-sky-50/95 text-sky-950',
    progressClassName: 'bg-sky-500',
  },
}

function ToastItem({ toast, onDismiss }) {
  const tone = toneStyles[toast.type] || toneStyles.info
  const Icon = tone.icon

  return (
    <li
      className={cn(
        'group pointer-events-auto relative overflow-hidden rounded-2xl border shadow-[0_20px_44px_rgba(17,22,29,0.18)] backdrop-blur-md transition-all duration-300 animate-toast-in',
        tone.className,
      )}
    >
      <div className="flex items-start gap-3 p-3.5 pr-2.5">
        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70">
          <Icon size={15} className="shrink-0" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 tracking-tight">{toast.title}</p>
          {toast.message ? <p className="mt-1 text-xs leading-5 opacity-90">{toast.message}</p> : null}
          {toast.actionLabel && typeof toast.onAction === 'function' ? (
            <button
              type="button"
              onClick={() => toast.onAction(toast)}
              className="mt-2 rounded-full border border-current/25 bg-white/80 px-3 py-1 text-xs font-semibold transition hover:bg-white"
            >
              {toast.actionLabel}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="grid h-7 w-7 place-items-center rounded-md text-current/70 transition hover:bg-black/5 hover:text-current"
          aria-label="Dismiss toast"
        >
          <X size={15} />
        </button>
      </div>
      <div className="h-1 w-full bg-black/5">
        <div
          className={cn('h-full animate-toast-progress origin-left', tone.progressClassName)}
          style={{ animationDuration: `${toast.durationMs}ms` }}
        />
      </div>
    </li>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback((payload) => {
    const id = payload.id || crypto.randomUUID()
    const durationMs = payload.durationMs || TOAST_LIFETIME_MS

    const toast = {
      id,
      type: payload.type || 'info',
      title: payload.title || '',
      message: payload.message || '',
      actionLabel: payload.actionLabel || '',
      onAction: payload.onAction,
      durationMs,
      createdAt: Date.now(),
    }

    setToasts((prev) => [toast, ...prev].slice(0, 6))

    const timer = window.setTimeout(() => {
      removeToast(id)
    }, durationMs)

    timersRef.current.set(id, timer)
    return id
  }, [removeToast])

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current.clear()
    setToasts([])
  }, [])

  const value = useMemo(
    () => ({
      toasts,
      toast: pushToast,
      dismissToast: removeToast,
      clearToasts,
      success: (title, message, options = {}) => pushToast({ type: 'success', title, message, ...options }),
      error: (title, message, options = {}) => pushToast({ type: 'error', title, message, ...options }),
      warning: (title, message, options = {}) => pushToast({ type: 'warning', title, message, ...options }),
      info: (title, message, options = {}) => pushToast({ type: 'info', title, message, ...options }),
    }),
    [toasts, pushToast, removeToast, clearToasts],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <aside className="pointer-events-none fixed left-1/2 top-3 z-[220] w-[min(560px,calc(100vw-1.5rem))] -translate-x-1/2">
        <ul className="space-y-2.5">
          {toasts.map((entry) => (
            <ToastItem key={entry.id} toast={entry} onDismiss={removeToast} />
          ))}
        </ul>
      </aside>
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used inside ToastProvider')
  }
  return context
}
