import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings, Workflow } from 'lucide-react'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { UserAvatar } from '@/components/shared/user-avatar'
import { cn } from '@/lib/utils'

// Loose display-only shape so both mock personas (MockUser, a closed set of
// literal unions) and the real authenticated session user (arbitrary backend
// strings) satisfy it without a cast — see F1 "AppShell real-user
// integration".
export interface AppShellUser {
  name: string
  initials: string
  role: string
  department?: string
}

interface AppShellProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  activeKey: string
  children: ReactNode
  // Omitted entirely on the /preview/* mock-persona pages — there is no
  // real session to sign out of there. Real authenticated routes pass a
  // real handler (see F1 useLogout()).
  onLogout?: () => void
}

export function AppShell({ user, navItems, activeKey, children, onLogout }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Workflow className="icon" width={15} height={15} strokeWidth={2} />
          </div>
          <div className="brand-name">ReqFlow</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={cn('nav-item', item.key === activeKey && 'active')}
            >
              <item.icon className="icon" width={17} height={17} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="nav-item">
            <Settings className="icon" width={17} height={17} strokeWidth={2} />
            <span>Settings</span>
          </button>
          {onLogout ? (
            <button type="button" className="nav-item" onClick={onLogout}>
              <LogOut className="icon" width={17} height={17} strokeWidth={2} />
              <span>Log out</span>
            </button>
          ) : null}
          <div className="user-row">
            <UserAvatar initials={user.initials} />
            <div className="user-meta">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role === 'Employee' ? user.department : user.role}</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-area">
        <div className="main-content">{children}</div>
      </div>
    </div>
  )
}
