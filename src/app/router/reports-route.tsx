import { Navigate } from 'react-router-dom'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { ReportsPage } from '@/features/reports/reports-page'

// Hak akses tetap divalidasi oleh backend.
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
