import type { BreakdownRow } from '@/types/domain'

export function BreakdownList({ rows }: { rows: BreakdownRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rows.map((row) => (
        <div className="progress-row" key={row.label}>
          <div className="progress-row-top">
            <span className="progress-row-label">{row.label}</span>
            <span className="progress-row-value">{row.value}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${row.percent}%`, background: row.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}
