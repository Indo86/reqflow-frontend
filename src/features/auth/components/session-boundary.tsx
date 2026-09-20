import { Loader2 } from 'lucide-react'

// Minimal, restrained bootstrap state — no full-screen branded splash, just
// enough to avoid rendering protected/guest content before the session
// check resolves (F1 "Session bootstrap" / "avoid redirect flicker").
export function SessionBootstrapFallback() {
  return (
    <div
      style={{
        minHeight: '100svh',
        width: '100%',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="icon animate-spin" width={22} height={22} style={{ color: 'var(--rf-accent)' }} />
    </div>
  )
}

interface SessionErrorFallbackProps {
  onRetry: () => void
}

// Distinct from "you are logged out" — this renders only when the session
// check itself failed (network/backend outage), never for a normal
// unauthenticated response (see getSession()).
export function SessionErrorFallback({ onRetry }: SessionErrorFallbackProps) {
  return (
    <div
      style={{
        minHeight: '100svh',
        width: '100%',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 320, margin: 0 }}>
        We couldn't reach ReqFlow. Check your connection and try again.
      </p>
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}
