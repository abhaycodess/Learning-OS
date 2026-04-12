export default function SectionWrapper({
  id,
  eyebrow,
  title,
  description,
  children,
  className = '',
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20 ${className}`}>
      {(eyebrow || title || description) && (
        <header className="mb-8 md:mb-10">
          {eyebrow && (
            <p className="inline-flex rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </p>
          )}
          {title && <h2 className="mt-3 text-3xl text-neutral-900 md:text-4xl">{title}</h2>}
          {description && <p className="mt-3 max-w-3xl text-sm text-neutral-600 md:text-base">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
