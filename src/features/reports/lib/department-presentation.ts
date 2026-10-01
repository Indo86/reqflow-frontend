import type { BreakdownRow } from '@/types/domain'
import type { DepartmentBreakdownRow } from '../types/report'

// Department count is dynamic/unbounded (unlike the fixed RequestStatus/
// RequestType enums), so colors cycle through a palette by index rather
// than a fixed per-key map.
const PALETTE = ['var(--rf-accent)', '#6D8BE8', '#9AB1EF', '#C3D1F5', '#E1E8FB', 'var(--green-dot)', 'var(--amber-dot)']

// A null departmentId/departmentName group ("requests with no department")
// is never dropped — labeled "No department" rather than silently omitted,
// matching the backend's own deliberate inclusion of that group
// (report.service.ts). See F6 "Department distribution".
export function departmentBreakdownRows(rows: DepartmentBreakdownRow[], total: number): BreakdownRow[] {
  return rows
    .filter((row) => row.count > 0)
    .map((row, index) => ({
      label: row.departmentName ?? 'No department',
      value: row.count,
      percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
      color: PALETTE[index % PALETTE.length],
    }))
}
