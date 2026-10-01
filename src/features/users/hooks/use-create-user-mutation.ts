import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '../api/create-user'
import { userKeys } from '../api/user-query-keys'

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  })
}
