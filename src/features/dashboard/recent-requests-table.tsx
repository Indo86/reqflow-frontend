import type { RequestListItem } from '@/types/domain'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatRupiah } from '@/lib/utils/format-currency'

export function RecentRequestsTable({ requests }: { requests: RequestListItem[] }) {
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
              <td className="cell-mono">{request.id}</td>
              <td className="cell-primary">{request.title}</td>
              <td className="cell-primary">{formatRupiah(request.amount)}</td>
              <td>
                <StatusBadge status={request.status} />
              </td>
              <td className="cell-secondary">{request.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
