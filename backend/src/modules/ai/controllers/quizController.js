/**
 * AI Quiz Controller
 * Generates a study quiz for the current subject or focus area
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

function parseJSONFromModel(content) {
  if (!content || typeof content !== 'string') return null

  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : content

  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

function parseLegacyQuizText(content) {
  if (!content || typeof content !== 'string') return null

  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  const answerIndex = lines.findIndex((line) => /^(\*\*)?answers(\*\*)?:?$/i.test(line))
  const questionLines = answerIndex >= 0 ? lines.slice(0, answerIndex) : lines
  const answerLines = answerIndex >= 0 ? lines.slice(answerIndex + 1) : []

  const questions = []
  let currentQuestion = null

  questionLines.forEach((line) => {
    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (questionMatch) {
      if (currentQuestion && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion)
      }

      currentQuestion = {
        id: `q${questionMatch[1]}`,
        question: questionMatch[2],
        options: [],
        correctOption: 'A',
        explanation: 'Review this concept and retry for retention.',
      }
      return
    }

    const optionMatch = line.match(/^(?:[-*•]\s*)?([A-D])\.\s+(.+)$/i)
    if (currentQuestion && optionMatch) {
      currentQuestion.options.push({
        key: optionMatch[1].toUpperCase(),
        text: optionMatch[2],
      })
    }
  })

  if (currentQuestion && currentQuestion.options.length >= 2) {
    questions.push(currentQuestion)
  }

  if (questions.length === 0) return null

  const answerMap = new Map()
  answerLines.forEach((line) => {
    const answerMatch = line.match(/^(\d+)\.\s*([A-D])\.\s*(.+)$/i)
    if (!answerMatch) return

    answerMap.set(`q${answerMatch[1]}`, {
      correctOption: answerMatch[2].toUpperCase(),
      explanation: answerMatch[3],
    })
  })

  return {
    title: 'Practice Quiz',
    instructions: 'Choose one option for each question.',
    questions: questions.map((question) => {
      const mapped = answerMap.get(question.id)
      const optionKeys = question.options.map((entry) => entry.key)

      return {
        ...question,
        correctOption:
          mapped && optionKeys.includes(mapped.correctOption)
            ? mapped.correctOption
            : question.options[0].key,
        explanation: mapped?.explanation || question.explanation,
      }
    }),
  }
}

function fallbackQuizStructure({ count, difficulty, topic, subtopic, subjectTitle }) {
  const focusLabel = [topic, subtopic].filter(Boolean).join(' - ') || subjectTitle || 'current subject'

  return {
    title: `${difficulty[0].toUpperCase()}${difficulty.slice(1)} Quiz: ${focusLabel}`,
    instructions: 'Choose one option for each question.',
    questions: Array.from({ length: count }).map((_, index) => ({
      id: `q${index + 1}`,
      question: `Which statement best reflects ${focusLabel} concept ${index + 1}?`,
      options: [
        { key: 'A', text: `Core idea of ${focusLabel}` },
        { key: 'B', text: `Common misconception about ${focusLabel}` },
        { key: 'C', text: `Partially correct interpretation` },
        { key: 'D', text: `Unrelated statement` },
      ],
      correctOption: 'A',
      explanation: `Option A aligns best with the fundamental idea of ${focusLabel}.`,
    })),
  }
}

function normalizeQuizStructure(quizObj, fallback) {
  if (!quizObj || typeof quizObj !== 'object' || !Array.isArray(quizObj.questions)) {
    return fallback
  }

  const questions = quizObj.questions
    .map((entry, index) => {
      const rawOptions = Array.isArray(entry.options) ? entry.options : []
      const options = rawOptions
        .map((opt, optIndex) => {
          if (typeof opt === 'string') {
            return {
              key: String.fromCharCode(65 + optIndex),
              text: opt,
            }
          }

          if (!opt || typeof opt !== 'object') return null
          const key = String(opt.key || String.fromCharCode(65 + optIndex)).toUpperCase().slice(0, 1)
          const text = typeof opt.text === 'string' ? opt.text : ''
          if (!text.trim()) return null
          return { key, text: text.trim() }
        })
        .filter(Boolean)

      if (!entry || typeof entry.question !== 'string' || options.length < 2) {
        return null
      }

      const correctOptionRaw = String(entry.correctOption || options[0].key).toUpperCase().slice(0, 1)
      const hasCorrectOption = options.some((opt) => opt.key === correctOptionRaw)

      return {
        id: String(entry.id || `q${index + 1}`),
        question: entry.question.trim(),
        options,
        correctOption: hasCorrectOption ? correctOptionRaw : options[0].key,
        explanation:
          typeof entry.explanation === 'string' && entry.explanation.trim()
            ? entry.explanation.trim()
            : 'Review this concept again for stronger retention.',
      }
    })
    .filter(Boolean)

  if (questions.length === 0) {
    return fallback
  }

  return {
    title: typeof quizObj.title === 'string' && quizObj.title.trim() ? quizObj.title.trim() : fallback.title,
    instructions:
      typeof quizObj.instructions === 'string' && quizObj.instructions.trim()
        ? quizObj.instructions.trim()
        : fallback.instructions,
    questions,
  }
}

async function quizHandler(req, res) {
  const {
    subject,
    userStats,
    count = 5,
    difficulty = 'beginner',
    severity,
    focus = '',
    topic = '',
    subtopic = '',
  } = req.body || {}

  const normalizedCount = Math.min(10, Math.max(3, Number(count) || 5))
  const rawDifficulty = (severity || difficulty || 'beginner').toString().toLowerCase()
  const allowedDifficulty = ['beginner', 'intermediate', 'advanced']
  const normalizedDifficulty = allowedDifficulty.includes(rawDifficulty) ? rawDifficulty : 'beginner'

  const normalizedSubject =
    subject && typeof subject === 'object'
      ? {
          id: subject.id || '',
          title: subject.title || subject.name || 'General',
          description: subject.description || 'N/A',
        }
      : {
          id: '',
          title: 'General',
          description: 'N/A',
        }

  const normalizedFocus =
    String(focus || '').trim() ||
    [String(topic || '').trim(), String(subtopic || '').trim()].filter(Boolean).join(': ') ||
    normalizedSubject.title

  try {
    const prompt = buildPrompt({
      type: 'quiz',
      input: {
        count: normalizedCount,
        difficulty: normalizedDifficulty,
        severity: normalizedDifficulty,
        topic: String(topic || '').trim(),
        subtopic: String(subtopic || '').trim(),
        focus: normalizedFocus,
      },
      context: {
        subject: normalizedSubject,
        userStats,
      },
    })

    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.5,
      maxTokens: 1400,
    })

    const fallbackQuiz = fallbackQuizStructure({
      count: normalizedCount,
      difficulty: normalizedDifficulty,
      topic: String(topic || '').trim(),
      subtopic: String(subtopic || '').trim(),
      subjectTitle: normalizedSubject.title,
    })
    const parsedQuiz = parseJSONFromModel(aiResponse.content)
    const normalizedQuiz = normalizeQuizStructure(parsedQuiz, fallbackQuiz)

    res.json({
      quiz: normalizedQuiz,
      quizRaw: aiResponse.content,
      provider: aiResponse.provider,
      count: normalizedCount,
      difficulty: normalizedDifficulty,
      subject: normalizedSubject,
      topic: String(topic || '').trim(),
      subtopic: String(subtopic || '').trim(),
    })
  } catch (error) {
    console.error('Quiz handler error:', error.message)
    res.status(500).json({
      message: 'Failed to generate quiz',
      error: error.message,
    })
  }
}

async function evaluateQuizHandler(req, res) {
  const { quiz, userAnswers = {}, subject, difficulty = 'beginner', topic = '', subtopic = '' } = req.body || {}

  const normalizedSubject =
    subject && typeof subject === 'object'
      ? {
          id: subject.id || '',
          title: subject.title || subject.name || 'General',
          description: subject.description || 'N/A',
        }
      : {
          id: '',
          title: 'General',
          description: 'N/A',
        }

  const parsedLegacyQuiz = typeof quiz === 'string' ? parseLegacyQuizText(quiz) : null
  const normalizedQuiz = normalizeQuizStructure(parsedLegacyQuiz || quiz, null)
  if (!normalizedQuiz || !Array.isArray(normalizedQuiz.questions) || normalizedQuiz.questions.length === 0) {
    return res.status(400).json({ message: 'Quiz questions are required for evaluation' })
  }

  const answersMap = typeof userAnswers === 'object' && userAnswers !== null ? userAnswers : {}

  const questionResults = normalizedQuiz.questions.map((question) => {
    const selectedOption = String(answersMap[question.id] || '').toUpperCase().slice(0, 1)
    const answered = Boolean(selectedOption)
    const isCorrect = answered && selectedOption === question.correctOption

    return {
      id: question.id,
      question: question.question,
      selectedOption,
      correctOption: question.correctOption,
      isCorrect,
      explanation: question.explanation,
      options: question.options,
    }
  })

  const totalQuestions = questionResults.length
  const answeredCount = questionResults.filter((entry) => Boolean(entry.selectedOption)).length
  const correctCount = questionResults.filter((entry) => entry.isCorrect).length
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  let feedback = 'Good attempt. Review incorrect answers and retry the same subtopic tomorrow.'

  try {
    const prompt = buildPrompt({
      type: 'quiz_evaluation',
      input: {
        difficulty,
        topic,
        subtopic,
        totalQuestions,
        answeredCount,
        correctCount,
        scorePercent,
        questionResults,
      },
      context: {
        subject: normalizedSubject,
      },
    })

    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.4,
      maxTokens: 800,
    })

    feedback = aiResponse.content || feedback
  } catch (error) {
    console.error('Quiz evaluation AI fallback:', error.message)
  }

  return res.json({
    score: {
      totalQuestions,
      answeredCount,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      scorePercent,
    },
    feedback,
    questionResults,
    subject: normalizedSubject,
    topic: String(topic || '').trim(),
    subtopic: String(subtopic || '').trim(),
    difficulty: String(difficulty || 'beginner').toLowerCase(),
  })
}

module.exports = {
  quizHandler,
  evaluateQuizHandler,
}