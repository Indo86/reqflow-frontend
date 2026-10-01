import type { ReactNode } from 'react'
import { AlertCircle, Inbox, Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/api'

interface RequestTableStatusProps {
  colSpan: number
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry: () => void
  isEmpty: boolean
  emptyTitle: string
  emptyBody: string
  emptyAction?: ReactNode
  loadingLabel?: string
  errorTitle?: string
  genericErrorMessage?: string
}

// Replaces the table body with a loading / error / empty row — used by
// MyRequestsPage, AdminRequestsPage, and the Approval Inbox (F3) so their
// loading/error/empty presentation stays identical rather than each
// reimplementing it. Returns null once real rows should render.
export function RequestTableStatus({
  colSpan,
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyBody,
  emptyAction,
  loadingLabel = 'Loading requests…',
  errorTitle = "Couldn't load requests",
  genericErrorMessage = 'Something went wrong loading requests.',
}: RequestTableStatusProps) {
  if (isLoading) {
    return (
      <tr className="table-status-row">
        <td colSpan={colSpan}>
          <div className="empty-state" role="status" aria-label={loadingLabel}>
            <div className="empty-state-icon">
              <Loader2 className="icon" width={18} height={18} strokeWidth={2} />
            </div>
            <div className="empty-state-title">{loadingLabel}</div>
          </div>
        </td>
      </tr>
    )
  }

  if (isError) {
    // Never renders the raw error/JSON — only ApiError's already-sanitized
    // message (see api-error.ts normalizeHttpError), plus the requestId when
    // the backend provided one, so a real support ticket can reference it.
    const requestId = error instanceof ApiError ? error.requestId : undefined
    const message = error instanceof ApiError ? error.message : genericErrorMessage
    return (
      <tr className="table-status-row">
        <td colSpan={colSpan}>
          <div className="empty-state" role="alert">
            <div className="empty-state-icon">
              <AlertCircle className="icon" width={18} height={18} strokeWidth={2} />
            </div>
            <div className="empty-state-title">{errorTitle}</div>
            <div className="empty-state-body">
              {message}
              {requestId ? ` (Request ID: ${requestId})` : ''}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRetry}
              style={{ marginTop: 12 }}
            >
              Retry
            </button>
          </div>
        </td>
      </tr>
    )
  }

  if (isEmpty) {
    return (
      <tr className="table-status-row">
        <td colSpan={colSpan}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <Inbox className="icon" width={18} height={18} strokeWidth={2} />
            </div>
            <div className="empty-state-title">{emptyTitle}</div>
            <div className="empty-state-body">{emptyBody}</div>
            {emptyAction}
          </div>
        </td>
      </tr>
    )
  }

  return null
}
