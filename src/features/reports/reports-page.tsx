import { useState } from 'react'
import { Calendar, Download } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { FilterBar, FilterPill, FilterSpacer } from '@/components/shared/filter-bar'
import { BreakdownList } from '@/components/shared/breakdown-list'
import { TrendLineChart } from '@/components/shared/trend-line-chart'
import { EmptyState } from '@/components/shared/empty-state'
import { ApiError } from '@/lib/api'
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
import { requestStatusLabels, requestTypeLabels } from '@/features/requests/types/request'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import { requestStatusBreakdownRows, requestTypeBreakdownRows } from '@/features/dashboard/lib/request-status-presentation'
import { SectionQueryState } from '@/features/dashboard/components/section-query-state'
import { useRequestReportQuery } from './hooks/use-request-report-query'
import { useWorkflowDurationQuery } from './hooks/use-workflow-duration-query'
import { useDepartmentsQuery } from './hooks/use-departments-query'
import { useExportRequestReportCsv } from './hooks/use-export-request-report-csv'
import { parseReportUrlFilters, toRequestReportFilters } from './lib/parse-report-filters'
import { departmentBreakdownRows } from './lib/department-presentation'
import { buildWorkflowDurationRows } from './lib/workflow-duration-presentation'
import { formatDurationSeconds } from './lib/format-duration'

interface ReportsPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

const statusOptions = Object.entries(requestStatusLabels).map(([value, label]) => ({ value, label }))
const typeOptions = Object.entries(requestTypeLabels).map(([value, label]) => ({ value, label }))

// See owner-dashboard-page.tsx for the onLogout-gated real/preview pattern.
// Export CSV and the Department filter are both real in production, backed
// by GET /reports/requests/export and GET /departments respectively (see
// F6-contract-completion). No "Requests Over Time" chart here: that data
// lives on /dashboard/requests-over-time, a dashboard-scoped snapshot with
// different (unfiltered) semantics from Reports' filtered aggregates —
// Admin Dashboard already covers it, so Reports isn't duplicating a second,
// differently-scoped chart of the same underlying series.
export function ReportsPage({
  user = adminUser,
  navItems = previewNavigationByRole.Admin,
  onLogout,
}: ReportsPageProps = {}) {
  const isProduction = Boolean(onLogout)
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilters = parseReportUrlFilters(searchParams)
  const reportFilters = toRequestReportFilters(urlFilters)

  const reportQuery = useRequestReportQuery(reportFilters, { enabled: isProduction })
  const durationQuery = useWorkflowDurationQuery({ from: reportFilters.from, to: reportFilters.to }, { enabled: isProduction })
  const departmentsQuery = useDepartmentsQuery({ enabled: isProduction })
  const exportMutation = useExportRequestReportCsv()
  const [exportError, setExportError] = useState<string | null>(null)

  function updateParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  function handleExport() {
    setExportError(null)
    exportMutation.mutate(reportFilters, {
      onError: (error) => setExportError(error instanceof ApiError ? error.message : 'The export could not be completed. Please try again.'),
    })
  }

  const hasAnyFilter = Boolean(
    urlFilters.status || urlFilters.type || urlFilters.departmentId || urlFilters.fromDate || urlFilters.toDate
  )
  const departmentOptions = (departmentsQuery.data ?? []).map((department) => ({
    value: department.id,
    label: department.name,
  }))

  if (!isProduction) {
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

  const report = reportQuery.data
  const durationReport = durationQuery.data
  const approvalRate =
    report && report.totals.requests > 0
      ? `${Math.round(((report.byStatus.APPROVED ?? 0) / report.totals.requests) * 100)}%`
      : '—'
  const durationRows = durationReport ? buildWorkflowDurationRows(durationReport) : []

  return (
    <AppShell user={user} navItems={navItems} activeKey="reports" onLogout={onLogout}>
      <PageHeader
        title="Reports"
        subtitle="Insights into request volume, approvals, and workflow performance"
        actions={
          <button type="button" className="btn btn-primary" disabled={exportMutation.isPending} onClick={handleExport}>
            <Download className="icon" width={15} height={15} strokeWidth={2} />
            <span>{exportMutation.isPending ? 'Exporting…' : 'Export CSV'}</span>
          </button>
        }
      />

      {exportError ? (
        <div role="alert" className="body-text" style={{ color: 'var(--red-text)' }}>
          {exportError}
        </div>
      ) : null}

      <div className="card" style={{ padding: '14px 18px' }}>
        <FilterBar>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label htmlFor="report-from" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              From
            </label>
            <input
              id="report-from"
              type="date"
              className="text-input"
              value={urlFilters.fromDate ?? ''}
              onChange={(event) => updateParam('from', event.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label htmlFor="report-to" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              To (exclusive)
            </label>
            <input
              id="report-to"
              type="date"
              className="text-input"
              value={urlFilters.toDate ?? ''}
              onChange={(event) => updateParam('to', event.target.value)}
            />
          </div>
          <FilterPill
            label="Status"
            value={urlFilters.status ?? ''}
            options={statusOptions}
            onChange={(value) => updateParam('status', value)}
          />
          <FilterPill
            label="Type"
            value={urlFilters.type ?? ''}
            options={typeOptions}
            onChange={(value) => updateParam('type', value)}
          />
          {departmentsQuery.isPending ? (
            <div className="filter-pill" aria-disabled="true">Loading departments...</div>
          ) : departmentsQuery.isError ? (
            // Degrades to a disabled, honest state rather than a broken or
            // silently-empty dropdown — the rest of Reports (status/type/
            // date filters, totals, breakdowns) stays fully usable. See F6-
            // contract-completion "Department filter states".
            <div className="filter-pill" aria-disabled="true" title="Department filter unavailable">
              Failed to load departments
            </div>
          ) : departmentOptions.length === 0 ? (
            <div className="filter-pill" aria-disabled="true">No departments available</div>
          ) : (
            <FilterPill
              label="Department"
              value={urlFilters.departmentId ?? ''}
              options={departmentOptions}
              onChange={(value) => updateParam('departmentId', value)}
            />
          )}
          <FilterSpacer />
          {hasAnyFilter ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSearchParams(new URLSearchParams())}>
              Clear filters
            </button>
          ) : null}
        </FilterBar>
      </div>

      {reportQuery.isPending || reportQuery.isError || !report ? (
        <SectionQueryState
          isPending={reportQuery.isPending}
          isError={reportQuery.isError}
          error={reportQuery.error}
          onRetry={() => void reportQuery.refetch()}
          loadingLabel="Loading report…"
          errorTitle="Couldn't load report"
          genericErrorMessage="Something went wrong loading this report."
        />
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Total Requests</span>
            </div>
            <div className="stat-value">{report.totals.requests}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Total Amount</span>
            </div>
            <div className="stat-value">{formatRequestAmount(report.totals.amountTotal)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Approval Rate</span>
            </div>
            <div className="stat-value">{approvalRate}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Avg. Workflow Duration</span>
            </div>
            <div className="stat-value">
              {durationReport?.overall.averageSeconds != null ? formatDurationSeconds(durationReport.overall.averageSeconds) : '—'}
            </div>
          </div>
        </div>
      )}

      {report ? (
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <SectionCard title="Requests by Status">
              {(() => {
                const rows = requestStatusBreakdownRows(report.byStatus, report.totals.requests)
                return rows.length === 0 ? (
                  <EmptyState icon={Calendar} title="No status data in range" body="Try widening your filters." />
                ) : (
                  <BreakdownList rows={rows} />
                )
              })()}
            </SectionCard>
          </div>
          <div style={{ flex: 1 }}>
            <SectionCard title="Requests by Type">
              {(() => {
                const rows = requestTypeBreakdownRows(report.byType, report.totals.requests)
                return rows.length === 0 ? (
                  <EmptyState icon={Calendar} title="No type data in range" body="Try widening your filters." />
                ) : (
                  <BreakdownList rows={rows} />
                )
              })()}
            </SectionCard>
          </div>
          <div style={{ flex: 1 }}>
            <SectionCard title="Requests by Department">
              {(() => {
                const rows = departmentBreakdownRows(report.byDepartment, report.totals.requests)
                return rows.length === 0 ? (
                  <EmptyState icon={Calendar} title="No department data in range" body="Try widening your filters." />
                ) : (
                  <BreakdownList rows={rows} />
                )
              })()}
            </SectionCard>
          </div>
        </div>
      ) : null}

      <SectionCard
        title="Workflow Duration by Outcome"
        subtitle="Average time from creation to a final decision, per outcome"
      >
        {durationQuery.isPending || durationQuery.isError ? (
          <SectionQueryState
            isPending={durationQuery.isPending}
            isError={durationQuery.isError}
            error={durationQuery.error}
            onRetry={() => void durationQuery.refetch()}
            loadingLabel="Loading workflow duration…"
            errorTitle="Couldn't load workflow duration"
            genericErrorMessage="Something went wrong loading this report."
          />
        ) : durationRows.length === 0 ? (
          <EmptyState icon={Calendar} title="No completed requests in range" body="Duration data appears once requests reach a final decision." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {durationRows.map((row) => (
              <div className="progress-row" key={row.label}>
                <div className="progress-row-top">
                  <span className="progress-row-label">
                    {row.label} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({row.count})</span>
                  </span>
                  <span className="progress-row-value">{row.formatted}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${row.percent}%`, background: row.color }} />
                </div>
              </div>
            ))}
            {durationReport && durationReport.excludedTerminalRequestsWithoutAuditEvidence > 0 ? (
              <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                {durationReport.excludedTerminalRequestsWithoutAuditEvidence} completed request
                {durationReport.excludedTerminalRequestsWithoutAuditEvidence === 1 ? '' : 's'} in range could not be measured
                (no audit evidence) and {durationReport.excludedTerminalRequestsWithoutAuditEvidence === 1 ? 'is' : 'are'} excluded from
                the averages above.
              </p>
            ) : null}
          </div>
        )}
      </SectionCard>
    </AppShell>
  )
}
