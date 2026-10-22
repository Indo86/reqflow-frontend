import { apiClient } from '@/lib/api'
import { auditLogResponseSchema } from './audit.schema'

// One page of up to 100 events covers any realistic request lifetime.
export async function getRequestAuditLog(requestId: string) {
  const response = await apiClient(`/requests/${requestId}/audit-log?page=1&pageSize=100`)
  return auditLogResponseSchema.parse(response)
}
