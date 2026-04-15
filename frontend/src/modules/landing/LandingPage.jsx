import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { detectSubjectFromText } from '../../utils/smartInput.js'
import { getGuestData, getGuestMostStudiedSubject } from '../../utils/guestStorage.js'
import { BrandMark } from '../../components/BrandMark.jsx'
import { Play, Brain, Target, BarChart3, LayoutDashboard, UserPlus } from 'lucide-react'
import { formatClock } from '../../utils/time.js'

export default function LandingPage() {
  const [taskInput, setTaskInput] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, requiresOnboarding } = useAuth()

  const [guestProgress, setGuestProgress] = useState({
    totalStudySeconds: 0,
    streakDays: 0,
    mostStudied: 'None'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      const data = getGuestData()
      setGuestProgress({
        totalStudySeconds: data.progress.totalStudySeconds,
        streakDays: data.progress.streakDays,
        mostStudied: getGuestMostStudiedSubject()
      })
    }
  }, [isAuthenticated])

  const handleStartFocus = (e) => {
    e?.preventDefault()
    if (!taskInput.trim()) return

    const subjectName = detectSubjectFromText(taskInput)

    // Navigate to focus page with the state indicating we want to start a quick session
    navigate('/focus', {
      state: {
        quickStartTaskTitle: taskInput,
        quickStartSubjectName: subjectName,
        autoStart: true
      }
    })
  }

  const handleBrainDump = () => {
    navigate('/brain-dump')
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans flex flex-col items-center justify-center p-4">
      {/* Top right actions */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        {isAuthenticated ? (
          <button
            onClick={() => navigate(requiresOnboarding ? '/onboarding' : '/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition bg-white px-4 py-2 rounded-full shadow-sm border border-neutral-200"
          >
            <LayoutDashboard size={16} />
            Go to Dashboard
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition px-4 py-2 rounded-full shadow-sm"
            >
              <UserPlus size={16} />
              Sign up
            </button>
          </>
        )}
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        <BrandMark size={96} rounded="2xl" className="mb-8" surface="transparent" />

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-800 mb-8">
          What do you want to study?
        </h1>

        <form onSubmit={handleStartFocus} className="w-full relative max-w-xl group">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="e.g. Physics Chapter 4..."
            className="w-full text-lg md:text-xl py-4 pl-6 pr-32 rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 transition-all placeholder:text-neutral-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={!taskInput.trim()}
            className="absolute right-2 top-2 bottom-2 bg-neutral-900 text-white rounded-xl px-5 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
          >
            <Play size={16} fill="currentColor" />
            Start Focus
          </button>
        </form>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleBrainDump}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 bg-white border border-neutral-200 px-4 py-2 rounded-full shadow-sm transition"
          >
            <Brain size={16} />
            Brain Dump Mode
          </button>
        </div>

        {/* Guest Progress Section */}
        {!isAuthenticated && (
          <div className="mt-20 w-full max-w-lg grid grid-cols-3 gap-4 border-t border-neutral-200 pt-10">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <Target size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Today</span>
              </div>
              <span className="text-xl font-medium text-neutral-800">
                {formatClock(guestProgress.totalStudySeconds).replace(/^00:/, '')}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Streak</span>
              </div>
              <span className="text-xl font-medium text-neutral-800 flex items-center gap-1">
                {guestProgress.streakDays} <span className="text-orange-500 text-sm">🔥</span>
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <BarChart3 size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Top Subject</span>
              </div>
              <span className="text-lg font-medium text-neutral-800 truncate max-w-full px-2">
                {guestProgress.mostStudied}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
