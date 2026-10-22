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

// Production Request Detail. Only real DTO fields are shown (requestNumber,
// title, type, status, amount, requester, department, description,
// timestamps, approval cycles, comments, attachments) — the F0.5 mock
// detail page additionally rendered vendor/costCenter/priority/
// requestedDelivery/budgetLine/quantity, none of which exist on the real
// backend response. Approval history/actions are real as of F3; Comments
// and Attachments are real as of F4. See
// src/features/requests/request-detail-page.tsx (unmodified) for the
// mock/preview variant.
export function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const session = useSession()
  const onLogout = useLogout()
  const query = useRequestQuery(requestId)
  // M4: execution permissions, asked only once the request is known to be APPROVED.
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
  // Write access (edit/submit/cancel/delete) is creator-only regardless of
  // role, even for Admin — mirrors the backend exactly (findOwnedRequest in
  // request.service.ts). Admin's org-wide read access never implies write
  // access here.
  const isOwner = detail.createdBy.id === user.id

  // Authority principle (F3): NOT role === MANAGER/FINANCE/DIRECTOR. The
  // only question is whether *this* backend-returned PENDING step's
  // approver is *this* signed-in user — a Manager who isn't assigned this
  // step, or an Admin viewing for visibility, both see no actions, exactly
  // like the backend's own decide()/getApprovalDetail() authorization.
  //
  // In practice this can only ever be reached by the owner or an Admin:
  // getRequestDetail() is owner/admin-only server-side (createdById-scoped
  // for every non-admin role), so a Manager/Finance/Director who is NOT the
  // owner 404s here before ever reaching this check — they review and
  // decide via /approvals/:approvalId instead (see
  // features/approvals/pages/approval-review-page.tsx). Kept here anyway
  // because it is still the behaviorally correct rule for whoever *can*
  // load this page, and because an owner is never their own approver, this
  // branch is intentionally always false in the current contract — not
  // dead code, just currently unreachable-true. See F3 "known limitations".
  const pendingApproval = findPendingApproval(detail.approvalCycles)
  const isCurrentApprover = pendingApproval?.approver.id === user.id
  // M1: Admin-only recovery action on open steps. Admin still gets no decision rights.
  const canReassign = user.role === 'Admin' && detail.status === 'IN_REVIEW'

  // Collaboration write access (F4) mirrors collaboration.service.ts's
  // getWritableRequestForCollaboration exactly: owner, or the current
  // active approver, and never on a terminal request. On this page the
  // viewer is always the owner or an Admin (see the note above) — Admin's
  // broad read access never implies collaboration write access either, so
  // only `isOwner` ever makes this true in practice here.
  const canWriteCollaboration = (isOwner || isCurrentApprover) && !TERMINAL_REQUEST_STATUSES.includes(detail.status)
  // M4: while an APPROVED request's fulfillment is open, the server also lets the
  // owner and the assignee comment and the assignee attach evidence. It tells us
  // so in `permissions`; nothing else about an approved request becomes editable.
  const fulfillmentPermissions = fulfillmentQuery.data?.permissions
  const canComment = canWriteCollaboration || Boolean(fulfillmentPermissions?.canComment)
  const canAttach = canWriteCollaboration || Boolean(fulfillmentPermissions?.canAddEvidence)
  // A DRAFT has no approval cycle yet, so the backend treats its comments and
  // attachments as owner-only (getViewableRequestForCollaboration) — even an
  // Admin who can read the request itself gets 404 there. Don't request them.
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
