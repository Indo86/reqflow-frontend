import { Plus } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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

interface MyRequestsPageProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const COLUMN_COUNT = 6

// Production "My Requests" — real data via GET /requests. The backend
// scopes this to the signed-in user's own requests for every non-admin
// role; this component never filters client-side, it just renders whatever
// the backend returns for the current filters/page.
export function MyRequestsPage({ user, navItems, onLogout }: MyRequestsPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filters = parseRequestListParams(searchParams)
  const query = useRequestsQuery(filters)

  return (
    <AppShell user={user} navItems={navItems} activeKey="requests" onLogout={onLogout}>
      <PageHeader
        title="My Requests"
        subtitle="Requests you've created"
        actions={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requests/new')}>
            <Plus className="icon" width={15} height={15} strokeWidth={2} />
            <span>New Request</span>
          </button>
        }
      />

      <RequestFilters searchPlaceholder="Search my requests..." />

      <DataTableShell>
        <thead>
          <tr>
            <th>Request #</th>
            <th>Title</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created At</th>
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
            emptyBody="Create your first request to get started."
            emptyAction={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => navigate('/requests/new')}
              >
                New Request
              </button>
            }
          />
          {query.data?.items.map((request) => (
            <tr key={request.id}>
              <td className="cell-mono">
                <Link to={`/requests/${request.id}`}>{request.requestNumber}</Link>
              </td>
              <td className="cell-primary">{request.title}</td>
              <td className="cell-secondary">{requestTypeLabels[request.type]}</td>
              <td className="cell-primary">{formatRequestAmount(request.amount)}</td>
              <td>
                <RequestStatusBadge status={request.status} />
              </td>
              <td className="cell-secondary">{new Date(request.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>

      {query.data && query.data.items.length > 0 ? <RequestPagination {...query.data.meta} /> : null}
    </AppShell>
  )
}
