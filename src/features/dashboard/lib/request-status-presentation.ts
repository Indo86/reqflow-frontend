import type { BreakdownRow } from '@/types/domain'
import { requestStatusLabels, requestTypeLabels, type RequestStatus, type RequestType } from '@/features/requests/types/request'

// Memetakan status request ke warna tampilan.
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

// Menyiapkan data untuk ditampilkan di antarmuka.
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
