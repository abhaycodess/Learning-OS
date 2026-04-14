import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { detectSubjectFromText } from '../utils/smartInput.js'

export default function QuickInputBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [taskInput, setTaskInput] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + Shift + F or similar could open this, but we'll stick to fixed visibility
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setTaskInput('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!taskInput.trim()) return

    const subjectName = detectSubjectFromText(taskInput)

    // Auto-start focus session directly
    navigate('/focus', {
      state: {
        quickStartTaskTitle: taskInput,
        quickStartSubjectName: subjectName,
        autoStart: true
      }
    })

    setTaskInput('')
    setIsOpen(false)
  }

  // Floating minimal bar
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300">
      {isOpen ? (
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-white/70 backdrop-blur-md border border-neutral-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-2 py-2 w-[320px] md:w-[480px] animate-in slide-in-from-bottom-4 fade-in"
        >
          <input
            ref={inputRef}
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Quickly add what to study..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium text-neutral-800 placeholder:text-neutral-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!taskInput.trim()}
            className="bg-neutral-900 text-white rounded-full h-8 px-4 text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="ml-2 text-neutral-400 hover:text-neutral-600 p-1"
          >
            &times;
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
          className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md border border-neutral-200/50 shadow-lg hover:shadow-xl rounded-full px-5 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-all group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Quick Add</span>
        </button>
      )}
    </div>
  )
}
