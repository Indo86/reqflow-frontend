import { requestStatusLabels, requestTypeLabels, type RequestStatus, type RequestType } from '../types/request'
import type { RequestListFilters } from '../api/request-query-keys'

const DEFAULT_PAGE_SIZE = 20

function isRequestStatus(value: string): value is RequestStatus {
  return value in requestStatusLabels
}

function isRequestType(value: string): value is RequestType {
  return value in requestTypeLabels
}

// Normalizes raw URL search params into the exact filter shape GET /requests
// accepts, safely ignoring any invalid/unsupported value (e.g. a stale or
// hand-edited URL) instead of sending it to the backend or crashing.
export function parseRequestListParams(searchParams: URLSearchParams): RequestListFilters {
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1

  const rawStatus = searchParams.get('status')
  const status = rawStatus && isRequestStatus(rawStatus) ? rawStatus : undefined

  const rawType = searchParams.get('type')
  const type = rawType && isRequestType(rawType) ? rawType : undefined

  const rawQ = searchParams.get('q')?.trim()
  const q = rawQ ? rawQ : undefined

  return { page, pageSize: DEFAULT_PAGE_SIZE, status, type, q }
}
