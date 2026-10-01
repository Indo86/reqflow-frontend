import {
  Clock,
  MoveDown,
  MoveUp,
  RotateCcw,
  ShoppingCart,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { StatCardData } from '@/lib/mock/dashboards'

const iconByKey: Record<StatCardData['icon'], LucideIcon> = {
  requests: ShoppingCart,
  pending: Clock,
  approved: CheckCircle2,
  revision: RotateCcw,
  pendingApproval: ClipboardCheck,
  rejected: XCircle,
}

const toneStyle: Record<StatCardData['tone'], { background: string; color: string }> = {
  accent: { background: 'var(--rf-accent-subtle)', color: 'var(--rf-accent)' },
  amber: { background: 'var(--amber-bg)', color: 'var(--amber-text)' },
  green: { background: 'var(--green-bg)', color: 'var(--green-text)' },
  orange: { background: 'var(--orange-bg)', color: 'var(--orange-text)' },
  red: { background: 'var(--red-bg)', color: 'var(--red-text)' },
}

export function StatCard({ label, value, icon, tone, delta, trend }: StatCardData) {
  const Icon = iconByKey[icon]
  const TrendIcon = trend === 'up' ? MoveUp : trend === 'down' ? MoveDown : Clock

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <div className="stat-icon-wrap" style={toneStyle[tone]}>
          <Icon className="icon" width={15} height={15} strokeWidth={2} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {delta ? (
        <div className={`stat-delta ${trend ?? 'flat'}`}>
          <TrendIcon className="icon" width={12} height={12} strokeWidth={2} />
          <span>{delta}</span>
        </div>
      ) : null}
    </div>
  )
}
