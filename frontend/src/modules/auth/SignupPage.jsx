import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [validationError, setValidationError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++
    return strength
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }

    setValidationError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    // Validation
    if (!formData.name.trim()) {
      setValidationError('Name is required')
      return
    }
    if (!formData.email.trim()) {
      setValidationError('Email is required')
      return
    }
    if (!formData.password.trim()) {
      setValidationError('Password is required')
      return
    }
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    try {
      await signup(formData.name, formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setValidationError(err.message || 'Signup failed. Please try again.')
    }
  }

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-300/20 to-primary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-200/20 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 animate-fade-up text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles size={16} />
              Premium Learning Platform
            </div>
            <h1 className="font-heading text-4xl font-medium text-stone-900">
              Get Started
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Create your account and begin your learning adventure
            </p>
          </div>

          {/* Form Card */}
          <div className="animate-fade-up space-y-4 rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/30 backdrop-blur-sm" style={{ animationDelay: '0.1s' }}>
            {/* Error Message */}
            {(error || validationError) && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 animate-shake">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{error || validationError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-stone-900 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition-all hover:border-stone-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-stone-900 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition-all hover:border-stone-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-stone-900 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors"
                  />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition-all hover:border-stone-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 animate-fade-up">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-stone-500">
                      Password strength: <span className="font-semibold text-stone-700">{strengthLabels[passwordStrength]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-stone-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition-all hover:border-stone-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <Check
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 animate-bounce"
                      />
                    )}
                </div>
              </div>

              {/* TC Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="tc"
                  className="mt-1 rounded border border-stone-200 text-primary focus:ring-primary/20"
                />
                <label htmlFor="tc" className="text-xs text-stone-600">
                  I agree to the <span className="font-medium text-primary hover:underline cursor-pointer">Terms & Conditions</span> and <span className="font-medium text-primary hover:underline cursor-pointer">Privacy Policy</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-purple-600 px-4 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="text-xs text-stone-400">OR</span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-stone-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-light transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 animate-fade-up text-center" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs text-stone-500 mb-3">Trusted by thousands of students</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-xs font-medium text-stone-600 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                256-bit SSL Encrypted
              </div>
              <div className="text-xs font-medium text-stone-600 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                Data Privacy Protected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
