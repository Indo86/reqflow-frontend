import type { RequestStatus, RequestType } from '../types/request'

export interface RequestListFilters {
  page: number
  pageSize: number
  type?: RequestType
  status?: RequestStatus
  q?: string
  // M2: narrows within the caller's authorized set; the server never widens it.
  view?: 'all' | 'mine' | 'assigned'
}

// Feature-owned query keys (never a single global registry) — filters are
// included directly in the list key so distinct filter combinations cache
// and invalidate independently. See F2 spec "Query key architecture".
export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters: RequestListFilters) => [...requestKeys.lists(), filters] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
  // Child of detail(id): invalidating a request's detail (submit, cancel,
  // reassign, ...) refreshes its audit timeline too, with no per-mutation bookkeeping.
  audit: (id: string) => [...requestKeys.details(), id, 'audit'] as const,
}
