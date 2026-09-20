import { Navigate } from 'react-router-dom'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { ApprovalInboxPage } from '@/features/approvals/pages/approval-inbox-page'
import type { Role } from '@/types/domain'

// Only Manager/Finance/Director are ever assigned an approval step in the
// backend's workflow (see approval.service.ts's STEP_RESOLVERS — Employee/
// Admin are never resolved as an approver for any step type), so this is a
// UX redirect for a page that would always be empty for them, not an
// invented resource-level permission — GET /approvals/inbox itself would
// just return zero rows for those roles; the backend remains authoritative.
const APPROVER_ROLES: Role[] = ['Manager', 'Finance', 'Director']

// Real data (F3) — see src/features/approvals/pages/approval-inbox-page.tsx.
// The F0.5 mock ApprovalsInboxPage (persona-driven, no /pages/ prefix) is
// untouched and still serves /preview/{manager,finance,director}/approvals.
export function ApprovalsRoute() {
  const session = useSession()
  const onLogout = useLogout()
  if (session.status !== 'authenticated') return null

  const { user } = session
  if (!APPROVER_ROLES.includes(user.role)) return <Navigate to="/dashboard" replace />

  return (
    <ApprovalInboxPage
      user={toAppShellUser(user)}
      navItems={productionNavigationByRole[user.role]}
      onLogout={onLogout}
    />
  )
}
