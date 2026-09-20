import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs } from '@/components/shared/tabs'
import { NotificationItem } from '@/components/shared/notification-item'
import { deniZaky } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { mockNotifications } from '@/lib/mock/notifications'

interface NotificationsPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

export function NotificationsPage({
  user = deniZaky,
  navItems = previewNavigationByRole.Employee,
  onLogout,
}: NotificationsPageProps = {}) {
  const unreadCount = mockNotifications.filter((item) => item.unread).length

  return (
    <AppShell user={user} navItems={navItems} activeKey="notifications" onLogout={onLogout}>
      <PageHeader
        title="Notifications"
        subtitle="Updates on requests, approvals, and comments"
        actions={
          <button type="button" className="btn btn-ghost">
            <span>Mark all as read</span>
          </button>
        }
      />

      <Tabs tabs={[{ label: 'All', count: mockNotifications.length }, { label: 'Unread', count: unreadCount }]} />

      <div className="card">
        {mockNotifications.map((notification) => (
          <NotificationItem key={notification.id} {...notification} />
        ))}
      </div>
    </AppShell>
  )
}
