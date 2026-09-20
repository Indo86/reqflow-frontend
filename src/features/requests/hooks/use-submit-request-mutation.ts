import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitRequest } from '../api/submit-request'
import { requestKeys } from '../api/request-query-keys'
import type { RequestStatus } from '../types/request'

export function useSubmitRequestMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (currentStatus: RequestStatus) => submitRequest(id, currentStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}
