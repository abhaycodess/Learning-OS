
import { fuzzyMatch } from './fuzzyMatch'

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

  // 1. Try exact/substring match
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return subject.charAt(0).toUpperCase() + subject.slice(1)
      }
    }
  }

  // 2. Try fuzzy match against all keywords
  const allKeywords = Object.values(SUBJECT_KEYWORDS).flat()
  const fuzzy = fuzzyMatch(text, allKeywords, 3)
  if (fuzzy) {
    // Find which subject this keyword belongs to
    for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
      if (keywords.includes(fuzzy)) {
        return subject.charAt(0).toUpperCase() + subject.slice(1)
      }
    }
  }

  return 'General'
}
