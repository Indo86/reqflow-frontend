import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, Bell, Loader2 } from 'lucide-react'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ApiError } from '@/lib/api'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { useNotificationsQuery } from './hooks/use-notifications-query'
import { useUnreadCountQuery } from './hooks/use-unread-count-query'
import { useMarkReadMutation } from './hooks/use-mark-read-mutation'
import { useMarkAllReadMutation } from './hooks/use-mark-all-read-mutation'
import { NotificationRow } from './components/notification-row'

interface NotificationsPageProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const PAGE_SIZE = 20

type Filter = 'all' | 'unread'

// Production Notifications page — real data via GET /notifications, scoped
// server-side to the signed-in user (notification.service.ts
// listNotifications). unreadOnly is sent as an explicit 'true'/'false'
// string (never inferred from JS truthiness) so switching tabs can't
// silently request the wrong scope. See F5 "All / Unread tabs".
export function NotificationsPage({ user, navItems, onLogout }: NotificationsPageProps) {
  const [searchParams] = useSearchParams()
  const filter: Filter = searchParams.get('filter') === 'unread' ? 'unread' : 'all'
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1

  const query = useNotificationsQuery({ page, pageSize: PAGE_SIZE, unreadOnly: filter === 'unread' })
  const unreadCountQuery = useUnreadCountQuery()
  const markReadMutation = useMarkReadMutation()
  const markAllReadMutation = useMarkAllReadMutation()

  const unreadCount = unreadCountQuery.data?.count

  function markReadTabHref(nextFilter: Filter) {
    const next = new URLSearchParams(searchParams)
    next.set('filter', nextFilter)
    next.delete('page')
    return `?${next.toString()}`
  }

  function pageHref(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    return `?${next.toString()}`
  }

  return (
    <AppShell user={user} navItems={navItems} activeKey="notifications" onLogout={onLogout}>
      <PageHeader
        title="Notifications"
        subtitle="Updates on requests, approvals, and comments"
        actions={
          <button
            type="button"
            className="btn btn-ghost"
            disabled={markAllReadMutation.isPending || !unreadCount}
            onClick={() => markAllReadMutation.mutate()}
          >
            <span>{markAllReadMutation.isPending ? 'Marking all as read…' : 'Mark all as read'}</span>
          </button>
        }
      />

      <div className="tabs">
        <Link to={markReadTabHref('all')} className={`tab${filter === 'all' ? ' active' : ''}`}>
          <span>All</span>
          {filter === 'all' && query.data ? <span className="tab-count">{query.data.meta.total}</span> : null}
        </Link>
        <Link to={markReadTabHref('unread')} className={`tab${filter === 'unread' ? ' active' : ''}`}>
          <span>Unread</span>
          {unreadCount !== undefined ? <span className="tab-count">{unreadCount}</span> : null}
        </Link>
      </div>

      {query.isPending ? (
        <div className="empty-state" role="status" aria-label="Loading notifications…">
          <div className="empty-state-icon">
            <Loader2 className="icon" width={18} height={18} strokeWidth={2} />
          </div>
          <div className="empty-state-title">Loading notifications…</div>
        </div>
      ) : query.isError ? (
        <div className="empty-state" role="alert">
          <div className="empty-state-icon">
            <AlertCircle className="icon" width={18} height={18} strokeWidth={2} />
          </div>
          <div className="empty-state-title">Couldn't load notifications</div>
          <div className="empty-state-body">
            {query.error instanceof ApiError ? query.error.message : 'Something went wrong loading notifications.'}
            {query.error instanceof ApiError && query.error.requestId ? ` (Request ID: ${query.error.requestId})` : ''}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => void query.refetch()}
          >
            Retry
          </button>
        </div>
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? "You're all caught up." : 'No notifications yet.'}
          body={
            filter === 'unread'
              ? 'New notifications will show up here as they arrive.'
              : 'Updates on your requests and approvals will show up here.'
          }
        />
      ) : (
        <>
          <div className="card">
            {query.data.items.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onOpen={(id) => markReadMutation.mutate(id)}
                onMarkRead={(id) => markReadMutation.mutate(id)}
              />
            ))}
          </div>

          {query.data.meta.totalPages > 1 ? (
            <div className="row-action" style={{ justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
              {page > 1 ? (
                <Link to={pageHref(page - 1)} className="btn btn-secondary btn-sm">
                  Previous
                </Link>
              ) : null}
              {page < query.data.meta.totalPages ? (
                <Link to={pageHref(page + 1)} className="btn btn-secondary btn-sm">
                  Next
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </AppShell>
  )
}
