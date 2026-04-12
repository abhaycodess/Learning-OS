import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './components/PrivateRoute.jsx'
import { useAuth } from './hooks/useAuth.jsx'

const MainLayout = lazy(() => import('./layouts/MainLayout.jsx'))
const DashboardPage = lazy(() => import('./modules/dashboard/DashboardPage.jsx'))
const TasksPage = lazy(() => import('./modules/tasks/TasksPage.jsx'))
const SubjectsPage = lazy(() => import('./modules/subjects/SubjectsPage.jsx'))
const AnalyticsPage = lazy(() => import('./modules/analytics/AnalyticsPage.jsx'))
const FocusPage = lazy(() => import('./modules/focus/FocusPage.jsx'))
const StudyCoachPage = lazy(() => import('./modules/ai/StudyCoachPage.jsx'))
const AuthPage = lazy(() => import('./modules/auth/AuthPage.jsx'))
const OnboardingPage = lazy(() => import('./modules/onboarding/OnboardingPage.jsx'))
const ProfilePage = lazy(() => import('./modules/profile/ProfilePage.jsx'))
const LandingPage = lazy(() => import('./modules/landing/LandingPage.jsx'))
const HowItWorksPage = lazy(() => import('./modules/landing/HowItWorksPage.jsx'))
const SettingsPage = lazy(() => import('./modules/settings/SettingsPage.jsx'))

function LoadingScreen() {
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

function App() {
  const { isAuthenticated, isInitialized, requiresOnboarding } = useAuth()

  if (!isInitialized) {
    return <LoadingScreen />
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/auth" element={isAuthenticated ? <Navigate to={requiresOnboarding ? '/onboarding' : '/dashboard'} replace /> : <AuthPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={requiresOnboarding ? '/onboarding' : '/dashboard'} replace /> : <Navigate to="/auth" replace />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to={requiresOnboarding ? '/onboarding' : '/dashboard'} replace /> : <Navigate to="/auth" replace />} />

        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <OnboardingPage />
            </PrivateRoute>
          }
        />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<PrivateRoute>{requiresOnboarding ? <Navigate to="/onboarding" replace /> : <DashboardPage />}</PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute>{requiresOnboarding ? <Navigate to="/onboarding" replace /> : <TasksPage />}</PrivateRoute>} />
          <Route path="/subjects" element={<PrivateRoute>{requiresOnboarding ? <Navigate to="/onboarding" replace /> : <SubjectsPage />}</PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute>{requiresOnboarding ? <Navigate to="/onboarding" replace /> : <AnalyticsPage />}</PrivateRoute>} />
          <Route path="/study-coach" element={<PrivateRoute>{requiresOnboarding ? <Navigate to="/onboarding" replace /> : <StudyCoachPage />}</PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/focus" element={<PrivateRoute>{requiresOnboarding ? <Navigate to="/onboarding" replace /> : <FocusPage />}</PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? (requiresOnboarding ? '/onboarding' : '/dashboard') : '/'} replace />} />
      </Routes>
    </Suspense>
  )
}

export default App