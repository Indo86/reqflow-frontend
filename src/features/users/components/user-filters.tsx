import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterBar, FilterPill, SearchField } from '@/components/shared/filter-bar'
import { useDepartmentsQuery } from '@/features/reports/hooks/use-departments-query'
import { roleLabels } from '../types/user'

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({ value, label }))
const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

// Drives the list query entirely through URL search params
// (?q=&role=&departmentId=&isActive=&page=), limited to exactly what
// GET /users supports. Reuses Reports' existing Department query
// infrastructure (useDepartmentsQuery) rather than duplicating it — see
// F6.5 "Query keys".
export function UserFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('q') ?? ''

  const [searchDraft, setSearchDraft] = useState(urlSearch)
  const [lastSyncedUrlSearch, setLastSyncedUrlSearch] = useState(urlSearch)

  if (urlSearch !== lastSyncedUrlSearch) {
    setLastSyncedUrlSearch(urlSearch)
    setSearchDraft(urlSearch)
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchParams((prev) => {
        const trimmed = searchDraft.trim()
        if ((prev.get('q') ?? '') === trimmed) return prev
        const next = new URLSearchParams(prev)
        if (trimmed) next.set('q', trimmed)
        else next.delete('q')
        next.delete('page')
        return next
      })
    }, 350)
    return () => clearTimeout(handle)
  }, [searchDraft, setSearchParams])

  const departmentsQuery = useDepartmentsQuery()
  const departmentOptions = (departmentsQuery.data ?? []).map((department) => ({
    value: department.id,
    label: department.name,
  }))

  function updateParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  return (
    <FilterBar>
      <SearchField placeholder="Search users..." value={searchDraft} onChange={setSearchDraft} />
      <FilterPill
        label="Role"
        value={searchParams.get('role') ?? ''}
        options={roleOptions}
        onChange={(value) => updateParam('role', value)}
      />
      {departmentsQuery.isPending ? (
        <div className="filter-pill" aria-disabled="true">Loading departments...</div>
      ) : departmentsQuery.isError ? (
        <div className="filter-pill" aria-disabled="true">Failed to load departments</div>
      ) : departmentOptions.length === 0 ? (
        <div className="filter-pill" aria-disabled="true">No departments available</div>
      ) : (
        <FilterPill
          label="Department"
          value={searchParams.get('departmentId') ?? ''}
          options={departmentOptions}
          onChange={(value) => updateParam('departmentId', value)}
        />
      )}
      <FilterPill
        label="Status"
        value={searchParams.get('isActive') ?? ''}
        options={statusOptions}
        onChange={(value) => updateParam('isActive', value)}
      />
    </FilterBar>
  )
}
