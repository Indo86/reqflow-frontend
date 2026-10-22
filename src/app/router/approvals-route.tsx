import { Navigate } from 'react-router-dom'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { ApprovalInboxPage } from '@/features/approvals/pages/approval-inbox-page'
import type { Role } from '@/types/domain'

// Mengambil data dari /approvals/inbox.
const APPROVER_ROLES: Role[] = ['Manager', 'Finance', 'Director']

// Menggunakan data API di halaman produksi tanpa mengubah halaman preview.
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
