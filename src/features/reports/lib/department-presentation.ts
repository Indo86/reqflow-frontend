import type { BreakdownRow } from '@/types/domain'
import type { DepartmentBreakdownRow } from '../types/report'

// Menyimpan palet warna untuk departemen.
const PALETTE = ['var(--rf-accent)', '#6D8BE8', '#9AB1EF', '#C3D1F5', '#E1E8FB', 'var(--green-dot)', 'var(--amber-dot)']

// Properti ini opsional agar penggunaan sebelumnya tetap didukung.
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
