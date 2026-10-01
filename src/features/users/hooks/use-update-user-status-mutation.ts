import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserStatus } from '../api/update-user-status'
import { userKeys } from '../api/user-query-keys'

export function useUpdateUserStatusMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isActive: boolean) => updateUserStatus(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
