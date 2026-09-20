import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api/get-request'
import { requestKeys } from '../api/request-query-keys'

export function useRequestQuery(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.detail(id ?? ''),
    queryFn: () => getRequest(id as string),
    enabled: id !== undefined,
  })
}
