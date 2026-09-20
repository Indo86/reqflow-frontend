import { Lock, Mail, Workflow } from 'lucide-react'

// Static F0.5 design translation — no authentication request is made here.
export function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100svh',
        width: '100%',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: 24,
      }}
    >
      <div style={{ position: 'absolute', top: 32, left: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="brand-mark">
          <Workflow className="icon" width={15} height={15} strokeWidth={2} />
        </div>
        <div className="brand-name" style={{ fontSize: 16 }}>
          ReqFlow
        </div>
      </div>

      <div className="card" style={{ width: 400, maxWidth: '100%', padding: '36px 36px 30px 36px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <div className="brand-mark" style={{ width: 44, height: 44, borderRadius: 11 }}>
            <Workflow className="icon" width={22} height={22} strokeWidth={2} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Welcome back
            </h1>
            <p style={{ margin: '6px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Sign in to manage requests and approvals for your team
            </p>
          </div>
        </div>

        <form
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="field">
            <label className="field-label" htmlFor="login-email">
              Work email
            </label>
            <div className="text-input with-icon">
              <Mail className="icon" width={15} height={15} strokeWidth={2} />
              <input
                id="login-email"
                type="email"
                defaultValue="deni.zaky@company.com"
                style={{ border: 'none', outline: 'none', background: 'transparent', flexGrow: 1, font: 'inherit', color: 'var(--text-primary)' }}
              />
            </div>
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
                defaultValue="reqflow-demo"
                style={{ border: 'none', outline: 'none', background: 'transparent', flexGrow: 1, font: 'inherit', color: 'var(--text-primary)' }}
              />
            </div>
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
          <button type="submit" className="btn btn-primary" style={{ height: 40, width: '100%', fontSize: 13.5, marginTop: 4 }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--rf-border)', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            ReqFlow is your internal system for submitting, tracking, and approving company requests. Contact IT
            Support if you need access.
          </p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 28, fontSize: 11.5, color: 'var(--text-tertiary)' }}>
        © 2026 Internal Systems · v2.4.1
      </div>
    </div>
  )
}
