import { apiClient } from '@/lib/api'
import { auditLogResponseSchema } from './audit.schema'

// Mengambil data melalui getRequestAuditLog.
export async function getRequestAuditLog(requestId: string) {
  const response = await apiClient(`/requests/${requestId}/audit-log?page=1&pageSize=100`)
  return auditLogResponseSchema.parse(response)
}
