import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/api/request-query-keys'
import { approveRequest } from '../api/approve-request'
import { approvalKeys } from '../api/approval-query-keys'

// Menyetujui approval lalu menyegarkan data terkait.
export function useApproveMutation(approvalId: string, requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (comment?: string) => approveRequest(approvalId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: approvalKeys.inboxes() })
      void queryClient.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
      void queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) })
      void queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}
