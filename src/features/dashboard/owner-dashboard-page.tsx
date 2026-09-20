import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SectionCard } from '@/components/shared/section-card'
import { BreakdownList } from '@/components/shared/breakdown-list'
import { deniZaky } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { ownerRecentRequests, ownerStats, ownerStatusBreakdown } from '@/lib/mock/dashboards'
import { RecentRequestsTable } from './recent-requests-table'

interface OwnerDashboardPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

// user/navItems default to the F0.5 mock persona so /preview/owner/dashboard
// keeps working unchanged; the real /dashboard route passes the actual
// signed-in user and role-aware nav (see F1 dashboard-route.tsx).
export function OwnerDashboardPage({
  user = deniZaky,
  navItems = previewNavigationByRole.Employee,
  onLogout,
}: OwnerDashboardPageProps = {}) {
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

      <div className="stat-grid">
        {ownerStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <SectionCard
            title="My Recent Requests"
            headerAction={
              <Link to="/requests" style={{ fontSize: 12.5, fontWeight: 600 }}>
                View all
              </Link>
            }
            padded={false}
          >
            <RecentRequestsTable requests={ownerRecentRequests} />
          </SectionCard>
        </div>
        <div style={{ width: 340, flexShrink: 0 }}>
          <SectionCard title="My Requests by Status">
            <BreakdownList rows={ownerStatusBreakdown} />
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
