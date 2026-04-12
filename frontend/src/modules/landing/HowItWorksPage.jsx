import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CTAButton from './components/CTAButton.jsx'
import SectionWrapper from './components/SectionWrapper.jsx'
import {
  howItWorksFeatureGroups,
  howItWorksHighlights,
  howItWorksSteps,
  howItWorksUpdateHint,
} from './howItWorksContent.js'
import { useAuth } from '../../hooks/useAuth.jsx'

function FeaturePill({ item }) {
  return (
    <li className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-neutral-500" />
      <span>{item}</span>
    </li>
  )
}

function FeaturePreview({ label, value, bars, screenshot, group }) {
  if (screenshot) {
    return (
      <div className="mb-4 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        <img
          src={screenshot}
          alt={`${group} screenshot preview`}
          className="h-36 w-full object-cover object-top"
          loading="lazy"
        />
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
          <span>{label}</span>
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-bold text-neutral-700">{value}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        <span>{label}</span>
        <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-700">{value}</span>
      </div>
      <div className="space-y-2">
        {bars.map((bar, index) => (
          <div key={`${label}-${index}`} className="h-2 rounded-full bg-neutral-200">
            <div
              className="h-2 rounded-full bg-neutral-700/85 transition-all duration-500"
              style={{ width: `${bar}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
  const navigate = useNavigate()
  const { isAuthenticated, requiresOnboarding } = useAuth()

  const appEntryTarget = useMemo(
    () => (isAuthenticated ? (requiresOnboarding ? '/onboarding' : '/dashboard') : '/auth'),
    [isAuthenticated, requiresOnboarding],
  )

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fafafa_0%,#f4f5f7_100%)] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <ArrowLeft size={16} />
            Back to Landing
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700">
            <Sparkles size={14} />
            How It Works
          </div>
        </div>
      </header>

      <SectionWrapper className="pt-12 md:pt-16">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_12px_30px_rgba(17,22,29,0.06)] md:p-8">
          <p className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
            Easy Mode Explanation
          </p>
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
            Unlazy is like a friendly study game.
          </h1>
          <p className="mt-3 max-w-3xl text-base text-neutral-600 md:text-lg">
            You pick what to learn, do one small step, and watch your streak grow. We made it simple enough for a 5 year old brain.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CTAButton onClick={() => navigate(appEntryTarget)}>
              {isAuthenticated ? 'Open My App' : 'Start Unlazy'} <ArrowRight size={16} className="ml-1" />
            </CTAButton>
            <CTAButton variant="secondary" onClick={() => navigate('/')}>
              See Landing Again
            </CTAButton>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="Big Idea"
        title="Why this feels easy"
        description="Three things that make studying less scary and more fun"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorksHighlights.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_22px_rgba(17,22,29,0.05)]"
              >
                <div className="mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-neutral-700">
                  <Icon size={18} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">{item.title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </article>
            )
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="How To Use"
        title="4 simple steps"
        description="Do this loop daily and your progress compounds"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step) => (
            <article
              key={step.title}
              className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_22px_rgba(17,22,29,0.05)]"
            >
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-sm font-bold text-neutral-700">
                {step.emoji}
              </div>
              <h3 className="text-base font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{step.subtitle}</p>
              <p className="mt-3 text-sm text-neutral-600">{step.description}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="Feature Tour"
        title="Everything in your Unlazy workspace"
        description="Visual cards for each big feature in the app"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {howItWorksFeatureGroups.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.group}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_22px_rgba(17,22,29,0.05)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1.5 text-neutral-700">
                      <Icon size={15} />
                    </span>
                    {feature.group}
                  </div>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
                    Module
                  </span>
                </div>

                <FeaturePreview
                  label={feature.previewLabel}
                  value={feature.previewValue}
                  bars={feature.previewBars}
                  screenshot={feature.screenshot}
                  group={feature.group}
                />

                <ul className="space-y-1.5">
                  {feature.items.map((item) => (
                    <FeaturePill key={item} item={item} />
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper className="pb-10">
        <div className="rounded-3xl border border-amber-300/60 bg-amber-50/90 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Keep This Page Fresh</p>
          <p className="mt-2 text-sm text-amber-900 md:text-base">{howItWorksUpdateHint}</p>
        </div>
      </SectionWrapper>
    </div>
  )
}
