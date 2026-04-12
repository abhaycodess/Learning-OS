import { useState } from 'react'
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import FormInput from './FormInput'

const VALIDATION_RULES = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters',
    },
  },
}

export default function LoginForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})

  const validateField = (name, value) => {
    const rules = VALIDATION_RULES[name]
    if (!rules) return null

    if (rules.required && !value.trim()) {
      return rules.required
    }

    if (rules.pattern && value && !rules.pattern.value.test(value)) {
      return rules.pattern.message
    }

    if (rules.minLength && value && value.length < rules.minLength.value) {
      return rules.minLength.message
    }

    return null
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData((prev) => ({ ...prev, [name]: newValue }))

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {}
    Object.keys(VALIDATION_RULES).forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData)
    }
  }

  const hasValidationErrors = Object.values(errors).some(Boolean)
  const isFormValid = !hasValidationErrors && formData.email && formData.password

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-up">
      {/* Email Input */}
      <FormInput
        label="Email Address"
        name="email"
        type="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email ? errors.email : null}
        icon={Mail}
      />

      {/* Password Input */}
      <FormInput
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password ? errors.password : null}
        icon={Lock}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-stone-400 hover:text-stone-600 transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Remember Me */}
      <div className="flex items-center justify-start pt-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-stone-700 transition">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 rounded cursor-pointer"
            style={{ accentColor: '#6352c8' }}
          />
          <span className="text-stone-600">Remember me</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full py-3 rounded-lg font-semibold text-white transition hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2 group"
        style={{ backgroundColor: isFormValid ? '#6352c8' : '#d1d5db' }}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-stone-600 mt-4">
        Don't have an account?{' '}
        <button
          type="button"
          className="font-semibold hover:underline transition"
          style={{ color: '#6352c8' }}
          onClick={(e) => {
            e.preventDefault()
            // This will be handled by parent component
            window.dispatchEvent(
              new CustomEvent('switchTab', { detail: { tab: 'signup' } })
            )
          }}
        >
          Create one
        </button>
      </p>
    </form>
  )
}
