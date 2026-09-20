import { useQuery } from '@tanstack/react-query'
import { getApprovalDetail } from '../api/get-approval-detail'
import { approvalKeys } from '../api/approval-query-keys'

export function useApprovalDetailQuery(approvalId: string | undefined) {
  return useQuery({
    queryKey: approvalKeys.detail(approvalId ?? ''),
    queryFn: () => getApprovalDetail(approvalId as string),
    enabled: approvalId !== undefined,
  })
}
