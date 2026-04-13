import { useMemo, useState } from 'react'
import { ArrowRight, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import Input from '../../components/Input.jsx'
import SectionHeading from '../../components/SectionHeading.jsx'
import { useLearningStore } from '../../hooks/useLearningStore.jsx'
import { useUserProfile } from '../../hooks/useUserProfile.jsx'
import {
  buildSubjectFromName,
  getRoleQuickStartSubjects,
  getSubjectVisual,
  normalizeSubjectName,
} from './subjectCatalog.js'

function countSubtopics(subject) {
  return (subject.topics || []).reduce((sum, topic) => sum + (topic.subtopics || []).length, 0)
}

export default function SubjectsPage() {
  const navigate = useNavigate()
  const { state, addSubject, addSubjects, deleteSubject } = useLearningStore()
  const { userProfile } = useUserProfile()
  const [subjectName, setSubjectName] = useState('')
  const [actionError, setActionError] = useState('')
  const [pendingDeleteSubject, setPendingDeleteSubject] = useState(null)

  const existingSubjects = useMemo(
    () => new Set((state.subjects || []).map((subject) => normalizeSubjectName(subject.name))),
    [state.subjects],
  )

  const roleQuickStart = useMemo(
    () => getRoleQuickStartSubjects(userProfile?.role).filter((name) => !existingSubjects.has(normalizeSubjectName(name))),
    [existingSubjects, userProfile?.role],
  )

  const profileSubjects = useMemo(
    () =>
      (userProfile?.subjects || [])
        .filter((entry) => typeof entry === 'string' && entry.trim())
        .filter((entry) => !existingSubjects.has(normalizeSubjectName(entry))),
    [existingSubjects, userProfile?.subjects],
  )

  const stats = useMemo(() => {
    const totalTopics = (state.subjects || []).reduce((sum, subject) => sum + (subject.topics || []).length, 0)
    const totalSubtopics = (state.subjects || []).reduce((sum, subject) => sum + countSubtopics(subject), 0)

    return {
      totalSubjects: (state.subjects || []).length,
      totalTopics,
      totalSubtopics,
    }
  }, [state.subjects])

  async function addSingleSubject(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (existingSubjects.has(normalizeSubjectName(trimmed))) {
      setActionError('This subject already exists.')
      return
    }

    setActionError('')
    await addSubject(buildSubjectFromName(trimmed))
    setSubjectName('')
  }

  async function addAllFromProfile() {
    if (profileSubjects.length === 0) return

    setActionError('')
    await addSubjects(profileSubjects.map((name) => buildSubjectFromName(name)))
  }

  async function removeSubject(subject) {
    setPendingDeleteSubject(subject)
  }

  async function confirmDeleteSubject() {
    if (!pendingDeleteSubject) return

    setActionError('')
    try {
      await deleteSubject(pendingDeleteSubject.id)
      setPendingDeleteSubject(null)
    } catch (error) {
      setActionError(error.message || 'Unable to delete subject right now.')
    }
  }

  return (
    <div className="subjects-page space-y-4">
      <SectionHeading
        title="Subjects Workspace"
        subtitle="A clean, Notion-style home for your learning system. Open any subject to manage topics, subtopics, and notes."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-5" tone="soft">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Subjects</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-main)]">{stats.totalSubjects}</p>
        </Card>
        <Card className="p-5" tone="soft">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Topics</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-main)]">{stats.totalTopics}</p>
        </Card>
        <Card className="p-5" tone="soft">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Subtopics</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-main)]">{stats.totalSubtopics}</p>
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Create Subject</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            value={subjectName}
            onChange={(event) => setSubjectName(event.target.value)}
            placeholder="Add a subject"
          />
          <Button onClick={() => addSingleSubject(subjectName)} className="inline-flex items-center gap-2">
            <Plus size={14} />
            Add
          </Button>
          {profileSubjects.length > 0 && (
            <Button variant="ghost" onClick={addAllFromProfile} className="inline-flex items-center gap-2">
              <Sparkles size={14} />
              Import from Profile
            </Button>
          )}
        </div>

        {actionError && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {actionError}
          </div>
        )}
      </Card>

      {roleQuickStart.length > 0 && (
        <Card className="p-5" tone="soft">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Quick Start For Your Role</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roleQuickStart.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => addSingleSubject(subject)}
                className="rounded-full border border-[var(--line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface-alt)]"
              >
                + {subject}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(state.subjects || []).map((subject) => {
          const visual = {
            emoji: subject.emoji || getSubjectVisual(subject.name).emoji,
            coverImage: subject.coverImage || getSubjectVisual(subject.name).coverImage,
          }

          return (
            <article key={subject.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)]">
              <div className="h-20 w-full border-b border-[var(--line)]" style={{ backgroundImage: visual.coverImage }} />
              <div className="p-4">
                <button
                  type="button"
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                  className="w-full text-left"
                >
                  <p className="text-2xl">{visual.emoji}</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-main)]">{subject.name}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {(subject.topics || []).length} topics · {countSubtopics(subject)} subtopics
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Open workspace
                    <ArrowRight size={14} />
                  </p>
                </button>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeSubject(subject)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {(state.subjects || []).length === 0 && (
        <Card className="p-8 text-center" tone="soft">
          <p className="text-lg font-semibold text-[var(--text-main)]">No subjects yet</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Add one subject to start your workspace.</p>
        </Card>
      )}

      {pendingDeleteSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-[2px] px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)]/85 p-5 shadow-2xl">
            <p className="text-lg font-semibold text-[var(--text-main)]">Delete Subject</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Delete {pendingDeleteSubject.name}? This will also remove linked tasks.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteSubject(null)}
                className="rounded-lg border border-[var(--line)] bg-[var(--bg-surface-alt)] px-3 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSubject}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
