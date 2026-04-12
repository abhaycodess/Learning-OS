import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, MailCheck, RefreshCcw } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { verifyEmail, resendVerification, loading, error } = useAuth()

  const initialToken = useMemo(() => searchParams.get('token') || '', [searchParams])
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams])

  const [token, setToken] = useState(initialToken)
  const [email, setEmail] = useState(initialEmail)
  const [successMessage, setSuccessMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  async function handleVerify(event) {
    event.preventDefault()
    setSuccessMessage('')
    setInfoMessage('')

    try {
      const payload = await verifyEmail(token.trim())
      setSuccessMessage(payload.message || 'Email verified successfully. You can now log in.')
      window.setTimeout(() => navigate('/auth'), 1200)
    } catch {
      // Error is handled by context and surfaced in `error`.
    }
  }

  async function handleResend() {
    setSuccessMessage('')
    setInfoMessage('')

    try {
      const payload = await resendVerification(email.trim())
      setInfoMessage(payload.message || 'Verification email was resent.')
    } catch {
      // Error is handled by context and surfaced in `error`.
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Verify Your Email</h1>
          <p className="mt-2 text-sm text-stone-600">
            Paste your verification token below. Once verified, you can sign in and continue onboarding.
          </p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {infoMessage && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{infoMessage}</p>}
        {successMessage && (
          <p className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            {successMessage}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleVerify}>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Verification Token</label>
            <textarea
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="min-h-[96px] w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-primary focus:outline-none"
              placeholder="Paste token from verification email"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="my-5 h-px bg-stone-200" />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-stone-700">Need a new verification link?</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-primary focus:outline-none"
            placeholder="you@example.com"
          />
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || !email.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw size={14} />
            Resend Verification
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-stone-600">
          Already verified?{' '}
          <Link to="/auth" className="font-medium text-primary hover:underline">
            Go to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
