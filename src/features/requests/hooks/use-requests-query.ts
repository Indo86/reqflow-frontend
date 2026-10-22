import { useQuery } from '@tanstack/react-query'
import { getRequests } from '../api/get-requests'
import { requestKeys, type RequestListFilters } from '../api/request-query-keys'

export interface UseRequestsQueryOptions {
  // Menggunakan data API di halaman produksi tanpa mengubah halaman preview.
  enabled?: boolean
}

export function useRequestsQuery(filters: RequestListFilters, options: UseRequestsQueryOptions = {}) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => getRequests(filters),
    enabled: options.enabled ?? true,
  })
}
