import { useEffect, useRef, useState } from 'react'

interface ApprovalDecisionDialogProps {
  open: boolean
  title: string
  description: string
  commentLabel: string
  commentRequired: boolean
  confirmLabel: string
  isSubmitting: boolean
  errorMessage?: string
  onConfirm: (comment: string) => void
  onCancel: () => void
}

// Shared by Approve (comment optional), Reject, and Request Revision
// (both comment required by the backend — decisionWithRequiredCommentSchema)
// — same native <dialog> pattern as requests/components/confirm-dialog.tsx,
// extended with a comment field. Validates "required" client-side only as a
// UX nicety; the backend's own validation remains authoritative.
export function ApprovalDecisionDialog({
  open,
  title,
  description,
  commentLabel,
  commentRequired,
  confirmLabel,
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
}: ApprovalDecisionDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [comment, setComment] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setComment('')
      setValidationError(null)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleConfirm() {
    const trimmed = comment.trim()
    if (commentRequired && !trimmed) {
      setValidationError('A comment is required.')
      return
    }
    setValidationError(null)
    onConfirm(trimmed)
  }

  return (
    <dialog ref={ref} className="confirm-dialog" onClose={onCancel} onCancel={onCancel}>
      <div className="card-body">
        <div className="card-title" style={{ marginBottom: 6 }}>
          {title}
        </div>
        <p className="body-text" style={{ marginBottom: 12 }}>
          {description}
        </p>
        <div className="field" style={{ marginBottom: 12 }}>
          <label className="field-label" htmlFor="approval-decision-comment">
            {commentLabel}
            {!commentRequired ? <span className="field-hint"> (optional)</span> : null}
          </label>
          <textarea
            id="approval-decision-comment"
            className="text-input"
            style={{ height: 'auto', minHeight: 80, padding: '10px 12px', resize: 'vertical' }}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={isSubmitting}
          />
          {validationError ? (
            <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{validationError}</span>
          ) : null}
        </div>
        {errorMessage ? (
          <div role="alert" className="body-text" style={{ color: 'var(--red-text)', marginBottom: 12 }}>
            {errorMessage}
          </div>
        ) : null}
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
