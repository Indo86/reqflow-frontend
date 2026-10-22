import type { ReactNode } from 'react'
import { ChevronDown, Search } from 'lucide-react'

// Menjalankan proses FilterBar.
export function FilterBar({ children, alignEnd = false }: { children: ReactNode; alignEnd?: boolean }) {
  return <div className={alignEnd ? 'filter-bar filter-bar-end' : 'filter-bar'}>{children}</div>
}

interface SearchFieldProps {
  placeholder: string
  // Menyiapkan data untuk ditampilkan di antarmuka.
  value?: string
  onChange?: (value: string) => void
}

export function SearchField({ placeholder, value, onChange }: SearchFieldProps) {
  if (onChange === undefined) {
    return (
      <div className="search-input" style={{ flexGrow: 0 }}>
        <Search className="icon" width={15} height={15} strokeWidth={2} />
        <span>{placeholder}</span>
      </div>
    )
  }

  return (
    <div className="search-input" style={{ flexGrow: 0 }}>
      <Search className="icon" width={15} height={15} strokeWidth={2} />
      <input
        type="search"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          width: '100%',
          font: 'inherit',
          color: 'inherit',
        }}
      />
    </div>
  )
}

export interface FilterPillOption {
  label: string
  value: string
}

interface FilterPillProps {
  label: string
  // Menyiapkan data untuk ditampilkan di antarmuka.
  value?: string
  options?: FilterPillOption[]
  onChange?: (value: string) => void
}

export function FilterPill({ label, value, options, onChange }: FilterPillProps) {
  if (onChange === undefined || options === undefined) {
    return (
      <div className="filter-pill">
        {label}
        <ChevronDown className="icon" width={14} height={14} strokeWidth={2} />
      </div>
    )
  }

  const activeLabel = options.find((option) => option.value === value)?.label

  return (
    <div className="filter-pill" style={{ position: 'relative' }}>
      <span style={{ pointerEvents: 'none' }}>{activeLabel ?? label}</span>
      <ChevronDown
        className="icon"
        width={14}
        height={14}
        strokeWidth={2}
        style={{ pointerEvents: 'none' }}
      />
      <select
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function FilterSpacer() {
  return <div className="filter-spacer" />
}
