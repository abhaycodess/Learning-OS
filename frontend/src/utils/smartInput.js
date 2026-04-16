<<<<<<< HEAD
=======

import { fuzzyMatch } from './fuzzyMatch'

>>>>>>> origin/main
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
<<<<<<< HEAD

=======

  // 1. Try exact/substring match
>>>>>>> origin/main
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return subject.charAt(0).toUpperCase() + subject.slice(1)
      }
    }
  }
<<<<<<< HEAD

=======

  // 2. Try fuzzy match against all keywords using the longest word in the input
  // (e.g., 'prtoessccsing' should match 'processing' in 'natural language processing')
  const words = text.split(/\s+/).filter(Boolean)
  let mainWord = words[0] || text
  for (const word of words) {
    if (word.length > mainWord.length) mainWord = word
  }
  const allKeywords = Object.values(SUBJECT_KEYWORDS).flat()
  const fuzzy = fuzzyMatch(mainWord, allKeywords, 3)
  if (fuzzy) {
    // Find which subject this keyword belongs to
    for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
      if (keywords.includes(fuzzy)) {
        return subject.charAt(0).toUpperCase() + subject.slice(1)
      }
    }
  }

>>>>>>> origin/main
  return 'General'
}
