import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ClipboardList, Clock3, PlusCircle, Trash2, Zap } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Input from '../../components/Input.jsx'
import SectionHeading from '../../components/SectionHeading.jsx'
import SkeletonBlock from '../../components/SkeletonBlock.jsx'
import { useLearningStore } from '../../hooks/useLearningStore.jsx'
import { useToast } from '../../hooks/useToast.jsx'
import { TaskBreakdownModal } from './TaskBreakdownModal.jsx'

const TASK_TYPES = ['Study', 'Revision', 'Test']
const QUICK_DAY_OFFSETS = [
  { label: 'Today', offset: 0 },
  { label: 'Tomorrow', offset: 1 },
  { label: 'In 3 Days', offset: 3 },
]

const SUBJECT_PALETTES = [
  { backgroundColor: '#ecfeff', color: '#0e7490', borderColor: '#a5f3fc' },
  { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' },
  { backgroundColor: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' },
  { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' },
  { backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' },
  { backgroundColor: '#f0fdfa', color: '#0f766e', borderColor: '#99f6e4' },
]

const STATUS_STYLES = {
  overdue: {
    label: 'Overdue',
    badgeStyle: { backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' },
    rowBorderColor: '#fecaca',
  },
  today: {
    label: 'Due Today',
    badgeStyle: { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' },
    rowBorderColor: '#fde68a',
  },
  upcoming: {
    label: 'Upcoming',
    badgeStyle: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
    rowBorderColor: '#bfdbfe',
  },
  noDate: {
    label: 'No Date',
    badgeStyle: { backgroundColor: '#f5f5f5', color: '#525252', borderColor: '#d4d4d4' },
    rowBorderColor: '#e5e5e5',
  },
  completed: {
    label: 'Completed',
    badgeStyle: { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' },
    rowBorderColor: '#a7f3d0',
  },
}

function dateInputByOffset(offsetDays = 0) {
  const now = new Date()
  now.setDate(now.getDate() + offsetDays)
  return now.toISOString().slice(0, 10)
}

function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateLabel(dateValue) {
  if (!dateValue) return 'No due date'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function hashString(value = '') {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getSubjectPalette(subjectName = '') {
  const normalized = subjectName.toLowerCase()

  if (normalized.includes('math')) return SUBJECT_PALETTES[0]
  if (normalized.includes('physics')) return SUBJECT_PALETTES[1]
  if (normalized.includes('chem')) return SUBJECT_PALETTES[2]
  if (normalized.includes('bio')) return SUBJECT_PALETTES[3]
  if (normalized.includes('english')) return SUBJECT_PALETTES[4]
  if (normalized.includes('history')) return SUBJECT_PALETTES[5]

  return SUBJECT_PALETTES[hashString(subjectName) % SUBJECT_PALETTES.length]
}

function getTaskStatus(task) {
  if (task.completed) return 'completed'
  if (!task.dueDate) return 'noDate'

  const dueKey = task.dueDate.slice(0, 10)
  const todayKey = new Date().toISOString().slice(0, 10)

  if (dueKey < todayKey) return 'overdue'
  if (dueKey === todayKey) return 'today'
  return 'upcoming'
}

function TaskActionButton({ label, onClick, icon, tone = 'neutral' }) {
  const toneClassByType = {
    positive:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300',
    neutral:
      'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-300',
    danger:
      'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300',
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`group relative h-11 w-11 rounded-xl border p-0 shadow-sm ${toneClassByType[tone] || toneClassByType.neutral}`}
    >
      {createElement(icon, { size: 24, strokeWidth: 3 })}
      <span className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 hidden whitespace-nowrap rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 shadow-md group-hover:block">
        {label}
      </span>
    </Button>
  )
}

function TaskForm({
  title,
  setTitle,
  type,
  setType,
  subjectId,
  setSubjectId,
  dueDate,
  setDueDate,
  subjects,
  onSubmit,
  submitLabel,
}) {
  return (
    <form className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]" onSubmit={onSubmit}>
      <Input
        id="task-title-input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What are you finishing next? Be specific."
      />
      <select
        className="rounded-ui border border-neutral-200 bg-white px-s2 py-2 text-sm"
        value={type}
        onChange={(event) => setType(event.target.value)}
      >
        {TASK_TYPES.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
      <select
        className="rounded-ui border border-neutral-200 bg-white px-s2 py-2 text-sm"
        value={subjectId}
        onChange={(event) => setSubjectId(event.target.value)}
      >
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
      <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}

function TasksPageSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-24" />
      <div className="grid gap-3 sm:grid-cols-3">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <SkeletonBlock className="h-[380px]" />
        <SkeletonBlock className="h-[380px]" />
      </div>
    </div>
  )
}

export default function TasksPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, addTask, toggleTask, deleteTask } = useLearningStore()
  const { success, error, warning, info, dismissToast } = useToast()

  const [title, setTitle] = useState('')
  const [type, setType] = useState(TASK_TYPES[0])
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id || '')
  const [dueDate, setDueDate] = useState(todayDateInputValue())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [breakdownTask, setBreakdownTask] = useState(null)
  const pendingDeletesRef = useRef(new Map())
  const cameFromFocus = Boolean(location.state?.fromFocus)

  useEffect(() => {
    if (location.state?.openCreateTaskModal) {
      setIsCreateModalOpen(true)
      navigate('/tasks', { replace: true })
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (!subjectId && state.subjects[0]?.id) {
      setSubjectId(state.subjects[0].id)
    }
  }, [subjectId, state.subjects])

  useEffect(
    () => () => {
      pendingDeletesRef.current.forEach((entry) => window.clearTimeout(entry.timeoutId))
    },
    [],
  )

  const subjectNameById = useMemo(
    () => new Map(state.subjects.map((subject) => [subject.id, subject.name])),
    [state.subjects],
  )

  const grouped = useMemo(() => {
    const taskGroups = state.tasks.reduce(
      (acc, task) => {
        if (task.completed) acc.completed.push(task)
        else acc.pending.push(task)
        return acc
      },
      { pending: [], completed: [] },
    )

    taskGroups.pending.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    taskGroups.completed.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''))

    return taskGroups
  }, [state.tasks])

  const hasAnyTask = state.tasks.length > 0

  async function createTask(event) {
    event.preventDefault()

    if (!title.trim()) {
      warning('Task title required', 'Write a clear task title before saving.')
      return
    }

    if (!subjectId) {
      warning('Select a subject', 'Pick a subject so the task lands in the right track.')
      return
    }

    await addTask({
      title: title.trim(),
      subjectId,
      type,
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00.000Z`).toISOString() : undefined,
    })

    setTitle('')
    setDueDate(todayDateInputValue())
    setIsCreateModalOpen(false)
    success('Task created', 'Your task was added to the execution queue.')
  }

  async function confirmDelete(task) {
    const timeoutMs = 5000

    try {
      await deleteTask(task.id)

      const toastId = warning('Task deleted', 'This task was removed from your queue.', {
        actionLabel: 'Undo',
        durationMs: timeoutMs,
        onAction: async () => {
          const pending = pendingDeletesRef.current.get(task.id)
          if (!pending) return

          window.clearTimeout(pending.timeoutId)
          pendingDeletesRef.current.delete(task.id)
          dismissToast(pending.toastId)

          await addTask(pending.task)
          success('Task restored', 'Undo complete. Back in queue.')
        },
      })

      const timeoutId = window.setTimeout(() => {
        pendingDeletesRef.current.delete(task.id)
      }, timeoutMs)

      pendingDeletesRef.current.set(task.id, {
        task,
        toastId,
        timeoutId,
      })
    } catch {
      error('Delete failed', 'Task could not be deleted. Try again.')
    }
  }

  return (
    <div className="tasks-page space-y-s2">
      <SectionHeading
        title="Task System"
        subtitle="Capture tasks and execute with clarity."
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <PlusCircle size={16} />
              New Task
            </span>
          </Button>
        }
      />

      {cameFromFocus ? (
        <Card className="border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-neutral-900">Select a task to focus on</p>
          <p className="mt-1 text-xs text-neutral-600">
            Use the Focus selector on a pending task row to jump back and start immediately.
          </p>
        </Card>
      ) : null}

      {!state.bootstrapped ? (
        <TasksPageSkeleton />
      ) : (
        <>
          <Card className="p-4">
            <TaskForm
              title={title}
              setTitle={setTitle}
              type={type}
              setType={setType}
              subjectId={subjectId}
              setSubjectId={setSubjectId}
              dueDate={dueDate}
              setDueDate={setDueDate}
              subjects={state.subjects}
              onSubmit={createTask}
              submitLabel="Add Task"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Quick due date</p>
              {QUICK_DAY_OFFSETS.map((entry) => (
                <button
                  key={entry.label}
                  type="button"
                  onClick={() => setDueDate(dateInputByOffset(entry.offset))}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </Card>

          {!hasAnyTask ? (
            <EmptyState
              icon={ClipboardList}
              title="No tasks yet"
              description="Your queue is empty. Create your first task and turn intention into momentum."
              ctaLabel="Create your first task"
              onCta={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Total</p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900">{state.tasks.length}</p>
                  <p className="mt-1 text-xs text-neutral-500">System load across all subjects.</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Pending</p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900">{grouped.pending.length}</p>
                  <p className="mt-1 text-xs text-neutral-500">These are waiting for you, not motivation.</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Completed</p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900">{grouped.completed.length}</p>
                  <p className="mt-1 text-xs text-neutral-500">Proof that you can finish things.</p>
                </Card>
              </div>

              <div className="grid gap-s2 xl:grid-cols-2">
                <Card className="p-4">
                  <h3 className="text-lg text-neutral-900">Pending</h3>
                  {grouped.pending.length === 0 ? (
                    <EmptyState
                      icon={Clock3}
                      title="No pending tasks"
                      description="You are clear right now. Add the next meaningful task before context fades."
                      ctaLabel="Add next task"
                      onCta={() => setIsCreateModalOpen(true)}
                    />
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {grouped.pending.map((task) => {
                        const subjectName = subjectNameById.get(task.subjectId) || 'Unknown subject'
                        const subjectPalette = getSubjectPalette(subjectName)
                        const status = getTaskStatus(task)
                        const statusStyle = STATUS_STYLES[status]

                        return (
                          <li
                            key={task.id}
                            className="flex items-center justify-between rounded-[18px] border px-4 py-3 transition-all duration-300"
                            style={{ borderColor: statusStyle.rowBorderColor }}
                          >
                            <div>
                              <p className="text-sm font-medium text-neutral-900 transition-all duration-300">{task.title}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <span className="rounded-full border px-2 py-0.5 font-semibold" style={subjectPalette}>
                                  {subjectName}
                                </span>
                                <span className="text-neutral-500">{task.type}</span>
                                <span className="rounded-full border px-2 py-0.5 font-semibold" style={statusStyle.badgeStyle}>
                                  {statusStyle.label}
                                </span>
                                {task.dueDate && (
                                  <span className="text-neutral-500">Due {formatDateLabel(task.dueDate)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {cameFromFocus ? (
                                <Button
                                  variant="ghost"
                                  className="h-11 rounded-xl border border-primary/30 bg-primary/10 px-3 text-sm font-semibold text-primary hover:bg-primary/15"
                                  onClick={() =>
                                    navigate('/focus', {
                                      state: {
                                        selectedTaskId: task.id,
                                      },
                                    })
                                  }
                                >
                                  Focus
                                </Button>
                              ) : null}
                              <TaskActionButton
                                label="Break into steps"
                                onClick={() => setBreakdownTask(task)}
                                icon={Zap}
                                tone="neutral"
                              />
                              <TaskActionButton
                                label="Mark done"
                                onClick={() => toggleTask(task.id)}
                                icon={Check}
                                tone="positive"
                              />
                              <TaskActionButton
                                label="Delete task"
                                onClick={() => confirmDelete(task)}
                                icon={Trash2}
                                tone="danger"
                              />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg text-neutral-900">Completed</h3>
                  {grouped.completed.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <p className="text-sm font-medium text-neutral-800">Nothing completed yet.</p>
                      <p className="mt-1 text-xs text-neutral-500">Ship one task and this section starts telling a better story.</p>
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {grouped.completed.map((task) => {
                        const subjectName = subjectNameById.get(task.subjectId) || 'Unknown subject'
                        const subjectPalette = getSubjectPalette(subjectName)
                        const statusStyle = STATUS_STYLES.completed

                        return (
                          <li
                            key={task.id}
                            className="flex items-center justify-between rounded-[18px] border px-4 py-3 opacity-75 transition-all duration-300"
                            style={{ borderColor: statusStyle.rowBorderColor }}
                          >
                            <div>
                              <p className="text-sm font-medium text-neutral-900 line-through decoration-2 decoration-primary/60 transition-all duration-300">
                                {task.title}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <span className="rounded-full border px-2 py-0.5 font-semibold" style={subjectPalette}>
                                  {subjectName}
                                </span>
                                <span className="text-neutral-500">{task.type}</span>
                                <span className="rounded-full border px-2 py-0.5 font-semibold" style={statusStyle.badgeStyle}>
                                  {statusStyle.label}
                                </span>
                                {task.dueDate && (
                                  <span className="text-neutral-500">Due {formatDateLabel(task.dueDate)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <TaskActionButton
                                label="Mark pending"
                                onClick={() => toggleTask(task.id)}
                                icon={Clock3}
                                tone="neutral"
                              />
                              <TaskActionButton
                                label="Delete task"
                                onClick={() => confirmDelete(task)}
                                icon={Trash2}
                                tone="danger"
                              />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/45 p-4">
          <Card className="w-full max-w-4xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Quick Create</p>
                <h3 className="text-2xl text-neutral-900">Create Task</h3>
              </div>
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Close</Button>
            </div>
            <TaskForm
              title={title}
              setTitle={setTitle}
              type={type}
              setType={setType}
              subjectId={subjectId}
              setSubjectId={setSubjectId}
              dueDate={dueDate}
              setDueDate={setDueDate}
              subjects={state.subjects}
              onSubmit={createTask}
              submitLabel="Create"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Quick due date</p>
              {QUICK_DAY_OFFSETS.map((entry) => (
                <button
                  key={entry.label}
                  type="button"
                  onClick={() => setDueDate(dateInputByOffset(entry.offset))}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {state.subjects.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm font-semibold text-neutral-900">Create a subject first</p>
          <p className="mt-1 text-xs text-neutral-600">Tasks are linked to subjects. Add one subject to unlock task creation.</p>
          <Button
            className="mt-3"
            onClick={() => {
              info('No subjects yet', 'Redirecting to Subjects so you can add one first.')
              navigate('/subjects')
            }}
          >
            Guide me
          </Button>
        </Card>
      ) : null}

      {breakdownTask && (
        <TaskBreakdownModal
          task={breakdownTask}
          subject={state.subjects.find((s) => s.id === breakdownTask.subjectId)}
          onClose={() => setBreakdownTask(null)}
        />
      )}
    </div>
  )
}
