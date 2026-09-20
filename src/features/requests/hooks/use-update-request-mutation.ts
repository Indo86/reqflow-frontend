import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRequest, type UpdateRequestInput } from '../api/update-request'
import { requestKeys } from '../api/request-query-keys'

export function useUpdateRequestMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateRequestInput) => updateRequest(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}
