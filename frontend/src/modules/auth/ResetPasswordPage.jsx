import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword, loading, error } = useAuth()

  const initialToken = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [token, setToken] = useState(initialToken)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setValidationError('')
    setSuccessMessage('')

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    try {
      const payload = await resetPassword(token.trim(), password)
      setSuccessMessage(payload.message || 'Password reset successful')
      window.setTimeout(() => navigate('/auth'), 1200)
    } catch {
      // Error surfaced from auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">Reset Password</h1>
        <p className="mt-2 text-sm text-stone-600">Enter your reset token and choose a new password.</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {validationError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{validationError}</p>}
        {successMessage && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Reset Token</label>
            <textarea
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="min-h-[84px] w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-primary focus:outline-none"
              placeholder="Paste reset token"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-primary focus:outline-none"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-primary focus:outline-none"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token.trim() || !password.trim() || !confirmPassword.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound size={14} />
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Back to <Link to="/auth" className="font-medium text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
