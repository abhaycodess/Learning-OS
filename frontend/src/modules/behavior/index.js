/**
 * Learning OS - Behavior Engine
 * 
 * A collection of intelligent hooks and components that make the app
 * aware of user behavior and push toward action.
 * 
 * Modules:
 * --------
 * 1. useNudgeEngine
 *    - Detects inactivity, pending tasks, page entry patterns
 *    - Returns contextual nudge messages
 *    - Severity: soft, medium, strong
 * 
 * 2. useSmartGreetingEngine
 *    - Generates culturally-aware greetings
 *    - Based on time, last session, goal, consistency
 *    - Builds user connection through personalization
 * 
 * 3. useStartNowEngine
 *    - Intelligent task selection for immediate action
 *    - Prioritizes by due date, subject recency, type
 *    - Fallback: suggests quick task creation
 * 
 * 4. SessionReflectionModal
 *    - Post-session feedback capture
 *    - Collects focus rating (1-5), completion notes, distractions
 *    - Feeds into behavior analytics
 * 
 * 5. useWeeklySummaryEngine
 *    - Honest progress reporting
 *    - Planned vs completed, consistency, focus quality
 *    - Generates verdict and actionable suggestions
 * 
 * Integration Pattern:
 * -------------------
 * 
 * // In Dashboard component
 * const { nudge } = useNudgeEngine({
 *   pageOpenTimeMs,
 *   pendingTaskCount: todaysTasks.length,
 *   completedTasksToday: completedToday.length,
 *   plannedTasksToday: plannedTasks.length,
 * })
 * 
 * const greeting = useSmartGreetingEngine({
 *   firstName: user.name.split(' ')[0],
 *   lastSessionMinutesAgo: calculateMinutesSince(lastSession),
 * })
 * 
 * const startNow = useStartNowEngine({
 *   tasks: allTasks,
 *   subjects: allSubjects,
 *   sessions: allSessions,
 * })
 * 
 * // In Focus page, post-session
 * const [showReflection, setShowReflection] = useState(false)
 * <SessionReflectionModal
 *   isOpen={showReflection && sessionEnded}
 *   session={currentSession}
 *   onSubmit={handleReflectionSave}
 * />
 * 
 * // In Analytics/Weekly view
 * const summary = useWeeklySummaryEngine({
 *   tasks: weekTasks,
 *   sessions: weekSessions,
 *   reflections: allReflections,
 * })
 * 
 * Philosophy:
 * -----------
 * These systems exist to reduce decision friction and push users toward
 * consistent, focused action. They are:
 * - Honest (not sugarcoating)
 * - Aware (tracking behavior patterns)
 * - Actionable (always suggesting next step)
 * - Conversational (not corporate)
 */

export { useNudgeEngine } from './useNudgeEngine'
export { useSmartGreetingEngine } from './useSmartGreetingEngine'
export { useStartNowEngine } from './useStartNowEngine'
export { SessionReflectionModal } from './SessionReflectionModal'
export { useWeeklySummaryEngine } from './useWeeklySummaryEngine'
export { useNudgeExperiment } from './useNudgeExperiment'
