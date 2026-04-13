/**
 * Simple validation utility for request bodies
 * Provides schema-based validation without external dependencies
 */

const validateTask = (data) => {
  const errors = []

  if (!data.id || typeof data.id !== 'string' || !data.id.trim()) {
    errors.push('Task id is required and must be a non-empty string')
  }

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Task title is required and must be a non-empty string')
  }

  if (data.title && data.title.length > 255) {
    errors.push('Task title must be less than 255 characters')
  }

  const validTypes = ['Study', 'Revision', 'Test']
  if (data.type && !validTypes.includes(data.type)) {
    errors.push(`Task type must be one of: ${validTypes.join(', ')}`)
  }

  if (!data.subjectId || typeof data.subjectId !== 'string' || !data.subjectId.trim()) {
    errors.push('Task subjectId is required and must be a non-empty string')
  }

  if (!data.dueDate) {
    errors.push('Task dueDate is required')
  } else if (isNaN(new Date(data.dueDate).getTime())) {
    errors.push('Task dueDate must be a valid date')
  }

  if (data.completed !== undefined && typeof data.completed !== 'boolean') {
    errors.push('Task completed must be a boolean')
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] }
}

const validateSubject = (data) => {
  const errors = []

  if (!data.id || typeof data.id !== 'string' || !data.id.trim()) {
    errors.push('Subject id is required and must be a non-empty string')
  }

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Subject name is required and must be a non-empty string')
  }

  if (data.name && data.name.length > 255) {
    errors.push('Subject name must be less than 255 characters')
  }

  if (data.topics !== undefined) {
    if (!Array.isArray(data.topics)) {
      errors.push('Subject topics must be an array')
    } else {
      data.topics.forEach((topic, idx) => {
        if (!topic.id || !topic.name) {
          errors.push(`Topic at index ${idx} must have id and name`)
        }

        if (topic.subtopics !== undefined) {
          if (!Array.isArray(topic.subtopics)) {
            errors.push(`Topic at index ${idx} subtopics must be an array`)
          } else {
            topic.subtopics.forEach((subtopic, subIdx) => {
              if (typeof subtopic === 'string') return

              if (!subtopic || typeof subtopic !== 'object' || !subtopic.id || !subtopic.name) {
                errors.push(`Subtopic at topic ${idx}, index ${subIdx} must have id and name`)
              }
            })
          }
        }
      })
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] }
}

const validateSession = (data) => {
  const errors = []

  if (!data.id || typeof data.id !== 'string' || !data.id.trim()) {
    errors.push('Session id is required and must be a non-empty string')
  }

  if (!data.taskId || typeof data.taskId !== 'string' || !data.taskId.trim()) {
    errors.push('Session taskId is required and must be a non-empty string')
  }

  if (!data.subjectId || typeof data.subjectId !== 'string' || !data.subjectId.trim()) {
    errors.push('Session subjectId is required and must be a non-empty string')
  }

  const validSources = ['manual', 'quick-focus']
  if (data.source && !validSources.includes(data.source)) {
    errors.push(`Session source must be one of: ${validSources.join(', ')}`)
  }

  if (data.plannedDurationSec !== undefined) {
    if (typeof data.plannedDurationSec !== 'number' || data.plannedDurationSec < 0) {
      errors.push('Session plannedDurationSec must be a non-negative number')
    }
  }

  if (data.durationSec !== undefined) {
    if (typeof data.durationSec !== 'number' || data.durationSec < 0) {
      errors.push('Session durationSec must be a non-negative number')
    }
  }

  if (!data.dateKey || typeof data.dateKey !== 'string') {
    errors.push('Session dateKey is required and must be a string')
  }

  if (!data.startedAt) {
    errors.push('Session startedAt is required')
  } else if (isNaN(new Date(data.startedAt).getTime())) {
    errors.push('Session startedAt must be a valid date')
  }

  if (!data.endedAt) {
    errors.push('Session endedAt is required')
  } else if (isNaN(new Date(data.endedAt).getTime())) {
    errors.push('Session endedAt must be a valid date')
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] }
}

const validateSessionReflection = (data) => {
  const errors = []

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Reflection payload must be an object'] }
  }

  if (typeof data.focusScore !== 'number' || data.focusScore < 1 || data.focusScore > 5) {
    errors.push('Reflection focusScore is required and must be a number between 1 and 5')
  }

  if (data.completionNote !== undefined && typeof data.completionNote !== 'string') {
    errors.push('Reflection completionNote must be a string')
  }

  if (data.distractions !== undefined) {
    if (!Array.isArray(data.distractions)) {
      errors.push('Reflection distractions must be an array')
    } else if (!data.distractions.every((item) => typeof item === 'string')) {
      errors.push('Reflection distractions entries must be strings')
    }
  }

  if (data.completedAt !== undefined && isNaN(new Date(data.completedAt).getTime())) {
    errors.push('Reflection completedAt must be a valid date')
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] }
}

module.exports = {
  validateTask,
  validateSubject,
  validateSession,
  validateSessionReflection,
}
