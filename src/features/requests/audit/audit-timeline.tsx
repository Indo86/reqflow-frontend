import { describeAuditEntry } from './describe-audit-entry'
import { useRequestAuditLogQuery } from './use-request-audit-log-query'

// Read-only history of one request, straight from the append-only audit log.
// Authorization is server-side: a user who cannot read the request is refused
// by the endpoint, and that is shown as an error, never as an empty history.
export function AuditTimeline({ requestId }: { requestId: string }) {
  const query = useRequestAuditLogQuery(requestId)

  if (query.isPending) return <p className="body-text">Loading history…</p>
  if (query.isError) {
    return (
      <div>
        <p className="body-text">The history for this request could not be loaded.</p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => void query.refetch()}
        >
          Retry
        </button>
      </div>
    )
  }
  if (query.data.data.length === 0) return <p className="body-text">No activity has been recorded yet.</p>

  return (
    <ol
      aria-label="Request history"
      style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {query.data.data.map((entry) => {
        const { title, detail } = describeAuditEntry(entry)
        return (
          <li key={entry.id}>
            <div className="body-text" style={{ fontWeight: 600 }}>{title}</div>
            <div className="approval-step-meta">
              {entry.actor?.name ?? 'System'} · {new Date(entry.createdAt).toLocaleString()}
            </div>
            {detail ? <p className="body-text" style={{ marginTop: 2 }}>{detail}</p> : null}
          </li>
        )
      })}
    </ol>
  )
}
