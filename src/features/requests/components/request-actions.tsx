import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { useSubmitRequestMutation } from '../hooks/use-submit-request-mutation'
import { useCancelRequestMutation } from '../hooks/use-cancel-request-mutation'
import { useDeleteRequestMutation } from '../hooks/use-delete-request-mutation'
import { requestKeys } from '../api/request-query-keys'
import { ApprovalDecisionDialog } from '@/features/approvals/components/approval-decision-dialog'
import { ConfirmDialog } from './confirm-dialog'
import {
  CANCELLABLE_STATUSES,
  DELETABLE_STATUSES,
  EDITABLE_STATUSES,
  type RequestDetail,
} from '../types/request'

interface RequestActionsProps {
  request: RequestDetail
}

// Decides which controls are *reasonable* to show from the request's
// current status — every action still calls the backend directly, which
// remains the sole authority. A 409 here means another actor (or another
// tab) already moved the request; the response is to refetch the detail
// query and surface the backend's own message, never to assume the click
// was valid. Submit dispatches to either /submit or /resubmit depending on
// status (see api/submit-request.ts) — presented as one action since that
// distinction is purely a backend implementation detail.
export function RequestActions({ request }: RequestActionsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'withdraw' | 'delete' | null>(null)
  const [withdrawError, setWithdrawError] = useState<string | undefined>(undefined)
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  const submitMutation = useSubmitRequestMutation(request.id)
  const cancelMutation = useCancelRequestMutation(request.id)
  const deleteMutation = useDeleteRequestMutation(request.id)

  function handleConflict(error: unknown) {
    void queryClient.invalidateQueries({ queryKey: requestKeys.detail(request.id) })
    setConflictMessage(
      error instanceof ApiError
        ? error.message
        : 'This request changed — please review its current status.'
    )
  }

  const canEditOrSubmit = EDITABLE_STATUSES.includes(request.status)
  const canCancel = CANCELLABLE_STATUSES.includes(request.status)
  const canDelete = DELETABLE_STATUSES.includes(request.status)
  // M1: an IN_REVIEW request is *withdrawn* (reason required), anything else is cancelled.
  const isWithdrawal = request.status === 'IN_REVIEW'

  return (
    <>
      {conflictMessage ? (
        <div role="alert" className="body-text" style={{ color: 'var(--red-text)', marginBottom: 8 }}>
          {conflictMessage}
        </div>
      ) : null}
      <div className="action-group">
        {canDelete ? (
          <button
            type="button"
            className="btn btn-danger-ghost"
            onClick={() => setConfirmAction('delete')}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="icon" width={15} height={15} strokeWidth={2} />
            <span>Delete</span>
          </button>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            className="btn btn-danger-ghost"
            onClick={() => {
              setWithdrawError(undefined)
              setConfirmAction(isWithdrawal ? 'withdraw' : 'cancel')
            }}
            disabled={cancelMutation.isPending}
          >
            <XCircle className="icon" width={15} height={15} strokeWidth={2} />
            <span>{isWithdrawal ? 'Withdraw' : 'Cancel'}</span>
          </button>
        ) : null}
        {canEditOrSubmit ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/requests/${request.id}/edit`)}
          >
            <Pencil className="icon" width={15} height={15} strokeWidth={2} />
            <span>Edit</span>
          </button>
        ) : null}
        {canEditOrSubmit ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitMutation.isPending}
            onClick={() => submitMutation.mutate(request.status, { onError: handleConflict })}
          >
            <CheckCircle2 className="icon" width={15} height={15} strokeWidth={2} />
            <span>{submitMutation.isPending ? 'Submitting…' : 'Submit'}</span>
          </button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmAction === 'cancel'}
        title="Cancel this request?"
        description="This request will be moved to Cancelled. This cannot be undone."
        confirmLabel="Cancel Request"
        isConfirming={cancelMutation.isPending}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() =>
          cancelMutation.mutate(undefined, {
            onSuccess: () => setConfirmAction(null),
            onError: (error) => {
              setConfirmAction(null)
              handleConflict(error)
            },
          })
        }
      />
      <ApprovalDecisionDialog
        open={confirmAction === 'withdraw'}
        title="Withdraw this request?"
        description="Pending approvals will be stopped and the request will be moved to Cancelled. Decisions already made stay in the history. This cannot be undone."
        commentLabel="Reason for withdrawing"
        commentRequired
        confirmLabel="Withdraw request"
        isSubmitting={cancelMutation.isPending}
        errorMessage={withdrawError}
        onCancel={() => setConfirmAction(null)}
        onConfirm={(reason) =>
          cancelMutation.mutate(reason, {
            onSuccess: () => setConfirmAction(null),
            onError: (error) => {
              // A 409 means someone decided the request first; surface the
              // backend's own message inside the dialog, then refetch.
              setWithdrawError(error instanceof ApiError ? error.message : 'Could not withdraw this request.')
              void queryClient.invalidateQueries({ queryKey: requestKeys.detail(request.id) })
            },
          })
        }
      />
      <ConfirmDialog
        open={confirmAction === 'delete'}
        title="Delete this request?"
        description="This draft request will be permanently deleted. This cannot be undone."
        confirmLabel="Delete Request"
        isConfirming={deleteMutation.isPending}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() =>
          deleteMutation.mutate(undefined, {
            onSuccess: () => navigate('/requests', { replace: true }),
            onError: (error) => {
              setConfirmAction(null)
              handleConflict(error)
            },
          })
        }
      />
    </>
  )
}
