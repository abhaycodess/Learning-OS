const HeroBanner = ({ eyebrow, title, subtitle, action, metrics = [] }) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[rgb(var(--brand-rgb)/0.18)] px-6 py-8 text-white shadow-lg md:px-8 md:py-12"
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgb(var(--brand-rgb)) 0%, rgb(var(--brand-light-rgb)) 55%, rgb(var(--brand-lighter-rgb)) 100%)',
        boxShadow: '0 20px 40px rgb(var(--brand-rgb) / 0.2)',
      }}
    >
      {/* Gradient orbs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-[15%] top-[18%] h-24 w-24 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute right-[18%] top-[14%] h-36 w-36 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.22),transparent_18%),radial-gradient(circle_at_72%_62%,rgba(255,255,255,0.16),transparent_12%)]" />
      </div>

      <div className="relative z-10">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 font-heading text-3xl font-medium leading-tight text-white md:text-4xl lg:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
            {subtitle}
          </p>
        )}

        {metrics.length > 0 ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">{metric.label}</p>
                <p className="mt-1 text-base font-semibold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  )
}

export default HeroBanner
