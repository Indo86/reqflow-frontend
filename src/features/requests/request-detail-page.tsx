import { CheckCircle2, History, MessageSquare, MoreHorizontal, Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { AppShell } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { Badge } from '@/components/shared/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { RequestMetaChips } from '@/components/shared/request-meta-chips'
import { KeyValueGrid } from '@/components/shared/key-value-grid'
import { Tabs } from '@/components/shared/tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { CommentItem } from '@/components/shared/comment-item'
import { ApprovalTimeline } from '@/components/shared/approval-timeline'
import { UserAvatar } from '@/components/shared/user-avatar'
import { previewNavigationByRole } from '@/lib/mock/navigation'
import { adminUser, andiPratama, deniZaky, sarahWijaya } from '@/lib/mock/users'
import type { RequestDetail, RequestDetailVariant } from '@/types/domain'
import { RichTextRenderer } from './components/rich-text-renderer'

interface RequestDetailPageProps {
  detail: RequestDetail
  variant: RequestDetailVariant
}

function useVariantConfig(variant: RequestDetailVariant, detail: RequestDetail) {
  switch (variant) {
    case 'owner-draft':
      return {
        user: deniZaky,
        navItems: previewNavigationByRole.Employee,
        activeKey: 'requests',
        badges: <StatusBadge status={detail.status} /> as ReactNode,
        actions: (
          detail.status === 'Draft' ? (
            <>
              <button type="button" className="btn btn-danger-ghost">
                <span>Cancel</span>
              </button>
              <button type="button" className="btn btn-secondary">
                <Pencil className="icon" width={15} height={15} strokeWidth={2} />
                <span>Edit</span>
              </button>
              <button type="button" className="btn btn-primary">
                <CheckCircle2 className="icon" width={15} height={15} strokeWidth={2} />
                <span>Submit</span>
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-secondary">
              <MessageSquare className="icon" width={15} height={15} strokeWidth={2} />
              <span>Add Comment</span>
            </button>
          )
        ) as ReactNode,
        showApprovalActions: false,
        showAddComment: false,
        footerNote:
          detail.status === 'Draft'
            ? 'The approval flow starts once you submit this request — no approver can act on a Draft.'
            : 'You submitted this request. Approval actions are only available to the current authorized approver.',
      }
    case 'current-approver':
      return {
        user: andiPratama,
        navItems: previewNavigationByRole.Director,
        activeKey: 'approvals',
        badges: (
          <>
            <StatusBadge status={detail.status} />
            <Badge variant="accent">Your approval step</Badge>
          </>
        ) as ReactNode,
        actions: (
          <>
            <button type="button" className="btn btn-danger-ghost">
              <span>Reject</span>
            </button>
            <button type="button" className="btn btn-primary">
              <CheckCircle2 className="icon" width={15} height={15} strokeWidth={2} />
              <span>Approve</span>
            </button>
            <button type="button" className="btn-icon" aria-label="More actions">
              <MoreHorizontal className="icon" width={16} height={16} strokeWidth={2} />
            </button>
          </>
        ) as ReactNode,
        showApprovalActions: true,
        showAddComment: true,
        addCommentInitials: andiPratama.initials,
        footerNote:
          'Approve / Reject shown because Andi Pratama is the current authorized approver for the Director step — not because Director is a senior role.',
      }
    case 'non-current':
      return {
        user: sarahWijaya,
        navItems: previewNavigationByRole.Manager,
        activeKey: 'requests',
        badges: (
          <>
            <Badge variant="amber">Submitted</Badge>
            <Badge variant="muted">Read-only — not your step</Badge>
          </>
        ) as ReactNode,
        actions: (
          <button type="button" className="btn btn-secondary">
            <MessageSquare className="icon" width={15} height={15} strokeWidth={2} />
            <span>Add Comment</span>
          </button>
        ) as ReactNode,
        showApprovalActions: false,
        showAddComment: false,
        footerNote:
          'Sarah Wijaya is a Manager, but her Manager step on this request is already complete — she is not the current authorized approver, so no approval actions are shown.',
      }
    case 'admin-view-only':
      return {
        user: adminUser,
        navItems: previewNavigationByRole.Admin,
        activeKey: 'requests',
        badges: (
          <>
            <StatusBadge status={detail.status} />
            <Badge variant="muted">Viewing — not an approver</Badge>
          </>
        ) as ReactNode,
        actions: (
          <>
            <button type="button" className="btn btn-secondary">
              <History className="icon" width={15} height={15} strokeWidth={2} />
              <span>View Audit Trail</span>
            </button>
            <button type="button" className="btn-icon" aria-label="More actions">
              <MoreHorizontal className="icon" width={16} height={16} strokeWidth={2} />
            </button>
          </>
        ) as ReactNode,
        showApprovalActions: false,
        showAddComment: true,
        addCommentInitials: adminUser.initials,
        footerNote:
          'Admin has organization-wide visibility into this request, but is not the assigned approver — Approve / Reject are not shown.',
      }
  }
}

export function RequestDetailPage({ detail, variant }: RequestDetailPageProps) {
  const config = useVariantConfig(variant, detail)

  return (
    <AppShell user={config.user} navItems={config.navItems} activeKey={config.activeKey}>
      <PageHeader
        showBackLink
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="cell-mono" style={{ fontSize: 13 }}>
                {detail.id}
              </span>
              {config.badges}
            </div>
            <h1 className="page-title" style={{ fontSize: 20 }}>
              {detail.title}
            </h1>
          </div>
        }
        actions={config.actions}
      />

      <RequestMetaChips detail={detail} />

      <div className="detail-columns">
        <div className="detail-main">
          <SectionCard title="Description">
            <RichTextRenderer value={detail.description} />
          </SectionCard>

          <SectionCard title="Request Information">
            <KeyValueGrid
              items={[
                { label: 'Vendor', value: detail.vendor },
                { label: 'Cost Center', value: detail.costCenter },
                { label: 'Priority', value: detail.priority },
                { label: 'Requested Delivery', value: detail.requestedDelivery },
                { label: 'Budget Line', value: detail.budgetLine },
                { label: 'Quantity', value: detail.quantity },
              ]}
            />
          </SectionCard>

          <Tabs
            tabs={[
              { label: 'Comments', count: detail.comments.length },
              { label: 'Attachments', count: detail.attachmentCount },
              { label: 'Activity' },
            ]}
          />

          <SectionCard>
            {detail.comments.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No comments yet"
                body="Comments will appear here once this request is submitted for review."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {detail.comments.map((comment) => (
                  <CommentItem key={`${comment.author}-${comment.timestamp}`} {...comment} />
                ))}
                {config.showAddComment ? (
                  <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--rf-border)', paddingTop: 16 }}>
                    <UserAvatar initials={config.addCommentInitials ?? config.user.initials} />
                    <div className="text-input placeholder" style={{ flexGrow: 1 }}>
                      Add a comment...
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="detail-side">
          <SectionCard title="Approval Flow">
            <ApprovalTimeline steps={detail.approvalSteps} />
            <div style={{ padding: '0 0 0 0', marginTop: 4, fontSize: 11.5, color: 'var(--text-tertiary)' }}>
              {config.footerNote}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
