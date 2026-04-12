import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useToast } from '../../hooks/useToast.jsx'
import LeftBrandPanel from './components/LeftBrandPanel'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, signup, loading, error } = useAuth()
  const { success, error: toastError } = useToast()
  const [activeTab, setActiveTab] = useState('login')

  const handleLoginSubmit = async (formData) => {
    try {
      await login(formData.email, formData.password)
      success('Login successful', 'Redirecting to dashboard...', { position: 'top-center' })
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (err) {
      toastError('Login failed', err?.message || 'Unable to sign in right now.')
    }
  }

  const handleSignupSubmit = async (formData) => {
    try {
      await signup(formData)

      success('Account created', 'Let\'s set up your learning profile...')
      setTimeout(() => navigate('/onboarding'), 900)
    } catch (err) {
      toastError('Signup failed', err?.message || 'Unable to create account right now.')
    }
  }

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
  }

  useEffect(() => {
    const handleSwitchTab = (event) => {
      const requestedTab = event?.detail?.tab
      if (requestedTab === 'login' || requestedTab === 'signup') {
        handleTabSwitch(requestedTab)
      }
    }

    window.addEventListener('switchTab', handleSwitchTab)
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab)
    }
  }, [])

  useEffect(() => {
    if (!error) return
    toastError('Authentication error', error)
  }, [error, toastError])

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Brand Panel - Hidden on mobile */}
      <LeftBrandPanel />

      {/* Right Auth Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="w-full max-w-sm">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 bg-white rounded-xl p-1 shadow-sm border border-stone-200">
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#6352c8]/10 to-[#6352c8]/5 text-[#6352c8] shadow-sm'
                  : 'bg-transparent text-stone-600 hover:text-stone-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-[#6352c8]/10 to-[#6352c8]/5 text-[#6352c8] shadow-sm'
                  : 'bg-transparent text-stone-600 hover:text-stone-700'
              }`}
            >
              Create Account
            </button>
          </div>


          {/* Form Content */}
          {activeTab === 'login' ? (
            <LoginForm onSubmit={handleLoginSubmit} loading={loading} />
          ) : (
            <SignupForm onSubmit={handleSignupSubmit} loading={loading} />
          )}
        </div>
      </div>
    </div>
  )
}
