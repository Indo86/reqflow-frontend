import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/use-session'
import { SessionBootstrapFallback } from './session-boundary'

const AUTHENTICATED_LANDING_ROUTE = '/dashboard'

interface GuestOnlyRouteProps {
  children: ReactNode
}

// Menjalankan proses GuestOnlyRoute.
export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const session = useSession()

  if (session.status === 'loading') return <SessionBootstrapFallback />
  if (session.status === 'authenticated') {
    return <Navigate to={session.user.mustChangePassword ? '/change-password' : AUTHENTICATED_LANDING_ROUTE} replace />
  }

  return <>{children}</>
}
