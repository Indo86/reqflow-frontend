import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/api/request-query-keys'
import { approveRequest } from '../api/approve-request'
import { approvalKeys } from '../api/approval-query-keys'

// Invalidates through the existing F2 request keys (never a second cache
// system) plus the approval inbox — never `queryClient.clear()` (F3 "Request
// cache coordination"). No optimistic update: the UI waits for the
// backend's confirmed result before anything changes (F3 "Approve").
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
