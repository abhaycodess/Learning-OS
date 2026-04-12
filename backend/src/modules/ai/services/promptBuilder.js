/**
 * Prompt Builder Service
 *
 * Constructs optimized AI prompts with context injection
 * Supports: chat, summarize, doubt, task_breakdown
 */

function buildContextString(context = {}) {
  const { subject, task, userStats } = context

  let contextStr = ''

  if (subject) {
    contextStr += `\nSubject: ${subject.title}\nDescription: ${subject.description || 'N/A'}`
  }

  if (task) {
    contextStr += `\n\nCurrent Task: ${task.title}\nDescription: ${task.description || 'N/A'}`
  }

  if (userStats) {
    const { streak, weakAreas, todayProgress } = userStats
    if (streak !== undefined) contextStr += `\n\nUser Streak: ${streak} days`
    if (todayProgress) contextStr += `\nToday's Progress: ${todayProgress}%`
    if (weakAreas && weakAreas.length > 0) {
      contextStr += `\nWeak Areas: ${weakAreas.join(', ')}`
    }
  }

  return contextStr
}

/**
 * Build chat prompt with context
 */
function buildChatPrompt(message, context = {}) {
  const contextStr = buildContextString(context)

  return `${message}${contextStr ? '\n\nContext:\n' + contextStr : ''}

Please provide a helpful, clear response as a study coach. Keep responses concise and actionable.`
}

/**
 * Build summarization prompt
 */
function buildSummarizePrompt(notes, context = {}) {
  const contextStr = buildContextString(context)

  return `Summarize the following study notes into key points, structured clearly:

---
${notes}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Format as:
- Bullet points for key concepts
- Group related ideas
- Keep it concise (max 10 points)
- Mark important terms in bold

Provide the summary now:`
}

/**
 * Build doubt-solving prompt
 */
function buildDoubtPrompt(question, mode = 'quick', context = {}) {
  const contextStr = buildContextString(context)

  const modeInstructions = {
    quick: 'Provide a brief, direct explanation (2-3 sentences)',
    deep: 'Provide a comprehensive explanation with examples and reasoning (150-250 words)',
  }

  return `Answer the following study question as a helpful coach:

Question: ${question}

${contextStr ? '\nContext:\n' + contextStr : ''}

${modeInstructions[mode] || modeInstructions.quick}

Format your response clearly with:
- Direct answer first
- Key points in bullets
- Practical example if relevant`
}

/**
 * Build task breakdown prompt
 */
function buildTaskBreakdownPrompt(task, context = {}) {
  const { mode = 'balanced', availableMinutes = null } = context
  const contextStr = buildContextString({ ...context, task })

  const modeInstructions = {
    quick: 'Keep the plan lightweight and fast to execute.',
    balanced: 'Balance clarity, depth, and practicality.',
    deep: 'Provide a detailed, robust execution plan with stronger checkpoints.',
  }

  return `Break down the following task into actionable steps:

Task: ${task.title}
Description: ${task.description || 'No description provided'}
Execution style: ${mode}
${availableMinutes ? `Available time: ${availableMinutes} minutes` : 'Available time: not specified'}

${contextStr ? '\nContext:\n' + contextStr : ''}

${modeInstructions[mode] || modeInstructions.balanced}

Create a step-by-step plan with:
1. Clear, numbered steps
2. Realistic time estimates per step
3. Key resources or tools needed
4. Dependencies between steps
5. Success criteria for each step

Make it actionable and specific to the task context.`
}

/**
 * Build daily plan prompt
 */
function buildDailyPlanPrompt(input = {}, context = {}) {
  const { tasks = [], availableMinutes, studyTime } = input
  const contextStr = buildContextString(context)

  const taskLines = Array.isArray(tasks) && tasks.length > 0
    ? tasks
        .map((task, index) => {
          const dueDate = task.dueDate ? `, due ${task.dueDate}` : ''
          const status = task.completed ? 'completed' : 'pending'
          return `${index + 1}. ${task.title}${dueDate} (${task.type || 'Study'}, ${status})`
        })
        .join('\n')
    : 'No tasks provided.'

  return `Create a practical daily study plan for today.

Available time: ${availableMinutes || 60} minutes
Preferred study time: ${studyTime || 'not specified'}

Today's tasks:
${taskLines}

${contextStr ? '\nContext:\n' + contextStr : ''}

Requirements:
- Prioritize the most urgent and important tasks first
- Include a short warm-up, focused work blocks, and a closing review
- Keep the plan realistic within the available time
- Use clear headings and bullet points
- Mention the first action the user should take right now

Format the response like this:
**Today's Focus**
- ...

**Plan**
1. ...
2. ...

**If Time Remains**
- ...

Keep the answer concise, structured, and actionable.`
}

/**
 * Build quiz prompt
 */
function buildQuizPrompt(input = {}, context = {}) {
  const { count = 5, difficulty = 'beginner', focus = '' } = input
  const contextStr = buildContextString(context)

  return `Create a study quiz for the learner.

Question count: ${count}
Difficulty: ${difficulty}
Focus topic: ${focus || 'Use the current subject if available'}

${contextStr ? '\nContext:\n' + contextStr : ''}

Requirements:
- Mix short-answer and multiple-choice questions
- Keep the questions aligned to the subject context
- Start easy and increase difficulty slightly
- Include an answer key after the questions
- Add one-line explanations for each answer

Format the response like this:
**Quiz**
1. Question text
   - A. Option
   - B. Option
   - C. Option
   - D. Option

**Answers**
1. Correct answer with a short explanation

Keep the quiz clear, useful, and easy to review.`
}

/**
 * Build session summary prompt
 */
function buildSessionSummaryPrompt(input = {}, context = {}) {
  const {
    taskTitle = 'Study session',
    subjectName = 'General',
    durationMinutes = 0,
    focusScore,
    completionNote = '',
    distractions = [],
    lapCount = 0,
  } = input

  const contextStr = buildContextString(context)
  const distractionText = distractions.length > 0 ? distractions.join(', ') : 'None'

  return `Write a short post-session summary for a study session.

Session details:
- Task: ${taskTitle}
- Subject: ${subjectName}
- Duration: ${durationMinutes} minutes
- Focus score: ${focusScore || 'not provided'}/5
- Lap count: ${lapCount}
- Completion note: ${completionNote || 'No completion note provided'}
- Distractions: ${distractionText}

${contextStr ? '\nContext:\n' + contextStr : ''}

Requirements:
- Keep it concise: 3 to 5 short bullet points
- Mention what was done well
- Mention one improvement for next time
- End with a practical next step
- Use clear, simple language

Format like this:
**Session Summary**
- ...
- ...

**Next Step**
- ...

Make it honest, specific, and actionable.`
}

/**
 * Build reminder coach prompt
 */
function buildReminderPrompt(input = {}, context = {}) {
  const {
    status = 'not-started',
    targetMinutes = 60,
    actualMinutes = 0,
    streakCount = 0,
    weekActiveDays = 0,
    avgSessionMinutes = 0,
    weakAreas = [],
    topSubjects = [],
  } = input

  const contextStr = buildContextString(context)

  return `You are Nexis, an accountability-focused study coach.

Current learner signals:
- Daily status: ${status}
- Daily target: ${targetMinutes} min
- Completed today: ${actualMinutes} min
- Current streak: ${streakCount} day(s)
- Active days this week: ${weekActiveDays}
- Average session duration: ${avgSessionMinutes} min
- Weak areas: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None identified yet'}
- Strong subjects recently: ${topSubjects.length > 0 ? topSubjects.join(', ') : 'Not enough data'}

${contextStr ? '\nContext:\n' + contextStr : ''}

Generate one short study reminder with this structure:
1. A direct one-line reality check
2. One positive reinforcement line
3. One concrete action to take in the next 10-20 minutes

Constraints:
- Keep total output under 80 words
- Be clear, direct, and motivating (not fluffy)
- Do not use markdown headings
- Keep it as plain text in 2-4 short lines`
}

/**
 * Build note analyzer prompt
 */
function buildNoteAnalyzerPrompt(notes, context = {}) {
  const contextStr = buildContextString(context)

  return `Analyze the following study notes and identify quality, gaps, and next actions.

---
${notes}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output format:
**What is Strong**
- ...

**Missing or Weak**
- ...

**High-Impact Fixes**
1. ...
2. ...

**Quick Self-Test Questions**
- ...

Rules:
- Be specific and practical
- Keep it concise
- Assume this is for exam-focused study improvement`
}

function buildDailyStreakNudgesPrompt(input = {}, context = {}) {
  const { streakCount = 0, missedDays = 0, mood = 'neutral', todayGoalMinutes = 60, recentWins = [] } = input
  const contextStr = buildContextString(context)

  return `Create a daily streak nudge for a learner.

Inputs:
- Current streak: ${streakCount} day(s)
- Missed days recently: ${missedDays}
- Mood signal: ${mood}
- Today's target: ${todayGoalMinutes} minutes
- Recent wins: ${recentWins.length > 0 ? recentWins.join(', ') : 'none'}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output format:
**Nudge Message**
- 1 line reality check
- 1 line encouragement
- 1 immediate action for next 15 minutes

Keep it under 70 words and practical.`
}

function buildAdaptiveRevisionPlanPrompt(input = {}, context = {}) {
  const { topics = [], examDate = 'not specified', dailyMinutes = 60, weakAreas = [] } = input
  const contextStr = buildContextString(context)

  return `Build an adaptive revision plan.

Topics to revise: ${topics.join(', ')}
Exam date: ${examDate}
Daily available minutes: ${dailyMinutes}
Weak areas: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'none'}

${contextStr ? '\nContext:\n' + contextStr : ''}

Requirements:
- Produce a day-wise plan for the next 7 days
- Allocate more time to weak areas
- Include revision + recall + mini-test cycle
- Add checkpoint metrics at end of each day

Format:
**7-Day Adaptive Plan**
Day 1: ...
...
Day 7: ...

**Tracking Metrics**
- ...`
}

function buildChapterRecapModePrompt(input = {}, context = {}) {
  const { chapterTitle = '', chapterNotes = '', examType = 'general' } = input
  const contextStr = buildContextString(context)

  return `Run chapter recap mode for this chapter.

Chapter: ${chapterTitle}
Exam type: ${examType}

Chapter notes:
---
${chapterNotes}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Provide:
1. 8 key recap bullets
2. 5 must-remember facts/formulas
3. 4 probable exam questions from this chapter
4. 3 common mistakes to avoid

Keep it concise and exam-oriented.`
}

function buildExamStrategyCoachPrompt(input = {}, context = {}) {
  const {
    examName = '',
    syllabusScope = '',
    daysLeft = 30,
    strengths = [],
    weakAreas = [],
    dailyMinutes = 90,
  } = input
  const contextStr = buildContextString(context)

  return `Create an exam strategy coaching plan.

Exam: ${examName}
Syllabus scope: ${syllabusScope}
Days left: ${daysLeft}
Strengths: ${strengths.length > 0 ? strengths.join(', ') : 'none specified'}
Weak areas: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'none specified'}
Daily study minutes: ${dailyMinutes}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Strategy**
- Phase 1 (Foundation)
- Phase 2 (Scoring)
- Phase 3 (Final Revision)

**Daily Routine Template**
- ...

**High-ROI Focus Areas**
- ...`
}

function buildMistakeLogInsightsPrompt(input = {}, context = {}) {
  const { subjectName = 'General', mistakeLog = '' } = input
  const contextStr = buildContextString(context)

  return `Analyze this mistake log and generate insights.

Subject: ${subjectName}

Mistake log:
---
${mistakeLog}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output sections:
**Pattern Clusters**
- ...

**Root Causes**
- ...

**Fix Protocol**
1. ...
2. ...
3. ...

**Weekly Prevention Checklist**
- ...`
}

function buildConceptDependencyMapPrompt(input = {}, context = {}) {
  const { targetTopic = '', knownConcepts = [], depth = 'medium' } = input
  const contextStr = buildContextString(context)

  return `Generate a concept dependency map.

Target topic: ${targetTopic}
Known concepts: ${knownConcepts.length > 0 ? knownConcepts.join(', ') : 'none listed'}
Depth: ${depth}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output format:
**Learning Order**
1. Prerequisite A
2. Prerequisite B
...

**Dependency Graph (text form)**
Topic A -> Topic B -> Target topic

**Fastest Path (if short on time)**
- ...`
}

function buildConfidenceScoringModelPrompt(input = {}, context = {}) {
  const { topics = [], recentPerformance = [], selfRatingScale = '1-5' } = input
  const contextStr = buildContextString(context)

  return `Build a confidence scoring model for study topics.

Topics: ${topics.join(', ')}
Recent performance data: ${Array.isArray(recentPerformance) ? JSON.stringify(recentPerformance) : recentPerformance}
Self-rating scale: ${selfRatingScale}

${contextStr ? '\nContext:\n' + contextStr : ''}

Return:
**Confidence Scores**
- Topic: score/100 with one reason

**Overconfidence Risk**
- ...

**Low Confidence Recovery Plan**
- ...

**What To Attempt Next**
- ...`
}

function buildPersonalizedWarmupsPrompt(input = {}, context = {}) {
  const { subjectName = '', minutes = 10, weakAreas = [], energy = 'medium' } = input
  const contextStr = buildContextString(context)

  return `Create a personalized warmup routine.

Subject: ${subjectName}
Warmup duration: ${minutes} minutes
Weak areas: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'none'}
Energy level: ${energy}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Warmup Plan (${minutes} min)**
1. ...
2. ...
3. ...

**Activation Question**
- ...

**Success Signal**
- ...`
}

function buildTimedDrillGeneratorPrompt(input = {}, context = {}) {
  const { topic = '', minutes = 20, difficulty = 'intermediate', questionCount = 8 } = input
  const contextStr = buildContextString(context)

  return `Generate a timed drill set.

Topic: ${topic}
Total time: ${minutes} minutes
Difficulty: ${difficulty}
Question count: ${questionCount}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Timed Drill**
- Provide ${questionCount} questions
- Mention suggested time per question

**Answer Key**
- Correct answers with short reasoning

**Post-Drill Review**
- 3 reflection prompts`
}

function buildFlashcardAutoMakerPrompt(input = {}, context = {}) {
  const { sourceNotes = '', cardCount = 12, style = 'exam-ready' } = input
  const contextStr = buildContextString(context)

  return `Generate flashcards from the notes below.

Card count: ${cardCount}
Style: ${style}

Source notes:
---
${sourceNotes}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output format:
**Flashcards**
1. Q: ...
   A: ...
...

Make cards concise, exam-focused, and non-redundant.`
}

function buildSpacedRepetitionPlannerPrompt(input = {}, context = {}) {
  const { topics = [], days = 14, dailyMinutes = 30, retentionGoal = '85%' } = input
  const contextStr = buildContextString(context)

  return `Create a spaced repetition planner.

Topics: ${topics.join(', ')}
Planner duration: ${days} days
Daily available minutes: ${dailyMinutes}
Retention goal: ${retentionGoal}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Spaced Repetition Schedule**
Day 1: ...
...

**Review Pattern Rules**
- ...

**Daily Checklist (${dailyMinutes} min)**
- ...`
}

function buildAnswerEvaluatorAIPrompt(input = {}, context = {}) {
  const { question = '', studentAnswer = '', rubric = 'clarity, correctness, structure, examples', maxScore = 10 } = input
  const contextStr = buildContextString(context)

  return `Evaluate the student's written answer.

Question:
${question}

Student answer:
---
${studentAnswer}
---

Rubric: ${rubric}
Maximum score: ${maxScore}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output format:
**Score**
- x/${maxScore}

**Strengths**
- ...

**Gaps**
- ...

**How To Improve**
1. ...
2. ...`
}

function buildExplanationSimplifierPrompt(input = {}, context = {}) {
  const { sourceExplanation = '', level = 'beginner', format = 'bullets' } = input
  const contextStr = buildContextString(context)

  return `Simplify the following explanation.

Target level: ${level}
Preferred format: ${format}

Source explanation:
---
${sourceExplanation}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output requirements:
- Keep meaning accurate
- Remove jargon or explain it simply
- Add one quick example
- End with a one-line memory trick`
}

function buildTopicMasteryTrackerPrompt(input = {}, context = {}) {
  const { topics = [], recentScores = [], targetScore = 80 } = input
  const contextStr = buildContextString(context)

  return `Build a topic mastery tracker.

Topics: ${topics.join(', ')}
Recent scores data: ${Array.isArray(recentScores) ? JSON.stringify(recentScores) : recentScores}
Target score: ${targetScore}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Mastery Table**
- Topic | Mastery % | Status (Weak/Improving/Strong)

**Priority Fix Order**
1. ...

**Next 3 Sessions Plan**
- Session 1: ...`
}

function buildSessionInterruptionAlertsPrompt(input = {}, context = {}) {
  const { interruptionSignals = '', sessionLengthMinutes = 45, environment = 'home' } = input
  const contextStr = buildContextString(context)

  return `Create a session interruption alert protocol.

Interruption signals:
${interruptionSignals}

Session length: ${sessionLengthMinutes} minutes
Environment: ${environment}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Likely Interruptions**
- ...

**Pre-Session Shield Setup**
1. ...

**In-Session Recovery Triggers**
- If distracted for >2 min, ...`
}

function buildFocusMusicAdvisorPrompt(input = {}, context = {}) {
  const { studyType = '', energy = 'medium', distractionLevel = 'moderate' } = input
  const contextStr = buildContextString(context)

  return `Act as a focus music advisor for study productivity.

Study type: ${studyType}
Energy level: ${energy}
Distraction level: ${distractionLevel}

${contextStr ? '\nContext:\n' + contextStr : ''}

Provide:
**Recommended Audio Profile**
- Tempo range
- Instrumental/vocal suggestion
- Sound style

**When To Switch Tracks**
- ...

**Do-Not-Use During Focus**
- ...`
}

function buildMotivationalCheckInsPrompt(input = {}, context = {}) {
  const { currentState = '', goal = 'Finish one focused session', availableMinutes = 30 } = input
  const contextStr = buildContextString(context)

  return `Create a motivational check-in.

Current state: ${currentState}
Goal: ${goal}
Available minutes right now: ${availableMinutes}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
1. One-line emotional acknowledgement
2. One-line confidence anchor
3. A ${availableMinutes}-minute action plan in 3 micro-steps
4. One accountability check question`
}

function buildWeeklyAIReportPrompt(input = {}, context = {}) {
  const { weeklyData = '', focusArea = 'general progress' } = input
  const contextStr = buildContextString(context)

  return `Generate a weekly AI study report.

Focus area: ${focusArea}
Weekly data:
---
${typeof weeklyData === 'string' ? weeklyData : JSON.stringify(weeklyData, null, 2)}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output sections:
**Weekly Highlights**
- ...

**Bottlenecks**
- ...

**Scoreboard**
- Consistency: ...
- Focus: ...
- Output quality: ...

**Next Week Priorities**
1. ...`
}

function buildMonthlyPerformanceDigestPrompt(input = {}, context = {}) {
  const { monthlyData = '', monthLabel = 'Current Month' } = input
  const contextStr = buildContextString(context)

  return `Generate a monthly performance digest.

Month: ${monthLabel}
Monthly data:
---
${typeof monthlyData === 'string' ? monthlyData : JSON.stringify(monthlyData, null, 2)}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Month In Review**
- ...

**Progress Trends**
- ...

**Risk Signals**
- ...

**Next Month Strategy**
1. ...
2. ...`
}

function buildMentorProgressBriefPrompt(input = {}, context = {}) {
  const { studentProfile = '', recentProgress = '', objective = 'Mentor review and next-step guidance' } = input
  const contextStr = buildContextString(context)

  return `Create a mentor-ready progress brief.

Objective: ${objective}

Student profile:
---
${typeof studentProfile === 'string' ? studentProfile : JSON.stringify(studentProfile, null, 2)}
---

Recent progress:
---
${typeof recentProgress === 'string' ? recentProgress : JSON.stringify(recentProgress, null, 2)}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output sections:
**Learner Snapshot**
- ...

**Academic Progress**
- ...

**Behavioral Signals**
- ...

**Support Needed From Mentor**
- ...

**Recommended Next 2 Weeks Plan**
1. ...`
}

function buildSmartDoubtClusteringPrompt(input = {}, context = {}) {
  const { doubtsLog = '', subjectName = 'General' } = input
  const contextStr = buildContextString(context)

  return `Cluster these learner doubts into smart categories.

Subject: ${subjectName}
Doubts log:
---
${doubtsLog}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Doubt Clusters**
- Cluster name: listed doubts

**Root Confusions**
- ...

**Best Learning Order To Resolve**
1. ...`
}

function buildExamCountdownPlannerPrompt(input = {}, context = {}) {
  const { examDate = '', syllabusScope = '', dailyMinutes = 90, revisionCycles = 3 } = input
  const contextStr = buildContextString(context)

  return `Create an exam countdown planner.

Exam date: ${examDate}
Syllabus scope: ${syllabusScope}
Daily minutes: ${dailyMinutes}
Revision cycles: ${revisionCycles}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Countdown Plan**
- Week-by-week priorities

**Final 7 Days Strategy**
- ...

**Daily Non-Negotiables**
- ...`
}

function buildSyllabusCoverageEstimatorPrompt(input = {}, context = {}) {
  const { syllabusTopics = [], completedTopics = [], confidence = 'medium' } = input
  const contextStr = buildContextString(context)

  return `Estimate syllabus coverage and gaps.

Full syllabus topics: ${syllabusTopics.join(', ')}
Completed topics: ${completedTopics.join(', ')}
Confidence in data: ${confidence}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Coverage Estimate**
- Covered %
- Remaining %

**Critical Uncovered Areas**
- ...

**Fast Completion Path**
1. ...`
}

function buildBacklogRiskDetectorPrompt(input = {}, context = {}) {
  const { backlogItems = '', horizonDays = 14 } = input
  const contextStr = buildContextString(context)

  return `Detect risk in this study backlog.

Time horizon: ${horizonDays} days
Backlog items:
---
${typeof backlogItems === 'string' ? backlogItems : JSON.stringify(backlogItems, null, 2)}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Risk Level**
- Low/Medium/High with reason

**Risky Items**
- ...

**De-Risk Plan**
1. ...`
}

function buildCognitiveLoadMonitorPrompt(input = {}, context = {}) {
  const { studyPattern = '', sleepHours = 7, stressLevel = 'medium' } = input
  const contextStr = buildContextString(context)

  return `Analyze cognitive load from study behavior.

Study pattern:
---
${studyPattern}
---

Sleep hours: ${sleepHours}
Stress level: ${stressLevel}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Cognitive Load Snapshot**
- ...

**Overload Triggers**
- ...

**Load Balancing Actions**
1. ...`
}

function buildBurnoutRiskWarningsPrompt(input = {}, context = {}) {
  const { behaviorSignals = '', recoveryWindowDays = 7 } = input
  const contextStr = buildContextString(context)

  return `Generate burnout risk warnings and prevention actions.

Behavior signals:
---
${behaviorSignals}
---

Recovery window target: ${recoveryWindowDays} days

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Burnout Risk Level**
- ...

**Warning Signals To Watch**
- ...

**Recovery Micro-Plan**
1. ...`
}

function buildComebackDayProtocolPrompt(input = {}, context = {}) {
  const { setbackContext = '', availableMinutes = 45 } = input
  const contextStr = buildContextString(context)

  return `Create a comeback day protocol after a missed or low-performance period.

Setback context:
---
${setbackContext}
---

Available minutes today: ${availableMinutes}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Comeback Day Protocol**
1. ...
2. ...
3. ...

**Momentum Protection Rule**
- ...`
}

function buildAIOnboardingTutorPrompt(input = {}, context = {}) {
  const { learnerGoal = '', learnerLevel = 'beginner' } = input
  const contextStr = buildContextString(context)

  return `Create an AI onboarding tutor flow for a learner.

Learner goal: ${learnerGoal}
Learner level: ${learnerLevel}

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**First 7-Day Onboarding Plan**
- ...

**Daily Starter Prompts**
- ...

**Common Mistakes During Onboarding**
- ...`
}

function buildMultilingualStudySupportPrompt(input = {}, context = {}) {
  const { sourceText = '', targetLanguage = '', mode = 'explain' } = input
  const contextStr = buildContextString(context)

  return `Provide multilingual study support.

Target language: ${targetLanguage}
Mode: ${mode}

Source text:
---
${sourceText}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Translated + Simplified Explanation**
- ...

**Key Terms (Bilingual)**
- ...

**Quick Recall Questions**
- ...`
}

function buildAIReliabilityGuardrailsPrompt(input = {}, context = {}) {
  const { taskContext = '', aiOutput = '', strictness = 'standard' } = input
  const contextStr = buildContextString(context)

  return `Audit AI output reliability and propose guardrails.

Strictness: ${strictness}

Task context:
---
${taskContext}
---

AI output to audit:
---
${aiOutput}
---

${contextStr ? '\nContext:\n' + contextStr : ''}

Output:
**Reliability Risks**
- ...

**Validation Checks Before Use**
- ...

**Safe-Use Guardrails**
1. ...`
}

/**
 * Main builder function
 */
function buildPrompt({ type, input, context = {} }) {
  if (!type) throw new Error('Prompt type is required')
  if (!input) throw new Error('Input is required')

  switch (type) {
    case 'chat':
      return buildChatPrompt(input, context)
    case 'summarize':
      return buildSummarizePrompt(input, context)
    case 'doubt':
      const mode = context.mode || 'quick'
      return buildDoubtPrompt(input, mode, context)
    case 'task_breakdown':
      return buildTaskBreakdownPrompt(input, context)
    case 'daily_plan':
      return buildDailyPlanPrompt(input, context)
    case 'quiz':
      return buildQuizPrompt(input, context)
    case 'session_summary':
      return buildSessionSummaryPrompt(input, context)
    case 'reminder':
      return buildReminderPrompt(input, context)
    case 'note_analyzer':
      return buildNoteAnalyzerPrompt(input, context)
    case 'daily_streak_nudges':
      return buildDailyStreakNudgesPrompt(input, context)
    case 'adaptive_revision_plan':
      return buildAdaptiveRevisionPlanPrompt(input, context)
    case 'chapter_recap_mode':
      return buildChapterRecapModePrompt(input, context)
    case 'exam_strategy_coach':
      return buildExamStrategyCoachPrompt(input, context)
    case 'mistake_log_insights':
      return buildMistakeLogInsightsPrompt(input, context)
    case 'concept_dependency_map':
      return buildConceptDependencyMapPrompt(input, context)
    case 'confidence_scoring_model':
      return buildConfidenceScoringModelPrompt(input, context)
    case 'personalized_warmups':
      return buildPersonalizedWarmupsPrompt(input, context)
    case 'timed_drill_generator':
      return buildTimedDrillGeneratorPrompt(input, context)
    case 'flashcard_auto_maker':
      return buildFlashcardAutoMakerPrompt(input, context)
    case 'spaced_repetition_planner':
      return buildSpacedRepetitionPlannerPrompt(input, context)
    case 'answer_evaluator_ai':
      return buildAnswerEvaluatorAIPrompt(input, context)
    case 'explanation_simplifier':
      return buildExplanationSimplifierPrompt(input, context)
    case 'topic_mastery_tracker':
      return buildTopicMasteryTrackerPrompt(input, context)
    case 'session_interruption_alerts':
      return buildSessionInterruptionAlertsPrompt(input, context)
    case 'focus_music_advisor':
      return buildFocusMusicAdvisorPrompt(input, context)
    case 'motivational_check_ins':
      return buildMotivationalCheckInsPrompt(input, context)
    case 'weekly_ai_report':
      return buildWeeklyAIReportPrompt(input, context)
    case 'monthly_performance_digest':
      return buildMonthlyPerformanceDigestPrompt(input, context)
    case 'mentor_progress_brief':
      return buildMentorProgressBriefPrompt(input, context)
    case 'smart_doubt_clustering':
      return buildSmartDoubtClusteringPrompt(input, context)
    case 'exam_countdown_planner':
      return buildExamCountdownPlannerPrompt(input, context)
    case 'syllabus_coverage_estimator':
      return buildSyllabusCoverageEstimatorPrompt(input, context)
    case 'backlog_risk_detector':
      return buildBacklogRiskDetectorPrompt(input, context)
    case 'cognitive_load_monitor':
      return buildCognitiveLoadMonitorPrompt(input, context)
    case 'burnout_risk_warnings':
      return buildBurnoutRiskWarningsPrompt(input, context)
    case 'comeback_day_protocol':
      return buildComebackDayProtocolPrompt(input, context)
    case 'ai_onboarding_tutor':
      return buildAIOnboardingTutorPrompt(input, context)
    case 'multilingual_study_support':
      return buildMultilingualStudySupportPrompt(input, context)
    case 'ai_reliability_guardrails':
      return buildAIReliabilityGuardrailsPrompt(input, context)
    default:
      throw new Error(`Unknown prompt type: ${type}`)
  }
}

module.exports = {
  buildPrompt,
  buildChatPrompt,
  buildSummarizePrompt,
  buildDoubtPrompt,
  buildTaskBreakdownPrompt,
  buildDailyPlanPrompt,
  buildQuizPrompt,
  buildSessionSummaryPrompt,
  buildReminderPrompt,
  buildNoteAnalyzerPrompt,
  buildDailyStreakNudgesPrompt,
  buildAdaptiveRevisionPlanPrompt,
  buildChapterRecapModePrompt,
  buildExamStrategyCoachPrompt,
  buildMistakeLogInsightsPrompt,
  buildConceptDependencyMapPrompt,
  buildConfidenceScoringModelPrompt,
  buildPersonalizedWarmupsPrompt,
  buildTimedDrillGeneratorPrompt,
  buildFlashcardAutoMakerPrompt,
  buildSpacedRepetitionPlannerPrompt,
  buildAnswerEvaluatorAIPrompt,
  buildExplanationSimplifierPrompt,
  buildTopicMasteryTrackerPrompt,
  buildSessionInterruptionAlertsPrompt,
  buildFocusMusicAdvisorPrompt,
  buildMotivationalCheckInsPrompt,
  buildWeeklyAIReportPrompt,
  buildMonthlyPerformanceDigestPrompt,
  buildMentorProgressBriefPrompt,
  buildSmartDoubtClusteringPrompt,
  buildExamCountdownPlannerPrompt,
  buildSyllabusCoverageEstimatorPrompt,
  buildBacklogRiskDetectorPrompt,
  buildCognitiveLoadMonitorPrompt,
  buildBurnoutRiskWarningsPrompt,
  buildComebackDayProtocolPrompt,
  buildAIOnboardingTutorPrompt,
  buildMultilingualStudySupportPrompt,
  buildAIReliabilityGuardrailsPrompt,
  buildContextString,
}
