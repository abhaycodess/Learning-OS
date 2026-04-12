import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { LogOut, Settings, UserRound } from 'lucide-react'
import { cn } from '../utils/cn.js'

const GREETING_DISPLAY_MS = 2600

function getFirstName(user) {
  const source = user?.firstName || user?.name || 'there'
  return source.trim().split(/\s+/)[0] || 'there'
}

export default function ProfileGreetingMenu({ user, onSignOut }) {
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)
  const avatarButtonRef = useRef(null)
  const dropdownRef = useRef(null)
  const greetingKey = useMemo(() => {
    if (typeof window === 'undefined') return ''

    const userKey = user?.id || user?._id || user?.email || user?.name || ''
    if (!userKey) return ''

    const authToken = window.localStorage.getItem('authToken') || ''
    const tokenFingerprint = authToken ? authToken.slice(-18) : 'no-token'

    return `dashboardGreetingSeen:${userKey}:${tokenFingerprint}`
  }, [user?.id, user?._id, user?.email, user?.name])
  const isDashboard = location.pathname === '/dashboard'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [showGreeting, setShowGreeting] = useState(() => {
    if (!isDashboard || !greetingKey || typeof window === 'undefined') return false
    return window.sessionStorage.getItem(greetingKey) !== 'true'
  })

  const firstName = getFirstName(user)
  const avatarSrc = user?.profilePhoto || ''

  const updateMenuPosition = () => {
    if (!avatarButtonRef.current || typeof window === 'undefined') return

    const rect = avatarButtonRef.current.getBoundingClientRect()
    const viewportRight = Math.max(34, window.innerWidth - rect.right + 12)

    setMenuPosition({
      top: rect.bottom + 12,
      right: viewportRight,
    })
  }

  useEffect(() => {
    if (!isDashboard || !greetingKey || typeof window === 'undefined') {
      setShowGreeting(false)
      setIsMenuOpen(false)
      return undefined
    }

    const hasGreeted = window.sessionStorage.getItem(greetingKey) === 'true'

    if (hasGreeted) {
      setShowGreeting(false)
      return undefined
    }

    setShowGreeting(true)
    const timer = window.setTimeout(() => {
      setShowGreeting(false)
      window.sessionStorage.setItem(greetingKey, 'true')
    }, GREETING_DISPLAY_MS)

    return () => window.clearTimeout(timer)
  }, [greetingKey, isDashboard])

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedInsideContainer = menuRef.current?.contains(event.target)
      const clickedInsideDropdown = dropdownRef.current?.contains(event.target)

      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setIsMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!isMenuOpen) return undefined

    updateMenuPosition()

    const handleReposition = () => updateMenuPosition()

    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [isMenuOpen])

  return (
    <div ref={menuRef} className="profile-container relative mr-5 flex min-w-[176px] items-center justify-end lg:mr-6">
      <div className={cn('profile-morph-chip', showGreeting && 'is-expanded')}>
        <button
          ref={avatarButtonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label="Open profile menu"
          onClick={() => {
            updateMenuPosition()
            setIsMenuOpen((prev) => !prev)
          }}
          disabled={showGreeting}
          className={cn('profile-morph-button', showGreeting && 'is-expanded')}
        >
          <span className="profile-avatar-ring">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="profile-avatar-fallback">{firstName.charAt(0).toUpperCase()}</span>
            )}
          </span>

          <span
            className={cn('profile-morph-text', showGreeting && 'is-visible')}
            aria-live="polite"
            aria-atomic="true"
          >
            Hi, {firstName} <span className={cn('wave', showGreeting && 'is-active')}>👋</span>
          </span>
        </button>
      </div>

      {isMenuOpen && typeof document !== 'undefined'
        ? createPortal(
          <div
            ref={dropdownRef}
            className="profile-dropdown"
            role="menu"
            aria-label="Profile menu"
            style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
          >
            <button
              type="button"
              role="menuitem"
              className="profile-dropdown-item"
              onClick={() => {
                setIsMenuOpen(false)
                navigate('/profile')
              }}
            >
              <UserRound size={16} />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              className="profile-dropdown-item"
              onClick={() => {
                setIsMenuOpen(false)
                navigate('/settings')
              }}
            >
              <Settings size={16} />
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              className="profile-dropdown-item danger"
              onClick={() => {
                setIsMenuOpen(false)
                onSignOut()
              }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>,
          document.body,
        )
        : null}
    </div>
  )
}