const ROLE_QUICK_START_SUBJECTS = {
  school: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'],
  college: ['Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Statistics'],
  selfLearner: ['JavaScript', 'Python', 'UI Design', 'Productivity Systems', 'Communication Skills', 'Personal Finance'],
}

const SUBJECT_VISUALS = {
  Mathematics: { emoji: '📐', coverImage: 'linear-gradient(135deg, #e8f1ff 0%, #cfe2ff 100%)' },
  Physics: { emoji: '⚛️', coverImage: 'linear-gradient(135deg, #e8edff 0%, #cfd8ff 100%)' },
  Chemistry: { emoji: '🧪', coverImage: 'linear-gradient(135deg, #e7fff7 0%, #c8f5e8 100%)' },
  Biology: { emoji: '🧬', coverImage: 'linear-gradient(135deg, #eefde9 0%, #d6f5c8 100%)' },
  English: { emoji: '📝', coverImage: 'linear-gradient(135deg, #fff4e8 0%, #ffe1c4 100%)' },
  History: { emoji: '🏺', coverImage: 'linear-gradient(135deg, #f7efe7 0%, #e7d8c9 100%)' },
  'Data Structures': { emoji: '🧱', coverImage: 'linear-gradient(135deg, #ebf5ff 0%, #d2e8ff 100%)' },
  Algorithms: { emoji: '🧠', coverImage: 'linear-gradient(135deg, #efe9ff 0%, #ddd1ff 100%)' },
  'Database Systems': { emoji: '🗃️', coverImage: 'linear-gradient(135deg, #ecfff3 0%, #d1f7df 100%)' },
  'Operating Systems': { emoji: '💻', coverImage: 'linear-gradient(135deg, #f0f3ff 0%, #dde5ff 100%)' },
  'Computer Networks': { emoji: '🌐', coverImage: 'linear-gradient(135deg, #e8fbff 0%, #cdefff 100%)' },
  Statistics: { emoji: '📊', coverImage: 'linear-gradient(135deg, #fff5ea 0%, #ffe4c9 100%)' },
  JavaScript: { emoji: '🟨', coverImage: 'linear-gradient(135deg, #fffbe5 0%, #fff0b8 100%)' },
  Python: { emoji: '🐍', coverImage: 'linear-gradient(135deg, #eef8ff 0%, #d6e9ff 100%)' },
  'UI Design': { emoji: '🎨', coverImage: 'linear-gradient(135deg, #fff0f6 0%, #ffd9ea 100%)' },
  'Productivity Systems': { emoji: '⏱️', coverImage: 'linear-gradient(135deg, #eefdf8 0%, #d7f7e9 100%)' },
  'Communication Skills': { emoji: '🗣️', coverImage: 'linear-gradient(135deg, #f3efff 0%, #e0d8ff 100%)' },
  'Personal Finance': { emoji: '💸', coverImage: 'linear-gradient(135deg, #eefee9 0%, #d8f6c9 100%)' },
}

const AUTO_TOPICS_BY_SUBJECT = {
  Mathematics: [
    { name: 'Algebra', subtopics: ['Linear Equations', 'Quadratic Equations', 'Functions'] },
    { name: 'Calculus', subtopics: ['Limits', 'Differentiation', 'Integration'] },
  ],
  Physics: [
    { name: 'Mechanics', subtopics: ['Kinematics', 'Laws of Motion', 'Work and Energy'] },
    { name: 'Electromagnetism', subtopics: ['Electric Fields', 'Current Electricity', 'Magnetism'] },
  ],
  Chemistry: [
    { name: 'Physical Chemistry', subtopics: ['Mole Concept', 'Thermodynamics', 'Chemical Kinetics'] },
    { name: 'Organic Chemistry', subtopics: ['Hydrocarbons', 'Reaction Mechanisms', 'Functional Groups'] },
  ],
  Biology: [
    { name: 'Cell Biology', subtopics: ['Cell Structure', 'Cell Cycle', 'Biomolecules'] },
    { name: 'Human Physiology', subtopics: ['Digestive System', 'Respiratory System', 'Nervous System'] },
  ],
  default: [
    { name: 'Core Concepts', subtopics: ['Foundations', 'Practice Problems', 'Revision Notes'] },
    { name: 'Applied Practice', subtopics: ['Real Use Cases', 'Timed Practice', 'Error Review'] },
  ],
}

export function normalizeSubjectName(name = '') {
  return name.trim().toLowerCase()
}

export function getRoleQuickStartSubjects(role = '') {
  return ROLE_QUICK_START_SUBJECTS[role] || ROLE_QUICK_START_SUBJECTS.selfLearner
}

export function getSubjectVisual(name = '') {
  return SUBJECT_VISUALS[name] || { emoji: '📘', coverImage: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }
}

function getTemplate(name = '') {
  return AUTO_TOPICS_BY_SUBJECT[name] || AUTO_TOPICS_BY_SUBJECT.default
}

export function buildSubjectFromName(subjectName = '') {
  const trimmed = subjectName.trim()
  const visual = getSubjectVisual(trimmed)

  return {
    id: crypto.randomUUID(),
    name: trimmed,
    emoji: visual.emoji,
    coverImage: visual.coverImage,
    topics: getTemplate(trimmed).map((topic) => ({
      id: crypto.randomUUID(),
      name: topic.name,
      subtopics: topic.subtopics.map((subtopic) => ({
        id: crypto.randomUUID(),
        name: subtopic,
        notes: '',
      })),
    })),
  }
}
