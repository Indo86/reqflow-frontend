import { ClipboardCheck, FileText, Plus } from 'lucide-react'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SectionCard } from '@/components/shared/section-card'
import { EmptyState } from '@/components/shared/empty-state'
import { sarahWijaya } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { managerRecentRequests, managerStats } from '@/lib/mock/dashboards'
import { managerAttentionRows } from '@/lib/mock/approvals'
import { useRequestsQuery } from '@/features/requests/hooks/use-requests-query'
import { useApprovalInboxQuery } from '@/features/approvals/hooks/use-approval-inbox-query'
import { ApprovalAttentionTable } from './approval-attention-table'
import { RecentRequestsTable } from './recent-requests-table'
import { RealApprovalAttentionTable } from './components/real-approval-attention-table'
import { RealRecentRequestsTable } from './components/real-recent-requests-table'
import { SectionQueryState } from './components/section-query-state'
import { useDashboardSummaryQuery } from './hooks/use-dashboard-summary-query'
import { buildApproverStats } from './lib/build-stat-cards'

interface ManagerDashboardPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

const RECENT_PAGE_SIZE = 5
const ATTENTION_PAGE_SIZE = 5

// Reused for both the Manager and Finance real dashboards (no distinct
// Finance dashboard exists in the F0.5 design) — see dashboard-route.tsx.
// See owner-dashboard-page.tsx for the onLogout-gated real/preview pattern
// this and every other F6 page follows.
export function ManagerDashboardPage({
  user = sarahWijaya,
  navItems = previewNavigationByRole.Manager,
  onLogout,
}: ManagerDashboardPageProps = {}) {
  const isProduction = Boolean(onLogout)
  const summaryQuery = useDashboardSummaryQuery({ enabled: isProduction })
  const inboxQuery = useApprovalInboxQuery({ page: 1, pageSize: ATTENTION_PAGE_SIZE }, { enabled: isProduction })
  const recentQuery = useRequestsQuery({ page: 1, pageSize: RECENT_PAGE_SIZE }, { enabled: isProduction })

  const stats = isProduction && summaryQuery.data ? buildApproverStats(summaryQuery.data) : managerStats

  return (
    <AppShell user={user} navItems={navItems} activeKey="dashboard" onLogout={onLogout}>
      <PageHeader
        title="Dashboard"
        subtitle="What needs your decision, and the status of your own requests"
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SectionCard
          title="Approvals Requiring My Attention"
          subtitle="Requests currently assigned to you as Manager"
          padded={false}
        >
          {!isProduction ? (
            <ApprovalAttentionTable rows={managerAttentionRows} reviewHref="/preview/request-detail/current-approver" />
          ) : (
            <SectionQueryState
              isPending={inboxQuery.isPending}
              isError={inboxQuery.isError}
              error={inboxQuery.error}
              onRetry={() => void inboxQuery.refetch()}
              loadingLabel="Loading approvals…"
              errorTitle="Couldn't load approvals"
              genericErrorMessage="Something went wrong loading your approvals."
            />
          )}
          {isProduction && inboxQuery.data ? (
            inboxQuery.data.items.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="Nothing needs your attention" body="Requests assigned to you for approval will show up here." />
            ) : (
              <RealApprovalAttentionTable items={inboxQuery.data.items} />
            )
          ) : null}
        </SectionCard>
        <SectionCard title="My Recent Requests" padded={false}>
          {!isProduction ? (
            <RecentRequestsTable requests={managerRecentRequests} />
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
    </AppShell>
  )
}
