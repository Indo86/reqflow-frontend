import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Menu, Settings, Workflow, X } from 'lucide-react'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { UserAvatar } from '@/components/shared/user-avatar'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
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
  const [navigationOpen, setNavigationOpen] = useState(false)
  const navigationId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const closeNavigation = () => setNavigationOpen(false)
    window.addEventListener('popstate', closeNavigation)
    return () => window.removeEventListener('popstate', closeNavigation)
  }, [])

  useEffect(() => {
    if (!navigationOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNavigationOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigationOpen])

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <button
          ref={menuButtonRef}
          type="button"
          className="mobile-menu-button"
          aria-label="Open navigation"
          aria-expanded={navigationOpen}
          aria-controls={navigationId}
          onClick={() => setNavigationOpen(true)}
        >
          <Menu className="icon" width={21} height={21} strokeWidth={2} />
        </button>
        <div className="mobile-brand">
          <div className="brand-mark">
            <Workflow className="icon" width={15} height={15} strokeWidth={2} />
          </div>
          <span className="brand-name">ReqFlow</span>
        </div>
      </div>
      {navigationOpen ? (
        <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => { setNavigationOpen(false); menuButtonRef.current?.focus() }} />
      ) : null}
      <aside id={navigationId} className={`sidebar${navigationOpen ? ' is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Workflow className="icon" width={15} height={15} strokeWidth={2} />
          </div>
          <div className="brand-name">ReqFlow</div>
          <button ref={closeButtonRef} type="button" className="sidebar-close" aria-label="Close navigation" onClick={() => { setNavigationOpen(false); menuButtonRef.current?.focus() }}>
            <X className="icon" width={20} height={20} strokeWidth={2} />
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map((item) =>
            item.key === 'notifications' ? (
              <NotificationBell key={item.key} item={item} active={item.key === activeKey} onNavigate={() => setNavigationOpen(false)} />
            ) : (
              <Link
                key={item.key}
                to={item.href}
                className={cn('nav-item', item.key === activeKey && 'active')}
                onClick={() => setNavigationOpen(false)}
              >
                <item.icon className="icon" width={17} height={17} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="nav-item">
            <Settings className="icon" width={17} height={17} strokeWidth={2} />
            <span>Settings</span>
          </button>
          {onLogout ? (
            <button type="button" className="nav-item" onClick={() => { setNavigationOpen(false); onLogout() }}>
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
      <div className="main-area" inert={navigationOpen}>
        <div className="main-content">{children}</div>
      </div>
    </div>
  )
}
