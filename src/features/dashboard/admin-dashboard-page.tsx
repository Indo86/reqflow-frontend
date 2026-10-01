import { useState } from 'react'
import { Activity, Download } from 'lucide-react'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SectionCard } from '@/components/shared/section-card'
import { BreakdownList } from '@/components/shared/breakdown-list'
import { TrendLineChart } from '@/components/shared/trend-line-chart'
import { ActivityItem } from '@/components/shared/activity-item'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterPill } from '@/components/shared/filter-bar'
import { adminUser } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { adminStats, recentActivity, requestsOverTimeSeries, statusBreakdown, typeBreakdown } from '@/lib/mock/dashboards'
import { RealActivityItem } from './components/real-activity-item'
import { SectionQueryState } from './components/section-query-state'
import { useDashboardSummaryQuery } from './hooks/use-dashboard-summary-query'
import { useRequestsOverTimeQuery } from './hooks/use-requests-over-time-query'
import { useRecentActivityQuery } from './hooks/use-recent-activity-query'
import { buildAdminStats } from './lib/build-stat-cards'
import { requestStatusBreakdownRows, requestTypeBreakdownRows } from './lib/request-status-presentation'
import { formatPeriodLabel, lastSixMonthsRange } from './lib/requests-over-time-range'

interface AdminDashboardPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

const RECENT_ACTIVITY_LIMIT = 8

// See owner-dashboard-page.tsx for the onLogout-gated real/preview pattern.
// The "Monthly" filter pill stays decorative in both modes — a fixed
// 6-month/month-bucket window is the only range wired for F6; day/week
// bucket switching is a documented simplification, not a backend
// limitation (bucket=day|week are both real, supported values — see F6
// report "known limitations").
export function AdminDashboardPage({
  user = adminUser,
  navItems = previewNavigationByRole.Admin,
  onLogout,
}: AdminDashboardPageProps = {}) {
  const isProduction = Boolean(onLogout)
  const summaryQuery = useDashboardSummaryQuery({ enabled: isProduction })
  // Frozen once per mount — recomputing `now` on every render would change
  // the query's from/to on every render too, defeating caching and
  // refetching in a loop (F6 "Performance": no unnecessary refetch loops).
  const [range] = useState(() => lastSixMonthsRange())
  const overTimeQuery = useRequestsOverTimeQuery({ ...range, bucket: 'month' }, { enabled: isProduction })
  const activityQuery = useRecentActivityQuery({ limit: RECENT_ACTIVITY_LIMIT }, { enabled: isProduction })

  const stats = isProduction && summaryQuery.data ? buildAdminStats(summaryQuery.data) : adminStats
  const realStatusRows =
    isProduction && summaryQuery.data
      ? requestStatusBreakdownRows(summaryQuery.data.requests.byStatus, summaryQuery.data.requests.total)
      : statusBreakdown
  const realTypeRows =
    isProduction && summaryQuery.data
      ? requestTypeBreakdownRows(summaryQuery.data.requests.byType, summaryQuery.data.requests.total)
      : typeBreakdown
  const chartPoints = isProduction
    ? (overTimeQuery.data?.points ?? []).map((point) => ({
        label: formatPeriodLabel(point.periodStart, 'month'),
        value: point.count,
      }))
    : requestsOverTimeSeries

  return (
    <AppShell user={user} navItems={navItems} activeKey="dashboard" onLogout={onLogout}>
      <PageHeader
        title="Dashboard"
        subtitle="Organization-wide overview of requests and approvals"
        actions={
          <button type="button" className="btn btn-ghost">
            <Download className="icon" width={15} height={15} strokeWidth={2} />
            <span>Export</span>
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
          genericErrorMessage="Something went wrong loading the dashboard."
        />
      ) : (
        <div className="stat-grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flexGrow: 1, minWidth: 0 }}>
          <SectionCard title="Requests Over Time" subtitle="Last 6 months" headerAction={<FilterPill label="Monthly" />}>
            {isProduction && (overTimeQuery.isPending || overTimeQuery.isError) ? (
              <SectionQueryState
                isPending={overTimeQuery.isPending}
                isError={overTimeQuery.isError}
                error={overTimeQuery.error}
                onRetry={() => void overTimeQuery.refetch()}
                loadingLabel="Loading time series…"
                errorTitle="Couldn't load requests over time"
                genericErrorMessage="Something went wrong loading this chart."
              />
            ) : chartPoints.length === 0 ? (
              <EmptyState icon={Activity} title="No requests in this range" body="Requests created in the last 6 months will show up here." />
            ) : (
              <TrendLineChart data={chartPoints} />
            )}
          </SectionCard>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <SectionCard title="Requests by Status">
                {realStatusRows.length === 0 ? (
                  <EmptyState icon={Activity} title="No status data yet" body="Status breakdown will show up here." />
                ) : (
                  <BreakdownList rows={realStatusRows} />
                )}
              </SectionCard>
            </div>
            <div style={{ flex: 1 }}>
              <SectionCard title="Requests by Type">
                {realTypeRows.length === 0 ? (
                  <EmptyState icon={Activity} title="No type data yet" body="Type breakdown will show up here." />
                ) : (
                  <BreakdownList rows={realTypeRows} />
                )}
              </SectionCard>
            </div>
          </div>
        </div>
        <div style={{ width: 340, flexShrink: 0 }}>
          <SectionCard title="Recent Activity">
            {!isProduction ? (
              <div className="timeline">
                {recentActivity.map((entry, index) => (
                  <ActivityItem key={entry.id} {...entry} isLast={index === recentActivity.length - 1} />
                ))}
              </div>
            ) : (
              <>
                <SectionQueryState
                  isPending={activityQuery.isPending}
                  isError={activityQuery.isError}
                  error={activityQuery.error}
                  onRetry={() => void activityQuery.refetch()}
                  loadingLabel="Loading recent activity…"
                  errorTitle="Couldn't load recent activity"
                  genericErrorMessage="Something went wrong loading recent activity."
                />
                {activityQuery.data ? (
                  activityQuery.data.length === 0 ? (
                    <EmptyState icon={Activity} title="No activity yet" body="Organization activity will show up here." />
                  ) : (
                    <div className="timeline">
                      {activityQuery.data.map((entry, index) => (
                        <RealActivityItem key={entry.id} entry={entry} isLast={index === activityQuery.data.length - 1} />
                      ))}
                    </div>
                  )
                ) : null}
              </>
            )}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
