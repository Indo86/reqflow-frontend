import { Plus } from 'lucide-react'
import { AppShell } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { FilterBar, FilterPill, SearchField } from '@/components/shared/filter-bar'
import { DataTableShell } from '@/components/shared/data-table-shell'
import { StatusBadge } from '@/components/shared/status-badge'
import { deniZaky } from '@/lib/mock/users'
import { navigationByRole } from '@/lib/mock/navigation'
import { myRequests } from '@/lib/mock/requests'
import { formatRupiah } from '@/lib/utils/format-currency'

export function MyRequestsPage() {
  return (
    <AppShell user={deniZaky} navItems={navigationByRole.Employee} activeKey="requests">
      <PageHeader
        title="My Requests"
        subtitle="Requests you've created"
        actions={
          <button type="button" className="btn btn-primary">
            <Plus className="icon" width={15} height={15} strokeWidth={2} />
            <span>New Request</span>
          </button>
        }
      />

      <FilterBar>
        <SearchField placeholder="Search my requests..." />
        <FilterPill label="Status" />
        <FilterPill label="Type" />
        <FilterPill label="Date" />
      </FilterBar>

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
          {myRequests.map((request) => (
            <tr key={request.id}>
              <td className="cell-mono">{request.id}</td>
              <td className="cell-primary">{request.title}</td>
              <td className="cell-secondary">{request.type}</td>
              <td className="cell-primary">{formatRupiah(request.amount)}</td>
              <td>
                <StatusBadge status={request.status} />
              </td>
              <td className="cell-secondary">{request.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>
    </AppShell>
  )
}
