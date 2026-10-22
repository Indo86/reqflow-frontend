import { Link, useSearchParams } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableShell } from '@/components/shared/data-table-shell'
import type { NavItemConfig } from '@/lib/mock/navigation'
import type { Role } from '@/types/domain'
import { useRequestsQuery } from '../hooks/use-requests-query'
import { RequestFilters } from '../components/request-filters'
import { RequestPagination } from '../components/request-pagination'
import { RequestTableStatus } from '../components/request-table-status'
import { RequestStatusBadge } from '../components/request-status-badge'
import { FulfillmentBadge } from '@/features/fulfillment/components/fulfillment-badge'
import { ViewerBadge } from '../components/viewer-badge'
import { formatRequestAmount } from '../lib/format-request-amount'
import { requestTypeLabels } from '../types/request'
import { parseRequestListParams } from '../lib/parse-request-list-params'

interface ScopedRequestsPageProps {
  role: Exclude<Role, 'Employee'>
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const COLUMN_COUNT = 8

// Hak akses tetap divalidasi oleh backend.
const SCOPE_SUBTITLE: Record<ScopedRequestsPageProps['role'], string> = {
  Manager: 'Submitted requests from your department, plus your own requests',
  Finance: 'Purchase and reimbursement requests across the organization, plus your own requests',
  Director: 'Submitted requests across the organization, plus your own requests',
  Admin: 'Submitted requests across the organization. Drafts stay private to their owners',
}

const VIEW_TABS = [
  { value: undefined, label: 'All I can see' },
  { value: 'mine', label: 'Created by me' },
  { value: 'assigned', label: 'Assigned to me' },
] as const

// Mengambil data dari /requests.
export function ScopedRequestsPage({ role, user, navItems, onLogout }: ScopedRequestsPageProps) {
  const [searchParams] = useSearchParams()
  const filters = parseRequestListParams(searchParams)
  const query = useRequestsQuery(filters)

  function tabHref(view: string | undefined): string {
    const next = new URLSearchParams(searchParams)
    next.delete('page')
    if (view) next.set('view', view)
    else next.delete('view')
    const text = next.toString()
    return text ? `/requests?${text}` : '/requests'
  }

  return (
    <AppShell user={user} navItems={navItems} activeKey="requests" onLogout={onLogout}>
      <PageHeader title="Requests" subtitle={SCOPE_SUBTITLE[role]} />

      <div className="tabs" role="tablist" aria-label="Request scope">
        {VIEW_TABS.map((tab) => (
          <Link
            key={tab.label}
            to={tabHref(tab.value)}
            role="tab"
            aria-selected={(filters.view ?? undefined) === tab.value}
            className={`tab${(filters.view ?? undefined) === tab.value ? ' active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

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
            <th>Your role</th>
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
            emptyTitle="No requests to show"
            emptyBody={
              filters.view === 'mine'
                ? "You haven't created any requests yet."
                : filters.view === 'assigned'
                  ? 'No approval step has been assigned to you yet.'
                  : 'No submitted requests match your access or your filters.'
            }
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
                <FulfillmentBadge summary={request.fulfillment} />
              </td>
              <td className="cell-secondary" data-label="Created by">{request.createdBy.name}</td>
              <td data-label="Your role">
                <ViewerBadge viewer={request.viewer} />
              </td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>

      {query.data && query.data.items.length > 0 ? <RequestPagination {...query.data.meta} /> : null}
    </AppShell>
  )
}
