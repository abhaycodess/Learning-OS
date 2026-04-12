import { ArrowRight } from 'lucide-react'
import Button from './Button.jsx'

export default function EmptyState({ icon: Icon, title, description, ctaLabel, onCta }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] px-6 py-8 text-center">
      {Icon ? (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-neutral-200 bg-white text-neutral-600 shadow-sm">
          <Icon size={24} />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">{description}</p>
      {ctaLabel && onCta ? (
        <Button className="mt-5" onClick={onCta}>
          <span className="inline-flex items-center gap-2">
            {ctaLabel}
            <ArrowRight size={14} />
          </span>
        </Button>
      ) : null}
    </div>
  )
}
