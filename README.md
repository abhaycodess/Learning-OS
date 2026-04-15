# Learning OS - Current State and App Flow

Last updated: April 12, 2026

Version: 4.3 - Phase 10/11 AI Tooling Expansion Verified
Status: Active build, AI roadmap features integrated (40/40) with verified runtime on current backend instance

This is now the single source of product and implementation details in the repository.

## 1) Runtime Status

Frontend
- Stack: React + Vite + Tailwind
- Current status: stable build and runtime
- Key UI recently polished: Dashboard, Tasks, Profile, Focus, Analytics

Backend
- Stack: Node.js + Express + MongoDB (Mongoose)
- Current status: stable boot with retry handling and graceful shutdown
- Note: if feature endpoints unexpectedly return 404 while standard AI routes work, a stale process may be bound to port 4000; kill current listener and restart backend from `backend/`.
- Auth-protected API for all user data routes

## 2) Product Scope (Current)

Learning OS currently provides:
- Landing and unified auth flow
- Onboarding-gated core app
- Dashboard
- Settings
- Tasks
- Subjects
- Focus
- Analytics
- Profile
- Behavior and retention systems that push daily action and consistency

## 3) Routing and App Flow

Main routing is defined in `frontend/src/App.jsx`.

Public
- `/` -> landing (or redirect to authenticated destination)
- `/how-it-works` -> visual feature explainer page (kid-friendly walkthrough)
- `/auth` -> unified login/signup
- `/verify-email`, `/forgot-password`, `/reset-password`

Protected
- `/onboarding`
- `/dashboard`
- `/settings`
- `/tasks`
- `/subjects`
- `/analytics`
- `/focus`
- `/profile`

Guard behavior
- Auth required for protected routes
- Onboarding gate redirects incomplete users to `/onboarding`

## 4) State and Data Architecture

Global providers
- `AuthProvider` (`frontend/src/contexts/AuthContext.jsx`)
- `LearningProvider` (`frontend/src/hooks/useLearningStore.jsx`)

Auth/profile
- Token auth, user bootstrap, profile sync
- Shared profile schema normalized through `frontend/src/shared/userProfile.js`

Learning store
- Optimistic state for tasks, subjects, sessions
- Snapshot hydration from `/api/snapshot`
- Derived selectors include todays tasks, completed today, focus seconds, active task

## 5) Backend API and Model State

Core protected routes
- `/api/tasks`
- `/api/subjects`
- `/api/sessions`
- `/api/analytics`
- `/api/snapshot`
- `/api/behavior` (retention engine namespace)

Auth routes
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/user`
- `/api/auth/profile`, verification and password reset routes

Model safety
- Compound unique indexes for domain IDs by `userId`
- Request validation for task/subject/session payloads

## 6) Retention Engine (Phase 8 - Implemented)

### 6.1 User Behavior Data

User model now includes `behavior`:
- `dailyTargetMinutes`
- `lastActiveDate`
- `streakCount`
- `lastStreakDate`
- `missedDays`
- `totalActiveDays`

### 6.2 Daily Log Model

`DailyLog` stores day-level execution:
- `userId`, `dateKey`
- `plannedMinutes`, `actualMinutes`
- `sessionsCount`
- `started`, `completed`
- `verdict`

Unique index on `{ userId, dateKey }`.

### 6.3 Notification Queue Model

`NotificationQueue` stores deferred notifications:
- `type`: `REMINDER`, `MISSED_DAY`, `WEEKLY_SUMMARY`
- `message`, `scheduledAt`, `sent`

### 6.4 Behavior Endpoints

- `POST /api/behavior/daily-contract`
- `POST /api/behavior/log-session-impact`
- `POST /api/behavior/evaluate`
- `GET /api/behavior/today`
- `GET /api/behavior/streak`

### 6.5 Behavior Logic

- Daily contract target tracking
- Session-impact logging on session end
- Streak increments on start/show-up behavior
- Missed-day tracking and verdict generation
- Notification enqueueing logic for reminder/missed-day cases

## 7) Current UX State by Page

### Dashboard
- Action-first behavior sections integrated
- Non-relevant mock learning/course sections removed
- Focused on real usage signals and workflow

### Tasks
- Simplified layout (clutter reduced)
- Intelligent status coding:
  - Overdue
  - Due Today
  - Upcoming
  - No Date
  - Completed
- Subject color chips with deterministic mapping
- Action icons are large and visible:
  - Tick for mark done
  - Clock for mark pending
  - Red bin for delete
- Tooltips on hover
- Two-step delete confirmation (click once to arm, click again to confirm)
- Real delete wired end-to-end:
  - frontend state + service
  - backend `DELETE /api/tasks/:id`

### Subjects
- Subject/topic/subtopic management
- Profile-based quick generation retained

### Focus
- Custom session duration (5-180 min)
- Fullscreen timer mode
- Fullscreen mode now shows current task title
- Task selection flow integrated with Tasks page:
  - choose a task in Tasks when coming from Focus
  - return to Focus with selected task context
  - session resets to idle so CTA shows Start Session and timer resets
- Header controls simplified:
  - back control is icon-only arrow button
  - streak control is icon-only flame badge
- Session reflection modal layering fixed to always render above top navigation

### Settings
- Comprehensive settings page is active and routed
- Theme system is app-wide via provider/context
- Appearance controls include light/dark mode and accent selection (violet/emerald)
- Local advanced preferences reset path is implemented
- Focus sound cues setting is wired to focus session lifecycle events

### Analytics
- Advanced analytics retained
- Internal A/B experiment card removed from UI
- JSX/syntax issues resolved

### Profile
- Back arrow added before title
- Photo interaction redesigned:
  - Hover camera icon inside avatar circle
  - Click avatar opens action popover
  - Popover includes:
    - choose new photo
    - remove current photo
    - sarcastic roast button
  - Explicit `X` close added in popover
- Center-screen sarcastic popup appears on:
  - photo change
  - photo removal
- Popup quote rotates and auto-dismisses

## 8) Navigation Consistency Update

Back arrows were standardized for non-dashboard pages:
- Shared heading component now supports and renders back button by default except dashboard
- Profile and Focus headers also use explicit step-back controls

Recent refinement:
- Focus page top controls were reduced to icon-first controls for cleaner execution UI

## 9) Phase 9 UX Polish Implementation (New)

### Toast Notification System
- Global context-based toast with animated stack (max 6, bottom-right, z-index 220)
- Auto-dismiss with configurable duration (default 4800ms)
- Optional action buttons for undo flows (e.g., task delete undo)
- Color-coded by tone: success (green), error (red), warning (amber), info (blue)
- Progress bar animation (280ms entry, linear dismiss animation)
- Components: `ToastContext.jsx`, `useToast.jsx` hook wrapper

### Task Delete with Undo
- Delete optimistically with ref-based pending tracking
- 5000ms undo window via toast action button
- Re-add task on undo via `addTask()` with proper error rollback
- Full TasksPage rewrite with modal-based task creation

### Empty States
- Reusable `EmptyState` component with icon, title, description, optional CTA
- Deployed across: Tasks (no-tasks, no-pending), Focus (no-task-selected), Analytics (no-sessions)

### Skeleton Loaders
- `SkeletonBlock` component with shimmer animation (1.25s cycle)
- Page-level skeleton layouts during async data loads
- Guards: `!state.bootstrapped` triggers skeleton render

### Global Keyboard Shortcuts
- F: Navigate to Focus
- D: Navigate to Dashboard
- N: Create new task (with subject existence guard)
- Input context detection prevents shortcuts during form input (input/textarea/select/contentEditable)

### Micro-Interactions & Transitions
- Toast entry: 280ms fade-in with slide effect
- Page transition: 260ms fade-in
- Button hover: 1.03 scale, active 0.97 scale
- Skeleton shimmer: 1.25s infinite background sweep

### Grace-Day Streak System (Frontend Completed)
- Weekly grace-day availability tracking (ISO week scope)
- Frontend store tracks: `graceDayUsedYesterday`, `graceDayAvailable`
- Backend `/api/behavior/summary?dateKey=YYYY-MM-DD` endpoint returns daily summary
- Summary includes verdictType: 'completed'/'partial'/'missed'/'grace'

### End-of-Day Summary Modal
- Auto-shows on Dashboard when yesterday missed or grace-day used
- Displays: verdict message (themed by verdictType), stats (planned/actual minutes, sessions), grace-day explanation
- Loading and error states handled gracefully
- Component: `DailySummaryModal.jsx`

## 10) Known Notes

- UI uses optimistic updates in several places; backend sync failures are logged and reconciled on next hydration.
- Behavior analytics and reminder delivery queue are implemented; external notification delivery wiring can be extended later.
- Grace-day logic uses ISO week calculation (`YYYY-Www` format) for weekly reset alignment.
- Toast system supports custom action callbacks for undo flows and other interactive patterns.

## 11) Current Priority Snapshot

### Phase 9 Completed ✅
- Global toast notification system with undo actions
- Task delete with 5000ms undo window via toast
- Empty states across all key pages (Tasks, Focus, Analytics, Dashboard)
- Skeleton loaders with shimmer animation
- Global keyboard shortcuts (F/D/N) with input context guards
- Micro-interactions and CSS transitions
- Grace-day streak protection backend (ISO week tracking)
- Grace-day frontend state synchronization
- End-of-day summary modal with verdictType theming

### Previously Completed and Stable:
- Auth and onboarding pipeline
- Core page stack (Dashboard, Tasks, Focus, Analytics, Profile, Settings, Subjects)
- Settings page and theme controls
- App-wide light/dark mode foundation with accent switching
- Behavior engine foundations
- Retention engine models/routes/services
- Task UX simplification and action polish
- Focus task-to-session handoff flow and fullscreen UI refinements
- Profile photo action UX and sarcastic popup behavior

### Next Optional Upgrades:
- Mobile responsive refinement (Dashboard, Focus, Tasks layouts)
- Weekly summary email delivery
- Push notification integration for grace-day alerts
- Advanced analytics dashboard (trends, patterns)
- Task collaboration/sharing features

## 12) How It Works Page Maintenance (New)

To keep the landing explainer page aligned with the real product:

- Route: `/how-it-works`
- Entry points from landing: top nav "How it works" and hero CTA "How It Works"
- Page component: `frontend/src/modules/landing/HowItWorksPage.jsx`
- Feature content source of truth: `frontend/src/modules/landing/howItWorksContent.js`
- Visual preview metadata lives in content file (`previewLabel`, `previewValue`, `previewBars`) and is rendered as mini demo boards per feature card
- Real screenshot thumbnails now power key cards:
  - `/public/how-it-works/dashboard.png`
  - `/public/how-it-works/tasks.png`
  - `/public/how-it-works/focus.png`
  - `/public/how-it-works/analytics.png`
- Regenerate screenshots after UI updates:
  - `cd frontend && npm run capture:how-it-works`
  - script: `frontend/scripts/capture-how-it-works-screenshots.mjs`

When you add, remove, or change features:
- Update feature cards and wording in `howItWorksContent.js`
- Keep wording simple and visual-first (easy language)
- Ensure cards map to actual implemented modules/routes

## 13) AI Study Coach Module (Phase 10/11 - Expanded)

An intelligent AI-powered learning assistant integrated throughout the app.

### 13.1 Architecture

**Backend** (`backend/src/modules/ai/`)
- `services/aiClient.js`: Abstracts provider calls and currently runs with Hugging Face in active env.
  - Unified interface: `call({ prompt, temperature, maxTokens })`
  - Provider selection via env and fallback model list
- `services/promptBuilder.js`: Context-aware prompt generation for all AI modes and roadmap tools.
  - `buildPrompt({ type, input, context })`
  - Supports core prompt types + advanced tool prompt types (tasks 11-40)
- `controllers/`: Expanded controller set
  - `chatController.js`
  - `summarizeController.js`
  - `doubtController.js`
  - `taskBreakdownController.js`
  - `dailyPlanController.js`
  - `quizController.js`
  - `reminderController.js`
  - `noteAnalyzerController.js`
  - `featureToolsController.js` (advanced roadmap tools)
- `ai.routes.js`: Protected REST endpoints
  - `POST /api/ai/chat`
  - `POST /api/ai/summarize`
  - `POST /api/ai/doubt`
  - `POST /api/ai/task-breakdown`
  - `POST /api/ai/daily-plan`
  - `POST /api/ai/quiz`
  - `POST /api/ai/reminder`
  - `POST /api/ai/note-analyzer`
  - `POST /api/ai/feature/:featureId`

### 13.2 Frontend

**Study Coach Page** (`frontend/src/modules/ai/StudyCoachPage.jsx`)
- Multi-tab interface:
  - **Chat Tab**: Real-time conversation with AI coach
    - Message history preserved in component state
    - Auto-scroll to latest message
    - Typing indicator while AI responds
    - Context injected from learning store (subject, streak, progress)
  - **Summarize Tab**: Paste notes → get structured summary
    - Input textarea on left
    - Summary output on right
    - Bullet points and sections auto-formatted
  - **Note Analyzer Tab**: Strength/gap analysis with actionable fixes
  - **Doubt Solver Tab**: Ask questions with depth control
    - Question textarea
    - Quick (brief) vs Deep (comprehensive) toggle
    - Explanation formatted with examples and key points
  - **Quiz Tab**: Difficulty + count controlled quiz generation
  - **Daily Plan Tab**: Task/context aware day plan generation
  - **Power Tools Tab**: Runs all advanced roadmap feature tools (tasks 11-40)

**Components**
- `AIChatPanel.jsx`: Reusable chat UI
  - User messages (blue background)
  - AI responses (light background)
  - Loading animation (bouncing dots)
  - Send button with keyboard shortcut (Enter to send, Shift+Enter for newline)
  - Auto-formatting: bullets, numbered lists, headers
- `TaskBreakdownModal.jsx`: Modal for task planning
  - Shows AI-generated steps in clean format
  - Integrated into Tasks page via Zap button

**Services & Hooks**
- `service.js`: API client functions
  - `chatWithCoach(message, context)`
  - `summarizeNotes(notes, context)`
  - `solveDoubt(question, mode, context)`
  - `breakDownTask(task, context)`
  - `generateDailyPlan(payload)`
  - `generateQuiz(payload)`
  - `generateStudyReminder(payload)`
  - `analyzeNotes(notes, context)`
  - `runFeatureTool(featureId, payload)`
- `hooks/useAIChat.js`: Chat state management
  - Manages message history
  - Handles sending + loading states
  - Auto-scroll ref
  - Error handling with toast integration

### 13.3 Integration Points

**Navigation**
- Added to sidebar: `/study-coach` with Brain icon
- Keyboard shortcut: `C` (like F for Focus, D for Dashboard)
- Search placeholder: "Ask your study coach..."

**Task Breakdown in Tasks Page**
- Zap icon button on each pending task
- Triggered breakdown modal showing AI-generated steps
- Context includes: task title/description + related subject
- Modal auto-fetches breakdown on open

### 13.4 Configuration

**Environment Variables** (add to `.env`)
```
# Common:
AI_PROVIDER=huggingface|openai|google

# Hugging Face (active default in current setup)
HUGGINGFACE_API_KEY=hf_...
HUGGINGFACE_MODEL=HuggingFaceH4/zephyr-7b-beta

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Google Gemini (optional)
GOOGLE_AI_API_KEY=AIza...
```

Provider is auto-detected if `AI_PROVIDER` is not forced.

### 13.5 Prompt Patterns

All prompts follow a consistent structure:
- **System role**: "You are a helpful study coach..."
- **User request**: Specific task (chat message, notes to summarize, etc.)
- **Context injection**: Subject, task, user stats auto-appended
- **Response guidance**: Format hints (bullets, steps, brief vs detailed)

Temperature settings per mode (typical):
- Chat: `0.7` (balanced)
- Summarize: `0.5` (more deterministic)
- Doubt (Quick): `0.5` (focused)
- Doubt (Deep): `0.7` (more exploratory)
- Task Breakdown: `0.6` (structured but practical)

Advanced feature tools use a practical default around `0.45` for stable planning outputs.

### 13.6 Response Formatting

AI responses are automatically formatted for readability:
- Numbered lists (`1. Step`) → styled with numbers
- Bullet points (`- Item`) → styled with bullets
- Section headers (line ending with `:`) → bold, larger
- Regular text → normal paragraph flow

### 13.7 Advanced AI Toolset (Roadmap Tasks 11-40)

Implemented through `POST /api/ai/feature/:featureId` with backend validation:
- Missing required fields return `400`
- Unknown feature IDs return `404`

Tool groups now covered:
- Momentum and revision tools (streak nudges, adaptive revision, recap, exam strategy)
- Performance diagnostics (mistake insights, confidence scoring, mastery tracking)
- Practice generators (quiz-adjacent drills, flashcards, spaced repetition)
- Behavior and resilience tools (interruption alerts, burnout warnings, comeback protocol)
- Reporting and mentoring tools (weekly/monthly digest, mentor-ready brief)
- Reliability and language tools (multilingual support, AI reliability guardrails)

Runtime verification snapshot:
- Authenticated smoke tests executed for all 30 feature-tool IDs
- Result: `PASS=30 FAIL=0` on current backend instance

## 14) Current Priority Snapshot (Updated)

### Phase 10/11 Complete ✅
- AI Study Coach core integration complete
- Core tools complete: chat, summarize, doubt, task breakdown, daily plan, quiz, reminder, note analyzer
- Advanced roadmap tools complete via feature endpoint (`40/40` roadmap tasks implemented)
- Backend prompt/controller expansion complete and runtime validated
- Keyboard shortcut integration (C key)
- Task page AI breakdown modal integrated

### All Previously Completed Features ✅
- Phases 1-9: Auth, Dashboard, Tasks, Focus, Analytics, Settings, Theme, Behavior, Retention, UX Polish
- Grace-day streak protection
- Global keyboard shortcuts (F/D/N now F/D/C/N)
- Toast system with undo actions
- End-of-day summary modal

### Next Optional Upgrades:
- Streaming responses (for faster feedback on chat)
- History persistence (save chat conversations)
- AI-generated long-horizon study plans (weekly schedules with persistence)
- Conversation context awareness (remember previous messages)
- Mobile-responsive improvements for AI chat
- Voice input/output for accessibility
