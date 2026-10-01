import { FileText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SectionCard } from '@/components/shared/section-card'
import { BreakdownList } from '@/components/shared/breakdown-list'
import { EmptyState } from '@/components/shared/empty-state'
import { deniZaky } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { ownerRecentRequests, ownerStats, ownerStatusBreakdown } from '@/lib/mock/dashboards'
import { useRequestsQuery } from '@/features/requests/hooks/use-requests-query'
import { RecentRequestsTable } from './recent-requests-table'
import { RealRecentRequestsTable } from './components/real-recent-requests-table'
import { SectionQueryState } from './components/section-query-state'
import { useDashboardSummaryQuery } from './hooks/use-dashboard-summary-query'
import { buildOwnerStats } from './lib/build-stat-cards'
import { requestStatusBreakdownRows } from './lib/request-status-presentation'

interface OwnerDashboardPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

const RECENT_PAGE_SIZE = 5

// user/navItems default to the F0.5 mock persona so /preview/owner/dashboard
// keeps working unchanged; the real /dashboard route passes the actual
// signed-in user and role-aware nav (see F1 dashboard-route.tsx). onLogout
// is the same "real vs preview" signal F1/F5 already use elsewhere (only
// ever passed on a real authenticated route) — it gates whether this page
// queries the real backend or keeps rendering the frozen preview mock data,
// so /preview/owner/dashboard never needs a real session (F6 "Preview
// routes keep mock data").
export function OwnerDashboardPage({
  user = deniZaky,
  navItems = previewNavigationByRole.Employee,
  onLogout,
}: OwnerDashboardPageProps = {}) {
  const isProduction = Boolean(onLogout)
  const summaryQuery = useDashboardSummaryQuery({ enabled: isProduction })
  const recentQuery = useRequestsQuery({ page: 1, pageSize: RECENT_PAGE_SIZE }, { enabled: isProduction })

  const stats = isProduction && summaryQuery.data ? buildOwnerStats(summaryQuery.data) : ownerStats
  const statusRows =
    isProduction && summaryQuery.data
      ? requestStatusBreakdownRows(summaryQuery.data.requests.byStatus, summaryQuery.data.requests.total)
      : ownerStatusBreakdown

  return (
    <AppShell user={user} navItems={navItems} activeKey="dashboard" onLogout={onLogout}>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your requests"
        actions={
          <button type="button" className="btn btn-primary">
            <Plus className="icon" width={15} height={15} strokeWidth={2} />
            <span>New Request</span>
          </button>
        }
      />

      {isProduction && (summaryQuery.isPending || summaryQuery.isError) ? (
        <SectionQueryState
          isPending={summaryQuery.isPending}
          isError={summaryQuery.isError}
          error={summaryQuery.error}
          onRetry={() => void summaryQuery.refetch()}
          loadingLabel="Loading dashboard…"
          errorTitle="Couldn't load dashboard summary"
          genericErrorMessage="Something went wrong loading your dashboard."
        />
      ) : (
        <div className="stat-grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <div className="dashboard-layout">
        <div className="dashboard-primary">
          <SectionCard
            title="My Recent Requests"
            headerAction={
              <Link to="/requests" style={{ fontSize: 12.5, fontWeight: 600 }}>
                View all
              </Link>
            }
            padded={false}
          >
            {!isProduction ? (
              <RecentRequestsTable requests={ownerRecentRequests} />
            ) : (
              <SectionQueryState
                isPending={recentQuery.isPending}
                isError={recentQuery.isError}
                error={recentQuery.error}
                onRetry={() => void recentQuery.refetch()}
                loadingLabel="Loading recent requests…"
                errorTitle="Couldn't load recent requests"
                genericErrorMessage="Something went wrong loading your recent requests."
              />
            )}
            {isProduction && recentQuery.data ? (
              recentQuery.data.items.length === 0 ? (
                <EmptyState icon={FileText} title="No requests yet" body="Create your first request to get started." />
              ) : (
                <RealRecentRequestsTable requests={recentQuery.data.items} />
              )
            ) : null}
          </SectionCard>
        </div>
        <div className="dashboard-aside">
          <SectionCard title="My Requests by Status">
            {statusRows.length === 0 ? (
              <EmptyState icon={FileText} title="No status data yet" body="Your status breakdown will show up here." />
            ) : (
              <BreakdownList rows={statusRows} />
            )}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
