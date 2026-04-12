import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function ForgotPasswordPage() {
  const { requestPasswordReset, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSuccessMessage('')

    try {
      const payload = await requestPasswordReset(email.trim())
      setSuccessMessage(payload.message || 'Reset link generated.')
    } catch {
      // Error surfaced from auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-stone-600">Enter your account email and we will generate a reset link.</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {successMessage && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-200 px-9 py-2.5 text-sm text-stone-900 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={14} />
            {loading ? 'Generating...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Back to <Link to="/auth" className="font-medium text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
