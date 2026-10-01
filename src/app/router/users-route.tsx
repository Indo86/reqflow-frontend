import { Navigate } from 'react-router-dom'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { UsersPage } from '@/features/users/pages/users-page'

// UX-only gate (mirrors ApprovalsRoute's redirect pattern) — the backend
// remains the sole authority (every /users endpoint is
// requireRole(Role.ADMIN)); this only avoids showing a page that would
// just 403 for a non-Admin who navigates here directly.
export function UsersRoute() {
  const session = useSession()
  const onLogout = useLogout()
  if (session.status !== 'authenticated') return null
  if (session.user.role !== 'Admin') return <Navigate to="/dashboard" replace />

  const { user } = session
  return (
    <UsersPage
      user={toAppShellUser(user)}
      navItems={productionNavigationByRole[user.role]}
      onLogout={onLogout}
    />
  )
}
