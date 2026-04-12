import { cn } from '../utils/cn.js'

const variants = {
  primary:
    'bg-primary text-white shadow-[0_10px_24px_rgb(var(--brand-rgb)/0.28)] hover:bg-primary-light',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  success: 'bg-success text-white hover:opacity-90',
}

export default function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'hover-lift inline-flex items-center justify-center rounded-ui px-s2 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
