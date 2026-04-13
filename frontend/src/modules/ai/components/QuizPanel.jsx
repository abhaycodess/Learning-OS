import React from 'react'
import { cn } from '../../../utils/cn'

function parseLegacyQuiz(content) {
  const lines = String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  const answersIndex = lines.findIndex((line) => /^(\*\*)?answers(\*\*)?:?$/i.test(line))
  const questionLines = answersIndex >= 0 ? lines.slice(0, answersIndex) : lines
  const answerLines = answersIndex >= 0 ? lines.slice(answersIndex + 1) : []

  const questions = []
  let current = null

  questionLines.forEach((line) => {
    const qMatch = line.match(/^\s*(\d+)\.\s*(.+)$/)
    if (qMatch) {
      if (current && current.options.length >= 2) {
        questions.push(current)
      }
      current = {
        id: `q${qMatch[1]}`,
        question: qMatch[2],
        options: [],
        correctOption: 'A',
        explanation: 'Review this concept and retry for retention.',
      }
      return
    }

    const optionMatch = line.match(/^(?:[-*•]\s*)?([A-D])\.\s*(.+)$/i)
    if (current && optionMatch) {
      current.options.push({
        key: optionMatch[1].toUpperCase(),
        text: optionMatch[2],
      })
    }
  })

  if (current && current.options.length >= 2) {
    questions.push(current)
  }

  if (questions.length === 0) return null

  const answerMap = new Map()
  answerLines.forEach((line) => {
    const match = line.match(/^\s*(\d+)\.\s*([A-D])\.\s*(.+)$/i)
    if (!match) return
    answerMap.set(`q${match[1]}`, {
      correctOption: match[2].toUpperCase(),
      explanation: match[3],
    })
  })

  const normalizedQuestions = questions.map((question) => {
    const answer = answerMap.get(question.id)
    const optionKeys = question.options.map((entry) => entry.key)
    const correctOption = answer?.correctOption && optionKeys.includes(answer.correctOption)
      ? answer.correctOption
      : question.options[0].key

    return {
      ...question,
      correctOption,
      explanation: answer?.explanation || question.explanation,
    }
  })

  return {
    title: 'Practice Quiz',
    instructions: 'Choose one option for each question.',
    questions: normalizedQuestions,
  }
}

function renderInline(text = '') {
  const segments = String(text)
    .replace(/\\_/g, '_')
    .replace(/\\`/g, '`')
    .replace(/\\\*/g, '*')
    .split(/(\*\*[^*]+\*\*)/g)

  return segments.map((segment, index) => {
    const isBold = segment.startsWith('**') && segment.endsWith('**') && segment.length > 4
    if (isBold) {
      return <strong key={index}>{segment.slice(2, -2)}</strong>
    }
    return <span key={index}>{segment}</span>
  })
}

function FeedbackBlock({ feedback }) {
  if (!feedback) return null

  const lines = String(feedback)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-surface-alt)] p-3 text-sm text-[var(--text-main)]">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className="mb-1 last:mb-0">
          {renderInline(line)}
        </p>
      ))}
    </div>
  )
}

function getSarcasticMotivation(score, answeredCount, totalQuestions) {
  const attemptedAll = totalQuestions > 0 && answeredCount === totalQuestions

  if (!attemptedAll) {
    return 'Bold strategy: analyzing mid-battle. Finish the rest and go claim your full hero arc.'
  }

  if (score >= 90) {
    return 'Casual 90%+? Totally normal behavior for someone secretly allergic to average.'
  }

  if (score >= 75) {
    return 'Nice. You are one revision away from making this quiz regret underestimating you.'
  }

  if (score >= 50) {
    return 'Halfway there. Your brain is warming up; now stop negotiating and do round two.'
  }

  return 'Character development arc unlocked. Tough score, but comeback stories start exactly here.'
}

function LegacyFormattedQuiz({ content }) {
  const lines = String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="space-y-2 text-sm text-[var(--text-main)]">
      {lines.map((line, idx) => {
        if (/^\d+\.\s/.test(line)) {
          return <p key={idx}>{renderInline(line)}</p>
        }

        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex gap-2">
              <span className="font-semibold">•</span>
              <p className="flex-1">{renderInline(line.slice(2))}</p>
            </div>
          )
        }

        return <p key={idx}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function QuizPanel({
  quiz,
  userAnswers,
  onSelectAnswer,
  onAnalyze,
  onAnalyzePartial,
  isAnalyzing = false,
  analysis,
}) {
  const parsedQuiz =
    quiz && typeof quiz === 'object' && Array.isArray(quiz.questions)
      ? quiz
      : typeof quiz === 'string'
        ? parseLegacyQuiz(quiz)
        : null
  const isStructured = Boolean(parsedQuiz && Array.isArray(parsedQuiz.questions))

  if (!quiz) {
    return null
  }

  if (!isStructured) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-surface-alt)] p-4">
        <LegacyFormattedQuiz content={typeof quiz === 'string' ? quiz : JSON.stringify(quiz, null, 2)} />
      </div>
    )
  }

  const answeredCount = parsedQuiz.questions.filter((question) => Boolean(userAnswers?.[question.id])).length
  const totalQuestions = parsedQuiz.questions.length
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-surface-alt)] p-4">
        <h4 className="text-base font-semibold text-[var(--text-main)]">{parsedQuiz.title || 'Practice Quiz'}</h4>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {parsedQuiz.instructions || 'Choose one option for each question.'}
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">Answered: {answeredCount}/{parsedQuiz.questions.length}</p>
      </div>

      <div className="space-y-3">
        {parsedQuiz.questions.map((question, index) => {
          const selected = userAnswers?.[question.id] || ''

          return (
            <div
              key={question.id}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg-surface-alt)] p-4"
            >
              <p className="text-sm font-semibold text-[var(--text-main)]">
                {index + 1}. {question.question}
              </p>

              <div className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const isChecked = selected === option.key
                  const result = analysis?.questionResults?.find((entry) => entry.id === question.id)
                  const isCorrectOption = result?.correctOption === option.key
                  const isUserOption = result?.selectedOption === option.key
                  const isSelectedWrong = result && isChecked && !result.isCorrect

                  return (
                    <label
                      key={`${question.id}-${option.key}`}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition',
                        isChecked
                          ? 'border-primary/35 bg-primary/10 text-[var(--text-main)]'
                          : 'border-[var(--line)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-alt)]',
                        isCorrectOption && result
                          ? 'border-emerald-300 bg-emerald-50'
                          : '',
                        isSelectedWrong ? 'border-rose-300 bg-rose-50' : '',
                      )}
                    >
                      <input
                        type="radio"
                        name={`quiz-${question.id}`}
                        value={option.key}
                        checked={isChecked}
                        onChange={() => onSelectAnswer(question.id, option.key)}
                        className="accent-primary"
                      />
                      <span className="font-semibold">{option.key}.</span>
                      <span className="flex-1">{option.text}</span>
                      {result && isCorrectOption && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Correct answer
                        </span>
                      )}
                      {result && isUserOption && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Your choice
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>

              {analysis && (
                <div className="mt-2 rounded-md border border-[var(--line)] bg-[var(--bg-surface)] px-3 py-2 text-xs">
                  <p className="font-semibold text-[var(--text-main)]">
                    Correct Option: {analysis.questionResults?.find((entry) => entry.id === question.id)?.correctOption || question.correctOption}
                  </p>
                  <p className="mt-1 text-[var(--text-muted)]">
                    Your Option: {analysis.questionResults?.find((entry) => entry.id === question.id)?.selectedOption || 'Not answered'}
                  </p>
                  <p className="mt-1 text-[var(--text-muted)]">{question.explanation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onAnalyze(false)}
        disabled={isAnalyzing || !allAnswered}
        className={cn(
          'w-full rounded-lg px-4 py-3 font-semibold transition-all',
          isAnalyzing || !allAnswered
            ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-light',
        )}
      >
        {isAnalyzing ? 'Analyzing Quiz...' : 'Analyze Answers'}
      </button>

      {!allAnswered && (
        <button
          type="button"
          onClick={() => onAnalyzePartial?.()}
          disabled={isAnalyzing}
          className={cn(
            'w-full rounded-lg border border-[var(--line)] px-4 py-3 font-semibold transition-all',
            isAnalyzing
              ? 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] cursor-not-allowed'
              : 'bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-alt)]',
          )}
        >
          Analyze Partial Attempt ({answeredCount}/{totalQuestions})
        </button>
      )}

      {analysis?.score && (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-surface-alt)] p-4">
          <h4 className="text-sm font-semibold text-[var(--text-main)]">Score Summary</h4>
          <p className="mt-1 text-sm text-[var(--text-main)]">
            {analysis.score.correctCount}/{analysis.score.totalQuestions} correct ({analysis.score.scorePercent}%)
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Answered: {analysis.score.answeredCount} | Incorrect: {analysis.score.incorrectCount}
          </p>
          <p className="mt-2 text-xs font-semibold text-primary">
            {getSarcasticMotivation(
              analysis.score.scorePercent,
              analysis.score.answeredCount,
              analysis.score.totalQuestions,
            )}
          </p>
        </div>
      )}

      <FeedbackBlock feedback={analysis?.feedback} />
    </div>
  )
}

export { QuizPanel }
