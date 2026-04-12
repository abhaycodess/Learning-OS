import { useMemo, useState } from 'react'
import { Sparkles, Target } from 'lucide-react'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import Input from '../../components/Input.jsx'
import SectionHeading from '../../components/SectionHeading.jsx'
import { useLearningStore } from '../../hooks/useLearningStore.jsx'
import { useUserProfile } from '../../hooks/useUserProfile.jsx'

const QUICK_START_SUBJECTS = [
  'Physics',
  'Mathematics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
]

const AUTO_TOPICS_BY_SUBJECT = {
  Physics: [
    { name: 'Mechanics', subtopics: ['Kinematics', 'Laws of Motion', 'Work and Energy'] },
    { name: 'Electromagnetism', subtopics: ['Electric Fields', 'Current Electricity', 'Magnetism'] },
  ],
  Mathematics: [
    { name: 'Algebra', subtopics: ['Linear Equations', 'Quadratic Equations', 'Functions'] },
    { name: 'Calculus', subtopics: ['Limits', 'Differentiation', 'Integration'] },
  ],
  Chemistry: [
    { name: 'Physical Chemistry', subtopics: ['Mole Concept', 'Thermodynamics', 'Chemical Kinetics'] },
    { name: 'Organic Chemistry', subtopics: ['Hydrocarbons', 'Reaction Mechanisms', 'Functional Groups'] },
  ],
  Biology: [
    { name: 'Cell Biology', subtopics: ['Cell Structure', 'Cell Cycle', 'Biomolecules'] },
    { name: 'Human Physiology', subtopics: ['Digestive System', 'Respiratory System', 'Nervous System'] },
  ],
  'Computer Science': [
    { name: 'Programming Basics', subtopics: ['Variables', 'Loops', 'Functions'] },
    { name: 'Data Structures', subtopics: ['Arrays', 'Stacks and Queues', 'Trees'] },
  ],
  English: [
    { name: 'Grammar', subtopics: ['Tenses', 'Voice', 'Narration'] },
    { name: 'Reading Comprehension', subtopics: ['Inference', 'Vocabulary', 'Main Idea'] },
  ],
  default: [
    { name: 'Core Concepts', subtopics: ['Foundations', 'Practice Problems', 'Revision Notes'] },
    { name: 'Exam Strategy', subtopics: ['Important Patterns', 'Timed Practice', 'Error Review'] },
  ],
}

function normalizeSubjectName(name = '') {
  return name.trim().toLowerCase()
}

function subjectTemplate(subjectName) {
  return AUTO_TOPICS_BY_SUBJECT[subjectName] || AUTO_TOPICS_BY_SUBJECT.default
}

function buildSubject(subjectName) {
  return {
    id: crypto.randomUUID(),
    name: subjectName,
    topics: subjectTemplate(subjectName).map((topic) => ({
      id: crypto.randomUUID(),
      name: topic.name,
      subtopics: topic.subtopics,
    })),
  }
}

export default function SubjectsPage() {
  const { state, addSubject, addSubjects } = useLearningStore()
  const { userProfile } = useUserProfile()
  const [subjectName, setSubjectName] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState('')

  const stats = useMemo(() => {
    const totalTopics = state.subjects.reduce((sum, subject) => sum + subject.topics.length, 0)
    const totalSubtopics = state.subjects.reduce(
      (sum, subject) =>
        sum + subject.topics.reduce((topicSum, topic) => topicSum + topic.subtopics.length, 0),
      0,
    )

    return {
      totalSubjects: state.subjects.length,
      totalTopics,
      totalSubtopics,
    }
  }, [state.subjects])

  const subjectInsights = useMemo(
    () =>
      state.subjects.map((subject) => {
        const subjectTasks = state.tasks.filter((task) => task.subjectId === subject.id)
        const completed = subjectTasks.filter((task) => task.completed).length
        const completionRate =
          subjectTasks.length === 0 ? 0 : Math.round((completed / subjectTasks.length) * 100)

        return {
          ...subject,
          topicCount: subject.topics.length,
          taskCount: subjectTasks.length,
          completedCount: completed,
          completionRate,
        }
      }),
    [state.subjects, state.tasks],
  )

  const selectedSubject = useMemo(
    () => subjectInsights.find((entry) => entry.id === selectedSubjectId) || subjectInsights[0] || null,
    [selectedSubjectId, subjectInsights],
  )

  const selectedTopic = useMemo(() => {
    if (!selectedSubject) return null
    return selectedSubject.topics.find((topic) => topic.id === selectedTopicId) || selectedSubject.topics[0] || null
  }, [selectedSubject, selectedTopicId])

  const existingSubjects = useMemo(
    () => new Set(state.subjects.map((subject) => normalizeSubjectName(subject.name))),
    [state.subjects],
  )

  const quickStartOptions = useMemo(
    () => QUICK_START_SUBJECTS.filter((entry) => !existingSubjects.has(normalizeSubjectName(entry))),
    [existingSubjects],
  )

  const profileSubjects = useMemo(
    () => (userProfile?.subjects || []).filter((name) => typeof name === 'string' && name.trim().length > 0),
    [userProfile?.subjects],
  )

  async function addSingleSubject(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (existingSubjects.has(normalizeSubjectName(trimmed))) return

    await addSubject(buildSubject(trimmed))
    setSubjectName('')
  }

  async function generateFromProfile() {
    if (profileSubjects.length === 0) return

    const toCreate = profileSubjects
      .filter((entry) => !existingSubjects.has(normalizeSubjectName(entry)))
      .map((entry) => buildSubject(entry.trim()))

    if (toCreate.length === 0) return
    await addSubjects(toCreate)
  }

  return (
    <div className="subjects-page space-y-s2">
      <SectionHeading
        title="Subjects and Topics"
        subtitle="Clarity starts here. Break chaos into chapters and make every study hour intentional."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4" tone="soft">
          <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Subjects</p>
          <p className="kpi-number mt-s2 text-neutral-900">{stats.totalSubjects}</p>
        </Card>
        <Card className="p-4" tone="soft">
          <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Topics</p>
          <p className="kpi-number mt-s2 text-neutral-900">{stats.totalTopics}</p>
        </Card>
        <Card className="p-4" tone="soft">
          <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Subtopics</p>
          <p className="kpi-number mt-s2 text-neutral-900">{stats.totalSubtopics}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-4 rounded-[18px] border border-[#6352c8]/20 bg-[#6352c8]/5 p-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5a4db0]">
            <Target size={14} />
            Foundation Layer
          </p>
          <p className="mt-1 text-sm text-neutral-700">
            Subjects create structure. Topics create focus. Subtopics create action.
          </p>
        </div>

        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Add Subject</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Input
                value={subjectName}
                onChange={(event) => setSubjectName(event.target.value)}
                placeholder="Add your first subject"
              />
              <Button onClick={() => addSingleSubject(subjectName)}>Add</Button>
            </div>
          </div>
          <div>
            <Button
              variant="ghost"
              onClick={generateFromProfile}
              className="inline-flex items-center gap-2 border border-[#6352c8]/20 bg-[#6352c8]/8 text-[#5a4db0] hover:bg-[#6352c8]/12"
            >
              <Sparkles size={14} />
              Generate my subjects
            </Button>
          </div>
        </div>

        {quickStartOptions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Quick Start</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickStartOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => addSingleSubject(option)}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:-translate-y-[1px] hover:bg-neutral-50"
                >
                  + {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.subjects.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
            <p className="text-base font-semibold text-neutral-900">No subjects. No structure.</p>
            <p className="mt-1 text-sm text-neutral-600">Add your first subject to turn scattered effort into a real system.</p>
            <div className="mt-3">
              <Button onClick={() => addSingleSubject(subjectName || 'Physics')}>Add your first subject</Button>
            </div>
          </div>
        ) : (
        <div className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-[18px] border border-neutral-100 bg-neutral-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Subjects</p>
              {subjectInsights.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-600">Add one subject to begin the structure.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {subjectInsights.map((subject) => (
                    <li key={subject.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(subject.id)
                          setSelectedTopicId('')
                        }}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                          selectedSubject?.id === subject.id
                            ? 'border-[#6352c8]/30 bg-white shadow-sm'
                            : 'border-transparent bg-white/70 hover:border-neutral-200 hover:bg-white'
                        }`}
                      >
                        <p className="text-sm font-semibold text-neutral-900">{subject.name}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {subject.topicCount} {subject.topicCount === 1 ? 'topic' : 'topics'} • {subject.completionRate}% complete
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${subject.completionRate}%` }}
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[18px] border border-neutral-100 bg-neutral-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Topics</p>
              {!selectedSubject ? (
                <p className="mt-3 text-sm text-neutral-600">Select a subject and map out the main chapters.</p>
              ) : selectedSubject.topics.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-600">No topics yet. Start with 2-3 core chapters for {selectedSubject.name}.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {selectedSubject.topics.map((topic) => (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                          selectedTopic?.id === topic.id
                            ? 'border-[#6352c8]/30 bg-white shadow-sm'
                            : 'border-transparent bg-white/70 hover:border-neutral-200 hover:bg-white'
                        }`}
                      >
                        <p className="text-sm font-semibold text-neutral-900">{topic.name}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {topic.subtopics.length} {topic.subtopics.length === 1 ? 'subtopic' : 'subtopics'}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[18px] border border-neutral-100 bg-neutral-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Subtopics</p>
              {!selectedSubject ? (
                <p className="mt-3 text-sm text-neutral-600">Choose a subject first. Your execution plan starts there.</p>
              ) : !selectedTopic ? (
                <p className="mt-3 text-sm text-neutral-600">Pick a topic to break it into focused subtopics.</p>
              ) : selectedTopic.subtopics.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-600">No subtopics yet. Break this topic into small, winnable pieces.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTopic.subtopics.map((subtopic) => (
                    <span
                      key={subtopic}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700"
                    >
                      {subtopic}
                    </span>
                  ))}
                </div>
              )}
              {selectedSubject && (
                <p className="mt-3 text-xs text-neutral-500">
                  {selectedSubject.taskCount > 0
                    ? `${selectedSubject.taskCount} tasks linked to ${selectedSubject.name}. Keep execution aligned.`
                    : `No tasks linked yet. Add tasks under ${selectedSubject.name} to turn structure into progress.`}
                </p>
              )}
            </div>
          </div>
        </div>
        )}
      </Card>

      <Card className="p-4" tone="soft">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Contextual Guidance</p>
        {state.subjects.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-700">Start with one subject now. Momentum beats overthinking.</p>
        ) : (
          <p className="mt-2 text-sm text-neutral-700">
            Next step: choose a subject, review its topics, then create today’s tasks from one subtopic.
          </p>
        )}
      </Card>
    </div>
  )
}
