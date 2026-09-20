import { Building2, Calendar, FileText, User, Wallet } from 'lucide-react'
import { formatRequestAmount } from '../lib/format-request-amount'
import { requestTypeLabels, type RequestDetail } from '../types/request'

// Real-data equivalent of components/shared/request-meta-chips.tsx, which is
// typed to F0.5's mock RequestDetail and must not be reused/modified here.
export function RequestMetaChips({ detail }: { detail: RequestDetail }) {
  const chips = [
    { icon: FileText, label: 'Type', value: requestTypeLabels[detail.type] },
    { icon: User, label: 'Requester', value: detail.createdBy.name },
    { icon: Building2, label: 'Department', value: detail.department?.name ?? '—' },
    { icon: Calendar, label: 'Created', value: new Date(detail.createdAt).toLocaleDateString() },
    { icon: Wallet, label: 'Amount', value: formatRequestAmount(detail.amount) },
  ]

  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div className="chip-strip">
        {chips.map(({ icon: Icon, label, value }) => (
          <div className="chip-strip-item" key={label}>
            <Icon className="icon" width={15} height={15} strokeWidth={2} />
            <div>
              <div className="chip-strip-label">{label}</div>
              <div className="chip-strip-value">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
