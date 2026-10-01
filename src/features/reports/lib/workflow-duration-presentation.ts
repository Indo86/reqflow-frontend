import { formatDurationSeconds } from './format-duration'
import type { WorkflowDurationReport, WorkflowDurationStatus } from '../types/report'

export interface DurationRow {
  label: string
  formatted: string
  percent: number
  color: string
  count: number
}

const STATUS_ORDER: WorkflowDurationStatus[] = ['APPROVED', 'REJECTED', 'CANCELLED']

const STATUS_LABELS: Record<WorkflowDurationStatus, string> = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

const STATUS_COLORS: Record<WorkflowDurationStatus, string> = {
  APPROVED: 'var(--green-dot)',
  REJECTED: 'var(--red-dot)',
  CANCELLED: '#8A93A6',
}

// byStatus is sparse by design (report.service.ts) — only outcomes with at
// least one measured row appear. Percent here is relative to the longest
// average among the outcomes actually present, a presentation-only scaling
// so the bars stay comparable; it never changes the reported averages
// themselves (F6 "Workflow duration handling").
export function buildWorkflowDurationRows(report: WorkflowDurationReport): DurationRow[] {
  const entries = STATUS_ORDER.flatMap((status) => {
    const bucket = report.byStatus[status]
    return bucket && bucket.averageSeconds !== null ? [{ status, count: bucket.count, averageSeconds: bucket.averageSeconds }] : []
  })

  if (entries.length === 0) return []

  const maxSeconds = Math.max(...entries.map((entry) => entry.averageSeconds))

  return entries.map((entry) => ({
    label: STATUS_LABELS[entry.status],
    formatted: formatDurationSeconds(entry.averageSeconds),
    percent: maxSeconds > 0 ? Math.round((entry.averageSeconds / maxSeconds) * 100) : 0,
    color: STATUS_COLORS[entry.status],
    count: entry.count,
  }))
}
