import { Badge, type BadgeVariant } from '@/components/shared/badge'
import { requestStatusLabels, type RequestStatus } from '../types/request'

// Keyed on the REAL 7-value backend RequestStatus — the shared
// components/shared/status-badge.tsx is keyed on F0.5's 5-value mock
// RequestStatus and must not be reused/modified for real Request data.
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
