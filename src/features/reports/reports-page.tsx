import { Calendar, Download } from 'lucide-react'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { FilterBar, FilterPill, FilterSpacer } from '@/components/shared/filter-bar'
import { BreakdownList } from '@/components/shared/breakdown-list'
import { TrendLineChart } from '@/components/shared/trend-line-chart'
import { adminUser } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import {
  reportDepartmentBreakdown,
  reportRequestsOverTime,
  reportStats,
  reportStatusBreakdown,
  reportTypeBreakdown,
  workflowDurationByStep,
  workflowDurationLabels,
} from '@/lib/mock/reports'

interface ReportsPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

export function ReportsPage({
  user = adminUser,
  navItems = previewNavigationByRole.Admin,
  onLogout,
}: ReportsPageProps = {}) {
  return (
    <AppShell user={user} navItems={navItems} activeKey="reports" onLogout={onLogout}>
      <PageHeader
        title="Reports"
        subtitle="Organization-wide insights into request volume, approvals, and workflow performance"
        actions={
          <button type="button" className="btn btn-primary">
            <Download className="icon" width={15} height={15} strokeWidth={2} />
            <span>Export Report</span>
          </button>
        }
      />

      <div className="card" style={{ padding: '14px 18px' }}>
        <FilterBar>
          <div className="filter-pill">
            <Calendar className="icon" width={14} height={14} strokeWidth={2} />
            <span>Mar 1 – Sep 17, 2026</span>
          </div>
          <FilterPill label="Request Type" />
          <FilterPill label="Status" />
          <FilterPill label="Department" />
          <FilterSpacer />
          <button type="button" className="btn btn-secondary">
            <Download className="icon" width={15} height={15} strokeWidth={2} />
            <span>Export Report</span>
          </button>
        </FilterBar>
      </div>

      <div className="stat-grid">
        {reportStats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-card-top">
              <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-delta ${stat.trend}`}>
              <span>{stat.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Requests Over Time">
        <TrendLineChart data={reportRequestsOverTime} width={1080} height={210} />
      </SectionCard>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <SectionCard title="Requests by Status">
            <BreakdownList rows={reportStatusBreakdown} />
          </SectionCard>
        </div>
        <div style={{ flex: 1 }}>
          <SectionCard title="Requests by Type">
            <BreakdownList rows={reportTypeBreakdown} />
          </SectionCard>
        </div>
        <div style={{ flex: 1 }}>
          <SectionCard title="Requests by Department">
            <BreakdownList rows={reportDepartmentBreakdown} />
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Workflow Duration by Step" subtitle="Average time a request spends at each approval step">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {workflowDurationByStep.map((row) => (
            <div className="progress-row" key={row.label}>
              <div className="progress-row-top">
                <span className="progress-row-label">{row.label}</span>
                <span className="progress-row-value">{workflowDurationLabels[row.label]}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${row.percent}%`, background: row.color }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  )
}
