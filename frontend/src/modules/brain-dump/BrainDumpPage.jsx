import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useLearningStore } from '../../hooks/useLearningStore.jsx'
import { detectSubjectFromText } from '../../utils/smartInput.js'
import { getGuestData, saveGuestData } from '../../utils/guestStorage.js'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function BrainDumpPage() {
  const [dumpText, setDumpText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { state, addSubject, addTask } = useLearningStore()

  const handleOrganize = async () => {
    if (!dumpText.trim()) return
    setIsProcessing(true)

    const lines = dumpText.split('\n').filter(line => line.trim().length > 0)

    if (isAuthenticated) {
      for (const line of lines) {
        const title = line.trim()
        const detectedSubject = detectSubjectFromText(title)

        let subjectId = state.subjects.find(s => s.name.toLowerCase() === detectedSubject.toLowerCase())?.id

        if (!subjectId) {
          subjectId = crypto.randomUUID()
          await addSubject({
            id: subjectId,
            name: detectedSubject,
          })
        }

        await addTask({
          id: crypto.randomUUID(),
          title: title,
          subjectId: subjectId,
          type: 'Study',
          dueDate: new Date().toISOString(),
        })
      }
      navigate('/tasks')
    } else {
      const data = getGuestData()

      lines.forEach(line => {
        const title = line.trim()
        const detectedSubject = detectSubjectFromText(title)

        data.tasks.unshift({
          id: crypto.randomUUID(),
          title: title,
          subjectId: 'guest-subject',
          subjectName: detectedSubject,
          type: 'Study',
          completed: false,
          dueDate: new Date().toISOString()
        })
      })

      saveGuestData(data)
      // Since guests don't have a /tasks page readily available without auth in our logic,
      // we can redirect them to /focus to start the first dumped task, or back to /
      navigate('/focus', {
        state: {
          quickStartTaskTitle: lines[0],
          quickStartSubjectName: detectSubjectFromText(lines[0]),
          autoStart: true
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col p-4 md:p-8">
      <header className="flex items-center gap-4 mb-8 max-w-4xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-neutral-200 rounded-full transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-neutral-800">Brain Dump</h1>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        <p className="text-neutral-500 mb-6 text-sm">
          Type everything you need to study, line by line. We'll automatically turn them into actionable tasks and categorize them by subject.
        </p>

        <textarea
          value={dumpText}
          onChange={(e) => setDumpText(e.target.value)}
          placeholder="e.g.&#10;Read Biology chapter 4&#10;Solve 20 math problems&#10;Review physics notes"
          className="flex-1 w-full bg-white border border-neutral-200 rounded-2xl p-6 text-lg text-neutral-800 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 transition-all placeholder:text-neutral-300"
        />

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleOrganize}
            disabled={!dumpText.trim() || isProcessing}
            className="bg-neutral-900 text-white rounded-xl px-8 py-4 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors shadow-lg"
          >
            <Sparkles size={18} />
            {isProcessing ? 'Organizing...' : 'Organize for me'}
          </button>
        </div>
      </main>
    </div>
  )
}
