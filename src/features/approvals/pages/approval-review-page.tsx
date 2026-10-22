import { useParams } from 'react-router-dom'
import { AppShell } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { KeyValueGrid } from '@/components/shared/key-value-grid'
import { ApiError } from '@/lib/api'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import { requestStatusLabels, requestTypeLabels, TERMINAL_REQUEST_STATUSES } from '@/features/requests/types/request'
import { RequestStatusBadge } from '@/features/requests/components/request-status-badge'
import { CommentSection } from '@/features/collaboration/comments/components/comment-section'
import { AttachmentSection } from '@/features/collaboration/attachments/components/attachment-section'
import { computeInitials } from '@/lib/utils/compute-initials'
import { useRequestQuery } from '@/features/requests/hooks/use-request-query'
import { RichTextRenderer } from '@/features/requests/components/rich-text-renderer'
import { AuditTimeline } from '@/features/requests/audit/audit-timeline'
import { useApprovalDetailQuery } from '../hooks/use-approval-detail-query'
import { ApprovalHistory } from '../components/approval-history'
import { ApprovalActions } from '../components/approval-actions'
import { approvalStepTypeLabels } from '../types/approval'

// Where an assigned approver reviews a request and decides. The step itself
// comes from GET /approvals/:id; since M2 the request's description, full
// approval flow and audit history come from the ordinary request read
// endpoints, which now authorize any user who was assigned a step. This
// page can be opened by the assigned approver, the request's owner, or an
// org admin (read only), but
// Approve/Reject/Request Revision only ever render when *this* signed-in
// user is *this* approval's own `approver` — never from role, and never
// just because the page loaded successfully (F3 "Approval authority
// principle"). This only ever shows what getApprovalDetail returns: the
// request's summary fields (no description, no other cycle steps) plus
// this one approval step — see F3 "known limitations".
export function ApprovalReviewPage() {
  const { approvalId } = useParams<{ approvalId: string }>()
  const session = useSession()
  const onLogout = useLogout()
  const query = useApprovalDetailQuery(approvalId)
  // M2: an assigned approver may read the request itself (business context,
  // description, and every previous decision), not only their own step. This
  // is read access; the Approve/Reject buttons below still depend solely on
  // being this step's assigned approver.
  const requestQuery = useRequestQuery(query.data?.request.id)

  if (session.status !== 'authenticated') return null

  const { user } = session
  const shellUser = toAppShellUser(user)
  const navItems = productionNavigationByRole[user.role]

  if (query.isPending) {
    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="approvals" onLogout={onLogout}>
        <PageHeader showBackLink title="Loading approval…" />
      </AppShell>
    )
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404
    const message =
      query.error instanceof ApiError ? query.error.message : 'Something went wrong loading this approval.'
    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="approvals" onLogout={onLogout}>
        <PageHeader showBackLink title={notFound ? 'Approval not found' : 'Something went wrong'} />
        <SectionCard>
          <p className="body-text">
            {notFound
              ? "This approval doesn't exist, is no longer assigned to you, or you don't have access to it."
              : message}
          </p>
          {!notFound ? (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: 12 }}
              onClick={() => void query.refetch()}
            >
              Retry
            </button>
          ) : null}
        </SectionCard>
      </AppShell>
    )
  }

  const detail = query.data
  const isCurrentApprover = detail.status === 'PENDING' && detail.approver.id === user.id

  // F4 collaboration: view is always allowed here (getApprovalDetail's own
  // authorization already gated the page load — isAssignedApprover ||
  // isOwner || isAdmin, regardless of this step's status), but *write*
  // mirrors getWritableRequestForCollaboration exactly: only the current
  // active approver, and never on a terminal request.
  const canWriteCollaboration = isCurrentApprover && !TERMINAL_REQUEST_STATUSES.includes(detail.request.status)

  return (
    <AppShell user={shellUser} navItems={navItems} activeKey="approvals" onLogout={onLogout}>
      <PageHeader
        showBackLink
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="detail-title-meta">
              <span className="cell-mono" style={{ fontSize: 13 }}>
                {detail.request.requestNumber}
              </span>
              <RequestStatusBadge status={detail.request.status} />
            </div>
            <h1 className="page-title" style={{ fontSize: 20 }}>
              {detail.request.title}
            </h1>
          </div>
        }
        actions={isCurrentApprover ? <ApprovalActions approvalId={detail.id} requestId={detail.request.id} /> : null}
      />

      <SectionCard
        title={`Your step: ${approvalStepTypeLabels[detail.stepType]}`}
        subtitle="Your step in this request's approval flow. Earlier and later steps are shown below."
      >
        <KeyValueGrid
          items={[
            { label: 'Type', value: requestTypeLabels[detail.request.type] },
            { label: 'Requester', value: detail.request.createdBy.name },
            { label: 'Department', value: detail.request.department?.name ?? '—' },
            { label: 'Amount', value: formatRequestAmount(detail.request.amount) },
            { label: 'Request Status', value: requestStatusLabels[detail.request.status] },
            {
              label: 'Your Decision',
              value: detail.decisionComment ?? (detail.status === 'PENDING' ? 'Awaiting your decision' : '—'),
            },
          ]}
        />
      </SectionCard>

      <SectionCard title="Request details">
        {requestQuery.isPending ? (
          <p className="body-text">Loading request details…</p>
        ) : requestQuery.isError ? (
          <p className="body-text">The full request details could not be loaded.</p>
        ) : (
          <RichTextRenderer value={requestQuery.data.description} />
        )}
      </SectionCard>

      <SectionCard
        title="Approval flow"
        subtitle="Previous decisions with comments, the pending step, and steps still to come."
      >
        {requestQuery.isPending ? (
          <p className="body-text">Loading approval flow…</p>
        ) : requestQuery.isError ? (
          <p className="body-text">The approval flow could not be loaded.</p>
        ) : (
          <ApprovalHistory cycles={requestQuery.data.approvalCycles} />
        )}
      </SectionCard>

      <SectionCard title="History">
        <AuditTimeline requestId={detail.request.id} />
      </SectionCard>

      <SectionCard title="Comments">
        <CommentSection
          requestId={detail.request.id}
          currentUserId={user.id}
          currentUserInitials={computeInitials(user.name)}
          canWrite={canWriteCollaboration}
        />
      </SectionCard>

      <SectionCard title="Attachments">
        <AttachmentSection requestId={detail.request.id} currentUserId={user.id} canWrite={canWriteCollaboration} />
      </SectionCard>
    </AppShell>
  )
}
