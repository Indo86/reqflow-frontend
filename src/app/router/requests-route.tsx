import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { MyRequestsPage } from '@/features/requests/pages/my-requests-page'
import { ScopedRequestsPage } from '@/features/requests/pages/scoped-requests-page'

// Menggunakan data API di halaman produksi tanpa mengubah halaman preview.
export function RequestsRoute() {
  const session = useSession()
  const onLogout = useLogout()
  if (session.status !== 'authenticated') return null

  const { user } = session
  const shellUser = toAppShellUser(user)
  const navItems = productionNavigationByRole[user.role]

  if (user.role !== 'Employee') {
    return <ScopedRequestsPage role={user.role} user={shellUser} navItems={navItems} onLogout={onLogout} />
  }
  return <MyRequestsPage user={shellUser} navItems={navItems} onLogout={onLogout} />
}
