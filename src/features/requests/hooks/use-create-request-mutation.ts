import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRequest } from '../api/create-request'
import { requestKeys } from '../api/request-query-keys'

export function useCreateRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.lists() }),
  })
}
