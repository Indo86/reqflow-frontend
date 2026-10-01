import { Download } from 'lucide-react'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { FilterBar, FilterPill, FilterSpacer, SearchField } from '@/components/shared/filter-bar'
import { DataTableShell } from '@/components/shared/data-table-shell'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { adminUser } from '@/lib/mock/users'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { orgRequests } from '@/lib/mock/requests'
import { formatRupiah } from '@/lib/utils/format-currency'

interface AdminRequestsPageProps {
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

export function AdminRequestsPage({
  user = adminUser,
  navItems = previewNavigationByRole.Admin,
  onLogout,
}: AdminRequestsPageProps = {}) {
  return (
    <AppShell user={user} navItems={navItems} activeKey="requests" onLogout={onLogout}>
      <PageHeader
        title="Requests"
        subtitle="Organization-wide requests across all departments"
        actions={
          <button type="button" className="btn btn-ghost">
            <Download className="icon" width={15} height={15} strokeWidth={2} />
            <span>Export</span>
          </button>
        }
      />

      <FilterBar>
        <SearchField placeholder="Search requests..." />
        <FilterPill label="Status" />
        <FilterPill label="Type" />
        <FilterPill label="Department" />
        <FilterPill label="Created By" />
        <FilterSpacer />
        <button type="button" className="btn btn-ghost">
          <Download className="icon" width={15} height={15} strokeWidth={2} />
          <span>Export</span>
        </button>
      </FilterBar>

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
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {orgRequests.map((request) => (
            <tr key={request.id}>
              <td className="cell-mono" data-label="Request #">{request.id}</td>
              <td className="cell-primary" data-label="Title">{request.title}</td>
              <td className="cell-secondary" data-label="Type">{request.type}</td>
              <td className="cell-secondary" data-label="Department">{request.department}</td>
              <td className="cell-primary" data-label="Amount">{formatRupiah(request.amount)}</td>
              <td data-label="Status">
                <StatusBadge status={request.status} />
              </td>
              <td data-label="Created by">
                <div className="cell-user">
                  <UserAvatar initials={request.requester.initials} size={24} />
                  <span>{request.requester.name}</span>
                </div>
              </td>
              <td className="cell-secondary" data-label="Created">{request.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>

      <div className="pagination-bar">
        <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
          Showing 1–{orgRequests.length} of 428 requests
        </span>
        <div className="pagination-actions">
          <button type="button" className="btn btn-secondary btn-sm">
            Previous
          </button>
          <button type="button" className="btn btn-secondary btn-sm">
            Next
          </button>
        </div>
      </div>
    </AppShell>
  )
}
