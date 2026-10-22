import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '../api/logout'

// Menyediakan hook useLogoutMutation.
export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => queryClient.clear(),
  })
}
