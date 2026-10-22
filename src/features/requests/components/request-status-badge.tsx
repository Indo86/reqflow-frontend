import { Badge, type BadgeVariant } from '@/components/shared/badge'
import { requestStatusLabels, type RequestStatus } from '../types/request'

// Memetakan status request ke tampilan badge.
const statusVariant: Record<RequestStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  SUBMITTED: 'amber',
  IN_REVIEW: 'amber',
  REVISION_REQUIRED: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'muted',
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={statusVariant[status]}>{requestStatusLabels[status]}</Badge>
}
