import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/api/request-query-keys'
import { approvalKeys } from '../api/approval-query-keys'
import { reassignApproval } from '../api/reassign-approval'

export function useReassignApprovalMutation(approvalId: string, requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { approverId: string; reason: string }) => reassignApproval(approvalId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: approvalKeys.inboxes() })
      void queryClient.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
      void queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) })
    },
  })
}
