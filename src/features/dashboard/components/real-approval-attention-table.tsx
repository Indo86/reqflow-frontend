import { Link } from 'react-router-dom'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import type { InboxItem } from '@/features/approvals/types/approval'

interface RealApprovalAttentionTableProps {
  items: InboxItem[]
}

// Real-data counterpart to approval-attention-table.tsx (kept for preview
// personas). Reuses the exact GET /approvals/inbox shape from F3 — there is
// no separate "dashboard attention" endpoint, and the inbox row has no
// submitted-date field to show one (see F3 approval-inbox-page.tsx, same
// omission). Each row links to its own approval, never a single shared
// href — the mock table's reviewHref was a fixed string, which real per-row
// approvalIds fix.
export function RealApprovalAttentionTable({ items }: RealApprovalAttentionTableProps) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Request #</th>
            <th>Request</th>
            <th>Requester</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="cell-mono">{item.request.requestNumber}</td>
              <td className="cell-primary">{item.request.title}</td>
              <td className="cell-secondary">{item.request.createdBy.name}</td>
              <td className="cell-primary">{formatRequestAmount(item.request.amount)}</td>
              <td>
                <Link to={`/approvals/${item.id}`} className="btn btn-primary btn-sm">
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
