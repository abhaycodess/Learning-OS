import { useMemo } from 'react'
import { ArrowRight, BarChart3, CalendarCheck2, CheckCircle2, Flame, Focus, Layers3, Sparkles, Target, Timer, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import SectionWrapper from './components/SectionWrapper.jsx'
import CTAButton from './components/CTAButton.jsx'
import FeatureCard from './components/FeatureCard.jsx'
import { BrandMark } from '../../components/BrandMark.jsx'

const problemPoints = [
  'You make plans. Then ignore them.',
  'You open YouTube. End up anywhere but studying.',
  'You feel busy. But not productive.',
  'You wait for motivation. It never shows up.',
]

const solutionCards = [
  {
    icon: Layers3,
    title: 'Planning',
    description: 'Plan what actually gets done with a system built around your goals.',
  },
  {
    icon: BarChart3,
    title: 'Tracking',
    description: 'Track what actually matters with visible progress and completion trends.',
  },
  {
    icon: Focus,
    title: 'Focus',
    description: 'Control distractions with structured deep-work sessions.',
  },
  {
    icon: Flame,
    title: 'Consistency',
    description: 'Build discipline daily without waiting for motivation to show up.',
  },
]

const showcase = [
  {
    icon: BarChart3,
    title: 'Dashboard Preview',
    description: 'See your tasks, subjects, and momentum in one glance.',
    points: ['Daily tasks and completion', 'Subject-wise progress bars', 'System snapshot cards'],
  },
  {
    icon: Target,
    title: 'Goal-based Planning',
    description: 'Personalized plans from your onboarding choices.',
    points: ['Goal-aligned priorities', 'No random task piles', 'Weekly direction clarity'],
  },
  {
    icon: Timer,
    title: 'Focus Mode',
    description: 'Deep work sessions with less mental friction.',
    points: ['Start a focused block fast', 'Reduce context switching', 'End with measurable output'],
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Track improvement, not just activity.',
    points: ['Consistency streak signals', 'Trend visibility over time', 'Feedback loop for progress'],
  },
]

const steps = [
  'Tell us what you want.',
  'We build your system.',
  'You show up.',
  'It compounds.',
]

const testimonials = [
  {
    quote: 'I stopped overthinking and started finishing.',
    name: 'Aarav S.',
    role: 'Class 11 Student',
  },
  {
    quote: 'It feels like someone finally organized my brain.',
    name: 'Riya K.',
    role: 'B.Tech Student',
  },
  {
    quote: 'I did not need motivation. I needed this.',
    name: 'Neha P.',
    role: 'NEET Aspirant',
  },
]

function HeroVisual() {
  return (
    <div className="relative rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_24px_48px_rgba(17,22,29,0.1)] md:p-5">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Unlazy</p>
          <p className="text-sm text-neutral-800">Your Study Command Center</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Today</p>
          <p className="mt-2 text-sm text-neutral-900">6 tasks planned</p>
          <div className="mt-2 h-2 rounded-full bg-neutral-200">
            <div className="h-2 w-2/3 rounded-full bg-primary" />
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Focus Block</p>
          <p className="mt-2 text-sm text-neutral-900">45 min deep work</p>
          <p className="mt-1 text-xs text-neutral-500">No distractions mode enabled</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Subjects</p>
          <div className="mt-2 space-y-2 text-xs text-neutral-700">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span>Mathematics</span>
                <span>72%</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-200">
                <div className="h-2 w-[72%] rounded-full bg-primary" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span>Physics</span>
                <span>54%</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-200">
                <div className="h-2 w-[54%] rounded-full bg-primary-light" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, requiresOnboarding, user } = useAuth()

  const dashboardTarget = useMemo(
    () => (isAuthenticated ? (requiresOnboarding ? '/onboarding' : '/dashboard') : '/'),
    [isAuthenticated, requiresOnboarding],
  )

  const firstName = useMemo(() => {
    const source = user?.firstName || user?.name || 'there'
    return source.trim().split(/\s+/)[0] || 'there'
  }, [user?.firstName, user?.name])

  const avatarSrc = user?.profilePhoto || ''
  const profileInitial = firstName.charAt(0).toUpperCase()

  const handleAuthAction = (tab) => {
    window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab } }))
    navigate('/auth')
  }

  const handleDemoScroll = () => {
    const section = document.getElementById('showcase')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(99,82,200,0.12),transparent_35%),linear-gradient(180deg,#f7f8fc_0%,#eef1f7_100%)] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3"
          >
            <BrandMark size={44} rounded="xl" surface="transparent" />
            <span className="text-base font-semibold uppercase tracking-[0.14em] text-neutral-700">Unlazy</span>
          </button>

          <nav className="hidden items-center gap-5 text-sm text-neutral-600 md:flex">
            <a href="#problem" className="transition hover:text-neutral-900">Why it works</a>
            <a href="#showcase" className="transition hover:text-neutral-900">Features</a>
            <button
              type="button"
              onClick={() => navigate('/how-it-works')}
              className="transition hover:text-neutral-900"
            >
              How it works
            </button>
            <a href="#testimonials" className="transition hover:text-neutral-900">Stories</a>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate(dashboardTarget)}
                aria-label="Open dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-2 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-white"
              >
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-primary text-xs font-bold text-white">
                  {avatarSrc ? <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" /> : profileInitial}
                </span>
                <span className="hidden pr-1 sm:inline">Hi, {firstName}</span>
              </button>
            ) : (
              <>
                <CTAButton
                  variant="secondary"
                  onClick={() => {
                    handleAuthAction('login')
                  }}
                >
                  Login
                </CTAButton>
                <CTAButton
                  onClick={() => {
                    handleAuthAction('signup')
                  }}
                >
                  Signup
                </CTAButton>
              </>
            )}
          </div>
        </div>
      </header>

      <SectionWrapper className="pt-12 md:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_480px]">
          <div>
            <p className="inline-flex rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
              Built for students who want consistency, not chaos
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
              Stop Studying Randomly. Build Your Learning System.
            </h1>
            <p className="mt-4 max-w-xl text-base text-neutral-600 md:text-lg">
              Unlazy helps you plan, track, and stay consistent - all in one place.
            </p>
            <p className="mt-2 text-sm text-neutral-500">Because I will start tomorrow is getting old.</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CTAButton
                onClick={() => {
                  if (isAuthenticated) {
                    navigate(dashboardTarget)
                    return
                  }
                  handleAuthAction('signup')
                }}
              >
                Get Started <ArrowRight size={16} className="ml-1" />
              </CTAButton>
              <CTAButton variant="secondary" onClick={handleDemoScroll}>
                View Demo
              </CTAButton>
              <CTAButton
                variant="secondary"
                onClick={() => navigate('/how-it-works')}
              >
                How It Works
              </CTAButton>
            </div>
          </div>

          <HeroVisual />
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="problem"
        eyebrow="The Problem"
        title="Why most students fail to stay consistent"
        description="Lets be honest. It is not a talent gap. It is a system gap."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {problemPoints.map((point) => (
            <article
              key={point}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_22px_rgba(17,22,29,0.06)] transition-all duration-200 hover:-translate-y-[1px]"
            >
              <p className="text-sm font-medium text-neutral-800">{point}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm text-neutral-600">It is not you. It is the lack of a system.</p>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="The Solution"
        title="Your Personal Learning Operating System"
        description="Unlazy is not another app. It is how your studying should have worked from day one."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {solutionCards.map((card) => (
            <FeatureCard key={card.title} icon={card.icon} title={card.title} description={card.description} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="showcase"
        eyebrow="Feature Showcase"
        title="A system you can actually follow"
        description="No fluff UI. Every module exists to help you plan, execute, and improve."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {showcase.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_12px_26px_rgba(17,22,29,0.07)]"
              >
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <Icon size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">{item.title}</p>
                </div>
                <p className="text-sm text-neutral-600">{item.description}</p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 text-emerald-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="how-it-works"
        eyebrow="How It Works"
        title="No magic. Just structure."
        description="That is it. No hacks. No shortcuts."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_20px_rgba(17,22,29,0.06)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step {index + 1}</p>
              <p className="mt-2 text-sm font-medium text-neutral-800">{step}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper id="testimonials" eyebrow="Social Proof" title="What changed after students built a system">
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-700">"{item.quote}"</p>
              <p className="mt-4 text-sm font-semibold text-neutral-900">{item.name}</p>
              <p className="text-xs text-neutral-500">{item.role}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="pb-8">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_40px_rgba(17,22,29,0.08)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Final Push</p>
          <h2 className="mt-2 text-3xl md:text-4xl">Start building your system today</h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600 md:text-base">
            Your future depends on what you do daily. No pressure. Just progress.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <CTAButton
              onClick={() => {
                if (isAuthenticated) {
                  navigate(dashboardTarget)
                  return
                }
                handleAuthAction('signup')
              }}
            >
              Get Started
            </CTAButton>
            <CTAButton variant="secondary" onClick={() => handleAuthAction('signup')}>
              Sign Up
            </CTAButton>
          </div>
        </div>
      </SectionWrapper>

      <footer className="border-t border-neutral-200/80 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-neutral-600 md:px-6">
          <p>Unlazy</p>
          <div className="flex items-center gap-4">
            <a href="#" className="transition hover:text-neutral-900">About</a>
            <a href="#" className="transition hover:text-neutral-900">Contact</a>
            <a href="#" className="transition hover:text-neutral-900">Privacy</a>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? dashboardTarget : '/')}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-700 transition hover:bg-neutral-100"
            >
              Dashboard
            </button>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-30">
        <CTAButton
          onClick={() => navigate(isAuthenticated ? dashboardTarget : '/auth')}
          className="rounded-full px-4 py-3 shadow-[0_16px_34px_rgba(99,82,200,0.35)]"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Start Now'}
        </CTAButton>
      </div>
    </div>
  )
}
