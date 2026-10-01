import { useQuery } from '@tanstack/react-query'
import { getRequests } from '../api/get-requests'
import { requestKeys, type RequestListFilters } from '../api/request-query-keys'

export interface UseRequestsQueryOptions {
  // Defaults to true. F6 dashboards pass false while rendering a /preview/*
  // persona (no real session to query against) — see F6 "Preview routes
  // keep mock data".
  enabled?: boolean
}

export function useRequestsQuery(filters: RequestListFilters, options: UseRequestsQueryOptions = {}) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => getRequests(filters),
    enabled: options.enabled ?? true,
  })
}
