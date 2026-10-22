import { Badge, type BadgeVariant } from '@/components/shared/badge'

export interface FulfillmentBadgeSummary {
  applicability: 'NOT_APPROVED' | 'NOT_REQUIRED' | 'TRACKED' | 'NOT_TRACKED'
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null
  assignee: { id: string; name: string } | null
}

interface Presentation {
  label: string
  variant: BadgeVariant
  hint: string
}

// Menangani proses pemenuhan request.
function describeFulfillment(summary: FulfillmentBadgeSummary | undefined): Presentation | null {
  if (!summary) return null
  switch (summary.applicability) {
    case 'NOT_APPROVED':
    case 'NOT_REQUIRED':
      return null
    case 'NOT_TRACKED':
      return { label: 'Not tracked', variant: 'muted', hint: 'Approved before fulfillment tracking. Whether it was carried out was not recorded.' }
    case 'TRACKED':
      switch (summary.status) {
        case 'COMPLETED':
          return { label: 'Fulfilled', variant: 'green', hint: 'Recorded as completed by its executor (an internal record, not independently verified).' }
        case 'CANCELLED':
          return { label: 'Fulfillment cancelled', variant: 'muted', hint: 'An administrator cancelled the fulfillment. The approval is unchanged.' }
        case 'IN_PROGRESS':
          return { label: 'In fulfillment', variant: 'accent', hint: `In progress${summary.assignee ? `, assigned to ${summary.assignee.name}` : ''}.` }
        case 'NOT_STARTED':
          return summary.assignee
            ? { label: 'Awaiting fulfillment', variant: 'amber', hint: `Assigned to ${summary.assignee.name}; not started yet.` }
            : { label: 'Needs an owner', variant: 'orange', hint: 'Approved, but nobody is assigned to carry it out yet.' }
        default:
          return null
      }
  }
}

export function FulfillmentBadge({ summary }: { summary: FulfillmentBadgeSummary | undefined }) {
  const presentation = describeFulfillment(summary)
  if (!presentation) return null
  return (
    <span title={presentation.hint} style={{ display: 'block', marginTop: 4 }}>
      <Badge variant={presentation.variant}>{presentation.label}</Badge>
    </span>
  )
}
