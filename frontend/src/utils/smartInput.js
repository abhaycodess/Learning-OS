const SUBJECT_KEYWORDS = {
  physics: ['physics', 'mechanics', 'thermodynamics', 'optics', 'kinematics'],
  math: ['math', 'mathematics', 'algebra', 'calculus', 'geometry', 'trigonometry'],
  chemistry: ['chemistry', 'organic', 'inorganic', 'physical chemistry'],
  biology: ['biology', 'botany', 'zoology', 'anatomy', 'genetics'],
  history: ['history', 'civics'],
  geography: ['geography', 'maps'],
  english: ['english', 'grammar', 'literature', 'vocabulary'],
  computer: ['computer', 'programming', 'coding', 'cs', 'java', 'python', 'javascript', 'react', 'node'],
}

export function detectSubjectFromText(text) {
  const lowerText = text.toLowerCase()

  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return subject.charAt(0).toUpperCase() + subject.slice(1)
      }
    }
  }

  return 'General'
}
