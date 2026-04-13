import { createElement } from 'react'

export default function FeatureCard({ icon, title, description }) {
  return (
    <article className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_12px_24px_rgba(17,22,29,0.06)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_16px_28px_rgba(17,22,29,0.1)]">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary transition-transform duration-200 group-hover:scale-110">
        {createElement(icon, { size: 18 })}
      </div>
      <h3 className="text-xl text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </article>
  )
}
