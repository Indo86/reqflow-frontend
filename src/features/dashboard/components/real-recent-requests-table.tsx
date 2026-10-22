import { Link } from 'react-router-dom'
import { RequestStatusBadge } from '@/features/requests/components/request-status-badge'
import { ViewerBadge } from '@/features/requests/components/viewer-badge'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import type { Request } from '@/features/requests/types/request'

interface RealRecentRequestsTableProps {
  requests: Request[]
}

// Mengambil data dari /requests.
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
            <th>Created by</th>
            <th>Your role</th>
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
              <td className="cell-secondary">{request.createdBy.name}</td>
              <td>
                <ViewerBadge viewer={request.viewer} />
              </td>
              <td className="cell-secondary">{new Date(request.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
