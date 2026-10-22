import { apiClient } from '@/lib/api'
import { attachmentListResponseSchema } from '../schemas/attachment.schema'
import { mapAttachmentListResponse, type AttachmentListResult } from '../types/attachment'

// Mengambil data dari /requests/:id/attachments.
export async function getAttachments(requestId: string, page = 1, pageSize = 50): Promise<AttachmentListResult> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))

  const response = await apiClient(`/requests/${requestId}/attachments?${params.toString()}`)
  return mapAttachmentListResponse(attachmentListResponseSchema.parse(response))
}
