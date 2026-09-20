import type { ReactNode } from 'react'

interface DataTableShellProps {
  children: ReactNode
}

export function DataTableShell({ children }: DataTableShellProps) {
  return (
    <div className="card">
      <div className="table-scroll">
        <table className="data-table">{children}</table>
      </div>
    </div>
  )
}
