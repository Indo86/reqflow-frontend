import { useQuery } from '@tanstack/react-query'
import { requestKeys } from '../api/request-query-keys'
import { getRequestAuditLog } from './get-request-audit-log'

export function useRequestAuditLogQuery(requestId: string) {
  return useQuery({
    queryKey: requestKeys.audit(requestId),
    queryFn: () => getRequestAuditLog(requestId),
  })
}
