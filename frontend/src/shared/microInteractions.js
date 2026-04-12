/**
 * Micro-Interactions Guide for Learning OS
 * 
 * Subtle, delightful interactions that:
 * - Provide feedback (user knows action was registered)
 * - Guide attention (next action is obvious)
 * - Build personality (not robotic)
 * - Stay fast (never >300ms)
 * 
 * Principles:
 * -----------
 * 1. Transitions should be 200-300ms (not too fast, not too slow)
 * 2. Easing should be cubic-bezier(0.22, 1, 0.36, 1) for bounce
 * 3. Scale should be subtle: hover 1.02x, active 0.98x
 * 4. Opacity changes for state clarity
 * 5. Icons should rotate/pop, not fade
 * 
 * Add to frontend/src/index.css:
 */

// CSS SNIPPETS TO ADD
const MICRO_INTERACTIONS_CSS = `
/* BUTTON STATES */
.button-base {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
}

.button-primary {
  @apply button-base bg-purple-600 text-white;
}

.button-primary:hover {
  @apply bg-purple-700 scale-105;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.button-primary:active {
  @apply scale-95 bg-purple-800;
}

.button-secondary {
  @apply button-base bg-gray-100 text-gray-900;
}

.button-secondary:hover {
  @apply bg-gray-200 scale-102;
}

.button-secondary:active {
  @apply scale-95;
}

/* LINK/CTA HOVER */
.link-hover {
  @apply text-purple-600 cursor-pointer transition-all duration-200;
}

.link-hover:hover {
  @apply text-purple-700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

/* FOCUS STATE (KEYBOARD NAVIGATION) */
.focus-ring:focus {
  @apply outline-none ring-2 ring-purple-600 ring-offset-2;
}

/* ICON ANIMATIONS */
.icon-rotate {
  transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

.icon-rotate:hover {
  transform: rotate(180deg);
}

.icon-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.icon-bounce {
  animation: bounce 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* CARD/CONTAINER INTERACTIONS */
.card-hover {
  @apply transition-all duration-300 cursor-pointer;
}

.card-hover:hover {
  @apply translate-y-[-2px];
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-hover:active {
  @apply translate-y-[0px];
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* CHECKBOX/TOGGLE */
input[type='checkbox']:checked + label {
  @apply text-purple-600;
}

.checkbox-custom {
  @apply w-4 h-4 rounded border-2 border-gray-300 transition-all duration-200;
}

.checkbox-custom:checked {
  @apply bg-purple-600 border-purple-600;
}

/* LOADING STATE */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(147, 51, 234, 0.3);
  border-top-color: rgba(147, 51, 234, 1);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* TOAST/NOTIFICATION SLIDE */
.toast-enter {
  animation: slideIn 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-exit {
  animation: slideOut 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slideIn {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(16px);
    opacity: 0;
  }
}

/* MODAL BACKDROP FADE */
.modal-backdrop {
  animation: fadeIn 200ms ease-in-out;
}

.modal-content {
  animation: modalPop 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* NUDGE BANNER APPEAR */
.nudge-appear {
  animation: nudgeSlideDown 300ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes nudgeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* PROGRESS BAR FILL */
.progress-fill {
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* LABEL FLOAT (for inputs) */
input:placeholder-shown + label {
  cursor: text;
  top: 1rem;
}

input:not(:placeholder-shown) + label,
input:focus + label {
  @apply text-sm text-purple-600;
  top: -0.5rem;
}

label {
  @apply transition-all duration-200 absolute left-3;
}
`

/**
 * React Component Interaction Patterns
 */

// PATTERN 1: Button with Loading State
export const ButtonWithFeedback = ({
  children,
  onClick,
  isLoading,
  disabled,
  ...props
}) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`
      button-primary relative
      ${isLoading ? 'opacity-75' : ''}
    `}
    {...props}
  >
    {isLoading ? (
      <>
        <span className="loading-spinner inline-block mr-2" />
        Processing...
      </>
    ) : (
      children
    )}
  </button>
)

// PATTERN 2: Task Completion Toggle with Feedback
export const TaskCheckbox = ({ task, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(task.id)}
      className={`
        transition-all duration-200
        ${task.completed ? 'opacity-50' : ''}
      `}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="checkbox-custom"
      />
      <label className={task.completed ? 'line-through text-gray-400' : ''}>
        {task.title}
      </label>
    </button>
  )
}

// PATTERN 3: Hover Card Animation
export const InteractiveCard = ({ children, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`card-hover rounded-lg p-4 bg-white ${className}`}
  >
    {children}
  </div>
)

// PATTERN 4: Focus Rating Selector
export const FocusRating = ({ value, onChange }) => {
  const ratings = [
    { value: 1, emoji: '😤' },
    { value: 2, emoji: '😕' },
    { value: 3, emoji: '😐' },
    { value: 4, emoji: '😊' },
    { value: 5, emoji: '🔥' },
  ]

  return (
    <div className="flex gap-2">
      {ratings.map((rating) => (
        <button
          key={rating.value}
          onClick={() => onChange(rating.value)}
          className={`
            text-2xl p-3 rounded-lg transition-all duration-200
            ${
              value === rating.value
                ? 'bg-purple-600 scale-110'
                : 'bg-gray-100 hover:scale-105'
            }
          `}
        >
          {rating.emoji}
        </button>
      ))}
    </div>
  )
}

// PATTERN 5: Icon Action Button
export const IconButton = ({ icon: Icon, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      icon-rotate p-2 rounded-lg
      hover:bg-gray-100 transition-colors duration-200
      ${className}
    `}
  >
    <Icon size={20} />
  </button>
)

// PATTERN 6: Animated List Item
export const AnimatedListItem = ({ item, children, onDelete }) => {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => onDelete(item.id), 200)
  }

  return (
    <div
      className={`
        transition-all duration-200
        ${isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      {children(handleDelete)}
    </div>
  )
}

/**
 * Pro Tips
 * -------
 * 1. Always add transition classes BEFORE adding hover/active states
 * 2. Use cubic-bezier(0.22, 1, 0.36, 1) for "bouncy" feel
 * 3. Keep animations under 300ms for snappy UX
 * 4. Add box-shadow changes for depth (not just scale)
 * 5. Test on low-end devices - animations should not stutter
 * 6. Use will-change sparingly for performance
 * 7. Ensure keyboard navigation also shows focus states
 */

export default {
  MICRO_INTERACTIONS_CSS,
  ButtonWithFeedback,
  TaskCheckbox,
  InteractiveCard,
  FocusRating,
  IconButton,
  AnimatedListItem,
}
