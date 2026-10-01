import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { requestKeys } from '@/features/requests/api/request-query-keys'
import { useApproveMutation } from '../hooks/use-approve-mutation'
import { useRejectMutation } from '../hooks/use-reject-mutation'
import { useRequestRevisionMutation } from '../hooks/use-request-revision-mutation'
import { approvalKeys } from '../api/approval-query-keys'
import { ApprovalDecisionDialog } from './approval-decision-dialog'

interface ApprovalActionsProps {
  approvalId: string
  requestId: string
}

// Rendered by the caller (RequestDetailPage) only when the signed-in user is
// the approver on the current PENDING step — see
// findPendingApproval()/isCurrentApprover in that page. This component
// itself never re-derives or re-checks authority from role; by the time it
// renders, that decision has already been made from backend-authoritative
// data (F3 "Approval authority principle").
//
// Approve has no confirmation dialog (comment is optional, and F0.5's
// design treated it as a single click); Reject and Request Revision both
// require a comment on the backend (decisionWithRequiredCommentSchema), so
// they use a dialog. Replaces the F0.5 mock's decorative "..." overflow
// button, which never did anything.
export function ApprovalActions({ approvalId, requestId }: ApprovalActionsProps) {
  const queryClient = useQueryClient()
  const [decisionDialog, setDecisionDialog] = useState<'reject' | 'revision' | null>(null)
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  const approveMutation = useApproveMutation(approvalId, requestId)
  const rejectMutation = useRejectMutation(approvalId, requestId)
  const revisionMutation = useRequestRevisionMutation(approvalId, requestId)

  // A 404/409 here means the approval is no longer what the UI thought it
  // was (already decided by a race, no longer active, etc.) — refetch and
  // show the backend's own message rather than trusting the click (F3
  // "Concurrency / race conditions"). Never retried automatically.
  function handleConflict(error: unknown) {
    void queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) })
    void queryClient.invalidateQueries({ queryKey: approvalKeys.inboxes() })
    void queryClient.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
    setConflictMessage(
      error instanceof ApiError ? error.message : 'This approval changed — please review its current status.'
    )
  }

  const anyPending = approveMutation.isPending || rejectMutation.isPending || revisionMutation.isPending

  return (
    <>
      {conflictMessage ? (
        <div role="alert" className="body-text" style={{ color: 'var(--red-text)', marginBottom: 8 }}>
          {conflictMessage}
        </div>
      ) : null}
      <div className="action-group">
        <button
          type="button"
          className="btn btn-danger-ghost"
          disabled={anyPending}
          onClick={() => setDecisionDialog('reject')}
        >
          <XCircle className="icon" width={15} height={15} strokeWidth={2} />
          <span>Reject</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={anyPending}
          onClick={() => setDecisionDialog('revision')}
        >
          <RotateCcw className="icon" width={15} height={15} strokeWidth={2} />
          <span>Request Revision</span>
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={anyPending}
          onClick={() => approveMutation.mutate(undefined, { onError: handleConflict })}
        >
          <CheckCircle2 className="icon" width={15} height={15} strokeWidth={2} />
          <span>{approveMutation.isPending ? 'Approving…' : 'Approve'}</span>
        </button>
      </div>

      <ApprovalDecisionDialog
        open={decisionDialog === 'reject'}
        title="Reject this request?"
        description="Explain why this request is being rejected. The requester will see this comment."
        commentLabel="Reason"
        commentRequired
        confirmLabel="Reject"
        isSubmitting={rejectMutation.isPending}
        onCancel={() => setDecisionDialog(null)}
        onConfirm={(comment) =>
          rejectMutation.mutate(comment, {
            onSuccess: () => setDecisionDialog(null),
            onError: (error) => {
              setDecisionDialog(null)
              handleConflict(error)
            },
          })
        }
      />
      <ApprovalDecisionDialog
        open={decisionDialog === 'revision'}
        title="Request a revision?"
        description="Explain what needs to change. The requester will be able to edit and resubmit."
        commentLabel="What needs to change"
        commentRequired
        confirmLabel="Request Revision"
        isSubmitting={revisionMutation.isPending}
        onCancel={() => setDecisionDialog(null)}
        onConfirm={(comment) =>
          revisionMutation.mutate(comment, {
            onSuccess: () => setDecisionDialog(null),
            onError: (error) => {
              setDecisionDialog(null)
              handleConflict(error)
            },
          })
        }
      />
    </>
  )
}
