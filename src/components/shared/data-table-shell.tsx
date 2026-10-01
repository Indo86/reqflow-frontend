import type { ReactNode } from 'react'

interface DataTableShellProps {
  children: ReactNode
  mobileCards?: boolean
}

export function DataTableShell({ children, mobileCards = false }: DataTableShellProps) {
  return (
    <div className="card">
      <div className="table-scroll">
        <table className={`data-table${mobileCards ? ' responsive-data-table' : ''}`}>{children}</table>
      </div>
    </div>
  )
}
