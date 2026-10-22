import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login } from '../api/login'
import { authKeys } from './use-session'

// Menjalankan login dan menyegarkan data sesi.
export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.session() }),
  })
}
