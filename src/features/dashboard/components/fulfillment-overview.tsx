import { Link } from 'react-router-dom'
import { SectionCard } from '@/components/shared/section-card'
import type { DashboardSummary } from '../types/dashboard'

type FulfillmentCounts = NonNullable<DashboardSummary['fulfillment']>

interface Row {
  label: string
  value: number
  hint?: string
}

// Menangani proses pemenuhan request.
export function FulfillmentOverview({ counts }: { counts: FulfillmentCounts }) {
  const open = counts.notStarted + counts.inProgress
  const rows: Row[] = [
    { label: 'Awaiting fulfillment', value: open, hint: counts.awaitingOwner > 0 ? `${counts.awaitingOwner} still need an owner` : 'all assigned' },
    { label: 'In progress', value: counts.inProgress },
    { label: 'Recorded as fulfilled', value: counts.completed },
    { label: 'Fulfillment cancelled', value: counts.cancelled },
    { label: 'Approved before tracking', value: counts.approvedBeforeTracking, hint: 'completion not recorded' },
  ]
  return (
    <SectionCard
      title="Fulfillment"
      subtitle="Approval says a request is allowed; fulfillment records that someone carried it out."
      headerAction={
        <Link to="/fulfillment" className="btn btn-secondary btn-sm">
          {counts.assignedToCurrentUser > 0 ? `My tasks (${counts.assignedToCurrentUser})` : 'Open tasks'}
        </Link>
      }
    >
      <dl aria-label="Fulfillment summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, margin: 0 }}>
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="field-label">{row.label}</dt>
            <dd style={{ margin: 0 }}>
              <span className="card-title" style={{ fontSize: 20 }}>{row.value}</span>
              {row.hint ? <span className="approval-step-meta" style={{ display: 'block' }}>{row.hint}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  )
}
