import { createElement, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpenText,
  CheckSquare,
  House,
  LayoutDashboard,
  Search,
  Timer,
  UserRound,
  PanelLeft,
  PanelLeftOpen,
  Settings,
  Brain,
} from 'lucide-react'
import { cn } from '../utils/cn.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { useLearningStore } from '../hooks/useLearningStore.jsx'
import { useToast } from '../hooks/useToast.jsx'
import ProfileGreetingMenu from '../components/ProfileGreetingMenu.jsx'
import { BrandMark, BrandWordmark } from '../components/BrandMark.jsx'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/subjects', label: 'Subjects', icon: BookOpenText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/study-coach', label: 'Study Coach', icon: Brain },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

function SidebarLink({ to, label, icon, expanded }) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      title={!expanded ? label : undefined}
      className={({ isActive }) => cn('sidebar-nav-item', expanded ? 'is-expanded' : 'is-collapsed', isActive ? 'active' : 'inactive')}
    >
      <span className="sidebar-nav-icon" aria-hidden="true">
        {createElement(icon, { size: 18 })}
      </span>
      <span className={cn('sidebar-nav-label', expanded && 'is-visible')}>{label}</span>
    </NavLink>
  )
}

function MobileSidebarLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition',
          isActive ? 'border-primary/30 bg-primary/12 text-primary' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
        )
      }
    >
      {createElement(icon, { size: 15 })}
      <span>{label}</span>
    </NavLink>
  )
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { state } = useLearningStore()
  const { info } = useToast()
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isTopbarCondensed, setIsTopbarCondensed] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isFullscreenFocus, setIsFullscreenFocus] = useState(false)
  const closeTimeoutRef = useRef(null)
  const isStudyCoachRoute = location.pathname === '/study-coach'

  const isSidebarExpanded = isSidebarPinned || isSidebarVisible
  const shouldHideSidebar = location.pathname === '/focus' && isFullscreenFocus

  const openSidebar = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsSidebarVisible(true)
  }

  const scheduleCloseSidebar = () => {
    if (isSidebarPinned) return

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsSidebarVisible(false)
    }, 90)
  }

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  const isTypingContext = (target) => {
    if (!target) return false
    const element = target
    const tagName = (element.tagName || '').toLowerCase()
    return element.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
  }

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSidebarPinned) {
        setIsSidebarVisible(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSidebarPinned])

  useEffect(() => {
    const handleGlobalShortcuts = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingContext(event.target)) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 'f') {
        event.preventDefault()
        navigate('/focus')
      }

      if (key === 'd') {
        event.preventDefault()
        navigate('/dashboard')
      }

      if (key === 'c') {
        event.preventDefault()
        navigate('/study-coach')
      }

      if (key === 'n') {
        event.preventDefault()
        if (state.subjects.length === 0) {
          info('Create a subject first', 'Add one subject before creating tasks from shortcuts.')
          navigate('/subjects')
          return
        }

        navigate('/tasks', {
          state: {
            openCreateTaskModal: true,
          },
        })
      }
    }

    document.addEventListener('keydown', handleGlobalShortcuts)
    return () => document.removeEventListener('keydown', handleGlobalShortcuts)
  }, [navigate, state.subjects.length, info])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreenFocus(Boolean(document.fullscreenElement))
    }

    handleFullscreenChange()
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    },
    [],
  )

  const searchPlaceholderMap = {
    '/dashboard': 'What are you working on?',
    '/tasks': 'Search tasks, due dates, status...',
    '/subjects': 'Search subjects and concepts...',
    '/analytics': 'Search trends and sessions...',
    '/focus': 'Find your next focus session...',
    '/study-coach': 'Ask your study coach...',
    '/settings': 'Search settings and preferences...',
  }

  const searchPlaceholder = searchPlaceholderMap[location.pathname] || 'Search tasks, subjects, sessions...'

  useEffect(() => {
    if (isSidebarPinned && !isSidebarVisible) {
      setIsSidebarVisible(true)
    }
  }, [isSidebarPinned, isSidebarVisible])

  const handleContentScroll = (event) => {
    const nextCondensed = event.currentTarget.scrollTop > 12
    setIsTopbarCondensed(nextCondensed)
  }

  return (
    <div className={cn('app-layout', isSidebarExpanded && 'sidebar-expanded')}>
      {!shouldHideSidebar ? (
        <>
          <button
            type="button"
            aria-label="Open sidebar"
            className="sidebar-trigger hidden lg:block"
            onMouseEnter={openSidebar}
            onFocus={openSidebar}
          />

          <aside
            className={cn('floating-sidebar hidden lg:flex', isSidebarExpanded && 'is-visible is-expanded', isSidebarPinned && 'is-pinned')}
            onMouseEnter={openSidebar}
            onMouseLeave={scheduleCloseSidebar}
            onFocusCapture={openSidebar}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                scheduleCloseSidebar()
              }
            }}
          >
            <div className="sidebar-logo-row">
              <button
                type="button"
                onClick={() => navigate('/')}
                aria-label="Go to Home"
                title="Home"
                className="flex items-center gap-3 px-1 text-left"
              >
                <BrandMark size={40} rounded="2xl" className="animate-float-soft" />
                <div className="sidebar-logo-copy">
                  <BrandWordmark
                    titleClassName="text-xl text-neutral-900"
                    subtitleClassName="text-[11px] tracking-[0.18em] text-neutral-500"
                    subtitle="Execution system"
                  />
                </div>
              </button>

              <button
                type="button"
                aria-label={isSidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                title={isSidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                className="sidebar-pin-toggle"
                onClick={() => setIsSidebarPinned((prev) => !prev)}
              >
                {isSidebarPinned ? <PanelLeftOpen size={16} /> : <PanelLeft size={16} />}
              </button>
            </div>

            <div className="mt-8 space-y-1">
              <p className={cn('sidebar-section-label px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400', isSidebarExpanded && 'is-visible')}>
                Overview
              </p>
              <nav className="sidebar-nav-list space-y-1">
                {links.map((link) => (
                  <SidebarLink key={link.to} expanded={isSidebarExpanded} {...link} />
                ))}
              </nav>
            </div>

            <div className="sidebar-settings-row mt-auto">
              <NavLink
                to="/settings"
                className={({ isActive }) => cn('sidebar-nav-item', isSidebarExpanded ? 'is-expanded' : 'is-collapsed', isActive ? 'active' : 'inactive')}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">
                  <Settings size={18} />
                </span>
                <span className={cn('sidebar-nav-label', isSidebarExpanded && 'is-visible')}>Settings</span>
              </NavLink>
            </div>
          </aside>
        </>
      ) : null}

      <main className="main-content-shell">
        <header className={cn('topbar-shell premium-topbar', isTopbarCondensed && 'is-condensed')}>
          <div className={cn('command-bar-shell', searchFocused && 'is-focused')}>
            <Search size={16} className="text-neutral-400" />
            <input
              className="command-bar-input"
              placeholder={searchPlaceholder}
              aria-label="Search command bar"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <span className="command-shortcut-hint" aria-hidden="true">Ctrl K</span>
          </div>

          <div className="action-cluster" role="group" aria-label="Quick actions">
            <button type="button" aria-label="Quick Tasks" title="Quick Tasks" className="topbar-action-btn" onClick={() => navigate('/tasks')}>
              <CheckSquare size={16} />
              <span className="topbar-tooltip" role="tooltip">Quick Tasks</span>
            </button>
            <button type="button" aria-label="Start Focus" title="Start Focus" className="topbar-action-btn" onClick={() => navigate('/focus')}>
              <Timer size={16} />
              <span className="topbar-tooltip" role="tooltip">Start Focus</span>
            </button>
          </div>

          <span className="topbar-divider" aria-hidden="true" />

          <ProfileGreetingMenu user={user} onSignOut={handleLogout} />
        </header>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {links.map((link) => (
            <MobileSidebarLink key={link.to} {...link} />
          ))}
        </div>

        <section className={cn('page-content-shell', isStudyCoachRoute && 'is-study-coach-route')} onScroll={handleContentScroll}>
          <div className={cn('page-transition', isStudyCoachRoute && 'is-full-bleed')}>
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  )
}