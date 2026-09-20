import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelRequest } from '../api/cancel-request'
import { requestKeys } from '../api/request-query-keys'

export function useCancelRequestMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cancelRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}
