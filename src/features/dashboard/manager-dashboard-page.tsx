import { Plus } from 'lucide-react'
import { AppShell } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SectionCard } from '@/components/shared/section-card'
import { sarahWijaya } from '@/lib/mock/users'
import { navigationByRole } from '@/lib/mock/navigation'
import { managerRecentRequests, managerStats } from '@/lib/mock/dashboards'
import { managerAttentionRows } from '@/lib/mock/approvals'
import { ApprovalAttentionTable } from './approval-attention-table'
import { RecentRequestsTable } from './recent-requests-table'

export function ManagerDashboardPage() {
  return (
    <AppShell user={sarahWijaya} navItems={navigationByRole.Manager} activeKey="dashboard">
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

      <div className="stat-grid">
        {managerStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SectionCard
          title="Approvals Requiring My Attention"
          subtitle="Requests currently assigned to you as Manager"
          padded={false}
        >
          <ApprovalAttentionTable rows={managerAttentionRows} reviewHref="/preview/request-detail/current-approver" />
        </SectionCard>
        <SectionCard title="My Recent Requests" padded={false}>
          <RecentRequestsTable requests={managerRecentRequests} />
        </SectionCard>
      </div>
    </AppShell>
  )
}
