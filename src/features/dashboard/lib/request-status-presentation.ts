import type { BreakdownRow } from '@/types/domain'
import { requestStatusLabels, requestTypeLabels, type RequestStatus, type RequestType } from '@/features/requests/types/request'

// Colors for the real 7-value backend RequestStatus — distinct from the
// F0.5 mock's 5-value palette (components/shared/status-badge.tsx), same
// reasoning as RequestStatusBadge: the two enums don't line up 1:1.
const statusColors: Record<RequestStatus, string> = {
  DRAFT: '#8A93A6',
  SUBMITTED: 'var(--amber-dot)',
  IN_REVIEW: '#6D8BE8',
  REVISION_REQUIRED: 'var(--orange-dot)',
  APPROVED: 'var(--green-dot)',
  REJECTED: 'var(--red-dot)',
  CANCELLED: '#C3D1F5',
}

const typeColors: Record<RequestType, string> = {
  PURCHASE: 'var(--rf-accent)',
  REIMBURSEMENT: '#6D8BE8',
  EQUIPMENT: '#9AB1EF',
  LEAVE: '#C3D1F5',
  GENERAL: '#E1E8FB',
}

// Turns a real, already-aggregated zero-filled count map into presentation
// rows: only percentage math (count / total) is computed here — never a
// fetched-then-summed-client-side total. Zero-count categories are omitted
// so the list only shows categories that actually occurred, matching the
// F0.5 design's own convention of only listing active categories.
function toBreakdownRows<K extends string>(
  counts: Partial<Record<K, number>>,
  labels: Record<K, string>,
  colors: Record<K, string>,
  total: number
): BreakdownRow[] {
  return (Object.keys(labels) as K[])
    .map((key) => {
      const value = counts[key] ?? 0
      return { label: labels[key], value, percent: total > 0 ? Math.round((value / total) * 100) : 0, color: colors[key] }
    })
    .filter((row) => row.value > 0)
}

export function requestStatusBreakdownRows(byStatus: Partial<Record<RequestStatus, number>>, total: number): BreakdownRow[] {
  return toBreakdownRows(byStatus, requestStatusLabels, statusColors, total)
}

export function requestTypeBreakdownRows(byType: Partial<Record<RequestType, number>>, total: number): BreakdownRow[] {
  return toBreakdownRows(byType, requestTypeLabels, typeColors, total)
}
