import { Link } from 'react-router-dom'
import { UserAvatar } from '@/components/shared/user-avatar'
import { formatRupiah } from '@/lib/utils/format-currency'
import type { ApprovalQueueRow } from '@/lib/mock/approvals'

interface ApprovalAttentionTableProps {
  rows: ApprovalQueueRow[]
  reviewHref: string
}

// Shared by the Manager and Director dashboards — same shape, different rows.
export function ApprovalAttentionTable({ rows, reviewHref }: ApprovalAttentionTableProps) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Request #</th>
            <th>Request</th>
            <th>Requester</th>
            <th>Amount</th>
            <th>Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="cell-mono">{row.id}</td>
              <td className="cell-primary">{row.title}</td>
              <td>
                <div className="cell-user">
                  <UserAvatar initials={row.requester.initials} size={24} />
                  <span>{row.requester.name}</span>
                </div>
              </td>
              <td className="cell-primary">{formatRupiah(row.amount)}</td>
              <td className="cell-secondary">{row.submittedAt}</td>
              <td>
                <Link to={reviewHref} className="btn btn-primary btn-sm">
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
