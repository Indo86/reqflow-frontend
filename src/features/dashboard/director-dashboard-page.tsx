import { ClipboardCheck, FileText, Plus } from 'lucide-react'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SectionCard } from '@/components/shared/section-card'
import { EmptyState } from '@/components/shared/empty-state'
import { andiPratama } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { directorHighValueRows, directorRecentRequests, directorStats } from '@/lib/mock/dashboards'
import { directorAttentionRows } from '@/lib/mock/approvals'
import { useRequestsQuery } from '@/features/requests/hooks/use-requests-query'
import { useApprovalInboxQuery } from '@/features/approvals/hooks/use-approval-inbox-query'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import { ApprovalAttentionTable } from './approval-attention-table'
import { RecentRequestsTable } from './recent-requests-table'
import { RealApprovalAttentionTable } from './components/real-approval-attention-table'
import { RealRecentRequestsTable } from './components/real-recent-requests-table'
import { SectionQueryState } from './components/section-query-state'
import { useDashboardSummaryQuery } from './hooks/use-dashboard-summary-query'
import { buildApproverStats } from './lib/build-stat-cards'
import { formatRupiah } from '@/lib/utils/format-currency'

interface DirectorDashboardPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

const RECENT_PAGE_SIZE = 5
const ATTENTION_PAGE_SIZE = 10
const HIGH_VALUE_COUNT = 3

// Sort-only: comparing two Decimal(14,2) amounts converted to Number is safe
// for ordering (they provably fit the safe-integer range — same guarantee
// format-request-amount.ts documents for display), but the values
// themselves are never summed or otherwise used arithmetically. See F6
// "Decimal / amount handling".
function byAmountDescending(a: { amount: string | null }, b: { amount: string | null }): number {
  return Number(b.amount ?? '0') - Number(a.amount ?? '0')
}

// See owner-dashboard-page.tsx for the onLogout-gated real/preview pattern.
// "High-value Requests Assigned to You" has no dedicated backend concept
// (no configurable threshold exists anywhere in M10) — real mode reuses the
// same approval-inbox data as "Decisions Requiring My Attention", sorted by
// amount, rather than fabricating a threshold-based endpoint (F6 "No fake
// dashboard calculations").
export function DirectorDashboardPage({
  user = andiPratama,
  navItems = previewNavigationByRole.Director,
  onLogout,
}: DirectorDashboardPageProps = {}) {
  const isProduction = Boolean(onLogout)
  const summaryQuery = useDashboardSummaryQuery({ enabled: isProduction })
  const inboxQuery = useApprovalInboxQuery({ page: 1, pageSize: ATTENTION_PAGE_SIZE }, { enabled: isProduction })
  const recentQuery = useRequestsQuery({ page: 1, pageSize: RECENT_PAGE_SIZE }, { enabled: isProduction })

  const stats = isProduction && summaryQuery.data ? buildApproverStats(summaryQuery.data) : directorStats
  const highValueItems = inboxQuery.data
    ? [...inboxQuery.data.items].sort((a, b) => byAmountDescending(a.request, b.request)).slice(0, HIGH_VALUE_COUNT)
    : []

  return (
    <AppShell user={user} navItems={navItems} activeKey="dashboard" onLogout={onLogout}>
      <PageHeader
        title="Dashboard"
        subtitle="Decisions requiring your attention, and the status of your own requests"
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
          title="Decisions Requiring My Attention"
          subtitle="Requests currently assigned to you as Director"
          padded={false}
        >
          {!isProduction ? (
            <ApprovalAttentionTable rows={directorAttentionRows} reviewHref="/preview/request-detail/current-approver" />
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
            <RecentRequestsTable requests={directorRecentRequests} />
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
        {!isProduction ? (
          <SectionCard
            title="High-value Requests Assigned to You"
            subtitle="Requests over Rp 20.000.000 currently at your approval step"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {directorHighValueRows.map((row, index) => (
                <div key={row.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div className="cell-primary" style={{ fontSize: 13.5 }}>
                        {row.title}
                      </div>
                      <div className="cell-secondary" style={{ fontSize: 12 }}>
                        {row.id} · {row.requesterName} · {row.department}
                      </div>
                    </div>
                    <div className="cell-primary" style={{ fontSize: 14 }}>
                      {formatRupiah(row.amount)}
                    </div>
                  </div>
                  {index < directorHighValueRows.length - 1 ? <hr className="divider" style={{ marginTop: 12 }} /> : null}
                </div>
              ))}
            </div>
          </SectionCard>
        ) : inboxQuery.data && inboxQuery.data.items.length > 0 ? (
          <SectionCard
            title="High-value Requests Assigned to You"
            subtitle="Your highest-amount pending approvals, from the same assigned-approval queue above"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {highValueItems.map((item, index) => (
                <div key={item.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div className="cell-primary" style={{ fontSize: 13.5 }}>
                        {item.request.title}
                      </div>
                      <div className="cell-secondary" style={{ fontSize: 12 }}>
                        {item.request.requestNumber} · {item.request.createdBy.name}
                        {item.request.department ? ` · ${item.request.department.name}` : ''}
                      </div>
                    </div>
                    <div className="cell-primary" style={{ fontSize: 14 }}>
                      {formatRequestAmount(item.request.amount)}
                    </div>
                  </div>
                  {index < highValueItems.length - 1 ? <hr className="divider" style={{ marginTop: 12 }} /> : null}
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  )
}
