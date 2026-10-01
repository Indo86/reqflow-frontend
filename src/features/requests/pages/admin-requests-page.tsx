import { Link, useSearchParams } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableShell } from '@/components/shared/data-table-shell'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { useRequestsQuery } from '../hooks/use-requests-query'
import { RequestFilters } from '../components/request-filters'
import { RequestPagination } from '../components/request-pagination'
import { RequestTableStatus } from '../components/request-table-status'
import { RequestStatusBadge } from '../components/request-status-badge'
import { formatRequestAmount } from '../lib/format-request-amount'
import { requestTypeLabels } from '../types/request'
import { parseRequestListParams } from '../lib/parse-request-list-params'

interface AdminRequestsPageProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const COLUMN_COUNT = 7

// Production "Requests" (Admin) — same GET /requests endpoint as
// MyRequestsPage; the backend widens visibility to the whole organization
// for ADMIN instead of filtering by createdById. No client-side org
// filtering happens here — whatever the backend returns is exactly what's
// shown. The F0.5 mock had Department/Created By columns and an Export
// action; Export is omitted here since the backend has no export endpoint —
// showing a non-functional button would be misleading in a real data view.
export function AdminRequestsPage({ user, navItems, onLogout }: AdminRequestsPageProps) {
  const [searchParams] = useSearchParams()
  const filters = parseRequestListParams(searchParams)
  const query = useRequestsQuery(filters)

  return (
    <AppShell user={user} navItems={navItems} activeKey="requests" onLogout={onLogout}>
      <PageHeader title="Requests" subtitle="Organization-wide requests across all departments" />

      <RequestFilters searchPlaceholder="Search requests..." />

      <DataTableShell mobileCards>
        <thead>
          <tr>
            <th>Request #</th>
            <th>Title</th>
            <th>Type</th>
            <th>Department</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          <RequestTableStatus
            colSpan={COLUMN_COUNT}
            isLoading={query.isPending}
            isError={query.isError}
            error={query.error}
            onRetry={() => void query.refetch()}
            isEmpty={query.isSuccess && query.data.items.length === 0}
            emptyTitle="No requests yet"
            emptyBody="No requests have been created in this organization."
          />
          {query.data?.items.map((request) => (
            <tr key={request.id}>
              <td className="cell-mono" data-label="Request #">
                <Link to={`/requests/${request.id}`}>{request.requestNumber}</Link>
              </td>
              <td className="cell-primary" data-label="Title">{request.title}</td>
              <td className="cell-secondary" data-label="Type">{requestTypeLabels[request.type]}</td>
              <td className="cell-secondary" data-label="Department">{request.department?.name ?? '—'}</td>
              <td className="cell-primary" data-label="Amount">{formatRequestAmount(request.amount)}</td>
              <td data-label="Status">
                <RequestStatusBadge status={request.status} />
              </td>
              <td className="cell-secondary" data-label="Created by">{request.createdBy.name}</td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>

      {query.data && query.data.items.length > 0 ? <RequestPagination {...query.data.meta} /> : null}
    </AppShell>
  )
}
