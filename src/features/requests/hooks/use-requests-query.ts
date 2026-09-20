import { useQuery } from '@tanstack/react-query'
import { getRequests } from '../api/get-requests'
import { requestKeys, type RequestListFilters } from '../api/request-query-keys'

export function useRequestsQuery(filters: RequestListFilters) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => getRequests(filters),
  })
}
