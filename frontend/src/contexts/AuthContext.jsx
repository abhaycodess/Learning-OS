import { createContext, useState, useCallback, useEffect } from 'react'
import {
  createDefaultUserProfile,
  normalizeUserProfile,
  validateUserProfile,
} from '../shared/userProfile.js'
import { apiClient } from '../services/apiClient.js'

export const AuthContext = createContext()

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const ONBOARDING_STATUS_KEY = 'onboardingStatusByUser'
const USER_PROFILE_KEY = 'onboardingProfileByUser'

function readMap(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeMap(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [requiresOnboarding, setRequiresOnboarding] = useState(false)

  const syncOnboardingRequirement = useCallback((nextUser) => {
    if (!nextUser?.id) {
      setRequiresOnboarding(false)
      return
    }

    if (typeof nextUser.onboardingCompleted === 'boolean') {
      setRequiresOnboarding(nextUser.onboardingCompleted === false)
      return
    }

    const statusMap = readMap(ONBOARDING_STATUS_KEY)
    setRequiresOnboarding(statusMap[nextUser.id] === false)
  }, [])

  const hydrateUserProfile = useCallback((baseUser) => {
    if (!baseUser?.id) {
      return { enrichedUser: baseUser, profile: null }
    }

    const profiles = readMap(USER_PROFILE_KEY)
    const cachedProfile = profiles[baseUser.id]
    const serverProfile = baseUser.profile
    const defaults = createDefaultUserProfile(baseUser)

    const normalized = normalizeUserProfile(
      {
        ...cachedProfile,
        ...serverProfile,
        id: baseUser.id,
        name: baseUser.name,
        profilePhoto: serverProfile?.profilePhoto || cachedProfile?.profilePhoto || baseUser.profilePhoto || '',
      },
      defaults,
    )

    profiles[baseUser.id] = normalized
    writeMap(USER_PROFILE_KEY, profiles)

    const preferredName = normalized.nickname || normalized.name || baseUser.name
    const enrichedUser = {
      ...baseUser,
      name: preferredName,
      profilePhoto: normalized.profilePhoto || baseUser.profilePhoto || '',
      profile: normalized,
    }

    return { enrichedUser, profile: normalized }
  }, [])

  const clearStoredSession = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    setUserProfile(null)
    setRequiresOnboarding(false)
  }

  const applySessionUser = useCallback(
    (nextUser) => {
      const { enrichedUser, profile } = hydrateUserProfile(nextUser)
      localStorage.setItem('user', JSON.stringify(enrichedUser))
      setUser(enrichedUser)
      setUserProfile(profile)
      syncOnboardingRequirement(nextUser)
      return { enrichedUser, profile }
    },
    [hydrateUserProfile, syncOnboardingRequirement],
  )

  const persistUserProfile = useCallback(
    async (partialProfile, options = {}) => {
      const { markOnboardingComplete = false } = options

      if (!user?.id) {
        return { error: 'No active user session found.' }
      }

      const defaults = createDefaultUserProfile(user)
      const normalized = normalizeUserProfile(
        {
          ...(userProfile || defaults),
          ...partialProfile,
          id: user.id,
          name: partialProfile?.name || userProfile?.name || user.name,
          profilePhoto:
            partialProfile?.profilePhoto ?? userProfile?.profilePhoto ?? user.profilePhoto ?? '',
        },
        defaults,
      )

      const validationMessage = validateUserProfile(normalized)
      if (validationMessage) {
        return { error: validationMessage }
      }

      try {
        const payload = {
          ...normalized,
          markOnboardingComplete,
        }

        const response = await apiClient('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        const backendUser = response.user || {
          ...user,
          onboardingCompleted: markOnboardingComplete ? true : user.onboardingCompleted,
          profile: response.profile || normalized,
        }

        const { profile } = applySessionUser(backendUser)

        const statusMap = readMap(ONBOARDING_STATUS_KEY)
        statusMap[user.id] = markOnboardingComplete ? true : backendUser.onboardingCompleted !== false
        writeMap(ONBOARDING_STATUS_KEY, statusMap)

        return { profile }
      } catch (persistError) {
        return {
          error:
            persistError?.message ||
            'Unable to save profile to server. Please try again.',
        }
      }
    },
    [applySessionUser, user, userProfile],
  )

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')

        if (!token) {
          clearStoredSession()
          return
        }

        const data = await apiClient('/auth/user')
        applySessionUser(data.user)
      } catch {
        clearStoredSession()
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [applySessionUser])

  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredSession()
      setError('Session expired. Please sign in again.')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(
    async (email, password) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Login failed')
        }

        const data = await response.json()
        const { token, user: nextUser } = data

        localStorage.setItem('authToken', token)
        applySessionUser(nextUser)

        const statusMap = readMap(ONBOARDING_STATUS_KEY)
        statusMap[nextUser.id] = nextUser.onboardingCompleted !== false
        writeMap(ONBOARDING_STATUS_KEY, statusMap)

        return data
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [applySessionUser],
  )

  const signup = useCallback(
    async (formData) => {
      setLoading(true)
      setError(null)

      try {
        const { firstName, lastName, name, email, password } = formData
        const resolvedName =
          name || `${firstName || ''} ${lastName || ''}`.trim()

        const response = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            name: resolvedName,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Signup failed')
        }

        const data = await response.json()

        const { token, user: nextUser } = data

        if (token && nextUser) {
          localStorage.setItem('authToken', token)
          applySessionUser(nextUser)

          const statusMap = readMap(ONBOARDING_STATUS_KEY)
          statusMap[nextUser.id] = false
          writeMap(ONBOARDING_STATUS_KEY, statusMap)
        }

        return data
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [applySessionUser],
  )

  const logout = useCallback(() => {
    clearStoredSession()
    setError(null)
  }, [])

  const completeOnboarding = useCallback(
    async (profile) => {
      const result = await persistUserProfile(
        {
          ...profile,
          createdAt: userProfile?.createdAt,
        },
        { markOnboardingComplete: true },
      )

      if (result.error) {
        setError(result.error)
      }

      return result
    },
    [persistUserProfile, userProfile?.createdAt],
  )

  const updateUserProfile = useCallback(
    async (profileUpdates) => {
      const result = await persistUserProfile(profileUpdates)
      if (result.error) {
        setError(result.error)
      }
      return result
    },
    [persistUserProfile],
  )

  const resetUserProfile = useCallback(async () => {
    if (!user?.id) {
      return { error: 'No active user session found.' }
    }

    const defaults = createDefaultUserProfile(user)
    const result = await persistUserProfile(defaults)
    if (result.error) {
      setError(result.error)
      return result
    }

    return result
  }, [persistUserProfile, user])

  const getProfile = useCallback(() => userProfile, [userProfile])

  const value = {
    user,
    userProfile,
    loading,
    error,
    isInitialized,
    login,
    signup,
    logout,
    getProfile,
    completeOnboarding,
    updateUserProfile,
    updateProfile: updateUserProfile,
    resetUserProfile,
    requiresOnboarding,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
