import { Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs } from '@/components/shared/tabs'
import { DataTableShell } from '@/components/shared/data-table-shell'
import { Badge } from '@/components/shared/badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { previewNavigationByRole, type NavItemConfig } from '@/lib/mock/navigation'
import { andiPratama, rinaPutri, sarahWijaya } from '@/lib/mock/users'
import { approvalsByPersona, type ApprovalPersona } from '@/lib/mock/approvals'
import { formatRupiah } from '@/lib/utils/format-currency'
import type { MockUser, Role } from '@/types/domain'

const personaUser: Record<ApprovalPersona, MockUser> = {
  manager: sarahWijaya,
  finance: rinaPutri,
  director: andiPratama,
}

const personaRole: Record<ApprovalPersona, Role> = {
  manager: 'Manager',
  finance: 'Finance',
  director: 'Director',
}

const personaReviewHref: Record<ApprovalPersona, string> = {
  manager: '/preview/request-detail/current-approver',
  finance: '/preview/request-detail/current-approver',
  director: '/preview/request-detail/current-approver',
}

interface ApprovalsInboxPageProps {
  persona: ApprovalPersona
  user?: AppShellUser
  navItems?: NavItemConfig[]
  onLogout?: () => void
}

export function ApprovalsInboxPage({ persona, user, navItems, onLogout }: ApprovalsInboxPageProps) {
  const queue = approvalsByPersona[persona]
  const resolvedUser = user ?? personaUser[persona]
  const resolvedNavItems = navItems ?? previewNavigationByRole[personaRole[persona]]

  return (
    <AppShell user={resolvedUser} navItems={resolvedNavItems} activeKey="approvals" onLogout={onLogout}>
      <PageHeader
        title={queue.title}
        subtitle={queue.subtitle}
        actions={
          <button type="button" className="btn btn-ghost">
            <Download className="icon" width={15} height={15} strokeWidth={2} />
            <span>Export</span>
          </button>
        }
      />

      <Tabs tabs={[{ label: 'Pending', count: queue.rows.length }, { label: 'Completed', count: queue.completedCount }]} />

      <DataTableShell mobileCards>
        <thead>
          <tr>
            <th>Request #</th>
            <th>Request</th>
            <th>Requester</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Current Step</th>
            <th>Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {queue.rows.map((row) => (
            <tr key={row.id}>
              <td className="cell-mono" data-label="Request #">{row.id}</td>
              <td className="cell-primary" data-label="Request">{row.title}</td>
              <td data-label="Requester">
                <div className="cell-user">
                  <UserAvatar initials={row.requester.initials} size={24} />
                  <span>{row.requester.name}</span>
                </div>
              </td>
              <td className="cell-secondary" data-label="Type">{row.type}</td>
              <td className="cell-primary" data-label="Amount">{formatRupiah(row.amount)}</td>
              <td data-label="Current step">
                <Badge variant="amber">{row.currentStep}</Badge>
              </td>
              <td className="cell-secondary" data-label="Submitted">{row.submittedAt}</td>
              <td data-label="Action">
                <div className="row-action">
                  <Link to={personaReviewHref[persona]} className="btn btn-primary btn-sm">
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
