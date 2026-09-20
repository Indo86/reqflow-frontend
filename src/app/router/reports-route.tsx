import { Navigate } from 'react-router-dom'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { ReportsPage } from '@/features/reports/reports-page'

// The backend's report/dashboard read-model routes (report.routes.ts,
// dashboard.routes.ts) accept any authenticated role and scope the *data*
// server-side (org-wide for Admin, own-requests-only otherwise — see
// report.service.ts) rather than gating the route itself. But the F0.5
// design only ever built an org-wide Reports page — there is no "my own
// requests" report layout — so non-Admin roles are redirected rather than
// shown a page that would misleadingly imply org-wide visibility they
// don't have. This is a UX/content-availability decision, not backend
// authority (which already scopes correctly and remains authoritative).
export function ReportsRoute() {
  const session = useSession()
  const onLogout = useLogout()
  if (session.status !== 'authenticated') return null

  const { user } = session
  if (user.role !== 'Admin') return <Navigate to="/dashboard" replace />

  return (
    <ReportsPage user={toAppShellUser(user)} navItems={productionNavigationByRole[user.role]} onLogout={onLogout} />
  )
}
