import { useQuery } from '@tanstack/react-query'
import { getUser } from '../api/get-user'
import { userKeys } from '../api/user-query-keys'

export function useUserQuery(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: () => getUser(id as string),
    enabled: id !== undefined,
  })
}
