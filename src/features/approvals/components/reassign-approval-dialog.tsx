import { useEffect, useRef, useState } from 'react'
import { ApiError } from '@/lib/api'
import { useUsersQuery } from '@/features/users/hooks/use-users-query'
import type { BackendRole } from '@/features/users/types/user'
import { useReassignApprovalMutation } from '../hooks/use-reassign-approval-mutation'
import type { ApprovalHistoryItem } from '../types/approval'
import { approvalStepTypeLabels } from '../types/approval'

const ROLE_BY_STEP: Record<ApprovalHistoryItem['stepType'], BackendRole> = {
  MANAGER: 'MANAGER',
  FINANCE: 'FINANCE',
  DIRECTOR: 'DIRECTOR',
}

interface ReassignApprovalDialogProps {
  step: ApprovalHistoryItem | null
  requestId: string
  ownerId: string
  departmentId: string | null
  onClose: () => void
}

// Aksi hanya tersedia untuk approver yang sedang bertugas.
export function ReassignApprovalDialog({ step, requestId, ownerId, departmentId, onClose }: ReassignApprovalDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [approverId, setApproverId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const mutation = useReassignApprovalMutation(step?.id ?? '', requestId)

  const candidates = useUsersQuery({
    page: 1,
    pageSize: 100,
    role: step ? ROLE_BY_STEP[step.stepType] : undefined,
    // Manager hanya dipilih dari departemen request.
    departmentId: step?.stepType === 'MANAGER' ? (departmentId ?? undefined) : undefined,
    isActive: true,
  })

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (step && !dialog.open) {
      setApproverId('')
      setReason('')
      setError(null)
      dialog.showModal()
    }
    if (!step && dialog.open) dialog.close()
  }, [step])

  const options = step
    ? (candidates.data?.items ?? []).filter((user) => user.id !== ownerId && user.id !== step.approver.id)
    : []

  function handleConfirm() {
    if (!approverId) return setError('Choose the new approver.')
    if (!reason.trim()) return setError('A reason is required.')
    setError(null)
    mutation.mutate(
      { approverId, reason },
      {
        onSuccess: onClose,
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Could not reassign this approval.'),
      }
    )
  }

  return (
    <dialog ref={ref} className="confirm-dialog" onClose={onClose} onCancel={onClose}>
      {step ? (
        <div className="card-body">
          <div className="card-title" style={{ marginBottom: 6 }}>
            Reassign {approvalStepTypeLabels[step.stepType]} approval
          </div>
          <p className="body-text" style={{ marginBottom: 12 }}>
            Currently assigned to {step.approver.name}. The new approver must be an active user who can hold this
            step. The change and your reason are recorded in the audit history.
          </p>
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="field-label" htmlFor="reassign-approver">New approver</label>
            <select
              id="reassign-approver"
              className="text-input"
              value={approverId}
              onChange={(event) => setApproverId(event.target.value)}
              disabled={mutation.isPending || candidates.isPending}
            >
              <option value="">{candidates.isPending ? 'Loading…' : 'Select a user'}</option>
              {options.map((user) => (
                <option key={user.id} value={user.id}>{`${user.name} (${user.email})`}</option>
              ))}
            </select>
            {!candidates.isPending && options.length === 0 ? (
              <span className="field-hint">No other eligible active user was found.</span>
            ) : null}
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label className="field-label" htmlFor="reassign-reason">Reason</label>
            <textarea
              id="reassign-reason"
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
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={mutation.isPending}>
              {mutation.isPending ? 'Reassigning…' : 'Reassign'}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
