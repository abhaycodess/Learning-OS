import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function PrivateRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth()

  // Show loading state while checking auth
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-primary" />
          </div>
          <p className="text-sm text-stone-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
