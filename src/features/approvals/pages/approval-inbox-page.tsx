import { Link, useSearchParams } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs } from '@/components/shared/tabs'
import { DataTableShell } from '@/components/shared/data-table-shell'
import { Badge } from '@/components/shared/badge'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import { requestTypeLabels } from '@/features/requests/types/request'
import { useApprovalInboxQuery } from '../hooks/use-approval-inbox-query'
import { RequestTableStatus } from '@/features/requests/components/request-table-status'
import { approvalStepTypeLabels } from '../types/approval'

interface ApprovalInboxPageProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const COLUMN_COUNT = 7
const PAGE_SIZE = 20

// Production Approval Inbox — real data via GET /approvals/inbox, already
// scoped server-side to the signed-in user's own PENDING steps (see
// approval.service.ts listInbox). No "Submitted" column: the inbox row has
// no createdAt field to show one (see approval.schema.ts). No Export
// button: no export endpoint exists, same reasoning as AdminRequestsPage.
// No requester avatar: like AdminRequestsPage, real `createdBy` only ever
// carries {id, name} — no initials — so this shows plain text rather than
// inventing one. "Completed" has no backing endpoint (listInbox only ever
// returns PENDING rows — see F3 "Completed approvals") so it renders with
// no count rather than a fabricated one; only "Pending" is connected.
export function ApprovalInboxPage({ user, navItems, onLogout }: ApprovalInboxPageProps) {
  const [searchParams] = useSearchParams()
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const query = useApprovalInboxQuery({ page, pageSize: PAGE_SIZE })

  return (
    <AppShell user={user} navItems={navItems} activeKey="approvals" onLogout={onLogout}>
      <PageHeader
        title="Pending My Approval"
        subtitle="Requests currently assigned to you for approval — not your department or the company's full approval queue"
      />

      <Tabs tabs={[{ label: 'Pending', count: query.data?.meta.total }, { label: 'Completed' }]} />

      <DataTableShell mobileCards>
        <thead>
          <tr>
            <th>Request #</th>
            <th>Request</th>
            <th>Requester</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Current Step</th>
            <th>Action</th>
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
            loadingLabel="Loading approvals…"
            errorTitle="Couldn't load approvals"
            genericErrorMessage="Something went wrong loading your approvals."
            emptyTitle="No approvals require your attention"
            emptyBody="Requests assigned to you for approval will show up here."
          />
          {query.data?.items.map((item) => (
            <tr key={item.id}>
              <td className="cell-mono" data-label="Request #">{item.request.requestNumber}</td>
              <td className="cell-primary" data-label="Request">{item.request.title}</td>
              <td className="cell-secondary" data-label="Requester">{item.request.createdBy.name}</td>
              <td className="cell-secondary" data-label="Type">{requestTypeLabels[item.request.type]}</td>
              <td className="cell-primary" data-label="Amount">{formatRequestAmount(item.request.amount)}</td>
              <td data-label="Current step">
                <Badge variant="amber">{approvalStepTypeLabels[item.stepType]}</Badge>
              </td>
              <td data-label="Action">
                <div className="row-action">
                  <Link to={`/approvals/${item.id}`} className="btn btn-primary btn-sm">
                    Review
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>
    </AppShell>
  )
}
