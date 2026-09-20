import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { OwnerDashboardPage } from '@/features/dashboard/owner-dashboard-page'
import { ManagerDashboardPage } from '@/features/dashboard/manager-dashboard-page'
import { DirectorDashboardPage } from '@/features/dashboard/director-dashboard-page'
import { AdminDashboardPage } from '@/features/dashboard/admin-dashboard-page'

// Only ever rendered under ProtectedRoute, so session is always
// 'authenticated' here in practice; the fallback below is just type-safety
// belt-and-braces, never expected to actually render.
export function DashboardRoute() {
  const session = useSession()
  const onLogout = useLogout()
  if (session.status !== 'authenticated') return null

  const { user } = session
  const shellUser = toAppShellUser(user)
  const navItems = productionNavigationByRole[user.role]

  // Dashboard body content stays the static F0.5 mock data per role — only
  // the AppShell identity (name/role) and nav are real. No distinct Finance
  // dashboard exists in the design, so Finance reuses Manager's shape (both
  // are "approver" dashboards with the same stat/table layout).
  switch (user.role) {
    case 'Manager':
    case 'Finance':
      return <ManagerDashboardPage user={shellUser} navItems={navItems} onLogout={onLogout} />
    case 'Director':
      return <DirectorDashboardPage user={shellUser} navItems={navItems} onLogout={onLogout} />
    case 'Admin':
      return <AdminDashboardPage user={shellUser} navItems={navItems} onLogout={onLogout} />
    default:
      return <OwnerDashboardPage user={shellUser} navItems={navItems} onLogout={onLogout} />
  }
}
