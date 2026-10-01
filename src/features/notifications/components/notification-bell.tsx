import { Link } from 'react-router-dom'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { cn } from '@/lib/utils'
import { useUnreadCountQuery } from '../hooks/use-unread-count-query'

interface NotificationBellProps {
  item: NavItemConfig
  active: boolean
  onNavigate?: () => void
}

// Self-contained: owns its own unread-count query so no other page or
// AppShell caller needs to know Notifications exists as a domain — nothing
// threads a notificationCount prop through Dashboard/Requests/Approvals/
// Reports (see F5 "Global notification badge architecture"). A failed or
// still-loading count degrades to "no badge" rather than blocking
// navigation or the rest of AppShell (F5 "Query failure must not break
// AppShell").
export function NotificationBell({ item, active, onNavigate }: NotificationBellProps) {
  const query = useUnreadCountQuery()
  const count = query.data?.count

  return (
    <Link to={item.href} className={cn('nav-item', active && 'active')} onClick={onNavigate}>
      <item.icon className="icon" width={17} height={17} strokeWidth={2} />
      <span>{item.label}</span>
      {count ? <span className="nav-badge">{count > 99 ? '99+' : count}</span> : null}
    </Link>
  )
}
