/**
 * StudyCoachPage
 * Main page for AI Study Coach features: Chat, Summarize, Doubt Solver
 */

import React, { useMemo, useState } from 'react'
import { ArrowRight, FileText, HelpCircle, MessageSquare, RotateCcw, Sparkles } from 'lucide-react'
import { AIChatPanel } from './components/AIChatPanel'
import { DailyPlanPanel } from './components/DailyPlanPanel'
import { QuizPanel } from './components/QuizPanel'
import { useAIChat } from './hooks/useAIChat'
import { useLearningStore } from '../../hooks/useLearningStore'
import { analyzeNotes, generateDailyPlan, generateQuiz, runFeatureTool, summarizeNotes, solveDoubt } from './service'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../utils/cn'
import nexisAvatar from '../../assets/nexis-avatar.svg'

const TABS = [
  {
    id: 'chat',
    label: 'Coach Chat',
    icon: MessageSquare,
    description: 'Ask and discuss concepts',
  },
  {
    id: 'summarize',
    label: 'Summarize Notes',
    icon: FileText,
    description: 'Condense long notes quickly',
  },
  {
    id: 'note-analyzer',
    label: 'Note Analyzer',
    icon: Sparkles,
    description: 'Find gaps and improve notes',
  },
  {
    id: 'doubt',
    label: 'Solve Doubt',
    icon: HelpCircle,
    description: 'Get quick or deep explanations',
  },
  {
    id: 'quiz',
    label: 'Quiz Me',
    icon: FileText,
    description: 'Practice with generated questions',
  },
  {
    id: 'daily-plan',
    label: 'Daily Plan',
    icon: Sparkles,
    description: 'Generate today’s study roadmap',
  },
  {
    id: 'power-tools',
    label: 'Power Tools',
    icon: Sparkles,
    description: '10 advanced AI study features',
  },
]

const FEATURE_TOOL_OPTIONS = [
  {
    id: 'daily-streak-nudges',
    label: 'Daily Streak Nudges',
    placeholder: 'Optional mood input (e.g., low energy, distracted, motivated)',
  },
  {
    id: 'adaptive-revision-plan',
    label: 'Adaptive Revision Plan',
    placeholder: 'Enter topics separated by commas (e.g., Algebra, Trigonometry, Probability)',
  },
  {
    id: 'chapter-recap-mode',
    label: 'Chapter Recap Mode',
    placeholder: 'First line: chapter title. Remaining text: chapter notes.',
  },
  {
    id: 'exam-strategy-coach',
    label: 'Exam Strategy Coach',
    placeholder: 'Format: Exam Name | Full syllabus scope or target chapters',
  },
  {
    id: 'mistake-log-insights',
    label: 'Mistake Log Insights',
    placeholder: 'Paste your recent mistake log entries',
  },
  {
    id: 'concept-dependency-map',
    label: 'Concept Dependency Map',
    placeholder: 'Enter target topic (e.g., Integration by parts)',
  },
  {
    id: 'confidence-scoring-model',
    label: 'Confidence Scoring Model',
    placeholder: 'Enter topics separated by commas',
  },
  {
    id: 'personalized-warmups',
    label: 'Personalized Warmups',
    placeholder: 'Optional: subject name (leave empty to use active subject)',
  },
  {
    id: 'timed-drill-generator',
    label: 'Timed Drill Generator',
    placeholder: 'Enter drill topic (e.g., Chemical Bonding numericals)',
  },
  {
    id: 'flashcard-auto-maker',
    label: 'Flashcard Auto-Maker',
    placeholder: 'Paste notes/content to convert into flashcards',
  },
  {
    id: 'spaced-repetition-planner',
    label: 'Spaced Repetition Planner',
    placeholder: 'Enter topics separated by commas',
  },
  {
    id: 'answer-evaluator-ai',
    label: 'Answer Evaluator AI',
    placeholder: 'Format: question line, then --- line, then your answer',
  },
  {
    id: 'explanation-simplifier',
    label: 'Explanation Simplifier',
    placeholder: 'Paste any complex explanation to simplify',
  },
  {
    id: 'topic-mastery-tracker',
    label: 'Topic Mastery Tracker',
    placeholder: 'Enter topics separated by commas',
  },
  {
    id: 'session-interruption-alerts',
    label: 'Session Interruption Alerts',
    placeholder: 'Describe interruptions you face (phone, noise, social apps, etc.)',
  },
  {
    id: 'focus-music-advisor',
    label: 'Focus Music Advisor',
    placeholder: 'What are you studying right now? (e.g., memorization, problem-solving)',
  },
  {
    id: 'motivational-check-ins',
    label: 'Motivational Check-Ins',
    placeholder: 'Describe your current state (e.g., tired, anxious, procrastinating)',
  },
  {
    id: 'weekly-ai-report',
    label: 'Weekly AI Report',
    placeholder: 'Paste weekly activity notes, scores, and session summary',
  },
  {
    id: 'monthly-performance-digest',
    label: 'Monthly Performance Digest',
    placeholder: 'Paste monthly study data or summary',
  },
  {
    id: 'mentor-progress-brief',
    label: 'Mentor-Ready Progress Brief',
    placeholder: 'Format: first part profile, then --- line, then recent progress details',
  },
  {
    id: 'smart-doubt-clustering',
    label: 'Smart Doubt Clustering',
    placeholder: 'Paste raw doubts/questions collected from your study sessions',
  },
  {
    id: 'exam-countdown-planner',
    label: 'Exam Countdown Planner',
    placeholder: 'Format: YYYY-MM-DD | exam scope / syllabus chapters',
  },
  {
    id: 'syllabus-coverage-estimator',
    label: 'Syllabus Coverage Estimator',
    placeholder: 'Format: all topics comma-separated --- completed topics comma-separated',
  },
  {
    id: 'backlog-risk-detector',
    label: 'Backlog Risk Detector',
    placeholder: 'Paste pending tasks/backlog items',
  },
  {
    id: 'cognitive-load-monitor',
    label: 'Cognitive Load Monitor',
    placeholder: 'Describe your weekly study pattern, sleep, and stress',
  },
  {
    id: 'burnout-risk-warnings',
    label: 'Burnout Risk Warnings',
    placeholder: 'Paste behavior signals (fatigue, missed days, low focus, stress)',
  },
  {
    id: 'comeback-day-protocol',
    label: 'Comeback Day Protocol',
    placeholder: 'Describe your setback and where you want to restart from',
  },
  {
    id: 'ai-onboarding-tutor',
    label: 'AI Onboarding Tutor',
    placeholder: 'What is your learning goal right now?',
  },
  {
    id: 'multilingual-study-support',
    label: 'Multilingual Study Support',
    placeholder: 'Format: target language | source text to explain/translate',
  },
  {
    id: 'ai-reliability-guardrails',
    label: 'AI Reliability Guardrails',
    placeholder: 'Format: task context --- AI output to audit',
  },
]

function StudyCoachPage() {
  const [activeTab, setActiveTab] = useState('chat')
  const { state } = useLearningStore()

  const aiContext = useMemo(
    () => ({
      subject:
        state.subjects && state.subjects.length > 0
          ? {
              title: state.subjects[0]?.title,
              description: state.subjects[0]?.description,
            }
          : null,
      userStats: {
        streak: state.user?.behavior?.streakCount || 0,
        todayProgress: state.todayTasksProgress || 0,
        targetMinutes: state.behavior?.targetMinutes || 60,
        status: state.behavior?.status || 'not-started',
        actualMinutes: state.behavior?.actualMinutes || 0,
      },
    }),
    [state],
  )

  const prioritizedTasks = useMemo(() => {
    const tasks = Array.isArray(state.tasks) ? [...state.tasks] : []

    return tasks
      .filter((task) => !task.completed)
      .sort((left, right) => {
        const leftDate = left.dueDate ? new Date(left.dueDate).getTime() : Number.POSITIVE_INFINITY
        const rightDate = right.dueDate ? new Date(right.dueDate).getTime() : Number.POSITIVE_INFINITY

        if (leftDate !== rightDate) {
          return leftDate - rightDate
        }

        return (left.title || '').localeCompare(right.title || '')
      })
      .slice(0, 8)
  }, [state.tasks])

  const quickPrompts = useMemo(
    () => [
      'Explain this topic in simple terms for a beginner',
      'Give me a 20-minute study plan for today',
      'Quiz me with 5 quick questions from this subject',
      'Break this chapter into manageable sub-topics',
    ],
    [],
  )

  return (
    <div className="study-coach-full-bleed min-h-full flex flex-col text-[var(--text-main)]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'rgb(var(--brand-rgb) / 0.18)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'rgb(var(--brand-light-rgb) / 0.16)' }}
        />
      </div>

      <div className="w-full px-6 lg:pr-10 lg:pl-24 py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="p-1 rounded-xl" style={{ background: 'rgb(var(--brand-rgb) / 0.14)' }}>
              <img src={nexisAvatar} alt="Nexis avatar" className="w-12 h-12 rounded-lg object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nexis</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Your AI study partner for clear, structured learning support.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'rgb(var(--brand-rgb) / 0.12)' }}>
              Streak: {aiContext.userStats.streak}d
            </div>
            <div className="rounded-full px-3 py-1.5 text-xs font-semibold bg-[var(--bg-surface-alt)] text-[var(--text-muted)]">
              Progress: {aiContext.userStats.todayProgress}%
            </div>
            <div className="rounded-full px-3 py-1.5 text-xs font-semibold bg-[var(--bg-surface-alt)] text-[var(--text-muted)]">
              {aiContext.subject?.title || 'No subject selected'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col w-full px-6 lg:pr-10 lg:pl-24 py-4">
        <div className="inline-flex gap-2 mb-5 overflow-x-auto pb-2">
          {TABS.map(({ id, label, icon, description }) => {
            const TabIcon = icon

            return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'group flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-left whitespace-nowrap transition-all duration-200 border',
                activeTab === id
                  ? 'text-primary border-primary/25 bg-primary/10'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-alt)]',
              )}
            >
              <TabIcon className="w-4 h-4 mt-0.5" />
              <span className="flex flex-col">
                <span className="font-semibold text-sm">{label}</span>
                <span className="text-xs opacity-75">{description}</span>
              </span>
            </button>
            )
          })}
        </div>

        <div className="flex-1 min-h-0 animate-fadeIn overflow-hidden">
          {activeTab === 'chat' && <ChatTab context={aiContext} quickPrompts={quickPrompts} />}
          {activeTab === 'summarize' && <SummarizeTab context={aiContext} />}
          {activeTab === 'note-analyzer' && <NoteAnalyzerTab context={aiContext} />}
          {activeTab === 'doubt' && <DoubtTab context={aiContext} />}
          {activeTab === 'quiz' && <QuizTab context={aiContext} />}
          {activeTab === 'daily-plan' && <DailyPlanTab context={aiContext} tasks={prioritizedTasks} />}
          {activeTab === 'power-tools' && <FeatureToolsTab context={aiContext} />}
        </div>
      </div>
    </div>
  )
}

function ChatTab({ context, quickPrompts }) {
  const { messages, isLoading, sendMessage, messagesEndRef, newChat, clearChat } = useAIChat(context)

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[270px,1fr] gap-4">
      <aside className="hidden lg:flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-3 overflow-y-auto">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Quick Start Prompts
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Tap one to start a focused conversation.</p>
        </div>

        <div className="space-y-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={isLoading}
              className="w-full text-left text-xs px-3 py-2 rounded-lg bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-page)] border border-[var(--line)] text-[var(--text-main)] transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={newChat}
          className="mt-auto flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-alt)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Chat
        </button>

        <button
          type="button"
          onClick={() => clearChat()}
          className="flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-alt)]"
        >
          Clear Chat
        </button>
      </aside>

      <div className="h-full min-h-0 flex flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-surface)]">
        <AIChatPanel
          messages={messages}
          isLoading={isLoading}
          onSendMessage={(msg) => sendMessage(msg)}
          messagesEndRef={messagesEndRef}
          quickPrompts={quickPrompts}
        />
      </div>
    </div>
  )
}

function SummarizeTab({ context }) {
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSummarize = async () => {
    if (!notes.trim()) {
      toast({ message: 'Please enter notes to summarize', tone: 'warning' })
      return
    }

    try {
      setIsLoading(true)
      const result = await summarizeNotes(notes, context)
      setSummary(result.summary)
      toast({ message: 'Notes summarized successfully!', tone: 'success' })
    } catch (error) {
      toast({ message: error.message || 'Failed to summarize notes', tone: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <label className="block text-sm font-semibold">Paste your notes</label>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">Best for lecture notes, long answers, and revision material.</p>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste notes here..."
          className={cn(
            'flex-1 px-4 py-3 rounded-lg border',
            'border-[var(--line)] bg-[var(--bg-surface)] text-[var(--text-main)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-transparent',
            'resize-none font-sans text-sm leading-relaxed',
          )}
        />

        <button
          onClick={handleSummarize}
          disabled={isLoading || !notes.trim()}
          className={cn(
            'mt-4 px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            isLoading || !notes.trim()
              ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
              : 'bg-primary hover:bg-primary-light text-white hover:shadow-md active:scale-95',
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Generate Summary
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col min-h-0 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Summary Output</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">Structured and concise highlights for quick revision.</p>

        {summary ? (
          <div className="text-sm text-[var(--text-main)] space-y-2 flex-1 overflow-y-auto">
            <FormattedSummary content={summary} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[var(--text-muted)] text-sm italic">Your summary will appear here...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NoteAnalyzerTab({ context }) {
  const [notes, setNotes] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!notes.trim()) {
      toast({ message: 'Please enter notes to analyze', tone: 'warning' })
      return
    }

    try {
      setIsLoading(true)
      const result = await analyzeNotes(notes, context)
      setAnalysis(result.analysis)
      toast({ message: 'Notes analyzed successfully!', tone: 'success' })
    } catch (error) {
      toast({ message: error.message || 'Failed to analyze notes', tone: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <label className="block text-sm font-semibold">Paste notes for review</label>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Nexis will identify strong parts, missing pieces, and best next improvements.
        </p>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your notes or draft answer here..."
          className={cn(
            'flex-1 px-4 py-3 rounded-lg border',
            'border-[var(--line)] bg-[var(--bg-surface)] text-[var(--text-main)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-transparent',
            'resize-none font-sans text-sm leading-relaxed',
          )}
        />

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !notes.trim()}
          className={cn(
            'mt-4 px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            isLoading || !notes.trim()
              ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
              : 'bg-primary hover:bg-primary-light text-white hover:shadow-md active:scale-95',
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Notes
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col min-h-0 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Analysis Output</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">Actionable feedback appears here.</p>

        {analysis ? (
          <div className="text-sm text-[var(--text-main)] space-y-2 flex-1 overflow-y-auto">
            <FormattedSummary content={analysis} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[var(--text-muted)] text-sm italic">No analysis generated yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DoubtTab({ context }) {
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState('quick')
  const [explanation, setExplanation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSolveDoubt = async () => {
    if (!question.trim()) {
      toast({ message: 'Please enter a question', tone: 'warning' })
      return
    }

    try {
      setIsLoading(true)
      const result = await solveDoubt(question, mode, context)
      setExplanation(result.explanation)
      toast({ message: 'Question answered!', tone: 'success' })
    } catch (error) {
      toast({ message: error.message || 'Failed to answer question', tone: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <label className="block text-sm font-semibold">What is your doubt?</label>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">Ask one clear question for best answers.</p>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: Why does acceleration due to gravity stay nearly constant near Earth?"
          className={cn(
            'w-full px-4 py-3 rounded-lg border',
            'border-[var(--line)] bg-[var(--bg-surface)] text-[var(--text-main)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-0 focus:border-transparent',
            'resize-none font-sans text-sm h-32',
          )}
        />

        <div className="mt-6">
          <label className="block text-sm font-semibold mb-3">Explanation Depth</label>
          <div className="flex gap-3 mb-6">
            {[
              { value: 'quick', label: 'Quick', description: 'Short and direct' },
              { value: 'deep', label: 'Deep', description: 'Detailed and layered' },
            ].map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg font-medium transition-all border text-center space-y-0.5',
                  mode === value
                    ? 'bg-amber-100/60 border-amber-300/60 text-amber-700'
                    : 'bg-[var(--bg-surface)] border-[var(--line)] text-[var(--text-muted)] hover:border-amber-300/60',
                )}
              >
                <div className="text-sm">{label}</div>
                <div className="text-xs opacity-70">{description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSolveDoubt}
          disabled={isLoading || !question.trim()}
          className={cn(
            'w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            isLoading || !question.trim()
              ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-md active:scale-95',
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              Get Explanation
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col min-h-0 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Explanation</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">The answer appears here in an easy-to-review format.</p>

        {explanation ? (
          <div className="text-sm text-[var(--text-main)] space-y-2 flex-1 overflow-y-auto">
            <FormattedSummary content={explanation} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[var(--text-muted)] text-sm italic">The explanation will appear here...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DailyPlanTab({ context, tasks }) {
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const availableMinutes = context.userStats.targetMinutes || 60

  const handleGenerate = async () => {
    try {
      setIsLoading(true)
      const result = await generateDailyPlan({
        tasks: tasks.map((task) => ({
          title: task.title,
          type: task.type,
          dueDate: task.dueDate,
          completed: task.completed,
        })),
        subject: context.subject,
        userStats: context.userStats,
        availableMinutes,
        studyTime: context.userStats.status,
      })

      setPlan(result.dailyPlan)
      toast({ message: 'Daily plan generated!', tone: 'success' })
    } catch (error) {
      toast({ message: error.message || 'Failed to generate daily plan', tone: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
      <div className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Today’s roadmap</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Nexis will turn your current tasks into a realistic study sequence for today.
        </p>

        <div className="space-y-2 text-xs text-[var(--text-muted)] mb-5">
          <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface-alt)] px-3 py-2">
            <span>Available time</span>
            <span className="font-semibold text-[var(--text-main)]">{availableMinutes} min</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface-alt)] px-3 py-2">
            <span>Open tasks</span>
            <span className="font-semibold text-[var(--text-main)]">{tasks.length}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface-alt)] px-3 py-2">
            <span>Current streak</span>
            <span className="font-semibold text-[var(--text-main)]">{context.userStats.streak} days</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={cn(
            'mt-auto px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            isLoading
              ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
              : 'bg-primary hover:bg-primary-light text-white hover:shadow-md active:scale-95',
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Building Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Daily Plan
            </>
          )}
        </button>

        <div className="mt-4 text-xs text-[var(--text-muted)] leading-relaxed">
          <p>Use this when you want a focused day instead of a random study session.</p>
        </div>
      </div>

      <div className="flex flex-col min-h-0 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Plan Output</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">A structured plan will appear here after generation.</p>

        {plan ? (
          <div className="text-sm text-[var(--text-main)] space-y-2 flex-1 overflow-y-auto">
            <DailyPlanPanel plan={plan} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[var(--text-muted)] text-sm italic">No plan generated yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function QuizTab({ context }) {
  const [quiz, setQuiz] = useState(null)
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState('beginner')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    try {
      setIsLoading(true)
      const result = await generateQuiz({
        subject: context.subject,
        userStats: context.userStats,
        count,
        difficulty,
        focus: context.subject?.title || '',
      })

      setQuiz(result.quiz)
      toast({ message: 'Quiz generated!', tone: 'success' })
    } catch (error) {
      toast({ message: error.message || 'Failed to generate quiz', tone: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
      <div className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Quiz settings</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Generate a quick practice quiz from the current subject.
        </p>

        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">Questions</label>
        <input
          type="range"
          min="3"
          max="10"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1 mb-4">
          <span>3</span>
          <span className="font-semibold text-[var(--text-main)]">{count}</span>
          <span>10</span>
        </div>

        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">Difficulty</label>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDifficulty(value)}
              className={cn(
                'px-3 py-2 rounded-lg border text-xs font-semibold transition-all',
                difficulty === value
                  ? 'bg-primary/10 border-primary/25 text-primary'
                  : 'bg-[var(--bg-surface-alt)] border-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text-main)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={cn(
            'mt-auto px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            isLoading
              ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
              : 'bg-primary hover:bg-primary-light text-white hover:shadow-md active:scale-95',
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Building Quiz...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Generate Quiz
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col min-h-0 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Quiz Output</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">Your generated practice quiz will appear here.</p>

        {quiz ? (
          <div className="text-sm text-[var(--text-main)] space-y-2 flex-1 overflow-y-auto">
            <QuizPanel quiz={quiz} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[var(--text-muted)] text-sm italic">No quiz generated yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FeatureToolsTab({ context }) {
  const [toolId, setToolId] = useState('daily-streak-nudges')
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const activeTool = FEATURE_TOOL_OPTIONS.find((tool) => tool.id === toolId)

  const buildPayload = () => {
    const trimmed = inputText.trim()
    const base = {
      subject: context.subject,
      userStats: context.userStats,
    }

    switch (toolId) {
      case 'daily-streak-nudges':
        return {
          ...base,
          mood: trimmed || 'neutral',
          streakCount: context.userStats.streak,
          todayGoalMinutes: context.userStats.targetMinutes,
          missedDays: context.userStats.status === 'missed' ? 1 : 0,
          recentWins: [],
        }
      case 'adaptive-revision-plan':
        return {
          ...base,
          topics: trimmed
            .split(',')
            .map((topic) => topic.trim())
            .filter(Boolean),
          dailyMinutes: context.userStats.targetMinutes || 60,
          weakAreas: [],
        }
      case 'chapter-recap-mode': {
        const [firstLine, ...rest] = trimmed.split('\n')
        return {
          ...base,
          chapterTitle: firstLine?.trim() || context.subject?.title || 'Chapter recap',
          chapterNotes: rest.join('\n').trim() || trimmed,
        }
      }
      case 'exam-strategy-coach': {
        const [examName, syllabusScope] = trimmed.split('|').map((part) => part?.trim())
        return {
          ...base,
          examName: examName || 'Upcoming exam',
          syllabusScope: syllabusScope || 'Full syllabus',
          daysLeft: 30,
          dailyMinutes: context.userStats.targetMinutes || 90,
          strengths: [],
          weakAreas: [],
        }
      }
      case 'mistake-log-insights':
        return {
          ...base,
          subjectName: context.subject?.title || 'General',
          mistakeLog: trimmed,
        }
      case 'concept-dependency-map':
        return {
          ...base,
          targetTopic: trimmed,
          knownConcepts: [],
          depth: 'medium',
        }
      case 'confidence-scoring-model':
        return {
          ...base,
          topics: trimmed
            .split(',')
            .map((topic) => topic.trim())
            .filter(Boolean),
          recentPerformance: [],
        }
      case 'personalized-warmups':
        return {
          ...base,
          subjectName: trimmed || context.subject?.title || 'General',
          minutes: 10,
          weakAreas: [],
          energy: 'medium',
        }
      case 'timed-drill-generator':
        return {
          ...base,
          topic: trimmed,
          minutes: 20,
          difficulty: 'intermediate',
          questionCount: 8,
        }
      case 'flashcard-auto-maker':
        return {
          ...base,
          sourceNotes: trimmed,
          cardCount: 12,
          style: 'exam-ready',
        }
      case 'spaced-repetition-planner':
        return {
          ...base,
          topics: trimmed
            .split(',')
            .map((topic) => topic.trim())
            .filter(Boolean),
          days: 14,
          dailyMinutes: Math.max(20, context.userStats.targetMinutes || 30),
          retentionGoal: '85%',
        }
      case 'answer-evaluator-ai': {
        const [questionPart, answerPart] = trimmed.split('---')
        return {
          ...base,
          question: (questionPart || '').trim(),
          studentAnswer: (answerPart || '').trim(),
          rubric: 'clarity, correctness, structure, examples',
          maxScore: 10,
        }
      }
      case 'explanation-simplifier':
        return {
          ...base,
          sourceExplanation: trimmed,
          level: 'beginner',
          format: 'bullets',
        }
      case 'topic-mastery-tracker':
        return {
          ...base,
          topics: trimmed
            .split(',')
            .map((topic) => topic.trim())
            .filter(Boolean),
          recentScores: [],
          targetScore: 80,
        }
      case 'session-interruption-alerts':
        return {
          ...base,
          interruptionSignals: trimmed,
          sessionLengthMinutes: 45,
          environment: 'home',
        }
      case 'focus-music-advisor':
        return {
          ...base,
          studyType: trimmed,
          energy: 'medium',
          distractionLevel: 'moderate',
        }
      case 'motivational-check-ins':
        return {
          ...base,
          currentState: trimmed,
          goal: 'Finish one focused session',
          availableMinutes: Math.max(20, context.userStats.targetMinutes || 30),
        }
      case 'weekly-ai-report':
        return {
          ...base,
          weeklyData: trimmed,
          focusArea: context.subject?.title || 'general progress',
        }
      case 'monthly-performance-digest':
        return {
          ...base,
          monthlyData: trimmed,
          monthLabel: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        }
      case 'mentor-progress-brief': {
        const [profilePart, progressPart] = trimmed.split('---')
        return {
          ...base,
          studentProfile: (profilePart || '').trim(),
          recentProgress: (progressPart || '').trim(),
          objective: 'Mentor review and next-step guidance',
        }
      }
      case 'smart-doubt-clustering':
        return {
          ...base,
          doubtsLog: trimmed,
          subjectName: context.subject?.title || 'General',
        }
      case 'exam-countdown-planner': {
        const [examDatePart, scopePart] = trimmed.split('|').map((part) => part?.trim())
        return {
          ...base,
          examDate: examDatePart || '2026-12-31',
          syllabusScope: scopePart || context.subject?.title || 'General syllabus',
          dailyMinutes: context.userStats.targetMinutes || 90,
          revisionCycles: 3,
        }
      }
      case 'syllabus-coverage-estimator': {
        const [allTopicsPart, completedPart] = trimmed.split('---')
        return {
          ...base,
          syllabusTopics: (allTopicsPart || '')
            .split(',')
            .map((topic) => topic.trim())
            .filter(Boolean),
          completedTopics: (completedPart || '')
            .split(',')
            .map((topic) => topic.trim())
            .filter(Boolean),
          confidence: 'medium',
        }
      }
      case 'backlog-risk-detector':
        return {
          ...base,
          backlogItems: trimmed,
          horizonDays: 14,
        }
      case 'cognitive-load-monitor':
        return {
          ...base,
          studyPattern: trimmed,
          sleepHours: 7,
          stressLevel: 'medium',
        }
      case 'burnout-risk-warnings':
        return {
          ...base,
          behaviorSignals: trimmed,
          recoveryWindowDays: 7,
        }
      case 'comeback-day-protocol':
        return {
          ...base,
          setbackContext: trimmed,
          availableMinutes: Math.max(30, context.userStats.targetMinutes || 45),
        }
      case 'ai-onboarding-tutor':
        return {
          ...base,
          learnerGoal: trimmed,
          learnerLevel: 'beginner',
        }
      case 'multilingual-study-support': {
        const [languagePart, textPart] = trimmed.split('|')
        return {
          ...base,
          targetLanguage: (languagePart || '').trim(),
          sourceText: (textPart || '').trim(),
          mode: 'explain',
        }
      }
      case 'ai-reliability-guardrails': {
        const [taskPart, outputPart] = trimmed.split('---')
        return {
          ...base,
          taskContext: (taskPart || '').trim(),
          aiOutput: (outputPart || '').trim(),
          strictness: 'standard',
        }
      }
      default:
        return base
    }
  }

  const validateInput = () => {
    if (toolId === 'daily-streak-nudges') return true
    if (toolId === 'answer-evaluator-ai' || toolId === 'mentor-progress-brief') {
      const [partA, partB] = inputText.split('---')
      return Boolean(partA?.trim()) && Boolean(partB?.trim())
    }
    if (toolId === 'syllabus-coverage-estimator' || toolId === 'ai-reliability-guardrails') {
      const [partA, partB] = inputText.split('---')
      return Boolean(partA?.trim()) && Boolean(partB?.trim())
    }
    if (toolId === 'multilingual-study-support') {
      const [partA, partB] = inputText.split('|')
      return Boolean(partA?.trim()) && Boolean(partB?.trim())
    }
    return inputText.trim().length > 0
  }

  const extractResultText = (payload) => {
    const textKey = Object.keys(payload).find(
      (key) => !['tool', 'provider', 'availableTools'].includes(key) && typeof payload[key] === 'string',
    )
    return textKey ? payload[textKey] : ''
  }

  const handleRunTool = async () => {
    if (!validateInput()) {
      toast({ message: 'Please provide input for this tool', tone: 'warning' })
      return
    }

    try {
      setIsLoading(true)
      const response = await runFeatureTool(toolId, buildPayload())
      const output = extractResultText(response)

      setResult(output)
      toast({ message: `${activeTool.label} generated successfully`, tone: 'success' })
    } catch (error) {
      toast({ message: error.message || 'Failed to run tool', tone: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
      <div className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Roadmap Power Tools</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Use these to run advanced AI planning, tracking, and reliability workflows.
        </p>

        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">Select tool</label>
        <select
          value={toolId}
          onChange={(event) => {
            setToolId(event.target.value)
            setInputText('')
            setResult('')
          }}
          className="w-full mb-4 rounded-lg border border-[var(--line)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {FEATURE_TOOL_OPTIONS.map((tool) => (
            <option key={tool.id} value={tool.id}>
              {tool.label}
            </option>
          ))}
        </select>

        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">Input</label>
        <textarea
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          placeholder={activeTool?.placeholder}
          className={cn(
            'min-h-[180px] px-4 py-3 rounded-lg border',
            'border-[var(--line)] bg-[var(--bg-surface)] text-[var(--text-main)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-transparent',
            'resize-none font-sans text-sm leading-relaxed',
          )}
        />

        <button
          onClick={handleRunTool}
          disabled={isLoading}
          className={cn(
            'mt-4 px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            isLoading
              ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
              : 'bg-primary hover:bg-primary-light text-white hover:shadow-md active:scale-95',
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Tool
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col min-h-0 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Tool Output</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">Generated study output appears here.</p>

        {result ? (
          <div className="text-sm text-[var(--text-main)] space-y-2 flex-1 overflow-y-auto">
            <FormattedSummary content={result} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[var(--text-muted)] text-sm italic">No output yet. Select a tool and run it.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FormattedSummary({ content }) {
  if (!content) return null

  const lines = content.split('\n').filter((line) => line.trim() !== '')

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <p>{trimmed.slice(2)}</p>
            </div>
          )
        }

        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={idx} className="flex gap-2">
              <span className="flex-shrink-0 font-medium">{trimmed.match(/^\d+/)[0]}.</span>
              <p>{trimmed.replace(/^\d+\.\s/, '')}</p>
            </div>
          )
        }

        if (trimmed.endsWith(':') && trimmed.split(' ').length <= 5) {
          return (
            <p key={idx} className="font-semibold mt-2 text-[var(--text-main)]">
              {trimmed}
            </p>
          )
        }

        return <p key={idx}>{trimmed}</p>
      })}
    </div>
  )
}

export default StudyCoachPage
