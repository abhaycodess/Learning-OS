import { useState } from 'react'
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react'
import FormInput from './FormInput'

const VALIDATION_RULES = {
  firstName: {
    required: 'First name is required',
    minLength: {
      value: 2,
      message: 'First name must be at least 2 characters',
    },
  },
  lastName: {
    required: 'Last name is required',
    minLength: {
      value: 2,
      message: 'Last name must be at least 2 characters',
    },
  },
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
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      message: 'Password must contain uppercase, lowercase, and numbers',
    },
  },
  confirmPassword: {
    required: 'Confirm password is required',
  },
  agreeToTerms: {
    required: 'You must agree to the terms',
  },
}

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++

    const levels = [
      { level: 1, label: 'Weak', color: 'bg-red-500' },
      { level: 2, label: 'Fair', color: 'bg-yellow-500' },
      { level: 3, label: 'Good', color: 'bg-blue-500' },
      { level: 4, label: 'Strong', color: 'bg-green-500' },
      { level: 5, label: 'Very Strong', color: 'bg-green-600' },
    ]

    return levels[strength - 1] || levels[0]
  }

  const strength = getStrength()
  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i <= strength.level ? strength.color : 'bg-gray-300'
            }`}
          ></div>
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color: strength.color.replace('bg-', '') }}>
        Password strength: {strength.label}
      </p>
    </div>
  )
}

const PasswordRequirement = ({ met, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <Check className="w-3.5 h-3.5 text-green-500" />
    ) : (
      <X className="w-3.5 h-3.5 text-gray-300" />
    )}
    <span className={met ? 'text-green-600' : 'text-stone-500'}>{text}</span>
  </div>
)

export default function SignupForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({})

  const passwordReqs = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    match: formData.password === formData.confirmPassword && formData.password !== '',
  }

  const validateField = (name, value) => {
    const rules = VALIDATION_RULES[name]
    if (!rules) return null

    if (rules.required && !value) {
      return rules.required
    }

    if (name === 'confirmPassword' && value !== formData.password) {
      return 'Passwords do not match'
    }

    if (rules.minLength && value && value.length < rules.minLength.value) {
      return rules.minLength.message
    }

    if (rules.pattern && value && !rules.pattern.value.test(value)) {
      return rules.pattern.message
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

      // Update confirm password error if password changes
      if (name === 'password' && touched.confirmPassword) {
        const confirmError = validateField('confirmPassword', formData.confirmPassword)
        setErrors((prev) => ({
          ...prev,
          confirmPassword: confirmError,
        }))
      }
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
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }
      await onSubmit(submitData)
    }
  }

  const hasValidationErrors = Object.values(errors).some(Boolean)

  const isFormValid =
    !hasValidationErrors &&
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.agreeToTerms

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-up">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="First Name"
          name="firstName"
          type="text"
          placeholder="Alex"
          value={formData.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.firstName ? errors.firstName : null}
          icon={User}
        />
        <FormInput
          label="Last Name"
          name="lastName"
          type="text"
          placeholder="Kumar"
          value={formData.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.lastName ? errors.lastName : null}
          icon={User}
        />
      </div>

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
      <div>
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
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Password Strength Meter */}
        {formData.password && (
          <div className="mt-3 p-3 bg-stone-50 rounded-lg space-y-2">
            <PasswordStrengthMeter password={formData.password} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <PasswordRequirement met={passwordReqs.length} text="At least 8 characters" />
              <PasswordRequirement met={passwordReqs.uppercase} text="Uppercase letter" />
              <PasswordRequirement met={passwordReqs.lowercase} text="Lowercase letter" />
              <PasswordRequirement met={passwordReqs.number} text="Number" />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Input */}
      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmPassword ? errors.confirmPassword : null}
        icon={Lock}
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-stone-400 hover:text-stone-600 transition"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Password Match Indicator */}
      {formData.confirmPassword && (
        <div className="flex items-center gap-2">
          {passwordReqs.match ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Passwords match</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">Passwords don't match</span>
            </>
          )}
        </div>
      )}

      {/* Terms Checkbox */}
      <label className="flex items-start gap-2.5 text-sm cursor-pointer pt-2">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="w-4 h-4 rounded mt-0.5 cursor-pointer"
          style={{ accentColor: '#6352c8' }}
        />
        <span className="text-stone-600">
          I agree to the{' '}
          <button
            type="button"
            className="font-semibold hover:underline transition"
            style={{ color: '#6352c8' }}
            onClick={(e) => e.preventDefault()}
          >
            Terms
          </button>{' '}
          and{' '}
          <button
            type="button"
            className="font-semibold hover:underline transition"
            style={{ color: '#6352c8' }}
            onClick={(e) => e.preventDefault()}
          >
            Privacy Policy
          </button>
        </span>
      </label>

      {errors.agreeToTerms && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <X className="w-4 h-4" />
          {errors.agreeToTerms}
        </p>
      )}

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
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-stone-600 mt-4">
        Already have an account?{' '}
        <button
          type="button"
          className="font-semibold hover:underline transition"
          style={{ color: '#6352c8' }}
          onClick={(e) => {
            e.preventDefault()
            window.dispatchEvent(
              new CustomEvent('switchTab', { detail: { tab: 'login' } })
            )
          }}
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
