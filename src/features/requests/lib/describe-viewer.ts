import type { BadgeVariant } from '@/components/shared/badge'
import type { RequestViewer } from '../types/request'

export interface ViewerPresentation {
  label: string
  variant: BadgeVariant
}

// Says WHY the signed-in user can see a request. "View only" is deliberate:
// reading a request (department/finance/organization oversight) never carries
// edit, cancel or approval rights — only the owner and the assigned approver
// get actions, and the backend enforces that independently.
export function describeViewer(viewer: RequestViewer | undefined): ViewerPresentation | null {
  if (!viewer) return null
  if (viewer.relationship === 'OWNER') return { label: 'Yours', variant: 'neutral' }
  // M4: assigned to carry the approved request out. Reading it grants no other right.
  if (viewer.relationship === 'EXECUTOR') return { label: 'You fulfil this', variant: 'accent' }
  if (viewer.approval === 'AWAITING_DECISION') return { label: 'Needs your decision', variant: 'amber' }
  if (viewer.approval === 'DECIDED') return { label: 'Decided by you', variant: 'green' }
  return { label: 'View only', variant: 'muted' }
}
