/**
 * AI Feature Tools Controller
 * Adds advanced study coach tools mapped to roadmap tasks.
 */

const { getAIClient } = require('../services/aiClient')
const { buildPrompt } = require('../services/promptBuilder')

const FEATURE_CONFIG = {
  'daily-streak-nudges': {
    promptType: 'daily_streak_nudges',
    requiredFields: [],
    outputKey: 'nudge',
    defaults: {
      mood: 'neutral',
      missedDays: 0,
      todayGoalMinutes: 60,
    },
  },
  'adaptive-revision-plan': {
    promptType: 'adaptive_revision_plan',
    requiredFields: ['topics'],
    outputKey: 'revisionPlan',
    defaults: {
      examDate: 'not specified',
      dailyMinutes: 60,
      weakAreas: [],
    },
  },
  'chapter-recap-mode': {
    promptType: 'chapter_recap_mode',
    requiredFields: ['chapterTitle', 'chapterNotes'],
    outputKey: 'recap',
    defaults: {
      examType: 'general',
    },
  },
  'exam-strategy-coach': {
    promptType: 'exam_strategy_coach',
    requiredFields: ['examName', 'syllabusScope'],
    outputKey: 'strategy',
    defaults: {
      daysLeft: 30,
      strengths: [],
      weakAreas: [],
      dailyMinutes: 90,
    },
  },
  'mistake-log-insights': {
    promptType: 'mistake_log_insights',
    requiredFields: ['mistakeLog'],
    outputKey: 'insights',
    defaults: {
      subjectName: 'General',
    },
  },
  'concept-dependency-map': {
    promptType: 'concept_dependency_map',
    requiredFields: ['targetTopic'],
    outputKey: 'dependencyMap',
    defaults: {
      knownConcepts: [],
      depth: 'medium',
    },
  },
  'confidence-scoring-model': {
    promptType: 'confidence_scoring_model',
    requiredFields: ['topics'],
    outputKey: 'confidenceModel',
    defaults: {
      recentPerformance: [],
      selfRatingScale: '1-5',
    },
  },
  'personalized-warmups': {
    promptType: 'personalized_warmups',
    requiredFields: ['subjectName'],
    outputKey: 'warmupPlan',
    defaults: {
      minutes: 10,
      weakAreas: [],
      energy: 'medium',
    },
  },
  'timed-drill-generator': {
    promptType: 'timed_drill_generator',
    requiredFields: ['topic'],
    outputKey: 'drill',
    defaults: {
      minutes: 20,
      difficulty: 'intermediate',
      questionCount: 8,
    },
  },
  'flashcard-auto-maker': {
    promptType: 'flashcard_auto_maker',
    requiredFields: ['sourceNotes'],
    outputKey: 'flashcards',
    defaults: {
      cardCount: 12,
      style: 'exam-ready',
    },
  },
  'spaced-repetition-planner': {
    promptType: 'spaced_repetition_planner',
    requiredFields: ['topics'],
    outputKey: 'spacedPlan',
    defaults: {
      days: 14,
      dailyMinutes: 30,
      retentionGoal: '85%',
    },
  },
  'answer-evaluator-ai': {
    promptType: 'answer_evaluator_ai',
    requiredFields: ['question', 'studentAnswer'],
    outputKey: 'evaluation',
    defaults: {
      rubric: 'clarity, correctness, structure, examples',
      maxScore: 10,
    },
  },
  'explanation-simplifier': {
    promptType: 'explanation_simplifier',
    requiredFields: ['sourceExplanation'],
    outputKey: 'simplified',
    defaults: {
      level: 'beginner',
      format: 'bullets',
    },
  },
  'topic-mastery-tracker': {
    promptType: 'topic_mastery_tracker',
    requiredFields: ['topics'],
    outputKey: 'masteryTracker',
    defaults: {
      recentScores: [],
      targetScore: 80,
    },
  },
  'session-interruption-alerts': {
    promptType: 'session_interruption_alerts',
    requiredFields: ['interruptionSignals'],
    outputKey: 'alertsPlan',
    defaults: {
      sessionLengthMinutes: 45,
      environment: 'home',
    },
  },
  'focus-music-advisor': {
    promptType: 'focus_music_advisor',
    requiredFields: ['studyType'],
    outputKey: 'musicPlan',
    defaults: {
      energy: 'medium',
      distractionLevel: 'moderate',
    },
  },
  'motivational-check-ins': {
    promptType: 'motivational_check_ins',
    requiredFields: ['currentState'],
    outputKey: 'checkIn',
    defaults: {
      goal: 'Finish one focused session',
      availableMinutes: 30,
    },
  },
  'weekly-ai-report': {
    promptType: 'weekly_ai_report',
    requiredFields: ['weeklyData'],
    outputKey: 'weeklyReport',
    defaults: {
      focusArea: 'general progress',
    },
  },
  'monthly-performance-digest': {
    promptType: 'monthly_performance_digest',
    requiredFields: ['monthlyData'],
    outputKey: 'monthlyDigest',
    defaults: {
      monthLabel: 'Current Month',
    },
  },
  'mentor-progress-brief': {
    promptType: 'mentor_progress_brief',
    requiredFields: ['studentProfile', 'recentProgress'],
    outputKey: 'mentorBrief',
    defaults: {
      objective: 'Mentor review and next-step guidance',
    },
  },
  'smart-doubt-clustering': {
    promptType: 'smart_doubt_clustering',
    requiredFields: ['doubtsLog'],
    outputKey: 'doubtClusters',
    defaults: {
      subjectName: 'General',
    },
  },
  'exam-countdown-planner': {
    promptType: 'exam_countdown_planner',
    requiredFields: ['examDate', 'syllabusScope'],
    outputKey: 'countdownPlan',
    defaults: {
      dailyMinutes: 90,
      revisionCycles: 3,
    },
  },
  'syllabus-coverage-estimator': {
    promptType: 'syllabus_coverage_estimator',
    requiredFields: ['syllabusTopics', 'completedTopics'],
    outputKey: 'coverageEstimate',
    defaults: {
      confidence: 'medium',
    },
  },
  'backlog-risk-detector': {
    promptType: 'backlog_risk_detector',
    requiredFields: ['backlogItems'],
    outputKey: 'backlogRisk',
    defaults: {
      horizonDays: 14,
    },
  },
  'cognitive-load-monitor': {
    promptType: 'cognitive_load_monitor',
    requiredFields: ['studyPattern'],
    outputKey: 'cognitiveLoad',
    defaults: {
      sleepHours: 7,
      stressLevel: 'medium',
    },
  },
  'burnout-risk-warnings': {
    promptType: 'burnout_risk_warnings',
    requiredFields: ['behaviorSignals'],
    outputKey: 'burnoutRisk',
    defaults: {
      recoveryWindowDays: 7,
    },
  },
  'comeback-day-protocol': {
    promptType: 'comeback_day_protocol',
    requiredFields: ['setbackContext'],
    outputKey: 'comebackProtocol',
    defaults: {
      availableMinutes: 45,
    },
  },
  'ai-onboarding-tutor': {
    promptType: 'ai_onboarding_tutor',
    requiredFields: ['learnerGoal'],
    outputKey: 'onboardingPlan',
    defaults: {
      learnerLevel: 'beginner',
    },
  },
  'multilingual-study-support': {
    promptType: 'multilingual_study_support',
    requiredFields: ['sourceText', 'targetLanguage'],
    outputKey: 'multilingualOutput',
    defaults: {
      mode: 'explain',
    },
  },
  'ai-reliability-guardrails': {
    promptType: 'ai_reliability_guardrails',
    requiredFields: ['taskContext', 'aiOutput'],
    outputKey: 'reliabilityReport',
    defaults: {
      strictness: 'standard',
    },
  },
}

function validateRequiredFields(payload, fields) {
  for (const field of fields) {
    const value = payload[field]

    if (value === undefined || value === null) {
      return `Field "${field}" is required`
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return `Field "${field}" cannot be empty`
    }

    if (Array.isArray(value) && value.length === 0) {
      return `Field "${field}" must have at least one item`
    }
  }

  return null
}

async function featureToolHandler(req, res) {
  const { featureId } = req.params
  const config = FEATURE_CONFIG[featureId]

  if (!config) {
    return res.status(404).json({
      message: 'Unknown feature tool',
      availableTools: Object.keys(FEATURE_CONFIG),
    })
  }

  const body = req.body || {}
  const payload = {
    ...config.defaults,
    ...body,
  }

  const validationError = validateRequiredFields(payload, config.requiredFields)
  if (validationError) {
    return res.status(400).json({ message: validationError })
  }

  try {
    const prompt = buildPrompt({
      type: config.promptType,
      input: payload,
      context: {
        subject: body.subject,
        task: body.task,
        userStats: body.userStats,
      },
    })

    const aiClient = getAIClient()
    const aiResponse = await aiClient.call({
      prompt,
      temperature: 0.45,
      maxTokens: 1400,
    })

    return res.json({
      tool: featureId,
      provider: aiResponse.provider,
      [config.outputKey]: aiResponse.content,
    })
  } catch (error) {
    console.error(`Feature tool ${featureId} failed:`, error.message)
    return res.status(500).json({
      message: `Failed to generate ${featureId}`,
      error: error.message,
    })
  }
}

module.exports = {
  featureToolHandler,
  FEATURE_CONFIG,
}
