import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterBar, FilterPill, SearchField } from '@/components/shared/filter-bar'
import { requestStatusLabels, requestTypeLabels } from '../types/request'

const statusOptions = Object.entries(requestStatusLabels).map(([value, label]) => ({ value, label }))
const typeOptions = Object.entries(requestTypeLabels).map(([value, label]) => ({ value, label }))

interface RequestFiltersProps {
  searchPlaceholder: string
}

// Drives the list query entirely through URL search params (?q=&status=&type=&page=),
// limited strictly to what GET /requests actually supports — no date/department/
// createdBy control exists here because the backend has no such filter. Free-text
// search is debounced locally (plain setTimeout, no new dependency) so typing
// doesn't fire one request per keystroke; status/type commit immediately since
// they're discrete choices. Any filter change resets page back to 1.
//
// The URL's `q` is the single source of truth; `searchDraft` only exists to
// buffer keystrokes before the debounce commits them. When `q` changes from
// outside this component (browser back/forward, a link, initial load), the
// draft is reset to match it — adjusted during render (comparing against the
// last-seen URL value), not via a `useEffect` that calls setState, per
// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
// That avoids the extra commit+effect+re-render an effect-based sync would
// cost, and avoids duplicating URL state into React state.
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
