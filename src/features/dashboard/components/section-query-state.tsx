import { AlertCircle, Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/api'

interface SectionQueryStateProps {
  isPending: boolean
  isError: boolean
  error?: unknown
  onRetry: () => void
  loadingLabel?: string
  errorTitle?: string
  genericErrorMessage?: string
}

// A non-table counterpart to features/requests/components/request-table-status.tsx
// — same loading/error presentation, for dashboard/report sections that
// aren't a <table>. Lets each section fail/load independently rather than
// blanking the whole page when one secondary query fails (F6 "Loading
// states" / "Error states"). Renders null once the caller should render its
// real content.
export function SectionQueryState({
  isPending,
  isError,
  error,
  onRetry,
  loadingLabel = 'Loading…',
  errorTitle = "Couldn't load this section",
  genericErrorMessage = 'Something went wrong loading this section.',
}: SectionQueryStateProps) {
  if (isPending) {
    return (
      <div className="empty-state" role="status" aria-label={loadingLabel}>
        <div className="empty-state-icon">
          <Loader2 className="icon" width={18} height={18} strokeWidth={2} />
        </div>
        <div className="empty-state-title">{loadingLabel}</div>
      </div>
    )
  }

  if (isError) {
    const requestId = error instanceof ApiError ? error.requestId : undefined
    const message = error instanceof ApiError ? error.message : genericErrorMessage
    return (
      <div className="empty-state" role="alert">
        <div className="empty-state-icon">
          <AlertCircle className="icon" width={18} height={18} strokeWidth={2} />
        </div>
        <div className="empty-state-title">{errorTitle}</div>
        <div className="empty-state-body">
          {message}
          {requestId ? ` (Request ID: ${requestId})` : ''}
        </div>
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  return null
}
