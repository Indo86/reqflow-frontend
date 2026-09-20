import { Building2, Calendar, FileText, User, Wallet } from 'lucide-react'
import type { RequestDetail } from '@/types/domain'
import { formatRupiah } from '@/lib/utils/format-currency'

export function RequestMetaChips({ detail }: { detail: RequestDetail }) {
  const chips = [
    { icon: FileText, label: 'Type', value: detail.type },
    { icon: User, label: 'Requester', value: detail.requester.name },
    { icon: Building2, label: 'Department', value: detail.department },
    { icon: Calendar, label: 'Created', value: detail.createdAt },
    { icon: Wallet, label: 'Amount', value: formatRupiah(detail.amount) },
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
