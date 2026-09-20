import type { RequestStatus } from '@/types/domain'
import { Badge, type BadgeVariant } from './badge'

const statusVariant: Record<RequestStatus, BadgeVariant> = {
  Draft: 'neutral',
  Pending: 'amber',
  Approved: 'green',
  Rejected: 'red',
  Revision: 'orange',
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>
}
