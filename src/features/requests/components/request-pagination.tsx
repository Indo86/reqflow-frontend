import { useSearchParams } from 'react-router-dom'
import type { RequestListMeta } from '../types/request'

export function RequestPagination({ page, pageSize, total, totalPages }: RequestListMeta) {
  const [, setSearchParams] = useSearchParams()
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  function goToPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(nextPage))
      return next
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
        Showing {from}–{to} of {total} requests
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
