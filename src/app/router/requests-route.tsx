import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { MyRequestsPage } from '@/features/requests/pages/my-requests-page'
import { AdminRequestsPage } from '@/features/requests/pages/admin-requests-page'

// Admin's top-level "Requests" nav item is the organization-wide list;
// every other role gets "My Requests". Both are real-data (F2) — see
// src/features/requests/pages/. The F0.5 mock components of the same name
// under src/features/requests/ (no /pages/ prefix) are untouched and still
// serve /preview/* routes only.
export function RequestsRoute() {
  const session = useSession()
  const onLogout = useLogout()
  if (session.status !== 'authenticated') return null

  const { user } = session
  const shellUser = toAppShellUser(user)
  const navItems = productionNavigationByRole[user.role]

  if (user.role === 'Admin') return <AdminRequestsPage user={shellUser} navItems={navItems} onLogout={onLogout} />
  return <MyRequestsPage user={shellUser} navItems={navItems} onLogout={onLogout} />
}
