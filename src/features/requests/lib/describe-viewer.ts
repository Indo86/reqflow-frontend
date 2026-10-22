import type { BadgeVariant } from '@/components/shared/badge'
import type { RequestViewer } from '../types/request'

export interface ViewerPresentation {
  label: string
  variant: BadgeVariant
}

// Aksi hanya tersedia untuk approver yang sedang bertugas.
export function describeViewer(viewer: RequestViewer | undefined): ViewerPresentation | null {
  if (!viewer) return null
  if (viewer.relationship === 'OWNER') return { label: 'Yours', variant: 'neutral' }
  // Menangani kondisi khusus sebelum proses dilanjutkan.
  if (viewer.relationship === 'EXECUTOR') return { label: 'You fulfil this', variant: 'accent' }
  if (viewer.approval === 'AWAITING_DECISION') return { label: 'Needs your decision', variant: 'amber' }
  if (viewer.approval === 'DECIDED') return { label: 'Decided by you', variant: 'green' }
  return { label: 'View only', variant: 'muted' }
}
