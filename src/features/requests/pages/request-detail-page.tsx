import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { ApiError } from '@/lib/api'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { ApprovalActions } from '@/features/approvals/components/approval-actions'
import { ApprovalHistory } from '@/features/approvals/components/approval-history'
import { ReassignApprovalDialog } from '@/features/approvals/components/reassign-approval-dialog'
import { findPendingApproval, type ApprovalHistoryItem } from '@/features/approvals/types/approval'
import { CommentSection } from '@/features/collaboration/comments/components/comment-section'
import { AttachmentSection } from '@/features/collaboration/attachments/components/attachment-section'
import { computeInitials } from '@/lib/utils/compute-initials'
import { useRequestQuery } from '../hooks/use-request-query'
import { RequestStatusBadge } from '../components/request-status-badge'
import { RequestMetaChips } from '../components/request-meta-chips'
import { AuditTimeline } from '../audit/audit-timeline'
import { RequestActions } from '../components/request-actions'
import { RichTextRenderer } from '../components/rich-text-renderer'
import { FulfillmentSection } from '@/features/fulfillment/components/fulfillment-section'
import { useFulfillmentQuery } from '@/features/fulfillment/hooks/use-fulfillment'
import { TERMINAL_REQUEST_STATUSES } from '../types/request'

// Menampilkan detail request dari API.
export function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const session = useSession()
  const onLogout = useLogout()
  const query = useRequestQuery(requestId)
  // Hak akses tetap divalidasi oleh backend.
  const fulfillmentQuery = useFulfillmentQuery(requestId, query.data?.status === 'APPROVED')
  const [reassignStep, setReassignStep] = useState<ApprovalHistoryItem | null>(null)

  if (session.status !== 'authenticated') return null

  const { user } = session
  const shellUser = toAppShellUser(user)
  const navItems = productionNavigationByRole[user.role]

  if (query.isPending) {
    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="requests" onLogout={onLogout}>
        <PageHeader showBackLink title="Loading request…" />
      </AppShell>
    )
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404
    const message =
      query.error instanceof ApiError
        ? query.error.message
        : 'Something went wrong loading this request.'

    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="requests" onLogout={onLogout}>
        <PageHeader showBackLink title={notFound ? 'Request not found' : 'Something went wrong'} />
        <SectionCard>
          <p className="body-text">
            {notFound ? "This request doesn't exist, or you don't have access to it." : message}
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
  // Aksi tulis hanya tersedia untuk pemilik data.
  const isOwner = detail.createdBy.id === user.id

  // Aksi hanya tersedia untuk approver yang sedang bertugas.
  const pendingApproval = findPendingApproval(detail.approvalCycles)
  const isCurrentApprover = pendingApproval?.approver.id === user.id
  // Admin dapat mengganti approver selama request masih ditinjau.
  const canReassign = user.role === 'Admin' && detail.status === 'IN_REVIEW'

  // Aksi hanya tersedia untuk approver yang sedang bertugas.
  const canWriteCollaboration = (isOwner || isCurrentApprover) && !TERMINAL_REQUEST_STATUSES.includes(detail.status)
  // Aksi tulis hanya tersedia untuk pemilik data.
  const fulfillmentPermissions = fulfillmentQuery.data?.permissions
  const canComment = canWriteCollaboration || Boolean(fulfillmentPermissions?.canComment)
  const canAttach = canWriteCollaboration || Boolean(fulfillmentPermissions?.canAddEvidence)
  // Memuat data kolaborasi draft hanya untuk pemilik request.
  const canViewCollaboration = detail.status !== 'DRAFT' || isOwner

  return (
    <AppShell user={shellUser} navItems={navItems} activeKey="requests" onLogout={onLogout}>
      <PageHeader
        showBackLink
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="detail-title-meta">
              <span className="cell-mono" style={{ fontSize: 13 }}>
                {detail.requestNumber}
              </span>
              <RequestStatusBadge status={detail.status} />
            </div>
            <h1 className="page-title" style={{ fontSize: 20 }}>
              {detail.title}
            </h1>
          </div>
        }
        actions={
          isOwner ? (
            <RequestActions request={detail} />
          ) : isCurrentApprover && pendingApproval ? (
            <ApprovalActions approvalId={pendingApproval.id} requestId={detail.id} />
          ) : null
        }
      />

      <RequestMetaChips detail={detail} />

      {detail.viewer && detail.viewer.relationship !== 'OWNER' && !(detail.viewer.approval === 'AWAITING_DECISION') ? (
        <div role="note" className="body-text" style={{ margin: '0 0 12px' }}>
          {detail.viewer.relationship === 'OVERSIGHT'
            ? 'View only. You can see this request because of your role. Only its owner and the assigned approvers can act on it.'
            : 'You were assigned an approval step on this request. It is shown for reference; there is nothing for you to decide right now.'}
        </div>
      ) : null}

      {detail.type === 'EQUIPMENT' && detail.amount !== null ? (
        <div role="note" className="body-text" style={{ margin: '0 0 12px' }}>
          This equipment request carries an amount from before equipment was limited to assets the organization already
          owns. Buying new goods is a Purchase request.
        </div>
      ) : null}

      <div className="detail-columns">
        <div className="detail-main">
          <SectionCard title="Description">
            <RichTextRenderer value={detail.description} />
          </SectionCard>

          {canViewCollaboration ? (
            <>
              <SectionCard title="Comments">
                <CommentSection
                  requestId={detail.id}
                  currentUserId={user.id}
                  currentUserInitials={computeInitials(user.name)}
                  canWrite={canComment}
                />
              </SectionCard>

              <SectionCard title="Attachments">
                <AttachmentSection requestId={detail.id} currentUserId={user.id} canWrite={canAttach} />
              </SectionCard>
            </>
          ) : null}
        </div>

        <div className="detail-side">
          {detail.status === 'APPROVED' ? (
            <SectionCard title="Fulfillment">
              <FulfillmentSection requestId={detail.id} requestType={detail.type} />
            </SectionCard>
          ) : null}
          <SectionCard title="Approval Flow">
            <ApprovalHistory
              cycles={detail.approvalCycles}
              renderStepAction={
                canReassign
                  ? (step) =>
                      step.status === 'PENDING' || step.status === 'WAITING' ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: 6, alignSelf: 'flex-start' }}
                          onClick={() => setReassignStep(step)}
                        >
                          Reassign
                        </button>
                      ) : null
                  : undefined
              }
            />
          </SectionCard>
          <SectionCard title="History">
            <AuditTimeline requestId={detail.id} />
          </SectionCard>
        </div>
      </div>

      {canReassign ? (
        <ReassignApprovalDialog
          step={reassignStep}
          requestId={detail.id}
          ownerId={detail.createdBy.id}
          departmentId={detail.department?.id ?? null}
          onClose={() => setReassignStep(null)}
        />
      ) : null}
    </AppShell>
  )
}
