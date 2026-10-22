import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Lock, Mail, Workflow } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { ApiError } from '@/lib/api'
import { useLoginMutation } from '../hooks/use-login-mutation'
import { loginFormSchema, type LoginFormValues } from '../schemas/login.schema'

const DEFAULT_LANDING_ROUTE = '/dashboard'

// apiClient's normalizeHttpError already reduces every 4xx to the backend's
// own safe {code,message} and every 5xx/unparsed response to a generic
// message (see api-error.ts) — so error.message here is already safe to
// show verbatim. We only decide whether the *requestId* is worth surfacing:
// for an unexpected failure (network down, 5xx, or a shape we don't
// recognize), not for an ordinary "invalid credentials"/validation 4xx.
function isUnexpectedFailure(error: ApiError): boolean {
  return error.status === 0 || error.status >= 500 || !error.code
}

interface LocationState {
  from?: Location
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values)
      const from = (location.state as LocationState | null)?.from
      navigate(from ? `${from.pathname}${from.search}` : DEFAULT_LANDING_ROUTE, { replace: true })
    } catch {
      // Surfaced below via loginMutation.error — nothing further to do here.
    }
  })

  const submitError = loginMutation.error
  const safeMessage =
    submitError instanceof ApiError
      ? submitError.message
      : submitError
        ? 'The request could not be completed. Please try again.'
        : undefined
  const requestId = submitError instanceof ApiError && isUnexpectedFailure(submitError) ? submitError.requestId : undefined

  return (
    <div className="login-split">
      <section className="login-form-side">
        <div className="login-brand">
          <div className="brand-mark">
            <Workflow className="icon" width={15} height={15} strokeWidth={2} />
          </div>
          <div className="brand-name" style={{ fontSize: 16 }}>
            ReqFlow
          </div>
        </div>

        <div className="login-form-wrap">
          <h1 className="login-heading">Welcome back</h1>
          <p className="login-lede">Sign in to manage requests and approvals for your team</p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={onSubmit} noValidate>
        {safeMessage ? (
          <div
            role="alert"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '10px 12px',
              borderRadius: 'var(--rf-radius-sm)',
              background: 'var(--red-bg)',
              color: 'var(--red-text)',
              fontSize: 12.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <AlertCircle className="icon" width={14} height={14} strokeWidth={2} />
              <span>{safeMessage}</span>
            </div>
            {requestId ? <span style={{ fontSize: 11, opacity: 0.85 }}>Request ID: {requestId}</span> : null}
          </div>
        ) : null}

        <div className="field">
          <label className="field-label" htmlFor="login-email">
            Work email
          </label>
          <div className="text-input with-icon">
            <Mail className="icon" width={15} height={15} strokeWidth={2} />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              style={{ border: 'none', outline: 'none', background: 'transparent', flexGrow: 1, font: 'inherit', color: 'var(--text-primary)' }}
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <span id="login-email-error" style={{ fontSize: 11.5, color: 'var(--red-text)' }}>
              {errors.email.message}
            </span>
          ) : null}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="login-password">
            Password
          </label>
          <div className="text-input with-icon">
            <Lock className="icon" width={15} height={15} strokeWidth={2} />
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              style={{ border: 'none', outline: 'none', background: 'transparent', flexGrow: 1, font: 'inherit', color: 'var(--text-primary)' }}
              {...register('password')}
            />
          </div>
          {errors.password ? (
            <span id="login-password-error" style={{ fontSize: 11.5, color: 'var(--red-text)' }}>
              {errors.password.message}
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <input type="checkbox" style={{ width: 14, height: 14, accentColor: 'var(--rf-accent)' }} />
            Remember me
          </label>
          <a href="#forgot-password" style={{ fontSize: 12.5, fontWeight: 600 }}>
            Forgot password?
          </a>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ height: 40, width: '100%', fontSize: 13.5, marginTop: 4 }}
          disabled={isSubmitting || loginMutation.isPending}
        >
          {isSubmitting || loginMutation.isPending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

          <p className="login-note">
            ReqFlow is your internal system for submitting, tracking, and approving company requests. Contact IT
            Support if you need access.
          </p>
        </div>

        <div className="login-footer">© 2026 Internal Systems · v2.4.1</div>
      </section>

      {/* Decorative only: nothing here is needed to sign in, so it is hidden from assistive tech. */}
      <aside className="login-visual" aria-hidden="true">
        <img src="/login-office.jpg" alt="" decoding="async" />
        <div className="login-visual-content">
          <span className="login-eyebrow">One place for every request</span>
          <h2 className="login-visual-title">Know where every request stands, and who decides next.</h2>
          <p className="login-visual-text">
            Submit once. Managers, Finance and Directors review in order, and every decision stays on record.
          </p>
          <div className="login-glass">
            <div className="login-glass-title">Laptops for new developers</div>
            <div className="login-glass-meta">Waiting for Director approval</div>
            <div className="login-steps">
              <span className="login-step done" />
              <span className="login-step done" />
              <span className="login-step active" />
            </div>
            <div className="login-steps-labels">
              <span>Manager</span>
              <span>Finance</span>
              <span>Director</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
