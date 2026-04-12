import {
  BarChart3,
  Bell,
  Brain,
  CalendarCheck2,
  CheckCircle2,
  Flame,
  Focus,
  Keyboard,
  Layers3,
  Sparkles,
  Target,
  Timer,
} from 'lucide-react'

export const howItWorksHighlights = [
  {
    icon: Sparkles,
    title: 'Tiny Steps, Big Wins',
    description: 'We break big study goals into tiny easy actions so your brain says: Yes, I can do this.',
  },
  {
    icon: CheckCircle2,
    title: 'See Progress Fast',
    description: 'You can see what you finished today, like putting stars on your homework chart.',
  },
  {
    icon: Bell,
    title: 'Friendly Nudge System',
    description: 'If you miss a day, Learning OS gives gentle reminders to help you come back.',
  },
  {
    icon: Brain,
    title: 'AI Study Coach',
    description: 'Ask doubts, summarize notes, make quizzes, and run smart study tools in one place.',
  },
]

export const howItWorksSteps = [
  {
    title: 'Pick your goal',
    subtitle: 'What do you want to learn?',
    description: 'Tell the app your goal once. It helps build your study plan automatically.',
    emoji: '1',
  },
  {
    title: 'Do one task at a time',
    subtitle: 'No confusion, no chaos.',
    description: 'Open your task list and finish just one thing. One thing is enough to start.',
    emoji: '2',
  },
  {
    title: 'Start focus timer',
    subtitle: 'Quiet brain mode.',
    description: 'Press start and do deep work for the time you choose. You can go fullscreen too.',
    emoji: '3',
  },
  {
    title: 'Check your score board',
    subtitle: 'Watch your streak grow.',
    description: 'Dashboard and analytics show your progress like a game level bar.',
    emoji: '4',
  },
]

export const howItWorksFeatureGroups = [
  {
    icon: Layers3,
    group: 'Dashboard',
    color: 'from-sky-500 to-cyan-500',
    screenshot: '/how-it-works/dashboard.png',
    previewLabel: 'Today Snapshot',
    previewValue: '4/6 Tasks Done',
    previewBars: [72, 54, 88],
    items: [
      'See today tasks and completion quickly',
      'See your active streak and focus stats',
      'See summary cards in one glance',
    ],
  },
  {
    icon: CalendarCheck2,
    group: 'Tasks',
    color: 'from-emerald-500 to-teal-500',
    screenshot: '/how-it-works/tasks.png',
    previewLabel: 'Task Queue',
    previewValue: '2 Due Today',
    previewBars: [90, 60, 35],
    items: [
      'Add and organize tasks by subject',
      'Mark done, pending, overdue with clear colors',
      'Delete with undo safety toast',
    ],
  },
  {
    icon: Target,
    group: 'Subjects',
    color: 'from-orange-500 to-amber-500',
    previewLabel: 'Subject Map',
    previewValue: '3 Subjects Active',
    previewBars: [45, 70, 58],
    items: [
      'Manage subject, topic, and subtopic trees',
      'Keep learning map clean and structured',
      'Use profile based subject setup support',
    ],
  },
  {
    icon: Timer,
    group: 'Focus',
    color: 'from-rose-500 to-pink-500',
    screenshot: '/how-it-works/focus.png',
    previewLabel: 'Focus Session',
    previewValue: '25:00 Running',
    previewBars: [100, 82, 46],
    items: [
      'Start custom session from 5 to 180 minutes',
      'Attach task context and enter fullscreen mode',
      'Finish sessions with reflection support',
    ],
  },
  {
    icon: BarChart3,
    group: 'Analytics',
    color: 'from-indigo-500 to-blue-500',
    screenshot: '/how-it-works/analytics.png',
    previewLabel: 'Trend Graph',
    previewValue: '+12% This Week',
    previewBars: [40, 62, 82],
    items: [
      'See consistency and trend signals',
      'Review learning momentum over time',
      'Track what improves and what drops',
    ],
  },
  {
    icon: Brain,
    group: 'AI Study Coach',
    color: 'from-violet-500 to-indigo-600',
    previewLabel: 'Power Tools',
    previewValue: '40 Features Live',
    previewBars: [85, 92, 88],
    items: [
      'Chat, summarize, note analyzer, and doubt solver',
      'Daily plan, quiz generation, and reminder coaching',
      'Advanced roadmap tools for revision, risk checks, and progress reports',
    ],
  },
  {
    icon: Flame,
    group: 'Consistency Engine',
    color: 'from-fuchsia-500 to-violet-500',
    previewLabel: 'Streak Keeper',
    previewValue: '7 Day Streak',
    previewBars: [75, 75, 75],
    items: [
      'Daily contract and streak tracking',
      'Grace day protection once per week',
      'End of day summary when needed',
    ],
  },
  {
    icon: Bell,
    group: 'Smart Notifications',
    color: 'from-red-500 to-orange-500',
    previewLabel: 'Nudge Center',
    previewValue: 'Undo Available',
    previewBars: [68, 100, 30],
    items: [
      'Toast notifications for success and warnings',
      'Undo actions in important flows',
      'Message queue support in behavior module',
    ],
  },
  {
    icon: Keyboard,
    group: 'Fast Controls',
    color: 'from-slate-600 to-slate-800',
    previewLabel: 'Shortcut Keys',
    previewValue: 'F · D · C · N',
    previewBars: [100, 100, 100],
    items: [
      'Press F to go to Focus',
      'Press D to go to Dashboard',
      'Press C to open Study Coach',
      'Press N to create a new task quickly',
    ],
  },
  {
    icon: Focus,
    group: 'Profile and Settings',
    color: 'from-lime-500 to-green-600',
    previewLabel: 'My Preferences',
    previewValue: 'Theme + Profile',
    previewBars: [52, 81, 66],
    items: [
      'Theme controls with light and dark options',
      'Avatar update with action popover',
      'Preference and sound cue settings',
    ],
  },
]

export const howItWorksUpdateHint =
  'When you add a new feature, update this file so the How It Works page always matches the real app.'
