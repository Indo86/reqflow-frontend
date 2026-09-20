import { Plus } from 'lucide-react'
import { AppShell } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SectionCard } from '@/components/shared/section-card'
import { andiPratama } from '@/lib/mock/users'
import { navigationByRole } from '@/lib/mock/navigation'
import { directorHighValueRows, directorRecentRequests, directorStats } from '@/lib/mock/dashboards'
import { directorAttentionRows } from '@/lib/mock/approvals'
import { ApprovalAttentionTable } from './approval-attention-table'
import { RecentRequestsTable } from './recent-requests-table'
import { formatRupiah } from '@/lib/utils/format-currency'

export function DirectorDashboardPage() {
  return (
    <AppShell user={andiPratama} navItems={navigationByRole.Director} activeKey="dashboard">
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

      <div className="stat-grid">
        {directorStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SectionCard
          title="Decisions Requiring My Attention"
          subtitle="Requests currently assigned to you as Director"
          padded={false}
        >
          <ApprovalAttentionTable rows={directorAttentionRows} reviewHref="/preview/request-detail/current-approver" />
        </SectionCard>
        <SectionCard title="My Recent Requests" padded={false}>
          <RecentRequestsTable requests={directorRecentRequests} />
        </SectionCard>
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
      </div>
    </AppShell>
  )
}
