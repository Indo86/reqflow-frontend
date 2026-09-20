import { Download } from 'lucide-react'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SectionCard } from '@/components/shared/section-card'
import { BreakdownList } from '@/components/shared/breakdown-list'
import { TrendLineChart } from '@/components/shared/trend-line-chart'
import { ActivityItem } from '@/components/shared/activity-item'
import { FilterPill } from '@/components/shared/filter-bar'
import { adminUser } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { adminStats, recentActivity, requestsOverTimeSeries, statusBreakdown, typeBreakdown } from '@/lib/mock/dashboards'

interface AdminDashboardPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

export function AdminDashboardPage({
  user = adminUser,
  navItems = previewNavigationByRole.Admin,
  onLogout,
}: AdminDashboardPageProps = {}) {
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

      <div className="stat-grid">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flexGrow: 1, minWidth: 0 }}>
          <SectionCard title="Requests Over Time" subtitle="Last 6 months" headerAction={<FilterPill label="Monthly" />}>
            <TrendLineChart data={requestsOverTimeSeries} />
          </SectionCard>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <SectionCard title="Requests by Status">
                <BreakdownList rows={statusBreakdown} />
              </SectionCard>
            </div>
            <div style={{ flex: 1 }}>
              <SectionCard title="Requests by Type">
                <BreakdownList rows={typeBreakdown} />
              </SectionCard>
            </div>
          </div>
        </div>
        <div style={{ width: 340, flexShrink: 0 }}>
          <SectionCard title="Recent Activity">
            <div className="timeline">
              {recentActivity.map((entry, index) => (
                <ActivityItem key={entry.id} {...entry} isLast={index === recentActivity.length - 1} />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
