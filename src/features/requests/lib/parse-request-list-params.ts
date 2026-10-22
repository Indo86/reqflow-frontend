import { requestStatusLabels, requestTypeLabels, type RequestStatus, type RequestType } from '../types/request'
import type { RequestListFilters } from '../api/request-query-keys'

const DEFAULT_PAGE_SIZE = 20

function isRequestStatus(value: string): value is RequestStatus {
  return value in requestStatusLabels
}

function isRequestType(value: string): value is RequestType {
  return value in requestTypeLabels
}

// Mengambil data dari /requests.
export function parseRequestListParams(searchParams: URLSearchParams): RequestListFilters {
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1

  const rawStatus = searchParams.get('status')
  const status = rawStatus && isRequestStatus(rawStatus) ? rawStatus : undefined

  const rawType = searchParams.get('type')
  const type = rawType && isRequestType(rawType) ? rawType : undefined

  const rawQ = searchParams.get('q')?.trim()
  const q = rawQ ? rawQ : undefined

  const rawView = searchParams.get('view')
  const view = rawView === 'mine' || rawView === 'assigned' ? rawView : undefined

  return { page, pageSize: DEFAULT_PAGE_SIZE, status, type, q, view }
}
