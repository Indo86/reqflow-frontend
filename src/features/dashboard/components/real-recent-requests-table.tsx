import { Link } from 'react-router-dom'
import { RequestStatusBadge } from '@/features/requests/components/request-status-badge'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import type { Request } from '@/features/requests/types/request'

interface RealRecentRequestsTableProps {
  requests: Request[]
}

// Real-data counterpart to recent-requests-table.tsx (kept for preview
// personas). M10 has no per-request list endpoint (aggregates only), so
// this reuses F2's real GET /requests — the same visibility rule the
// dashboard summary itself uses (own-only, or org-wide for Admin) — rather
// than fabricating a dashboard-only feed (see F6 "No fake dashboard
// calculations").
export function RealRecentRequestsTable({ requests }: RealRecentRequestsTableProps) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Request #</th>
            <th>Title</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="cell-mono">
                <Link to={`/requests/${request.id}`}>{request.requestNumber}</Link>
              </td>
              <td className="cell-primary">{request.title}</td>
              <td className="cell-primary">{formatRequestAmount(request.amount)}</td>
              <td>
                <RequestStatusBadge status={request.status} />
              </td>
              <td className="cell-secondary">{new Date(request.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
