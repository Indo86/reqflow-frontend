import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Workflow } from 'lucide-react'
import type { MockUser } from '@/types/domain'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { UserAvatar } from '@/components/shared/user-avatar'
import { cn } from '@/lib/utils'

interface AppShellProps {
  user: MockUser
  navItems: NavItemConfig[]
  activeKey: string
  children: ReactNode
}

export function AppShell({ user, navItems, activeKey, children }: AppShellProps) {
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
