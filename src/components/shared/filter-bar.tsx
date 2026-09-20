import type { ReactNode } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="filter-bar">{children}</div>
}

export function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="search-input" style={{ flexGrow: 0 }}>
      <Search className="icon" width={15} height={15} strokeWidth={2} />
      <span>{placeholder}</span>
    </div>
  )
}

export function FilterPill({ label }: { label: string }) {
  return (
    <div className="filter-pill">
      {label}
      <ChevronDown className="icon" width={14} height={14} strokeWidth={2} />
    </div>
  )
}

export function FilterSpacer() {
  return <div className="filter-spacer" />
}
