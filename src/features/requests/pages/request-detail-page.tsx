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
import { findPendingApproval } from '@/features/approvals/types/approval'
import { CommentSection } from '@/features/collaboration/comments/components/comment-section'
import { AttachmentSection } from '@/features/collaboration/attachments/components/attachment-section'
import { computeInitials } from '@/lib/utils/compute-initials'
import { useRequestQuery } from '../hooks/use-request-query'
import { RequestStatusBadge } from '../components/request-status-badge'
import { RequestMetaChips } from '../components/request-meta-chips'
import { RequestActions } from '../components/request-actions'
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

  // Collaboration write access (F4) mirrors collaboration.service.ts's
  // getWritableRequestForCollaboration exactly: owner, or the current
  // active approver, and never on a terminal request. On this page the
  // viewer is always the owner or an Admin (see the note above) — Admin's
  // broad read access never implies collaboration write access either, so
  // only `isOwner` ever makes this true in practice here.
  const canWriteCollaboration = (isOwner || isCurrentApprover) && !TERMINAL_REQUEST_STATUSES.includes(detail.status)

  return (
    <AppShell user={shellUser} navItems={navItems} activeKey="requests" onLogout={onLogout}>
      <PageHeader
        showBackLink
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

      <div className="detail-columns">
        <div className="detail-main">
          <SectionCard title="Description">
            <p className="body-text">{detail.description}</p>
          </SectionCard>

          <SectionCard title="Comments">
            <CommentSection
              requestId={detail.id}
              currentUserId={user.id}
              currentUserInitials={computeInitials(user.name)}
              canWrite={canWriteCollaboration}
            />
          </SectionCard>

          <SectionCard title="Attachments">
            <AttachmentSection requestId={detail.id} currentUserId={user.id} canWrite={canWriteCollaboration} />
          </SectionCard>
        </div>

        <div className="detail-side">
          <SectionCard title="Approval Flow">
            <ApprovalHistory cycles={detail.approvalCycles} />
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
