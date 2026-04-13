import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../components/Card.jsx'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import { useLearningStore } from '../../hooks/useLearningStore.jsx'
import { getSubjectVisual } from './subjectCatalog.js'

function normalizeSubtopicName(subtopic) {
  if (!subtopic) return ''
  if (typeof subtopic === 'string') return subtopic
  if (typeof subtopic === 'object' && typeof subtopic.name === 'string') return subtopic.name
  return ''
}

export default function SubjectWorkspacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateSubject } = useLearningStore()

  const subject = useMemo(
    () => (state.subjects || []).find((entry) => entry.id === id) || null,
    [id, state.subjects],
  )

  const [newTopicName, setNewTopicName] = useState('')
  const [newSubtopicDraftByTopic, setNewSubtopicDraftByTopic] = useState({})
  const [error, setError] = useState('')
  const visual = useMemo(() => {
    if (!subject) return getSubjectVisual('')
    return {
      emoji: subject.emoji || getSubjectVisual(subject.name).emoji,
      coverImage: subject.coverImage || getSubjectVisual(subject.name).coverImage,
    }
  }, [subject])

  if (!subject) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/subjects')} className="inline-flex items-center gap-2">
          <ArrowLeft size={14} />
          Back to Subjects
        </Button>
        <Card className="p-8 text-center" tone="soft">
          <p className="text-lg font-semibold text-[var(--text-main)]">Subject not found</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">It may have been deleted.</p>
        </Card>
      </div>
    )
  }

  async function persistTopics(topics) {
    setError('')
    try {
      await updateSubject(subject.id, { topics })
    } catch (updateError) {
      setError(updateError.message || 'Unable to save changes right now.')
    }
  }

  async function addTopic() {
    const trimmed = newTopicName.trim()
    if (!trimmed) return

    const nextTopics = [
      ...(subject.topics || []),
      {
        id: crypto.randomUUID(),
        name: trimmed,
        subtopics: [],
      },
    ]

    await persistTopics(nextTopics)
    setNewTopicName('')
  }

  async function renameTopic(topicId, currentName) {
    const next = window.prompt('Rename topic', currentName)
    if (next === null) return

    const trimmed = next.trim()
    if (!trimmed) return

    const nextTopics = (subject.topics || []).map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            name: trimmed,
          }
        : topic,
    )

    await persistTopics(nextTopics)
  }

  async function removeTopic(topicId) {
    const shouldDelete = window.confirm('Delete this topic and its subtopics?')
    if (!shouldDelete) return

    const nextTopics = (subject.topics || []).filter((topic) => topic.id !== topicId)
    await persistTopics(nextTopics)
  }

  async function addSubtopic(topicId) {
    const draft = (newSubtopicDraftByTopic[topicId] || '').trim()
    if (!draft) return

    const nextTopics = (subject.topics || []).map((topic) => {
      if (topic.id !== topicId) return topic

      return {
        ...topic,
        subtopics: [
          ...(topic.subtopics || []),
          {
            id: crypto.randomUUID(),
            name: draft,
            notes: '',
          },
        ],
      }
    })

    await persistTopics(nextTopics)
    setNewSubtopicDraftByTopic((prev) => ({ ...prev, [topicId]: '' }))
  }

  async function removeSubtopic(topicId, subtopicId) {
    const nextTopics = (subject.topics || []).map((topic) => {
      if (topic.id !== topicId) return topic
      return {
        ...topic,
        subtopics: (topic.subtopics || []).filter((subtopic) => subtopic.id !== subtopicId),
      }
    })

    await persistTopics(nextTopics)
  }

  async function renameSubtopic(topicId, subtopicId, currentName) {
    const next = window.prompt('Rename subtopic', currentName)
    if (next === null) return

    const trimmed = next.trim()
    if (!trimmed) return

    const nextTopics = (subject.topics || []).map((topic) => {
      if (topic.id !== topicId) return topic

      return {
        ...topic,
        subtopics: (topic.subtopics || []).map((subtopic) =>
          subtopic.id === subtopicId
            ? {
                ...subtopic,
                name: trimmed,
              }
            : subtopic,
        ),
      }
    })

    await persistTopics(nextTopics)
  }

  async function updateSubtopicNotes(topicId, subtopicId, notes) {
    const nextTopics = (subject.topics || []).map((topic) => {
      if (topic.id !== topicId) return topic

      return {
        ...topic,
        subtopics: (topic.subtopics || []).map((subtopic) =>
          subtopic.id === subtopicId
            ? {
                ...subtopic,
                notes,
              }
            : subtopic,
        ),
      }
    })

    await persistTopics(nextTopics)
  }

  async function saveNotesFromBlur(topicId, subtopic, nextValue) {
    const currentValue = typeof subtopic.notes === 'string' ? subtopic.notes : ''
    if (nextValue === currentValue) return

    await updateSubtopicNotes(topicId, subtopic.id, nextValue)
  }

  return (
    <div className="subjects-page space-y-5">
      <Button variant="ghost" onClick={() => navigate('/subjects')} className="inline-flex items-center gap-2">
        <ArrowLeft size={14} />
        Back to Subjects
      </Button>

      <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)]">
        <div className="h-36 w-full border-b border-[var(--line)]" style={{ backgroundImage: visual.coverImage }} />
        <div className="p-6">
          <p className="text-4xl">{visual.emoji}</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-main)]">{subject.name}</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">A clean workspace for topics, subtopics, and notes.</p>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-[var(--text-main)]">Topics</h2>
        <div className="mt-3 flex gap-2">
          <Input
            value={newTopicName}
            onChange={(event) => setNewTopicName(event.target.value)}
            placeholder="Add a topic"
          />
          <Button onClick={addTopic} className="inline-flex items-center gap-2">
            <Plus size={14} />
            Add Topic
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {(subject.topics || []).map((topic) => (
          <Card key={topic.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-[var(--text-main)]">{topic.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => renameTopic(topic.id, topic.name)}
                  className="rounded-md border border-[var(--line)] px-2 py-1 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface-alt)]"
                >
                  Rename Topic
                </button>
                <button
                  type="button"
                  onClick={() => removeTopic(topic.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 size={12} />
                  Delete Topic
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={newSubtopicDraftByTopic[topic.id] || ''}
                onChange={(event) =>
                  setNewSubtopicDraftByTopic((prev) => ({ ...prev, [topic.id]: event.target.value }))
                }
                placeholder="Add subtopic"
              />
              <Button onClick={() => addSubtopic(topic.id)}>Add</Button>
            </div>

            <div className="mt-4 space-y-3">
              {(topic.subtopics || []).map((subtopic) => (
                <div key={subtopic.id} className="rounded-xl border border-[var(--line)] bg-[var(--bg-surface-alt)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--text-main)]">{normalizeSubtopicName(subtopic)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => renameSubtopic(topic.id, subtopic.id, normalizeSubtopicName(subtopic))}
                        className="rounded-md border border-[var(--line)] px-2 py-1 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubtopic(topic.id, subtopic.id)}
                        className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <label className="mt-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Notes
                  </label>
                  <textarea
                    defaultValue={typeof subtopic.notes === 'string' ? subtopic.notes : ''}
                    onBlur={(event) => saveNotesFromBlur(topic.id, subtopic, event.target.value)}
                    placeholder="Capture concise notes for this subtopic..."
                    className="mt-2 min-h-24 w-full rounded-lg border border-[var(--line)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-primary"
                  />
                </div>
              ))}

              {(topic.subtopics || []).length === 0 && (
                <p className="text-sm text-[var(--text-muted)]">No subtopics yet. Add one to start notes.</p>
              )}
            </div>
          </Card>
        ))}

        {(subject.topics || []).length === 0 && (
          <Card className="p-6 text-center" tone="soft">
            <p className="text-sm text-[var(--text-muted)]">No topics yet. Add your first topic above.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
