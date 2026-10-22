import { useEffect, useRef, useState } from 'react'
import { ApiError } from '@/lib/api'
import { useAssignFulfillmentMutation, useAssignmentCandidatesQuery } from '../hooks/use-fulfillment'

interface AssignFulfillmentDialogProps {
  open: boolean
  requestId: string
  // Nama pelaksana saat ini ditampilkan ketika melakukan penugasan ulang.
  currentAssigneeName: string | null
  onClose: () => void
}

// Memvalidasi bentuk data sesuai kontrak API.
export function AssignFulfillmentDialog({ open, requestId, currentAssigneeName, onClose }: AssignFulfillmentDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [assigneeId, setAssigneeId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const mutation = useAssignFulfillmentMutation(requestId)
  const candidates = useAssignmentCandidatesQuery(requestId, open)
  const isReassignment = currentAssigneeName !== null

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setAssigneeId('')
      setReason('')
      setError(null)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleConfirm() {
    if (!assigneeId) return setError('Choose who will carry this out.')
    if (isReassignment && !reason.trim()) return setError('A reason is required to reassign.')
    setError(null)
    mutation.mutate(
      { assigneeId, reason },
      {
        onSuccess: onClose,
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Could not assign this fulfillment.'),
      }
    )
  }

  const options = candidates.data ?? []

  return (
    <dialog ref={ref} className="confirm-dialog" onClose={onClose} onCancel={onClose}>
      {open ? (
        <div className="card-body">
          <div className="card-title" style={{ marginBottom: 6 }}>
            {isReassignment ? 'Reassign fulfillment' : 'Assign fulfillment'}
          </div>
          <p className="body-text" style={{ marginBottom: 12 }}>
            {isReassignment
              ? `Currently assigned to ${currentAssigneeName}. `
              : 'Nobody is assigned yet. '}
            The person you choose becomes responsible for carrying this out. Assigning someone is recorded in the
            history; being an administrator does not by itself let anyone complete it.
          </p>
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="field-label" htmlFor="fulfillment-assignee">
              Assignee
            </label>
            <select
              id="fulfillment-assignee"
              className="text-input"
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              disabled={mutation.isPending || candidates.isPending}
            >
              <option value="">{candidates.isPending ? 'Loading…' : 'Select a user'}</option>
              {options.map((user) => (
                <option key={user.id} value={user.id}>{`${user.name} (${user.email})`}</option>
              ))}
            </select>
            {candidates.isError ? (
              <span className="field-hint">The list of eligible users could not be loaded.</span>
            ) : null}
            {!candidates.isPending && !candidates.isError && options.length === 0 ? (
              <span className="field-hint">No other eligible active user was found.</span>
            ) : null}
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="field-label" htmlFor="fulfillment-assign-reason">
              Reason{isReassignment ? '' : ' (optional)'}
            </label>
            <textarea
              id="fulfillment-assign-reason"
              className="text-input"
              style={{ height: 'auto', minHeight: 80, padding: '10px 12px', resize: 'vertical' }}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          {error ? (
            <div role="alert" className="body-text" style={{ color: 'var(--red-text)', marginBottom: 12 }}>
              {error}
            </div>
          ) : null}
          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={mutation.isPending}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save assignment'}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
