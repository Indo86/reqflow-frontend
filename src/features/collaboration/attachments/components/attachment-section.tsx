import { useRef, useState } from 'react'
import { AlertCircle, Download, Loader2, Paperclip, Trash2 } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { EmptyState } from '@/components/shared/empty-state'
import { formatBytes } from '@/lib/utils/format-bytes'
import { formatDate } from '@/lib/utils/format-date'
import { ConfirmDialog } from '@/features/requests/components/confirm-dialog'
import { useAttachmentsQuery } from '../hooks/use-attachments-query'
import { useUploadAttachmentMutation } from '../hooks/use-upload-attachment-mutation'
import { useDeleteAttachmentMutation } from '../hooks/use-delete-attachment-mutation'
import { useDownloadAttachment } from '../hooks/use-download-attachment'
import {
  ALLOWED_ATTACHMENT_EXTENSIONS_HINT,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
} from '../types/attachment'

interface AttachmentSectionProps {
  requestId: string
  currentUserId: string
  // See CommentSection — same owner-or-current-approver, not-terminal rule
  // (getWritableRequestForCollaboration), UX only.
  canWrite: boolean
}

// Real Request Attachments (F4). Single-file upload only — the backend's
// multer middleware is configured with `.single('file')`, so this never
// offers multi-file selection. Client-side size/MIME checks mirror the
// backend's own constants purely for UX; every upload is re-validated
// authoritatively server-side regardless.
export function AttachmentSection({ requestId, currentUserId, canWrite }: AttachmentSectionProps) {
  const query = useAttachmentsQuery(requestId)
  const uploadMutation = useUploadAttachmentMutation(requestId)
  const deleteMutation = useDeleteAttachmentMutation(requestId)
  const downloadMutation = useDownloadAttachment()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  function resetFileInput() {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setValidationError(null)
    if (!file) {
      setSelectedFile(null)
      return
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setValidationError(`This file exceeds the maximum size of ${formatBytes(MAX_ATTACHMENT_SIZE_BYTES)}.`)
      resetFileInput()
      return
    }
    if (!(ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
      setValidationError(`This file type isn't supported. Allowed types: ${ALLOWED_ATTACHMENT_EXTENSIONS_HINT}.`)
      resetFileInput()
      return
    }
    setSelectedFile(file)
  }

  function handleUpload() {
    if (!selectedFile) return
    uploadMutation.mutate(selectedFile, { onSuccess: resetFileInput })
  }

  if (query.isPending) {
    return (
      <div className="empty-state" role="status" aria-label="Loading attachments">
        <div className="empty-state-icon">
          <Loader2 className="icon" width={18} height={18} strokeWidth={2} />
        </div>
        <div className="empty-state-title">Loading attachments…</div>
      </div>
    )
  }

  if (query.isError) {
    const requestIdHint = query.error instanceof ApiError ? query.error.requestId : undefined
    const message =
      query.error instanceof ApiError ? query.error.message : 'Something went wrong loading attachments.'
    return (
      <div className="empty-state" role="alert">
        <div className="empty-state-icon">
          <AlertCircle className="icon" width={18} height={18} strokeWidth={2} />
        </div>
        <div className="empty-state-title">Couldn't load attachments</div>
        <div className="empty-state-body">
          {message}
          {requestIdHint ? ` (Request ID: ${requestIdHint})` : ''}
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 12 }}
          onClick={() => void query.refetch()}
        >
          Retry
        </button>
      </div>
    )
  }

  const attachments = query.data.items
  const uploadError = uploadMutation.error
  const safeUploadMessage =
    uploadError instanceof ApiError
      ? uploadError.message
      : uploadError
        ? 'The file could not be uploaded. Please try again.'
        : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {deleteError ? (
        <div role="alert" className="body-text" style={{ color: 'var(--red-text)' }}>
          {deleteError}
        </div>
      ) : null}
      {downloadError ? (
        <div role="alert" className="body-text" style={{ color: 'var(--red-text)' }}>
          {downloadError}
        </div>
      ) : null}

      {attachments.length === 0 ? (
        <EmptyState icon={Paperclip} title="No attachments yet" body="Files added to this request will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {attachments.map((attachment) => (
            <div className="comment-item" key={attachment.id}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: 'var(--muted-bg)',
                  color: 'var(--muted-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Paperclip className="icon" width={14} height={14} strokeWidth={2} />
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{attachment.originalName}</span>
                </div>
                <p className="comment-text" style={{ color: 'var(--text-tertiary)', fontSize: 11.5 }}>
                  {formatBytes(attachment.size)} · {attachment.uploadedBy.name} · {formatDate(attachment.createdAt)}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={downloadMutation.isPending}
                    onClick={() => {
                      setDownloadError(null)
                      downloadMutation.mutate(
                        { attachmentId: attachment.id, fallbackFilename: attachment.originalName },
                        {
                          onError: (error) =>
                            setDownloadError(
                              error instanceof ApiError
                                ? error.message
                                : 'This file could not be downloaded. Please try again.'
                            ),
                        }
                      )
                    }}
                  >
                    <Download className="icon" width={13} height={13} strokeWidth={2} />
                    <span>Download</span>
                  </button>
                  {attachment.uploadedBy.id === currentUserId ? (
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => setPendingDeleteId(attachment.id)}
                    >
                      <Trash2 className="icon" width={13} height={13} strokeWidth={2} />
                      <span>Delete</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {canWrite ? (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="field-label" htmlFor="attachment-file-input">
            Add a file
          </label>
          <input
            id="attachment-file-input"
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_ATTACHMENT_MIME_TYPES.join(',')}
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
          />
          <span className="field-hint">
            Up to {formatBytes(MAX_ATTACHMENT_SIZE_BYTES)}. Allowed types: {ALLOWED_ATTACHMENT_EXTENSIONS_HINT}.
          </span>
          {validationError ? (
            <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{validationError}</span>
          ) : null}
          {safeUploadMessage ? (
            <span role="alert" style={{ fontSize: 11.5, color: 'var(--red-text)' }}>
              {safeUploadMessage}
            </span>
          ) : null}
          <div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!selectedFile || uploadMutation.isPending}
              onClick={handleUpload}
            >
              {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this attachment?"
        description="This cannot be undone."
        confirmLabel="Delete Attachment"
        isConfirming={deleteMutation.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (!pendingDeleteId) return
          deleteMutation.mutate(pendingDeleteId, {
            onSuccess: () => {
              setPendingDeleteId(null)
              setDeleteError(null)
            },
            onError: (error) => {
              setPendingDeleteId(null)
              setDeleteError(
                error instanceof ApiError ? error.message : 'This attachment could not be deleted. Please try again.'
              )
            },
          })
        }}
      />
    </div>
  )
}
