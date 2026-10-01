import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/use-session'
import { SessionBootstrapFallback } from './session-boundary'

const AUTHENTICATED_LANDING_ROUTE = '/dashboard'

interface GuestOnlyRouteProps {
  children: ReactNode
}

// Wraps /login: an already-authenticated visitor is bounced straight to
// their landing route instead of seeing the sign-in form again (F1 "Guest-
// only login route"). On a session-check failure we still render the form —
// the user may want to try signing in anyway, and a failed login attempt
// will itself surface a clear "unable to connect" error.
export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const session = useSession()

  if (session.status === 'loading') return <SessionBootstrapFallback />
  if (session.status === 'authenticated') {
    return <Navigate to={session.user.mustChangePassword ? '/change-password' : AUTHENTICATED_LANDING_ROUTE} replace />
  }

  return <>{children}</>
}
