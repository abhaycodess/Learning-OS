/**
 * useSmartGreetingEngine - Context-Aware Greeting Messages
 * 
 * Generates greetings based on:
 * - Time of day (morning, afternoon, evening, night)
 * - Last session history
 * - Inactivity period
 * - User's goal/focus preference
 * 
 * Usage:
 * const greeting = useSmartGreetingEngine({
 *   timeOfDay: 'morning',
 *   lastSessionMinutesAgo: 1440,
 *   lastSessionDurationMinutes: 45,
 *   userGoal: 'stay-consistent',
 * })
 * // greeting.message === "Back again? Good."
 * // greeting.emoji === "👋"
 * // greeting.tone === "encouraging"
 */

/**
 * Get time of day period based on hour
 */
function getTimeOfDay(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/**
 * Greeting templates organized by context
 */
const GREETING_TEMPLATES = {
  // First appearance today
  morningFirstSession: {
    message: 'Good morning. Let\'s go.',
    emoji: '☀️',
    tone: 'energetic',
  },
  afternoonFirstSession: {
    message: 'Afternoon. Now or never.',
    emoji: '⚡',
    tone: 'focused',
  },
  eveningFirstSession: {
    message: 'Evening focus session?',
    emoji: '🌙',
    tone: 'calm',
  },

  // User returning (did session before)
  returningToday: {
    message: 'Back again? Good.',
    emoji: '👋',
    tone: 'encouraging',
  },

  // Multi-day consistency
  consistencyStreak2Days: {
    message: 'Two days running. Let\'s keep it going.',
    emoji: '🔥',
    tone: 'motivating',
  },
  consistencyStreak5Days: {
    message: 'Five days. Consistency wins.',
    emoji: '💪',
    tone: 'powerful',
  },

  // Reference to previous session
  returnWithSessionRef: {
    message: 'You did {minutes} minutes yesterday. Match it?',
    emoji: '⏱️',
    tone: 'playful',
  },

  // Long break
  longBreak7Days: {
    message: 'Week has passed. Let\'s wake up.',
    emoji: '⏰',
    tone: 'gentle',
  },

  // Goal-based greeting
  goalExamPrep: {
    message: 'Exam coming up. No time to waste.',
    emoji: '📖',
    tone: 'focused',
  },
  goalSkillBuild: {
    message: 'Building new skills. Nice.',
    emoji: '🛠️',
    tone: 'calm',
  },
  goalConsistency: {
    message: 'One step more. That\'s all.',
    emoji: '→',
    tone: 'minimalist',
  },

  // Time-sensitive
  nightSession: {
    message: 'Late, but you\'re here. I respect that.',
    emoji: '🌙',
    tone: 'supportive',
  },
  earlyMorning: {
    message: 'You\'re early. The world is quiet.',
    emoji: '🌅',
    tone: 'peaceful',
  },
}

export function useSmartGreetingEngine({
  firstName: _firstName = 'there',
  timeOfDay = null,
  lastSessionMinutesAgo = null,
  lastSessionDurationMinutes = null,
  userGoal = null,
  userHour = null,
} = {}) {
  const hour = userHour ?? new Date().getHours()
  const tod = timeOfDay || getTimeOfDay(hour)

  let selectedGreeting = null
  let context = {}

  // PRIORITY 1: Long break (7+ days)
  if (lastSessionMinutesAgo && lastSessionMinutesAgo >= 7 * 24 * 60) {
    selectedGreeting = GREETING_TEMPLATES.longBreak7Days
    context = { lastSessionDaysAgo: Math.floor(lastSessionMinutesAgo / (24 * 60)) }
  }

  // PRIORITY 2: Goal-based greeting (if no recent session)
  else if (!lastSessionMinutesAgo && userGoal) {
    if (userGoal.includes('crack-exam')) {
      selectedGreeting = GREETING_TEMPLATES.goalExamPrep
    } else if (userGoal.includes('learn-skills')) {
      selectedGreeting = GREETING_TEMPLATES.goalSkillBuild
    } else if (userGoal.includes('stay-consistent')) {
      selectedGreeting = GREETING_TEMPLATES.goalConsistency
    }
  }

  // PRIORITY 3: Session reference (last session < 24 hours)
  else if (lastSessionMinutesAgo && lastSessionMinutesAgo < 24 * 60) {
    selectedGreeting = GREETING_TEMPLATES.returningToday
    context = { withinSameDay: true }

    // Add previous session duration reference if available
    if (lastSessionDurationMinutes && lastSessionDurationMinutes > 15) {
      selectedGreeting = {
        ...GREETING_TEMPLATES.returnWithSessionRef,
        message: GREETING_TEMPLATES.returnWithSessionRef.message.replace(
          '{minutes}',
          lastSessionDurationMinutes,
        ),
      }
    }
  }

  // PRIORITY 4: Time-of-day specific
  else if (hour >= 4 && hour < 6) {
    selectedGreeting = GREETING_TEMPLATES.earlyMorning
  } else if (hour >= 22 || hour < 4) {
    selectedGreeting = GREETING_TEMPLATES.nightSession
  } else if (!lastSessionMinutesAgo) {
    // First session of the day
    if (tod === 'morning') {
      selectedGreeting = GREETING_TEMPLATES.morningFirstSession
    } else if (tod === 'afternoon') {
      selectedGreeting = GREETING_TEMPLATES.afternoonFirstSession
    } else if (tod === 'evening') {
      selectedGreeting = GREETING_TEMPLATES.eveningFirstSession
    }
  }

  // Fallback
  if (!selectedGreeting) {
    selectedGreeting = GREETING_TEMPLATES.returningToday
  }

  return {
    message: selectedGreeting.message,
    emoji: selectedGreeting.emoji,
    tone: selectedGreeting.tone,
    fullGreeting: `${selectedGreeting.emoji} ${selectedGreeting.message}`,
    context,
  }
}

export default useSmartGreetingEngine
