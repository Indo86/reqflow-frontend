import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/get-users'
import { userKeys, type UserListFilters } from '../api/user-query-keys'

export function useUsersQuery(filters: UserListFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
  })
}
