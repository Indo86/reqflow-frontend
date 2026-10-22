import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  isConfirming?: boolean
}

// Menjalankan proses ConfirmDialog.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  isConfirming = false,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="confirm-dialog" onClose={onCancel} onCancel={onCancel}>
      <div className="card-body">
        <div className="card-title" style={{ marginBottom: 6 }}>
          {title}
        </div>
        <p className="body-text" style={{ marginBottom: 16 }}>
          {description}
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isConfirming}>
            Keep it
          </button>
          <button
            type="button"
            className="btn btn-danger-ghost"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
