import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterBar, FilterPill, SearchField } from '@/components/shared/filter-bar'
import { requestStatusLabels, requestTypeLabels } from '../types/request'

const statusOptions = Object.entries(requestStatusLabels).map(([value, label]) => ({ value, label }))
const typeOptions = Object.entries(requestTypeLabels).map(([value, label]) => ({ value, label }))

interface RequestFiltersProps {
  searchPlaceholder: string
}

// Mengambil data dari /requests.
export function RequestFilters({ searchPlaceholder }: RequestFiltersProps) {
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
      <SearchField placeholder={searchPlaceholder} value={searchDraft} onChange={setSearchDraft} />
      <FilterPill
        label="Status"
        value={searchParams.get('status') ?? ''}
        options={statusOptions}
        onChange={(value) => updateParam('status', value)}
      />
      <FilterPill
        label="Type"
        value={searchParams.get('type') ?? ''}
        options={typeOptions}
        onChange={(value) => updateParam('type', value)}
      />
    </FilterBar>
  )
}
