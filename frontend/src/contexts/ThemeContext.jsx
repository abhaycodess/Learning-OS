import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_STORAGE_KEY = 'learningos-theme-mode'
const ACCENT_STORAGE_KEY = 'learningos-theme-accent'

const ThemeContext = createContext(null)

function readStoredMode() {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredAccent() {
  if (typeof window === 'undefined') return 'violet'

  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY)
  if (stored === 'emerald' || stored === 'violet') return stored

  return 'violet'
}

function applyTheme(mode, accent) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.toggle('theme-dark', mode === 'dark')
  root.classList.toggle('theme-light', mode === 'light')
  root.classList.toggle('accent-emerald', accent === 'emerald')
  root.classList.toggle('accent-violet', accent !== 'emerald')
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => readStoredMode())
  const [accent, setAccent] = useState(() => readStoredAccent())

  useEffect(() => {
    applyTheme(mode, accent)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode)
      window.localStorage.setItem(ACCENT_STORAGE_KEY, accent)
    }
  }, [accent, mode])

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      accent,
      setMode,
      setAccent,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [accent, mode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
