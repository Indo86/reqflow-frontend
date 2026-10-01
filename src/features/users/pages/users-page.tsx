import { Plus } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { DataTableShell } from '@/components/shared/data-table-shell'
import type { NavItemConfig } from '@/lib/mock/navigation'
// Reused across features — both are generic (no Request-specific props) —
// rather than duplicating an identical table-status/pagination footer here.
import { RequestTableStatus } from '@/features/requests/components/request-table-status'
import { RequestPagination } from '@/features/requests/components/request-pagination'
import { useUsersQuery } from '../hooks/use-users-query'
import { UserFilters } from '../components/user-filters'
import { UserStatusBadge } from '../components/user-status-badge'
import { roleLabels } from '../types/user'
import { parseUserListParams } from '../lib/parse-user-list-params'

interface UsersPageProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const COLUMN_COUNT = 5

// Admin-only User Management list — GET /users, Admin-only + organization-
// scoped server-side. Never fetches org-wide and filters client-side.
export function UsersPage({ user, navItems, onLogout }: UsersPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filters = parseUserListParams(searchParams)
  const query = useUsersQuery(filters)

  return (
    <AppShell user={user} navItems={navItems} activeKey="users" onLogout={onLogout}>
      <PageHeader
        title="Users"
        subtitle="Manage organization members, roles, and access"
        actions={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/users/new')}>
            <Plus className="icon" width={15} height={15} strokeWidth={2} />
            <span>New User</span>
          </button>
        }
      />

      <UserFilters />

      <DataTableShell mobileCards>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
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
            emptyTitle="No users found"
            emptyBody="No organization members match the current filters."
          />
          {query.data?.items.map((item) => (
            <tr key={item.id}>
              <td className="cell-primary" data-label="Name">
                <Link to={`/users/${item.id}`}>{item.name}</Link>
              </td>
              <td className="cell-secondary" data-label="Email">{item.email}</td>
              <td className="cell-secondary" data-label="Role">{roleLabels[item.role]}</td>
              <td className="cell-secondary" data-label="Department">{item.department?.name ?? 'No department'}</td>
              <td data-label="Status">
                <UserStatusBadge isActive={item.isActive} />
              </td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>

      {query.data && query.data.items.length > 0 ? <RequestPagination {...query.data.meta} /> : null}
    </AppShell>
  )
}
