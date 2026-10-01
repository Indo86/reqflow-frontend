import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../hooks/use-session'
import { SessionBootstrapFallback, SessionErrorFallback } from './session-boundary'

// Layout route: never renders protected content before the session check
// resolves (no flicker), and never treats "backend unreachable" as "log the
// user out" (F1 sections 8 and 24).
export function ProtectedRoute() {
  const session = useSession()
  const location = useLocation()

  if (session.status === 'loading') return <SessionBootstrapFallback />
  if (session.status === 'error') return <SessionErrorFallback onRetry={session.refetch} />
  if (session.status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (session.user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  if (!session.user.mustChangePassword && location.pathname === '/change-password') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
