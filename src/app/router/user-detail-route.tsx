import { Navigate } from 'react-router-dom'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { UserDetailPage } from '@/features/users/pages/user-detail-page'

export function UserDetailRoute() {
  const session = useSession()
  const onLogout = useLogout()
  if (session.status !== 'authenticated') return null
  if (session.user.role !== 'Admin') return <Navigate to="/dashboard" replace />

  const { user } = session
  return (
    <UserDetailPage
      user={toAppShellUser(user)}
      navItems={productionNavigationByRole[user.role]}
      onLogout={onLogout}
    />
  )
}
