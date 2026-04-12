import { Link } from 'react-router-dom'

export default function CTAButton({ to, onClick, variant = 'primary', children, className = '' }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-[1px]'

  const variants = {
    primary: 'bg-primary text-white shadow-[0_14px_30px_rgb(var(--brand-rgb)/0.34)] hover:bg-primary-light',
    secondary: 'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50',
  }

  if (to) {
    return (
      <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
