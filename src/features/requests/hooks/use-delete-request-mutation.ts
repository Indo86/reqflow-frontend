import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRequest } from '../api/delete-request'
import { requestKeys } from '../api/request-query-keys'

export function useDeleteRequestMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteRequest(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: requestKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}
