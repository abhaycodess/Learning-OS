import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function SectionHeading({ title, subtitle, action, eyebrow, showBack = true }) {
  const navigate = useNavigate()
  const location = useLocation()
  const shouldShowBack = showBack && location.pathname !== '/dashboard'

  return (
    <header className="mb-s3 flex flex-wrap items-end justify-between gap-s2">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
            {eyebrow}
          </p>
        ) : null}
        <div className="mt-1 flex items-center gap-3">
          {shouldShowBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              title="Go back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100"
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}
          <h2 className="text-3xl text-neutral-900 md:text-[2.1rem]">{title}</h2>
        </div>
        {subtitle ? <p className="mt-s1 max-w-2xl text-sm text-neutral-500">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  )
}
